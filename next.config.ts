import type { NextConfig } from "next";

// Security headers (GEO/technical audit). CSP intentionally omitted to avoid
// breaking external assets (Pretendard CDN, website-files images, unpkg Decap).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // External images are rendered with plain <img>, so Next's image optimizer
  // is not used. No remotePatterns needed.
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Decap CMS lives as static files in public/admin/. Map the bare /admin path
  // to the SPA entry. middleware.ts blocks /admin on non-dev hosts.
  async rewrites() {
    return [{ source: "/admin", destination: "/admin/index.html" }];
  },
};

export default nextConfig;
