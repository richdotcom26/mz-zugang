import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Für das Docker-Image (Coolify): minimaler Server unter .next/standalone
  output: "standalone",
};

export default nextConfig;
