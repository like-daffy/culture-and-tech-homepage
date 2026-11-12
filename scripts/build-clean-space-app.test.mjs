// clean-space.app's staging and its check (scripts/build-clean-space-app.mjs), on a made-up build in a temporary folder:
// the site as it should be passes; a link that would stay on clean-space.app for a cultureand.tech page, a file it loads
// but doesn't ship, a head on another origin, a breadcrumb, a route of cultureand.tech's in the build, an unknown host or
// a stray file each fail; staging copies only what the pages load.
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ORIGIN, ROBOTS, ROUTES, SITEMAP, checkSite, filesIn, settingsProblems, stageSite } from "./build-clean-space-app.mjs";

const dirs = [];
afterEach(() => {
  for (const d of dirs.splice(0)) rmSync(d, { recursive: true, force: true });
});
const temp = () => {
  const d = mkdtempSync(join(tmpdir(), "clean-space-app-"));
  dirs.push(d);
  return d;
};
const write = (dir, file, text = "x") => {
  mkdirSync(dirname(join(dir, file)), { recursive: true });
  writeFileSync(join(dir, file), text);
};

const BUILD = "b1";
function page(lang, { canonical, links = [], ld, page: route, extraHead = "" } = {}) {
  const path = lang === "ko" ? "/ko/" : "/";
  const url = `${ORIGIN}${path}`;
  const graph = ld ?? [
    { "@type": "Organization", "@id": "https://cultureand.tech/#organization", url: "https://cultureand.tech/" },
    { "@type": "WebSite", "@id": `${ORIGIN}/#website`, url: `${ORIGIN}/` },
    { "@type": "SoftwareApplication", "@id": `${url}#app`, url, image: `${ORIGIN}/images/apps/clean-space/icon.png` },
    { "@type": "FAQPage", "@id": `${url}#webpage`, url, isPartOf: { "@id": `${ORIGIN}/#website` } },
  ];
  const og = `${ORIGIN}/images/apps/clean-space/${lang === "ko" ? "og-ko" : "og"}.png`;
  return `<!DOCTYPE html><html lang="${lang}"><head><meta charSet="utf-8"/><title>Clean Space</title>
<link rel="canonical" href="${canonical ?? url}"/><link rel="alternate" hrefLang="en" href="${ORIGIN}/"/><link rel="alternate" hrefLang="ko" href="${ORIGIN}/ko/"/><link rel="alternate" hrefLang="x-default" href="${ORIGIN}/"/>
<meta property="og:image" content="${og}"/><meta property="og:url" content="${url}"/><meta name="twitter:image" content="${og}"/>
<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": graph })}</script>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Quicksand&amp;display=swap"/><script src="/_next/static/chunks/a.js" defer=""></script>${extraHead}</head>
<body><div id="__next"><a href="https://cultureand.tech/">Culture &amp; Tech</a><a href="${lang === "ko" ? "/" : "/ko/"}">other language</a><a href="#download">Download</a>
<img src="/images/apps/clean-space/icon.png" alt=""/><img src="/brand/logo-transparent-192.png" alt=""/>
<a href="https://portal.cultureand.tech/products/clean-space">Buy</a><a href="mailto:contact@cultureand.tech">mail</a>${links.join("")}</div>
<script id="__NEXT_DATA__" type="application/json">${JSON.stringify({ page: route ?? (lang === "ko" ? "/ko" : "/") })}</script></body></html>`;
}
const notFound = `<!DOCTYPE html><html><head><link rel="icon" href="/favicon.ico"/><script src="/_next/static/chunks/a.js"></script></head><body><a href="/">Return to home page</a><script id="__NEXT_DATA__" type="application/json">{"page":"/404"}</script></body></html>`;
const manifest = (routes = ROUTES) => `self.__BUILD_MANIFEST = {\n${routes.map((r) => `  "${r}": [\n    "static/chunks/a.js"\n  ],`).join("\n")}\n  "sortedPages": []\n};`;

/** A staged site as it should be, with overrides by file. */
function site(over = {}) {
  const dir = temp();
  const files = {
    "index.html": page("en"),
    "ko/index.html": page("ko"),
    "404.html": notFound,
    "_next/static/chunks/a.js": "x",
    [`_next/static/${BUILD}/_buildManifest.js`]: manifest(),
    "images/apps/clean-space/icon.png": "x",
    "images/apps/clean-space/og.png": "x",
    "images/apps/clean-space/og-ko.png": "x",
    "brand/logo-transparent-192.png": "x",
    "favicon.ico": "x",
    "robots.txt": ROBOTS,
    "sitemap.xml": SITEMAP,
    ...over,
  };
  for (const [f, text] of Object.entries(files)) if (text !== null) write(dir, f, text);
  return dir;
}

describe("the staged site's check", () => {
  it("passes the site as it should be", () => {
    expect(checkSite(site())).toEqual([]);
  });

  it("refuses a relative link to a page of cultureand.tech's, which would stay on clean-space.app", () => {
    for (const href of ["/apps/chord-to-midi/", "/culture/clean-space/direct-terms.html", "/#music-details", "/checkout/clean-space/"]) {
      expect(checkSite(site({ "index.html": page("en", { links: [`<a href="${href}">x</a>`] }) }))).toEqual([`index.html: <a href="${href}"> is relative but not one of this site's pages`]);
    }
  });

  it("refuses a file a page loads but the site doesn't ship", () => {
    const problems = checkSite(site({ "brand/logo-transparent-192.png": null }));
    expect(problems).toContain("index.html: loads /brand/logo-transparent-192.png, which is not staged");
  });

  it("refuses a canonical, hreflang or image on another origin", () => {
    expect(checkSite(site({ "ko/index.html": page("ko", { canonical: "https://cultureand.tech/ko/apps/clean-space/" }) }))).toContain(
      "ko/index.html: canonical is https://cultureand.tech/ko/apps/clean-space/, not https://clean-space.app/ko/",
    );
  });

  it("refuses a breadcrumb and a structured-data address of cultureand.tech's other than the organization", () => {
    const ld = [
      { "@type": "WebSite", "@id": `${ORIGIN}/#website` },
      { "@id": `${ORIGIN}/#app`, url: `${ORIGIN}/` },
      { "@type": "FAQPage", url: `${ORIGIN}/` },
      { "@type": "BreadcrumbList", itemListElement: [{ item: "https://cultureand.tech/apps/clean-space/" }] },
    ];
    const problems = checkSite(site({ "index.html": page("en", { ld }) }));
    expect(problems).toContain("index.html: structured data has a BreadcrumbList");
    expect(problems).toContain("index.html: structured data names cultureand.tech's https://cultureand.tech/apps/clean-space/");
  });

  it("refuses a build whose manifest has any of cultureand.tech's routes (reachable by navigating within the site)", () => {
    const problems = checkSite(site({ [`_next/static/${BUILD}/_buildManifest.js`]: manifest([...ROUTES, "/apps/clean-space"]) }));
    expect(problems).toEqual([`the build manifest's routes are ${[...ROUTES, "/apps/clean-space"].sort().join(" ")}, not ${ROUTES.join(" ")}`]);
  });

  it("refuses a host outside the list, an address without https and cultureand.tech's own head tags", () => {
    const problems = checkSite(site({ "index.html": page("en", { links: ['<a href="https://example.com/">x</a>', '<a href="http://cultureand.tech/">y</a>'], extraHead: '<meta name="naver-site-verification" content="z"/>' }) }));
    expect(problems).toEqual([
      'index.html: <a href="https://example.com/"> names a host outside the list',
      'index.html: <a href="http://cultureand.tech/"> is not https',
      "index.html: carries cultureand.tech's own head tags",
    ]);
  });

  it("refuses a staged file nothing loads, and a robots.txt or sitemap of another site", () => {
    const problems = checkSite(site({ "culture/clean-space/direct-terms.html": "x", "robots.txt": "Sitemap: https://cultureand.tech/sitemap.xml\n" }));
    expect(problems).toEqual(["robots.txt is not the site's", "culture/clean-space/direct-terms.html is staged but nothing on the site loads it"]);
  });
});

describe("staging", () => {
  it("copies the pages, _next/static and what the pages load, nothing else of the build, and writes robots.txt and the sitemap", () => {
    const build = temp();
    for (const [f, text] of Object.entries({
      "index.html": page("en"),
      "ko/index.html": page("ko"),
      "404.html": notFound,
      "404/index.html": notFound,
      "_next/static/chunks/a.js": "x",
      [`_next/static/${BUILD}/_buildManifest.js`]: manifest(),
      "images/apps/clean-space/icon.png": "x",
      "images/apps/clean-space/og.png": "x",
      "images/apps/clean-space/og-ko.png": "x",
      "images/apps/clean-space/main.webp": "x",
      "brand/logo-transparent-192.png": "x",
      "favicon.ico": "x",
      "robots.txt": "cultureand.tech's",
      "sitemap.xml": "cultureand.tech's",
      "llms.txt": "cultureand.tech's",
      "culture/clean-space/direct-terms.html": "x",
    }))
      write(build, f, text);
    const out = join(temp(), "site");
    expect(stageSite(build, out)).toEqual([]);
    expect(filesIn(out)).toEqual([
      "404.html",
      `_next/static/${BUILD}/_buildManifest.js`,
      "_next/static/chunks/a.js",
      "brand/logo-transparent-192.png",
      "favicon.ico",
      "images/apps/clean-space/icon.png",
      "images/apps/clean-space/og-ko.png",
      "images/apps/clean-space/og.png",
      "index.html",
      "ko/index.html",
      "robots.txt",
      "sitemap.xml",
    ]);
    expect(checkSite(out)).toEqual([]);
  });

  it("reports a page or a file a page loads that the build doesn't have", () => {
    const build = temp();
    write(build, "index.html", page("en"));
    const problems = stageSite(build, join(temp(), "site"));
    for (const missing of ["ko/index.html", "404.html", "images/apps/clean-space/icon.png", "favicon.ico"]) {
      expect(problems.some((p) => p.endsWith(`/${missing} is missing`))).toBe(true);
    }
  });
});

describe("the build's settings", () => {
  const good = { NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE: "1", NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL: "https://clean-space-cultureandtech.web.app/clean-space/1.0-7/Clean-Space-1.0.zip" };
  it("needs the website edition's release switch and an https download, and refuses another portal or site", () => {
    expect(settingsProblems(good)).toEqual([]);
    expect(settingsProblems({})).toHaveLength(2);
    expect(settingsProblems({ ...good, NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL: "http://example.com/a.zip" })).toEqual([
      "NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL isn't an https address: the page would have no download",
    ]);
    expect(settingsProblems({ ...good, NEXT_PUBLIC_PORTAL_ORIGIN: "http://127.0.0.1:5000" })).toEqual(["NEXT_PUBLIC_PORTAL_ORIGIN is set to another portal: remove it"]);
    expect(settingsProblems({ ...good, NEXT_PUBLIC_PORTAL_ORIGIN: "https://portal.cultureand.tech" })).toEqual([]);
    expect(settingsProblems({ ...good, NEXT_PUBLIC_SITE: "other" })).toEqual(["NEXT_PUBLIC_SITE names another site"]);
  });
});
