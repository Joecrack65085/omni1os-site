import type { NextConfig } from "next";

// @ts-expect-error - NextConfig type might be strictly missing eslint in this TS version
const nextConfig: NextConfig = {
  eslint: { ignoreDuringBuilds: true },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.supabase.co" },
    ],
  },
};

export default nextConfig;
