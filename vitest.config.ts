import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    env: {
      NODE_ENV: "test",
      BCRYPT_SALT_ROUNDS: "4"
    },
    testTimeout: 15000,
    hookTimeout: 30000
  }
});
