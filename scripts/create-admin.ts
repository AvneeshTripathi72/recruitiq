import { hashPassword } from "../server/auth";
import { db } from "../server/db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

async function main() {
  const username = "test@example.com";
  const password = "password123";
  
  const existingUser = await db.select().from(users).where(eq(users.username, username));
  if (existingUser.length > 0) {
    console.log("User already exists!");
    process.exit(0);
  }

  const hashedPassword = await hashPassword(password);
  
  await db.insert(users).values({
    username,
    password: hashedPassword,
    role: "super_admin",
    isActive: true,
    isVerified: true,
    email: username,
    fullName: "Test Admin",
  });
  
  console.log(`Successfully created admin user: ${username}`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error creating user:", err);
  process.exit(1);
});
