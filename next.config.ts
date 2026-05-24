import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // OAuth profile avatars come from these hosts. Listed even though the UI
    // doesn't currently render avatars — so adding one later doesn't require
    // a config + deploy round-trip.
    remotePatterns: [
      { protocol: "https", hostname: "avatars.githubusercontent.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
