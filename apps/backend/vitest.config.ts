import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    typecheck: {
      enabled: true,
      allowJs: false,
      checker: "tsc",
    },
    clearMocks: true,
  },
});
