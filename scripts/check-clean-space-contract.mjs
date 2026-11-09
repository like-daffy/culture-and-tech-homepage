#!/usr/bin/env node
// Clean Space's pages talk to the Clean Space licensing service through a pinned copy of its contract
// (src/lib/clean-space/contract.generated.ts), written by the service's own export script in the mac-get-space
// repository (services/licensing/contract/scripts/export.mjs). This site never imports that repository: the copy is
// committed here. This check (firebase.json predeploy, and `npm test`) recomputes the SHA-256 of the copy's body and
// fails when it differs from the hash in its header, so a hand edit or a partial copy never reaches a deployment.
//
//   node scripts/check-clean-space-contract.mjs [file]
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

export const CONTRACT_COPY = "src/lib/clean-space/contract.generated.ts";

const HEADER = [
  /^\/\/ GENERATED FILE: a pinned copy of the Clean Space licensing contract\. Do not edit\.$/,
  /^\/\/ Source: mac-get-space services\/licensing\/contract\/src\/index\.ts \(node scripts\/export\.mjs <this file>\)\.$/,
  /^\/\/ contract-version: (\d+)$/,
  /^\/\/ sha256: ([0-9a-f]{64})$/,
];

/** The copy's version and hash, or the first problem found. */
export function checkContractCopy(text) {
  const lines = text.split("\n");
  if (lines.length < HEADER.length + 1) return { ok: false, problem: "the file is shorter than its header" };
  const matches = HEADER.map((pattern, index) => pattern.exec(lines[index]));
  const bad = matches.findIndex((match) => match === null);
  if (bad !== -1) return { ok: false, problem: `header line ${bad + 1} is not the export script's` };
  const version = Number(matches[2][1]);
  const expected = matches[3][1];
  const body = lines.slice(HEADER.length).join("\n");
  const actual = createHash("sha256").update(body, "utf8").digest("hex");
  if (actual !== expected) return { ok: false, problem: `the body's SHA-256 is ${actual}, the header says ${expected}` };
  const declared = /export const CONTRACT_VERSION = (\d+) as const;/.exec(body);
  if (!declared || Number(declared[1]) !== version) return { ok: false, problem: "the header's contract-version is not the body's CONTRACT_VERSION" };
  return { ok: true, version, sha256: actual };
}

const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isMain) {
  const file = process.argv[2] ?? CONTRACT_COPY;
  let text;
  try {
    text = readFileSync(file, "utf8");
  } catch {
    console.error(`Clean Space contract: ${file} is missing. Export it from mac-get-space (services/licensing/contract/scripts/export.mjs).`);
    process.exit(1);
  }
  const result = checkContractCopy(text);
  if (!result.ok) {
    console.error(`Clean Space contract: ${file} is not an unedited export: ${result.problem}. Export it again; never edit it by hand.`);
    process.exit(1);
  }
  console.log(`Clean Space contract: ${file} is contract v${result.version}, sha256 ${result.sha256}.`);
}
