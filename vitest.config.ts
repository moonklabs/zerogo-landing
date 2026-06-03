import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    // CI logic tests only. Playwright specs (tests/*.spec.ts) run via Playwright.
    include: ["tests/ci/**/*.{test,spec}.ts"],
    exclude: ["node_modules", "dist", ".next", "tests/*.spec.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
    },
  },
});
