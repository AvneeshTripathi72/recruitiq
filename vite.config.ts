import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

const rootDir = process.cwd();

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(rootDir, "client", "src"),
      "@shared": path.resolve(rootDir, "shared"),
      "@assets": path.resolve(rootDir, "attached_assets"),
    },
  },
  root: rootDir,
  build: {
    outDir: path.resolve(rootDir, "dist/public"),
    emptyOutDir: true,
    target: "esnext",
    rollupOptions: {
      input: {
        admin: path.resolve(rootDir, "admin", "index.html"),
        candidate: path.resolve(rootDir, "candidate", "index.html"),
      }
    }
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
