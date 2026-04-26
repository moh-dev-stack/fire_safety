import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/** Local Express API (`npm run dev` / `dev:api`). Without this, /api requests get SPA HTML. */
const apiProxy = {
  "/api": { target: "http://127.0.0.1:3000", changeOrigin: true },
} as const;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  /** Main JS chunk includes app + dependencies; PDFs are separate assets. */
  build: { chunkSizeWarningLimit: 1000 },
  server: { proxy: { ...apiProxy } },
  preview: { proxy: { ...apiProxy } },
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.{test,spec}.{ts,tsx}", "api/**/*.test.ts"],
  },
});
