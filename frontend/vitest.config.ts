import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { "@": path.resolve(__dirname, "./src") },
  },
  test: {
    environment: "jsdom",                  // simulate a browser DOM
    globals: true,                         // describe/it/expect without imports
    setupFiles: ["./src/test/setup.ts"],   // jest-dom matchers
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      exclude: ["src/test/**", "src/main.tsx"],
    },
  },
});
