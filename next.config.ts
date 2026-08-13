import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent Next.js from bundling the native libsql binary — use it as external
  serverExternalPackages: ['@libsql/client'],
};

export default nextConfig;
