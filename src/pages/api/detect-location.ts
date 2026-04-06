import type { NextApiRequest, NextApiResponse } from "next";

type LocationData = {
  country: string | null;
  detected: boolean;
};

/**
 * API Route for IP-based geolocation detection
 * Checks for Cloudflare's CF-IPCountry header
 * Can be extended to use other geolocation services
 */
export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<LocationData>
) {
  try {
    // Check Cloudflare's CF-IPCountry header (if behind Cloudflare)
    const cfCountry = req.headers["cf-ipcountry"] as string | undefined;
    
    if (cfCountry && cfCountry !== "XX") {
      return res.status(200).json({
        country: cfCountry,
        detected: true,
      });
    }

    // Check Vercel's x-vercel-ip-country header (if on Vercel)
    const vercelCountry = req.headers["x-vercel-ip-country"] as string | undefined;
    
    if (vercelCountry) {
      return res.status(200).json({
        country: vercelCountry,
        detected: true,
      });
    }

    // Could add more geolocation service fallbacks here
    // For example: ipapi.co, ipgeolocation.io, etc.

    // No location detected
    return res.status(200).json({
      country: null,
      detected: false,
    });
  } catch (error) {
    console.error("Error detecting location:", error);
    return res.status(500).json({
      country: null,
      detected: false,
    });
  }
}