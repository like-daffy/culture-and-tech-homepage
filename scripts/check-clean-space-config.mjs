#!/usr/bin/env node
// Clean Space's account, sign-in callback and activation pages, and its product page's website-edition section, are
// built with the Clean Space licensing project's public web app settings and the sign-in providers' public client ids
// (src/lib/clean-space/config-rules.ts; docs/clean-space-direct-sale.md). This check reads the environment the way
// `next build` does (.env.production.local, .env.local, .env.production, .env, then the shell) and applies the same
// rules as the pages. With --deploy (firebase.json predeploy) only an unconfigured build (the pages then say accounts
// and purchases aren't available) or a complete production build passes: never an emulator or staging build, a demo
// project, emulator settings or a download address that isn't https. Its checkout is the central checkout's, whose
// switch and settings scripts/check-checkout-config.mjs checks. It names settings, never their values.
//
//   node scripts/check-clean-space-config.mjs [--deploy]
import nextEnv from "@next/env";
import { readFileSync } from "node:fs";
import { hasCleanSpacePortalRedirects } from "./clean-space-portal-redirects.mjs";
import { configProblems, readConfig } from "../src/lib/clean-space/config-rules.ts";
import { DEFAULT_FUNCTIONS_REGION } from "../src/lib/clean-space/contract.generated.ts";
import { CLEAN_SPACE_SITE_ORIGIN } from "../src/lib/clean-space/site.ts";

const deploy = process.argv.includes("--deploy");
const defaults = { functionsRegion: DEFAULT_FUNCTIONS_REGION, siteOrigin: CLEAN_SPACE_SITE_ORIGIN };
const { combinedEnv: env } = nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error: console.error });
let portalRedirects = false;
if (deploy) {
  try { portalRedirects = hasCleanSpacePortalRedirects(JSON.parse(readFileSync(new URL("../firebase.json", import.meta.url), "utf8"))); } catch {}
}
const problems = configProblems(env, { deploy, ...defaults, portalRedirects, portalMigration: true });

if (problems.length > 0) {
  console.error(`Clean Space's account pages can't be ${deploy ? "deployed" : "built"} with these settings:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
const config = readConfig(env, defaults);
if (!config.configured) {
  console.log("Clean Space's account pages: not configured. They say accounts and purchases aren't available and call nothing.");
} else {
  const checkout = config.checkoutOpen ? "open" : "closed";
  const download = config.downloadUrl ? "set" : "not set";
  console.log(
    `Clean Space's account pages: ${config.environment} settings complete; checkout ${checkout}; product page website copy ${config.websiteRelease ? "on" : "off"}; download address ${download}.`,
  );
}
