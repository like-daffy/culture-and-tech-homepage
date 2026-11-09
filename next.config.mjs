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

const nextConfig = {
  output: "export",
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
  // DJ Duplicate Guard's and Clean Space's checkout switches, and Clean Space's website-edition switch, written into the
  // pages whether they are set or not: a build that keeps a checkout closed, or the website edition unreleased, then
  // leaves its offer out of the bundle (src/lib/checkout/products.ts, src/lib/apps.ts; README, "DJ Duplicate Guard" and
  // "Clean Space").
  env: {
    NEXT_PUBLIC_DJ_DUPLICATE_GUARD_CHECKOUT: process.env.NEXT_PUBLIC_DJ_DUPLICATE_GUARD_CHECKOUT ?? "",
    NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT: process.env.NEXT_PUBLIC_CLEAN_SPACE_CHECKOUT ?? "",
    NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE: process.env.NEXT_PUBLIC_CLEAN_SPACE_WEBSITE_RELEASE ?? "",
  },
};

export default nextConfig;
