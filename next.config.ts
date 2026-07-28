import type { NextConfig } from "next";

const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN ?? "http://localhost:4000";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
  },
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_ORIGIN}/api/:path*`,
      },
      // Google OAuth is a full-page browser redirect chain (start ->
      // Google -> callback), not a fetch call, so it can't go through
      // RTK Query's base URL. Proxying it under the frontend origin too
      // (instead of pointing directly at BACKEND_ORIGIN) keeps the
      // callback's Set-Cookie response scoped to this origin, same as
      // every other auth cookie in the app.
      {
        source: "/auth/google",
        destination: `${BACKEND_ORIGIN}/auth/google`,
      },
      {
        source: "/auth/google/callback",
        destination: `${BACKEND_ORIGIN}/auth/google/callback`,
      },
    ];
  },
};

export default nextConfig;
