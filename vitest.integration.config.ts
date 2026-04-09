import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/integration/**/*.int.test.ts"],
    environment: "node",
    pool: "forks",
    poolOptions: {
      forks: {
        maxForks: 1,
        minForks: 1,
      },
    },
    globalSetup: ["./test/integration/preflight.ts"],
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
