import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import dts from "vite-plugin-dts";
import path from "node:path";

// Library build: emits ESM + CJS bundles, type declarations, and a single
// pre-compiled CSS file containing every Tailwind utility used by Sentinel.
// React/ReactDOM are externalized as peer dependencies; everything else
// (Radix, lucide-react, clsx, tailwind-merge, etc.) is bundled so consumers
// only need to install one package.
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    dts({
      tsconfigPath: "tsconfig.app.json",
      entryRoot: "src",
      include: ["src/lib-entry.ts", "src/**/*.ts", "src/**/*.tsx"],
      exclude: ["src/main.tsx", "src/App.tsx", "src/components/demo/**"],
      outDir: "dist-lib",
      insertTypesEntry: true,
      staticImport: true,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    outDir: "dist-lib",
    emptyOutDir: true,
    sourcemap: true,
    cssCodeSplit: false,
    lib: {
      entry: path.resolve(__dirname, "src/lib-entry.ts"),
      name: "Sentinel",
      formats: ["es", "cjs"],
      fileName: (format) => (format === "es" ? "sentinel.mjs" : "sentinel.cjs"),
      cssFileName: "styles",
    },
    rollupOptions: {
      external: ["react", "react-dom", "react/jsx-runtime", "react-dom/client"],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          "react/jsx-runtime": "jsxRuntime",
        },
      },
    },
  },
});
