// Unit tests (`npm test`): Clean Space's account-page logic (src/lib/clean-space), its entry in the central checkout
// (src/lib/checkout), and the scripts that guard a deployment. They run in Node with a fake service and fake browser
// objects: no network, no Firebase, no Toss.
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  test: {
    environment: "node",
    include: ["src/lib/clean-space/**/*.test.ts", "src/lib/checkout/**/*.test.ts", "scripts/**/*.test.mjs"],
  },
});
