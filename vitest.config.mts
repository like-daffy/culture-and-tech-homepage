// Unit tests of Clean Space's direct-sale logic (src/lib/clean-space) and of the scripts that guard its deployment.
// They run in Node with a fake service and fake browser objects: no network, no Firebase, no Toss (`npm test`).
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["src/lib/clean-space/**/*.test.ts", "scripts/**/*.test.mjs"],
  },
});
