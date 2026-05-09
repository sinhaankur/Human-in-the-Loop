import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { crx } from "@crxjs/vite-plugin";
import path from "node:path";
import manifest from "./manifest.json" with { type: "json" };

// MV3 Chrome extension build. The crxjs plugin reads manifest.json,
// resolves every entry it references (popup, service worker, content
// scripts, web-accessible HTML), bundles each one with the right
// constraints (service worker as ESM, content scripts as IIFE), and
// emits a packed extension into extension/dist that's directly
// load-as-unpacked-able.
export default defineConfig({
  root: path.resolve(__dirname),
  plugins: [react(), tailwindcss(), crx({ manifest })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "../src"),
    },
  },
  build: {
    outDir: path.resolve(__dirname, "dist"),
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        sandbox: path.resolve(__dirname, "src/sandbox/index.html"),
      },
    },
  },
  server: {
    port: 5174,
    strictPort: true,
    hmr: { port: 5174 },
  },
});
