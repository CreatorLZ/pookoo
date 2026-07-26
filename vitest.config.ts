import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov"],
      all: true,
      include: [
        "packages/scanner/src/**/*.ts",
        "packages/shared/src/**/*.ts",
        "apps/cli/src/**/*.ts"
      ],
      exclude: ["**/__tests__/**", "**/dist/**"]
    }
  }
});
