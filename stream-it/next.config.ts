import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // GitHub Pages usually deploys to /repository-name/
  basePath: '/STREAM-IT',
  assetPrefix: '/STREAM-IT/',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
