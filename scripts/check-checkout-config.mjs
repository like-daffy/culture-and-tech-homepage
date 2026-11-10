#!/usr/bin/env node
// Before a deployment (firebase.json predeploy): the central checkout's products are built with their own Firebase
// projects' public web app settings (src/lib/checkout/products.ts; README, "The central checkout"). Reads the
// environment the way `next build` does (.env.production.local, .env.local, .env.production, .env, then the shell) and
// refuses a build without Chord to MIDI's settings, with any product's test settings, or with DJ Duplicate Guard's or
// Clean Space's checkout open while its sales are closed. Names the settings, never their values.
import { existsSync } from "node:fs";
import nextEnv from "@next/env";

/**
 * Candidate for coordinated TEST review. This frontend switch does not enforce the payment environment: DJ's backend
 * must be verified as TEST-only and ready before the candidate is deployed.
 */
const DJ_DUPLICATE_GUARD_SALES_OPEN = true;

/**
 * Candidate for coordinated TEST review after the owner verifies portal connect/status and the CS env and 301s can
 * ship atomically. The backend must independently enforce TEST-only sales.
 */
const CLEAN_SPACE_SALES_OPEN = true;

/**
 * Candidate for coordinated TEST review only after commerce and policy version readiness. The commerce backend must
 * independently enforce TEST-only sales.
 */
const ALL_IN_ONE_SALES_OPEN = true;

/** Clean Space's Terms of Service, Refund Policy and Privacy Policy, which its checkout links (src/lib/clean-space/site.ts). */
const CLEAN_SPACE_POLICIES = [
  "/culture/clean-space/direct-terms.html",
  "/culture/clean-space/direct-refunds.html",
  "/culture/clean-space/direct-privacy.html",
];

const { combinedEnv: env } = nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error: console.error });
const problems = [];
const value = (name) => env[name]?.trim() ?? "";

/**
 * A product's web app settings, from its project's production web app: that project (`project`), or, for a product
 * whose project id isn't fixed here, any but an emulator's demo- project.
 */
function requireSettings(prefix, source, project) {
  for (const name of ["FIREBASE_API_KEY", "FIREBASE_PROJECT_ID", "FIREBASE_APP_ID", "RECAPTCHA_SITE_KEY"]) {
    if (!value(`${prefix}_${name}`)) problems.push(`${prefix}_${name} is empty: copy it from ${source}`);
  }
  const projectId = value(`${prefix}_FIREBASE_PROJECT_ID`);
  if (projectId && project && projectId !== project) {
    problems.push(`${prefix}_FIREBASE_PROJECT_ID isn't ${project}, the project that takes the payments`);
  }
  if (projectId && !project && projectId.startsWith("demo-")) {
    problems.push(`${prefix}_FIREBASE_PROJECT_ID is a demo- (emulator) project, not the one that takes the payments`);
  }
}

/**
 * Only the cross-site tests point a checkout at the emulators or at another site. A product's emulator switch is
 * `<prefix>_EMULATORS` unless it reads another (`emulators`: whether it is on, and its name).
 */
function refuseTestSettings(prefix, origin, emulators = { on: value(`${prefix}_EMULATORS`) !== "", name: `${prefix}_EMULATORS` }) {
  if (emulators.on) {
    problems.push(`${emulators.name} is set: a test setting must not reach a deployment`);
  }
  const set = value(`${prefix}_ORIGIN`);
  if (set && set !== origin) {
    problems.push(`${prefix}_ORIGIN is set to another site: remove it (the checkout links back to ${origin})`);
  }
}

// Chord to MIDI: open.
requireSettings("NEXT_PUBLIC_CHORD_TO_MIDI", "chord-to-midi-web's production web app settings", "chord-to-midi");
refuseTestSettings("NEXT_PUBLIC_CHORD_TO_MIDI", "https://chord-to-midi.app");

// DJ Duplicate Guard: configured candidate, subject to backend TEST readiness.
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

// Clean Space: configured candidate, subject to portal and backend readiness.
const csSwitch = value("NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT");
if (!CLEAN_SPACE_SALES_OPEN) {
  if (csSwitch) {
    problems.push(
      "NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT is set: Clean Space's sales are closed (CLEAN_SPACE_SALES_OPEN), so its checkout stays closed; remove it"
    );
  }
} else {
  if (csSwitch !== "on") problems.push("NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT isn't on: its sales are open, so open its checkout");
  // Its production project's id isn't fixed here (mac-get-space plan §0: one production project, not yet named).
  requireSettings("NEXT_PUBLIC_CLEAN_SPACE", "the Clean Space licensing project's production web app settings", null);
  for (const page of CLEAN_SPACE_POLICIES) {
    if (!existsSync(new URL(`../public${page}`, import.meta.url))) {
      problems.push(`public${page} is missing: publish Clean Space's policies first (README, "Opening Clean Space's checkout")`);
    }
  }
}
// Its test builds use the emulator switch its account pages read (src/lib/clean-space/config-rules.ts).
refuseTestSettings("NEXT_PUBLIC_CLEAN_SPACE", "https://cultureand.tech", {
  on: value("NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT") === "emulator",
  name: "NEXT_PUBLIC_CLEAN_SPACE_ENVIRONMENT=emulator",
});

// All-in-one: configured candidate, subject to commerce readiness.
const aioSwitch = value("NEXT_PUBLIC_ALL_IN_ONE_CHECKOUT");
if (!ALL_IN_ONE_SALES_OPEN) {
  if (aioSwitch) {
    problems.push(
      "NEXT_PUBLIC_ALL_IN_ONE_CHECKOUT is set: All-in-one's sales are closed (ALL_IN_ONE_SALES_OPEN), so its checkout stays closed; remove it"
    );
  }
} else {
  if (aioSwitch !== "on") problems.push("NEXT_PUBLIC_ALL_IN_ONE_CHECKOUT isn't on: its sales are open, so open its checkout");
  requireSettings("NEXT_PUBLIC_ALL_IN_ONE", "the portal project's web app settings for cultureand.tech", "cultureand-tech-web");
}
refuseTestSettings("NEXT_PUBLIC_ALL_IN_ONE", "https://portal.cultureand.tech", {
  on: value("NEXT_PUBLIC_ALL_IN_ONE_EMULATORS") !== "",
  name: "NEXT_PUBLIC_ALL_IN_ONE_EMULATORS",
});
const portalOrigin = value("NEXT_PUBLIC_PORTAL_ORIGIN");
if (portalOrigin && portalOrigin !== "https://portal.cultureand.tech") {
  problems.push("NEXT_PUBLIC_PORTAL_ORIGIN is set to another site: remove it (accounts link to https://portal.cultureand.tech)");
}

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
console.log(
  ALL_IN_ONE_SALES_OPEN
    ? "All-in-one's checkout: open, with the portal project's web app settings."
    : "All-in-one's checkout: closed (its sales are closed)."
);
console.log(
  CLEAN_SPACE_SALES_OPEN
    ? "Clean Space's checkout: open, with the production project's web app settings and its published policies."
    : "Clean Space's checkout: closed (its sales are closed)."
);
