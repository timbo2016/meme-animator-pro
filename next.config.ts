import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    'preview-chat-55e3d32e-2072-4d0a-89ca-129a9fc33315.space.z.ai',
    '.space.z.ai',
    '.z.ai',
  ],
};

export default nextConfig;
