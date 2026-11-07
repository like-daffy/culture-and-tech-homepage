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
  // DJ Duplicate Guard's checkout switch, written into the pages whether it is set or not: a build that keeps the
  // checkout closed then leaves its offer out of the bundle (src/lib/checkout/products.ts; README, "DJ Duplicate Guard").
  env: {
    NEXT_PUBLIC_DJ_DUPLICATE_GUARD_CHECKOUT: process.env.NEXT_PUBLIC_DJ_DUPLICATE_GUARD_CHECKOUT ?? "",
  },
};

export default nextConfig;
