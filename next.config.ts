import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Allow Supabase Storage image domains — replace with your project ref
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/**",
      },
    ],
  },
  // Prevent server-only modules from being bundled into the client
  serverExternalPackages: ["bcryptjs", "twilio"],
};

export default nextConfig;
