#!/usr/bin/env node
// Before a deployment (firebase.json predeploy): the central checkout's products are built with their own Firebase
// projects' public web app settings (src/lib/checkout/products.ts; README, "The central checkout"). Reads the
// environment the way `next build` does (.env.production.local, .env.local, .env.production, .env, then the shell) and
// refuses a build without Chord to MIDI's settings, with any product's test settings, or with DJ Duplicate Guard's
// checkout open while its sales are closed. Names the settings, never their values.
import nextEnv from "@next/env";

/**
 * DJ Duplicate Guard's Expert sales are closed (its DL-52): a deployment refuses to open its checkout. Its owner opens
 * them by changing this line in a commit of its own, after the steps in the README ("Opening DJ Duplicate Guard's
 * checkout"); the deployment then needs its settings instead.
 */
const DJ_DUPLICATE_GUARD_SALES_OPEN = false;

const { combinedEnv: env } = nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error: console.error });
const problems = [];
const value = (name) => env[name]?.trim() ?? "";

/** A product's web app settings, from its project's production web app. */
function requireSettings(prefix, source, project) {
  for (const name of ["FIREBASE_API_KEY", "FIREBASE_PROJECT_ID", "FIREBASE_APP_ID", "RECAPTCHA_SITE_KEY"]) {
    if (!value(`${prefix}_${name}`)) problems.push(`${prefix}_${name} is empty: copy it from ${source}`);
  }
  const projectId = value(`${prefix}_FIREBASE_PROJECT_ID`);
  if (projectId && projectId !== project) {
    problems.push(`${prefix}_FIREBASE_PROJECT_ID isn't ${project}, the project that takes the payments`);
  }
}

/** Only the cross-site tests point a checkout at the emulators or at another site. */
function refuseTestSettings(prefix, origin) {
  if (value(`${prefix}_EMULATORS`)) {
    problems.push(`${prefix}_EMULATORS is set: a test setting must not reach a deployment`);
  }
  const set = value(`${prefix}_ORIGIN`);
  if (set && set !== origin) {
    problems.push(`${prefix}_ORIGIN is set to another site: remove it (the checkout links back to ${origin})`);
  }
}

// Chord to MIDI: open.
requireSettings("NEXT_PUBLIC_CHORD_TO_MIDI", "chord-to-midi-web's production web app settings", "chord-to-midi");
refuseTestSettings("NEXT_PUBLIC_CHORD_TO_MIDI", "https://chord-to-midi.app");

// DJ Duplicate Guard: closed until its owner opens Expert's sales.
const djSwitch = value("NEXT_PUBLIC_DJ_DUPLICATE_GUARD_CHECKOUT");
if (!DJ_DUPLICATE_GUARD_SALES_OPEN) {
  if (djSwitch) {
    problems.push(
      "NEXT_PUBLIC_DJ_DUPLICATE_GUARD_CHECKOUT is set: DJ Duplicate Guard's sales are closed (its DL-52), so its checkout stays closed; remove it"
    );
  }
} else {
  if (djSwitch !== "on") problems.push("NEXT_PUBLIC_DJ_DUPLICATE_GUARD_CHECKOUT isn't on: its sales are open, so open its checkout");
  requireSettings("NEXT_PUBLIC_DJ_DUPLICATE_GUARD", "dj-duplicate-guard's production web app settings", "dj-duplicate-guard");
}
refuseTestSettings("NEXT_PUBLIC_DJ_DUPLICATE_GUARD", "https://dj-duplicate-guard.app");

if (problems.length > 0) {
  console.error("The central checkout isn't configured for a deployment:");
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
console.log("Chord to MIDI's checkout: the production project's web app settings are set.");
console.log(
  DJ_DUPLICATE_GUARD_SALES_OPEN
    ? "DJ Duplicate Guard's checkout: open, with the production project's web app settings."
    : "DJ Duplicate Guard's checkout: closed (its sales are closed)."
);
