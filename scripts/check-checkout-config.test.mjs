// The central checkout's predeploy check (scripts/check-checkout-config.mjs), run as firebase.json runs it, in an empty
// folder (no .env files) with only the settings given: Clean Space's checkout is refused while its sales are closed,
// and so are its test settings; the values are never printed.
import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, describe, expect, it } from "vitest";

const script = fileURLToPath(new URL("./check-checkout-config.mjs", import.meta.url));
const empty = mkdtempSync(join(tmpdir(), "checkout-config-"));
afterAll(() => rmSync(empty, { recursive: true, force: true }));

/** Chord to MIDI's settings, which every deployment needs. */
const CHORD_TO_MIDI = {
  NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_API_KEY: "chord-api-key-value",
  NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_PROJECT_ID: "chord-to-midi",
  NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_APP_ID: "chord-app-id-value",
  NEXT_PUBLIC_CHORD_TO_MIDI_RECAPTCHA_SITE_KEY: "chord-site-key-value",
};

function check(settings) {
  const result = spawnSync(process.execPath, [script], {
    cwd: empty,
    env: { PATH: process.env.PATH ?? "", ...settings },
    encoding: "utf8",
  });
  return { status: result.status, output: `${result.stdout}${result.stderr}` };
}

describe("the central checkout's predeploy check", () => {
  it("passes with Chord to MIDI's settings and Clean Space's checkout closed, with no Clean Space settings", () => {
    const { status, output } = check(CHORD_TO_MIDI);
    expect(status).toBe(0);
    expect(output).toContain("Clean Space's checkout: closed (its sales are closed).");
    expect(output).toContain("DJ Duplicate Guard's checkout: closed (its sales are closed).");
  });

  it("refuses Clean Space's switch while its sales are closed", () => {
    const { status, output } = check({ ...CHORD_TO_MIDI, NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT: "on" });
    expect(status).toBe(1);
    expect(output).toMatch(/NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT is set: Clean Space's sales are closed/);
  });

  it("refuses Clean Space's test settings: its emulators, or another site", () => {
    const emulators = check({ ...CHORD_TO_MIDI, NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT: "emulator" });
    expect(emulators.status).toBe(1);
    expect(emulators.output).toMatch(/NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT=emulator is set: a test setting/);
    const origin = check({ ...CHORD_TO_MIDI, NEXT_PUBLIC_CLEAN_SPACE_ORIGIN: "http://127.0.0.1:5000" });
    expect(origin.status).toBe(1);
    expect(origin.output).toMatch(/NEXT_PUBLIC_CLEAN_SPACE_ORIGIN is set to another site/);
    expect(check({ ...CHORD_TO_MIDI, NEXT_PUBLIC_CLEAN_SPACE_ORIGIN: "https://cultureand.tech" }).status).toBe(0);
  });

  it("still requires Chord to MIDI's settings, naming them and never their values", () => {
    const { status, output } = check({ ...CHORD_TO_MIDI, NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_APP_ID: "" });
    expect(status).toBe(1);
    expect(output).toMatch(/NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_APP_ID is empty/);
    for (const value of Object.values(CHORD_TO_MIDI)) if (value.endsWith("-value")) expect(output).not.toContain(value);
  });
});
