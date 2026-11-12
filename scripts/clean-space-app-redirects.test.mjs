// Clean Space's page moved to its own site on 2026-11-12 (README, "clean-space.app"): firebase.json sends exactly its six
// addresses here (each language, with and without the slash, and index.html) to clean-space.app with a 301, after the
// rules the portal check pins (scripts/clean-space-portal-redirects.mjs), and nothing else of Clean Space's goes there:
// the account, activation and sign-in addresses still go to the portal, the policies and images stay here.
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { hasCleanSpacePortalRedirects } from "./clean-space-portal-redirects.mjs";

const config = JSON.parse(readFileSync(new URL("../firebase.json", import.meta.url), "utf8"));
const redirects = config.hosting.redirects;
const MOVED = [
  ["/apps/clean-space/", "https://clean-space.app/"],
  ["/apps/clean-space", "https://clean-space.app/"],
  ["/apps/clean-space/index.html", "https://clean-space.app/"],
  ["/ko/apps/clean-space/", "https://clean-space.app/ko/"],
  ["/ko/apps/clean-space", "https://clean-space.app/ko/"],
  ["/ko/apps/clean-space/index.html", "https://clean-space.app/ko/"],
];

describe("Clean Space's page on clean-space.app", () => {
  it("leaves the pinned rules (the portal's) where they are, first", () => {
    expect(hasCleanSpacePortalRedirects(config)).toBe(true);
  });

  it("sends exactly its six addresses there, permanently, after them", () => {
    const toSite = redirects.map((r, index) => ({ ...r, index })).filter((r) => r.destination.startsWith("https://clean-space.app"));
    expect(toSite.map((r) => [r.source, r.destination])).toEqual(MOVED);
    for (const r of toSite) {
      expect(r.type).toBe(301);
      expect(r.regex).toBeUndefined();
      expect(r.index).toBeGreaterThan(22);
    }
  });

  it("matches no other address of Clean Space's: account, activation, sign-in, policies and images are unchanged", () => {
    // Firebase compares each source with the path exactly (no glob here), so these stay with their own rules or files
    for (const path of ["/apps/clean-space/account/", "/apps/clean-space/activate/", "/apps/clean-space/auth/email/", "/culture/clean-space/direct-terms.html", "/images/apps/clean-space/og.png"]) {
      expect(MOVED.some(([source]) => source === path)).toBe(false);
    }
    expect(MOVED.every(([source]) => !/[*:]/.test(source))).toBe(true);
  });
});
