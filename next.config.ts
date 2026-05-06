import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* existing config */
  cacheComponents: true, 
  
  // Add this section:
  experimental: {
    serverActions: {
      allowedOrigins: ['172.22.171.99', '192.168.123.8', 'localhost:3000'],
    },
  },
};

export default nextConfig;