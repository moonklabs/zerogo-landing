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
  // /admin (Decap CMS) is served by app/admin/route.ts (compute route) because
  // a static-file rewrite does not resolve on Amplify WEB_COMPUTE.
};

export default nextConfig;
