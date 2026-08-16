// Based on blueprint:javascript_auth_all_persistance
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express, Request, Response, NextFunction } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import { User as SelectUser, insertUserSchema, loginSchema } from "@shared/schema";
import { ZodError } from "zod";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// ─── Role-check middleware ────────────────────────────────────────────────────

/** Any authenticated admin-side user (super_admin, company_admin, recruiter). */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  const user = req.user as SelectUser;
  if (!user.isActive) return res.status(403).json({ error: "Account disabled" });
  next();
}

/** Only super_admin. Used for website management and company onboarding. */
export function requireSuperAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  const user = req.user as SelectUser;
  if (!user.isActive) return res.status(403).json({ error: "Account disabled" });
  if (user.role !== "super_admin") return res.status(403).json({ error: "Super admin access required" });
  next();
}

/** company_admin or super_admin. Used for team management within a company. */
export function requireCompanyAdmin(req: Request, res: Response, next: NextFunction) {
  if (!req.isAuthenticated()) return res.status(401).json({ error: "Not authenticated" });
  const user = req.user as SelectUser;
  if (!user.isActive) return res.status(403).json({ error: "Account disabled" });
  if (user.role !== "company_admin" && user.role !== "super_admin") {
    return res.status(403).json({ error: "Company admin access required" });
  }
  next();
}

export { hashPassword, comparePasswords };

// ─── Passport + session setup ────────────────────────────────────────────────

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET!,
    resave: false,
    saveUninitialized: false,
    store: storage.sessionStore,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      const user = await storage.getUserByUsername(username);
      if (!user || !(await comparePasswords(password, user.password))) {
        return done(null, false);
      }
      if (!user.isVerified) {
        return done(null, false, { message: "unverified" });
      }
      if (!user.isActive) {
        return done(null, false);
      }
      return done(null, user);
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    const user = await storage.getUser(id);
    done(null, user || null);
  });

  app.post("/api/register", async (req, res, next) => {
    try {
      const data = insertUserSchema.parse(req.body);
      const existing = await storage.getUserByUsername(data.username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }

      const hashedPassword = await hashPassword(data.password);
      const verificationToken = randomBytes(32).toString("hex");

      const user = await storage.createUser({
        ...data,
        password: hashedPassword,
        isActive: true, // Will be activated via email verification
        isVerified: false,
        verificationToken,
      });

      // Simple email simulation or real email if SMTP is configured
      const verifyLink = `${process.env.APP_URL || "http://localhost:5000"}/verify?token=${verificationToken}`;
      console.log(`\n=========================================\n[EMAIL MOCK] To: ${data.email || data.username}\nSubject: Verify your Tilcons account\nBody: Please verify your account by clicking: ${verifyLink}\n=========================================\n`);

      res.status(201).json({ message: "Registration successful. Please check your email to verify your account." });
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({ error: "Validation failed", details: error.errors });
      }
      next(error);
    }
  });

  app.get("/api/verify", async (req, res) => {
    const { token } = req.query;
    if (!token || typeof token !== "string") {
      return res.status(400).json({ error: "Invalid token" });
    }

    const [user] = await db.select().from(users).where(eq(users.verificationToken, token));
    if (!user) {
      return res.status(400).json({ error: "Invalid or expired verification link" });
    }

    await db.update(users).set({ isVerified: true, verificationToken: null }).where(eq(users.id, user.id));

    res.status(200).json({ message: "Account verified successfully" });
  });

  app.post("/api/login", (req, res, next) => {
    try {
      const validatedData = loginSchema.parse(req.body);

      passport.authenticate("local", (err: any, user: SelectUser | false, info?: { message: string }) => {
        if (err) return next(err);
        if (!user) {
          if (info?.message === "unverified") {
            return res.status(401).json({
              error: "Account not verified",
              message: "Please check your email and verify your account before logging in.",
            });
          }
          return res.status(401).json({
            error: "Authentication failed",
            message: "Invalid username or password. Please try again.",
          });
        }

        req.login(user, (loginErr) => {
          if (loginErr) return next(loginErr);
          // Return full user object (including role) so client can redirect correctly
          res.status(200).json(user);
        });
      })(req, res, next);
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          error: "Validation failed",
          message: "Please provide a valid username and password.",
          details: error.errors,
        });
      }
      next(error);
    }
  });

  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json(req.user);
  });
}
