import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "vitest";
import { exportRefundPolicyVersions } from "./apply-clean-space-refund-wording.mjs";
import { refundWindow } from "../src/lib/refund-schedule.ts";

const P = "2026-12-05T12:00:00+09:00";
const E = "2026-12-12T23:00:00+09:00";

for (const [file, kind] of [["direct-terms.html", "terms"], ["direct-refunds.html", "refund"]]) {
  const source = readFileSync(new URL("../public/culture/clean-space/" + file, import.meta.url), "utf8");
  test(file + " keeps the exact published bytes without a valid notice schedule", () => {
    assert.equal(exportRefundPolicyVersions(source, kind, refundWindow(undefined, E)), source);
    assert.equal(exportRefundPolicyVersions(source, kind, refundWindow(P, "2026-12-12T11:59:59+09:00")), source);
  });
  test(file + " has two dated versions in each locale and preserves existing protections", () => {
    const updated = exportRefundPolicyVersions(source, kind, refundWindow(P, E));
    assert.equal([...updated.matchAll(/<details open>/g)].length, 2);
    assert.equal([...updated.matchAll(/id="(en|ko)-amendment"/g)].length, 2);
    assert.match(updated, /23:00 KST/);
    assert.match(updated, /12:00 KST/);
    assert.match(updated, /Mac App Store purchases follow Apple/);
    assert.match(updated, /최대 7일/);
    assert.match(updated, /History/);
    assert.match(updated, /2026-11-10/);
    assert.match(updated, /"https:\/\/portal.cultureand.tech\/ko\/refund-policy-update"/);
    assert.match(updated, /"https:\/\/portal.cultureand.tech\/refund-policy-update"/);
    assert.doesNotMatch(updated, /<script|\{contact\}|REFUND_CONTACT/);
    for (const locale of ["en", "ko"]) {
      const old = new RegExp('<article id="' + locale + '" lang="' + locale + '">([\\s\\S]*?)</article>').exec(source)[1];
      assert.ok(updated.includes(old), "the archived version remains byte-identical");
    }
  });
}
