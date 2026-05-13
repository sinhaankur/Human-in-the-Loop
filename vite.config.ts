import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";

// Repo slug — drives the GitHub Pages base path. Override with VITE_BASE=/
// when previewing the production build at the filesystem root.
const REPO = "Human-in-the-Loop";

export default defineConfig(({ command }) => ({
  base: process.env.VITE_BASE ?? (command === "build" ? `/${REPO}/` : "/"),
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
}));
