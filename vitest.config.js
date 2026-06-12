import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    fileParallelism: false,
    exclude: [
      "node_modules",
      "dist",
      "src/tests/post.test.js",
      "src/tests/auth.test.js",
      "src/tests/user.test.js",
    ],
  },
});
