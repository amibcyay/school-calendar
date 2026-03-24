import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // ESLint dev deps removed (see package.json) — avoid failing production builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
