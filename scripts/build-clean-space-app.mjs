#!/usr/bin/env node
// clean-space.app, Clean Space's own site, built from this repo (README, "clean-space.app"): builds it
// (NEXT_PUBLIC_SITE=clean-space-app, next.config.mjs) into out-clean-space-app/, stages exactly the files the site serves
// into dist/clean-space-app/, and checks them. firebase.clean-space-app.json runs it before an upload; it uploads nothing.
//
//   node scripts/build-clean-space-app.mjs           check the settings, build, stage and check
//   node scripts/build-clean-space-app.mjs --stage   stage and check the last build (out-clean-space-app/)
//   node scripts/build-clean-space-app.mjs --check   check dist/clean-space-app/ alone
//
// The site shows the product page as cultureand.tech's live build does, so it needs the website edition's two settings:
// NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE=1 and NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL (an https address), from the shell or
// an env file, read the way `next build` reads them. It needs no checkout or Firebase setting: the page calls nothing. It
// names settings, never their values.
import nextEnv from "@next/env";
import { spawnSync } from "node:child_process";
import { copyFileSync, existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
export const BUILD_DIR = join(ROOT, "out-clean-space-app");
export const SITE_DIR = join(ROOT, "dist", "clean-space-app");

export const ORIGIN = "https://clean-space.app";
/** The site's two pages: Clean Space's product page in English and Korean, as the build names them. */
export const PAGES = [
  { file: "index.html", lang: "en", path: "/", page: "/" },
  { file: "ko/index.html", lang: "ko", path: "/ko/", page: "/ko" },
];
const NOT_FOUND = { file: "404.html", page: "/404" };
/** Every route the site's build has: nothing of cultureand.tech's can be reached by navigating within it. */
export const ROUTES = ["/", "/404", "/_error", "/ko"];
/** The hosts the pages may name: the site itself, cultureand.tech and its portal, the download, what the page loads anyway. */
export const HOSTS = [
  "clean-space.app",
  "cultureand.tech",
  "portal.cultureand.tech",
  "clean-space-cultureandtech.web.app",
  "fonts.googleapis.com",
  "fonts.gstatic.com",
  "cdn.softgen.ai",
  "img.youtube.com",
  "www.youtube.com",
  "schema.org",
];

export const ROBOTS = `# ${ORIGIN}/robots.txt
User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`;

const alternates = PAGES.map((p) => `    <xhtml:link rel="alternate" hreflang="${p.lang}" href="${ORIGIN}${p.path}"/>`)
  .concat(`    <xhtml:link rel="alternate" hreflang="x-default" href="${ORIGIN}${PAGES[0].path}"/>`)
  .join("\n");
export const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${PAGES.map((p) => `  <url>\n    <loc>${ORIGIN}${p.path}</loc>\n${alternates}\n  </url>`).join("\n")}
</urlset>
`;

const decode = (s) => s.replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#x27;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">");

/** Every start tag of an HTML file with its attributes (Next.js's output is well formed; script and style bodies skipped). */
export function tags(html) {
  const out = [];
  const body = html.replace(/<(script|style)\b([^>]*)>[\s\S]*?<\/\1>/gi, "<$1$2>");
  for (const m of body.matchAll(/<([a-zA-Z][\w-]*)((?:\s+[^\s=>"'/]+(?:=(?:"[^"]*"|'[^']*'|[^\s>"']+))?)*)\s*\/?>/g)) {
    const attrs = {};
    for (const a of m[2].matchAll(/([^\s=>"'/]+)(?:=(?:"([^"]*)"|'([^']*)'|([^\s>"']+)))?/g)) attrs[a[1].toLowerCase()] = decode(a[2] ?? a[3] ?? a[4] ?? "");
    out.push({ name: m[1].toLowerCase(), attrs });
  }
  return out;
}

const jsonLd = (html) => [...html.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => JSON.parse(m[1]));
const nextData = (html) => {
  const m = /<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/.exec(html);
  return m ? JSON.parse(m[1]) : null;
};
const strings = (value, out = []) => {
  if (typeof value === "string") out.push(value);
  else if (value && typeof value === "object") for (const v of Object.values(value)) strings(v, out);
  return out;
};

/** The root-relative files a page loads (scripts, styles, images, icons) and its absolute og/twitter images on this site. */
export function assetsOf(html) {
  const out = new Set();
  for (const { name, attrs } of tags(html)) {
    if (name === "a" || (name === "link" && /\b(canonical|alternate)\b/.test(attrs.rel ?? ""))) continue;
    const values = [attrs.src, name === "link" ? attrs.href : undefined, ...(attrs.srcset ?? "").split(",").map((s) => s.trim().split(/\s+/)[0])];
    if (name === "meta" && /^(og:image|twitter:image)$/.test(attrs.property ?? attrs.name ?? "") && attrs.content?.startsWith(`${ORIGIN}/`)) values.push(attrs.content.slice(ORIGIN.length));
    for (const v of values) if (v && v.startsWith("/") && !v.startsWith("//")) out.add(v.split(/[?#]/)[0]);
  }
  return [...out];
}

/** Files below a folder, as paths relative to it ("/"-separated). */
export function filesIn(dir) {
  const out = [];
  (function walk(d) {
    for (const n of readdirSync(d).sort()) {
      const p = join(d, n);
      if (statSync(p).isDirectory()) walk(p);
      else out.push(relative(dir, p).split("\\").join("/"));
    }
  })(dir);
  return out;
}

/** The routes a build's manifest lists (_next/static/<build id>/_buildManifest.js). */
export function manifestRoutes(dir) {
  const ids = existsSync(join(dir, "_next/static")) ? readdirSync(join(dir, "_next/static")).filter((n) => existsSync(join(dir, "_next/static", n, "_buildManifest.js"))) : [];
  if (ids.length !== 1) return null;
  const text = readFileSync(join(dir, "_next/static", ids[0], "_buildManifest.js"), "utf8");
  return [...text.matchAll(/^\s{2}"(\/[^"]*)":/gm)].map((m) => m[1]).sort();
}

/** Problems of a staged site folder; [] when it is exactly what clean-space.app should serve. */
export function checkSite(dir) {
  const problems = [];
  if (!existsSync(dir)) return [`${relative(ROOT, dir) || dir} does not exist`];
  const files = new Set(filesIn(dir));
  const allowed = new Set(["robots.txt", "sitemap.xml", "favicon.ico", ...PAGES.map((p) => p.file), NOT_FOUND.file]);
  const hosts = new Set(HOSTS);

  for (const p of [...PAGES, NOT_FOUND]) {
    if (!files.has(p.file)) {
      problems.push(`${p.file} is missing`);
      continue;
    }
    const html = readFileSync(join(dir, p.file), "utf8");
    const data = nextData(html);
    if (data?.page !== p.page) problems.push(`${p.file}: page is ${data?.page ?? "unknown"}, not ${p.page}`);
    for (const a of assetsOf(html)) {
      const file = a.slice(1);
      if (!files.has(file)) problems.push(`${p.file}: loads ${a}, which is not staged`);
      allowed.add(file);
    }
    for (const { name, attrs } of tags(html)) {
      for (const key of ["href", "src", "action", "content"]) {
        const value = attrs[key];
        if (!value || (key === "content" && !/^https?:/.test(value))) continue;
        if (/^(#|mailto:)/.test(value)) continue;
        if (value.startsWith("//")) problems.push(`${p.file}: <${name} ${key}="${value}"> has no scheme`);
        else if (/^[a-z][a-z0-9+.-]*:/i.test(value)) {
          let url;
          try {
            url = new URL(value);
          } catch {
            problems.push(`${p.file}: <${name} ${key}="${value}"> is not an address`);
            continue;
          }
          if (url.protocol !== "https:") problems.push(`${p.file}: <${name} ${key}="${value}"> is not https`);
          else if (!hosts.has(url.hostname)) problems.push(`${p.file}: <${name} ${key}="${value}"> names a host outside the list`);
        } else if (value.startsWith("/")) {
          // A link within the site goes to one of its two pages, exactly; anything else of cultureand.tech's is absolute.
          if (name === "a" && !PAGES.some((page) => page.path === value)) problems.push(`${p.file}: <a href="${value}"> is relative but not one of this site's pages`);
        } else if (key !== "content") problems.push(`${p.file}: <${name} ${key}="${value}"> is relative to the page`);
      }
    }
    if (/name="naver-site-verification"|name="keywords"/.test(html)) problems.push(`${p.file}: carries cultureand.tech's own head tags`);
    if (p === NOT_FOUND) continue;

    const url = `${ORIGIN}${p.path}`;
    const head = tags(html.split("</head>")[0]);
    const link = (rel, lang) => head.filter((t) => t.name === "link" && t.attrs.rel === rel && (lang === undefined || t.attrs.hreflang === lang)).map((t) => t.attrs.href);
    const meta = (key) => head.filter((t) => t.name === "meta" && (t.attrs.property ?? t.attrs.name) === key).map((t) => t.attrs.content);
    const html_ = head.find((t) => t.name === "html");
    if (html_?.attrs.lang !== p.lang) problems.push(`${p.file}: <html lang> is ${html_?.attrs.lang}, not ${p.lang}`);
    if (link("canonical").join() !== url) problems.push(`${p.file}: canonical is ${link("canonical").join() || "missing"}, not ${url}`);
    for (const page of PAGES) if (link("alternate", page.lang).join() !== `${ORIGIN}${page.path}`) problems.push(`${p.file}: hreflang ${page.lang} is not ${ORIGIN}${page.path}`);
    if (link("alternate", "x-default").join() !== `${ORIGIN}/`) problems.push(`${p.file}: hreflang x-default is not ${ORIGIN}/`);
    if (meta("og:url").join() !== url) problems.push(`${p.file}: og:url is not ${url}`);
    for (const key of ["og:image", "twitter:image"]) {
      const v = meta(key).join();
      if (!v.startsWith(`${ORIGIN}/images/apps/clean-space/`) || !files.has(v.slice(ORIGIN.length + 1))) problems.push(`${p.file}: ${key} ${v || "missing"} is not a staged image of this site`);
    }
    const ld = jsonLd(html);
    const graph = ld.flatMap((d) => d["@graph"] ?? [d]);
    if (graph.some((n) => n["@type"] === "BreadcrumbList")) problems.push(`${p.file}: structured data has a BreadcrumbList`);
    if (!graph.some((n) => n["@type"] === "WebSite" && n["@id"] === `${ORIGIN}/#website`)) problems.push(`${p.file}: structured data has no WebSite ${ORIGIN}/#website`);
    if (!graph.some((n) => n["@id"] === `${url}#app` && n.url === url)) problems.push(`${p.file}: structured data's app is not at ${url}`);
    if (!graph.some((n) => n["@type"] === "FAQPage" && n.url === url)) problems.push(`${p.file}: structured data's page is not at ${url}`);
    for (const s of strings(ld)) {
      if (!/^https?:\/\//.test(s)) continue;
      const host = new URL(s).hostname;
      if (!["clean-space.app", "cultureand.tech", "schema.org"].includes(host)) problems.push(`${p.file}: structured data names ${s}`);
      if (host === "cultureand.tech" && !/^https:\/\/cultureand\.tech\/(#organization)?$/.test(s)) problems.push(`${p.file}: structured data names cultureand.tech's ${s}`);
    }
  }

  const routes = manifestRoutes(dir);
  if (routes === null) problems.push("the build manifest is missing or not unique");
  else if (routes.join() !== [...ROUTES].sort().join()) problems.push(`the build manifest's routes are ${routes.join(" ")}, not ${ROUTES.join(" ")}`);
  if (files.has("robots.txt") && readFileSync(join(dir, "robots.txt"), "utf8") !== ROBOTS) problems.push("robots.txt is not the site's");
  if (files.has("sitemap.xml") && readFileSync(join(dir, "sitemap.xml"), "utf8") !== SITEMAP) problems.push("sitemap.xml is not the site's");
  for (const f of ["robots.txt", "sitemap.xml", "favicon.ico"]) if (!files.has(f)) problems.push(`${f} is missing`);
  for (const f of files) if (!allowed.has(f) && !f.startsWith("_next/static/")) problems.push(`${f} is staged but nothing on the site loads it`);
  return problems;
}

/** Copies the site's files from a build of it into the staged folder, and writes its robots.txt and sitemap.xml. */
export function stageSite(buildDir = BUILD_DIR, siteDir = SITE_DIR) {
  const problems = [];
  if (!existsSync(buildDir)) return [`${relative(ROOT, buildDir)} does not exist: build the site first`];
  rmSync(siteDir, { recursive: true, force: true });
  const copy = (file) => {
    const from = join(buildDir, file);
    if (!existsSync(from)) return problems.push(`${relative(ROOT, buildDir)}/${file} is missing`);
    mkdirSync(dirname(join(siteDir, file)), { recursive: true });
    copyFileSync(from, join(siteDir, file));
  };
  const pages = [...PAGES.map((p) => p.file), NOT_FOUND.file];
  for (const f of pages) copy(f);
  for (const f of filesIn(buildDir).filter((f) => f.startsWith("_next/static/"))) copy(f);
  const assets = new Set(["/favicon.ico"]);
  for (const f of pages) if (existsSync(join(buildDir, f))) for (const a of assetsOf(readFileSync(join(buildDir, f), "utf8"))) if (!a.startsWith("/_next/static/")) assets.add(a);
  for (const a of assets) copy(a.slice(1));
  writeFileSync(join(siteDir, "robots.txt"), ROBOTS);
  writeFileSync(join(siteDir, "sitemap.xml"), SITEMAP);
  return problems;
}

/** Problems of the build's settings (names only). */
export function settingsProblems(env) {
  const problems = [];
  if (env.NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE !== "1") problems.push("NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE isn't 1: the page would leave out the website edition it shows on cultureand.tech");
  let download = null;
  try {
    download = new URL((env.NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL ?? "").trim());
  } catch {
    /* reported below */
  }
  if (download?.protocol !== "https:") problems.push("NEXT_PUBLIC_CLEAN_SPACE_DOWNLOAD_URL isn't an https address: the page would have no download");
  if (env.NEXT_PUBLIC_PORTAL_ORIGIN && env.NEXT_PUBLIC_PORTAL_ORIGIN !== "https://portal.cultureand.tech") problems.push("NEXT_PUBLIC_PORTAL_ORIGIN is set to another portal: remove it");
  if (env.NEXT_PUBLIC_SITE && env.NEXT_PUBLIC_SITE !== "clean-space-app") problems.push("NEXT_PUBLIC_SITE names another site");
  return problems;
}

function main(args) {
  const fail = (problems) => {
    for (const p of problems) console.error(`clean-space.app: ${p}`);
    process.exit(1);
  };
  if (!args.includes("--check") && !args.includes("--stage")) {
    nextEnv.loadEnvConfig(ROOT, false, { info: () => {}, error: console.error });
    const problems = settingsProblems(process.env);
    if (problems.length) fail(problems);
    const result = spawnSync(join(ROOT, "node_modules/.bin/next"), ["build"], { cwd: ROOT, stdio: "inherit", env: { ...process.env, NEXT_PUBLIC_SITE: "clean-space-app" } });
    if (result.status !== 0) process.exit(result.status ?? 1);
  }
  if (!args.includes("--check")) {
    const problems = stageSite();
    if (problems.length) fail(problems);
  }
  const problems = checkSite(SITE_DIR);
  if (problems.length) fail(problems);
  const files = filesIn(SITE_DIR);
  const bytes = files.reduce((n, f) => n + statSync(join(SITE_DIR, f)).size, 0);
  console.log(`clean-space.app: ${relative(ROOT, SITE_DIR)} checked: ${files.length} files, ${bytes} bytes (${files.filter((f) => !f.startsWith("_next/")).join(", ")}, and _next/static/)`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2));
