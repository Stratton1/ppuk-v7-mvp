import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    turbo: {
      // Explicitly set Turbopack root to avoid monorepo mis-detection
      root: __dirname,
    },
  },
};

export default nextConfig;
