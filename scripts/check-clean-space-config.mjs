#!/usr/bin/env node
// Clean Space's direct-sale pages are built with the Clean Space licensing project's public web app settings and the
// sign-in providers' public client ids (src/lib/clean-space/config-rules.ts; docs/clean-space-direct-sale.md). This
// check reads the environment the way `next build` does (.env.production.local, .env.local, .env.production, .env,
// then the shell) and applies the same rules as the pages. With --deploy (firebase.json predeploy) only an unconfigured
// build (the pages then say purchases aren't available) or a complete production build passes: never an emulator or
// staging build, a demo project, emulator settings, or sales switched on before the policies are published.
// It names settings, never their values.
//
//   node scripts/check-clean-space-config.mjs [--deploy]
import nextEnv from "@next/env";
import { configProblems, readConfig } from "../src/lib/clean-space/config-rules.ts";
import { DEFAULT_FUNCTIONS_REGION } from "../src/lib/clean-space/contract.generated.ts";

const deploy = process.argv.includes("--deploy");
const { combinedEnv: env } = nextEnv.loadEnvConfig(process.cwd(), false, { info() {}, error: console.error });
const problems = configProblems(env, { deploy, functionsRegion: DEFAULT_FUNCTIONS_REGION });

if (problems.length > 0) {
  console.error(`Clean Space's direct-sale pages can't be ${deploy ? "deployed" : "built"} with these settings:`);
  for (const problem of problems) console.error(`  - ${problem}`);
  process.exit(1);
}
const config = readConfig(env, { functionsRegion: DEFAULT_FUNCTIONS_REGION });
if (!config.configured) {
  console.log("Clean Space's direct-sale pages: not configured. They say accounts and purchases aren't available and take no payment.");
} else {
  const sales = config.salesEnabled ? "on" : "off";
  const policies = config.policiesPublished ? "published" : "not published";
  console.log(`Clean Space's direct-sale pages: ${config.environment} settings complete; sales ${sales}; direct-sale policies ${policies}; product page website copy ${config.websiteRelease ? "on" : "off"}.`);
}
