// Combined candidate predeploy checks with public fixture settings and no provider calls.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";
const script = fileURLToPath(new URL("./check-checkout-config.mjs", import.meta.url));
const empty = mkdtempSync(join(tmpdir(), "checkout-config-"));
afterAll(() => rmSync(empty, { recursive: true, force: true }));
const values = {
  NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_API_KEY: "chord-api-key-value", NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_PROJECT_ID: "chord-to-midi",
  NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_APP_ID: "chord-app-id-value", NEXT_PUBLIC_CHORD_TO_MIDI_RECAPTCHA_SITE_KEY: "chord-site-key-value",
  NEXT_PUBLIC_DJ_DUPLICATE_GUARD_CHECKOUT: "on", NEXT_PUBLIC_DJ_DUPLICATE_GUARD_FIREBASE_API_KEY: "dj-key-value",
  NEXT_PUBLIC_DJ_DUPLICATE_GUARD_FIREBASE_PROJECT_ID: "dj-duplicate-guard", NEXT_PUBLIC_DJ_DUPLICATE_GUARD_FIREBASE_APP_ID: "dj-app-value", NEXT_PUBLIC_DJ_DUPLICATE_GUARD_RECAPTCHA_SITE_KEY: "dj-site-value",
  NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT: "on", NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_API_KEY: "cs-key-value", NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_PROJECT_ID: "clean-space-prod",
  NEXT_PUBLIC_CLEAN_SPACE_FIREBASE_APP_ID: "cs-app-value", NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY: "cs-site-value",
  NEXT_PUBLIC_ALL_IN_ONE_CHECKOUT: "on", NEXT_PUBLIC_ALL_IN_ONE_FIREBASE_API_KEY: "aio-key-value", NEXT_PUBLIC_ALL_IN_ONE_FIREBASE_PROJECT_ID: "cultureand-tech-web",
  NEXT_PUBLIC_ALL_IN_ONE_FIREBASE_APP_ID: "aio-app-value", NEXT_PUBLIC_ALL_IN_ONE_RECAPTCHA_SITE_KEY: "aio-site-value",
};
function check(overrides = {}) {
  const result = spawnSync(process.execPath, [script], { cwd: empty, env: { PATH: process.env.PATH ?? "", ...values, ...overrides }, encoding: "utf8" });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}
describe("combined candidate checkout predeploy", () => {
  it("accepts complete configured production apps without printing values", () => {
    const r = check(); expect(r.status).toBe(0);
    for (const v of Object.values(values)) if (v.endsWith("-value")) expect(r.output).not.toContain(v);
  });
  it("requires each checkout switch and every product's public settings", () => {
    for (const name of ["NEXT_PUBLIC_DJ_DUPLICATE_GUARD_CHECKOUT", "NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT", "NEXT_PUBLIC_ALL_IN_ONE_CHECKOUT", "NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_APP_ID", "NEXT_PUBLIC_DJ_DUPLICATE_GUARD_FIREBASE_APP_ID", "NEXT_PUBLIC_CLEAN_SPACE_RECAPTCHA_SITE_KEY", "NEXT_PUBLIC_ALL_IN_ONE_FIREBASE_API_KEY"]) {
      const r = check({ [name]: "" }); expect(r.status).toBe(1); expect(r.output).toContain(name);
    }
  });
  it("refuses emulator, alternate origin, and wrong project settings", () => {
    for (const [name, value] of [["NEXT_PUBLIC_DJ_DUPLICATE_GUARD_EMULATORS", "1"], ["NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT", "emulator"], ["NEXT_PUBLIC_ALL_IN_ONE_EMULATORS", "1"], ["NEXT_PUBLIC_PORTAL_ORIGIN", "http://127.0.0.1:3000"], ["NEXT_PUBLIC_ALL_IN_ONE_FIREBASE_PROJECT_ID", "demo-project"]]) {
      const r = check({ [name]: value }); expect(r.status).toBe(1); expect(r.output).toContain(name);
    }
  });
});
