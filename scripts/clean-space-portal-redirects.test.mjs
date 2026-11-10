import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { hasCleanSpacePortalRedirects } from "./clean-space-portal-redirects.mjs";
const source = JSON.parse(readFileSync(new URL("../firebase.json", import.meta.url), "utf8"));
const clone = () => structuredClone(source);
describe("Clean Space portal redirect deployment gate", () => {
  it("accepts only the complete ordered 301 routes", () => {
    expect(hasCleanSpacePortalRedirects(source)).toBe(true);
    const missing = clone(); missing.hosting.redirects.splice(12, 1);
    expect(hasCleanSpacePortalRedirects(missing)).toBe(false);
    const wildcard = clone(); wildcard.hosting.redirects.unshift({ source: "/**", destination: "/", type: 301 });
    expect(hasCleanSpacePortalRedirects(wildcard)).toBe(false);
    const modified = clone(); modified.hosting.redirects[17].destination = "https://example.invalid/";
    expect(hasCleanSpacePortalRedirects(modified)).toBe(false);
    const wrongCode = clone(); wrongCode.hosting.redirects[18].type = 302;
    expect(hasCleanSpacePortalRedirects(wrongCode)).toBe(false);
    expect(hasCleanSpacePortalRedirects({})).toBe(false);
  });
});
