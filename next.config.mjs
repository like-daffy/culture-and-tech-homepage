/** @type {import('next').NextConfig} */
import { createRequire } from "module";

// Check if element-tagger is available
function isElementTaggerAvailable() {
  try {
    const require = createRequire(import.meta.url);
    require.resolve("@softgenai/element-tagger");
    return true;
  } catch {
    return false;
  }
}

// Build turbo rules only if tagger is available
function getTurboRules() {
  if (!isElementTaggerAvailable()) {
    console.log(
      "[Softgen] Element tagger not found, skipping loader configuration"
    );
    return {};
  }

  return {
    "*.tsx": ["@softgenai/element-tagger"],
    "*.jsx": ["@softgenai/element-tagger"],
  };
}

// clean-space.app, Clean Space's own site, is a second build of this repo (NEXT_PUBLIC_SITE=clean-space-app; README,
// "clean-space.app"): its pages are only the src/pages files named *.clean-space-app.js (Clean Space's product page at
// "/" and "/ko/", and the 404 page), exported into out-clean-space-app/, never out/. Without the setting the build is
// cultureand.tech's, from the .tsx pages alone, exactly as before. The code tells the two apart by
// __CLEAN_SPACE_APP_SITE__ (src/clean-space-app-site.d.ts), replaced with false or true at compile time, so
// cultureand.tech's build compiles every clean-space.app branch away and its output stays byte for byte the same.
const SITE = process.env.NEXT_PUBLIC_SITE === "clean-space-app" ? "clean-space-app" : "";

const nextConfig = {
  output: "export",
  pageExtensions: SITE ? ["clean-space-app.js"] : ["tsx", "ts"],
  ...(SITE ? { distDir: "out-clean-space-app" } : {}),
  compiler: { define: { __CLEAN_SPACE_APP_SITE__: SITE === "clean-space-app" } },
  trailingSlash: true,
  reactStrictMode: true,
  turbopack: {
    rules: getTurboRules(),
  },
  experimental: {
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  allowedDevOrigins: ["*.daytona.work", "*.softgen.dev"],
  // DJ Duplicate Guard's, Clean Space's and All-in-one's checkout switches, and Clean Space's website-edition switch, written into the
  // pages whether they are set or not: a build that keeps a checkout closed, or the website edition unreleased, then
  // leaves its offer out of the bundle (src/lib/checkout/products.ts, src/lib/apps.ts; README, "DJ Duplicate Guard" and
  // "Clean Space").
  env: {
    NEXT_PUBLIC_DJ_DUPLICATE_GUARD_CHECKOUT: process.env.NEXT_PUBLIC_DJ_DUPLICATE_GUARD_CHECKOUT ?? "",
    NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT: process.env.NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT ?? "",
    NEXT_PUBLIC_ALL_IN_ONE_CHECKOUT: process.env.NEXT_PUBLIC_ALL_IN_ONE_CHECKOUT ?? "",
    NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE: process.env.NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE ?? "",
  },
};

export default nextConfig;
