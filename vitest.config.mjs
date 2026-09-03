import { defineConfig } from "vitest/config";

// This file is .mjs rather than .js on purpose. The package has no
// `"type": "module"`, so Vite would load a .js config as CommonJS, which
// resolves `vitest/config` through its require entry and pulls in Vite's
// deprecated CJS Node API -- printing a deprecation warning on every run.

export default defineConfig({
  test: {
    include: ["**/*.spec.{js,jsx,ts,tsx}"],
    exclude: ["**/*.test.{js,jsx,ts,tsx}", "**/node_modules/**", "**/dist/**"],
  },
});
