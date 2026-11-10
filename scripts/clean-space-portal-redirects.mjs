// Firebase processes redirects in order. Pin the known preceding rules and all CS routes so a wildcard inserted
// ahead of them, a missing locale, a changed destination, or a non-301 cannot silently enable the portal exception.
const BEFORE = [
  ["/culture", "/"], ["/culture/", "/"], ["/culture/index.html", "/"],
  ["/apps/mac-get-space", "/apps/clean-space/"], ["/apps/mac-get-space/", "/apps/clean-space/"],
  ["/ko/apps/mac-get-space", "/ko/apps/clean-space/"], ["/ko/apps/mac-get-space/", "/ko/apps/clean-space/"],
  ["/culture/mac-get-space/:file", "/culture/clean-space/:file"],
  ["/images/apps/mac-get-space/:file", "/images/apps/clean-space/:file"],
];
const PORTAL = "https://portal.cultureand.tech";
const ROUTES = [
  ["/apps/clean-space/account", "/products/clean-space"],
  ["/apps/clean-space/account/", "/products/clean-space"],
  ["/ko/apps/clean-space/account", "/ko/products/clean-space"],
  ["/ko/apps/clean-space/account/", "/ko/products/clean-space"],
  ["/apps/clean-space/activate", "/products/clean-space/activate"],
  ["/apps/clean-space/activate/", "/products/clean-space/activate"],
  ["/ko/apps/clean-space/activate", "/ko/products/clean-space/activate"],
  ["/ko/apps/clean-space/activate/", "/ko/products/clean-space/activate"],
  ["/apps/clean-space/auth/**", "/products/clean-space"],
  ["/ko/apps/clean-space/auth/**", "/ko/products/clean-space"],
  ["/apps/clean-space/account/index.html", "/products/clean-space"],
  ["/ko/apps/clean-space/account/index.html", "/ko/products/clean-space"],
  ["/apps/clean-space/activate/index.html", "/products/clean-space/activate"],
  ["/ko/apps/clean-space/activate/index.html", "/ko/products/clean-space/activate"],
].map(([source, destination]) => [source, PORTAL + destination]);

export function hasCleanSpacePortalRedirects(config) {
  const redirects = config?.hosting?.redirects;
  return Array.isArray(redirects) && [...BEFORE, ...ROUTES].every(([source, destination], index) => {
    const r = redirects[index];
    return r && r.source === source && r.destination === destination && r.type === 301 && !r.regex;
  });
}
