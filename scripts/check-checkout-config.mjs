#!/usr/bin/env node
// Before a deployment (firebase.json predeploy): Chord to MIDI's checkout pages are built with its Firebase project's
// public web app settings (src/lib/checkout/config.ts; README, "Chord to MIDI's checkout"). Reads the environment the
// way `next build` does (.env.production.local, .env.local, .env.production, .env, then the shell) and refuses a build
// without those settings, or with a test build's. Names the settings, never their values.
import nextEnv from "@next/env";

const { combinedEnv: env } = nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error: console.error });
const problems = [];

for (const name of [
  "NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_API_KEY",
  "NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_PROJECT_ID",
  "NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_APP_ID",
  "NEXT_PUBLIC_CHORD_TO_MIDI_RECAPTCHA_SITE_KEY",
]) {
  if (!env[name]?.trim()) problems.push(`${name} is empty: copy it from chord-to-midi-web's production web app settings`);
}
const project = env.NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_PROJECT_ID?.trim();
if (project && project !== "chord-to-midi") {
  problems.push("NEXT_PUBLIC_CHORD_TO_MIDI_FIREBASE_PROJECT_ID isn't chord-to-midi, the project that takes the payments");
}
// Only the cross-site tests point the checkout at the emulators or another Chord to MIDI.
if (env.NEXT_PUBLIC_CHORD_TO_MIDI_EMULATORS) {
  problems.push("NEXT_PUBLIC_CHORD_TO_MIDI_EMULATORS is set: a test setting must not reach a deployment");
}
const origin = env.NEXT_PUBLIC_CHORD_TO_MIDI_ORIGIN?.trim();
if (origin && origin !== "https://chord-to-midi.app") {
  problems.push("NEXT_PUBLIC_CHORD_TO_MIDI_ORIGIN is set to another site: remove it (the checkout links back to https://chord-to-midi.app)");
}

if (problems.length > 0) {
  console.error("Chord to MIDI's checkout isn't configured for a deployment:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log("Chord to MIDI's checkout: the production project's web app settings are set.");
