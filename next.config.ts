import type { NextConfig } from "next";
import { configuredPreviewParentOrigins } from "./lib/hero-preview-parent-origin";

// Security headers (GEO/technical audit). CSP intentionally omitted to avoid
// breaking external assets (Pretendard CDN, website-files images, unpkg Decap).
const commonSecurityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const configuredPreviewAncestors = configuredPreviewParentOrigins(process.env.LANDING_PREVIEW_ALLOWED_ORIGINS);
const previewFrameAncestors = process.env.NODE_ENV === "development"
  ? ["http://127.0.0.1:*", "http://localhost:*", ...configuredPreviewAncestors]
  : configuredPreviewAncestors;
const localDemoMediaPath = `/landing-media/${"a".repeat(64)}.png`;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // External images are rendered with plain <img>, so Next's image optimizer
  // is not used. No remotePatterns needed.
  async headers() {
    return [
      { source: "/:path*", headers: commonSecurityHeaders },
      {
        source: "/:path((?!preview(?:/|$)).*)",
        headers: [{ key: "X-Frame-Options", value: "SAMEORIGIN" }],
      },
      {
        source: "/preview",
        headers: [{ key: "Content-Security-Policy", value: `frame-ancestors ${previewFrameAncestors.length ? previewFrameAncestors.join(" ") : "'none'"}; form-action 'none'` }],
      },
      {
        source: "/:file(llms\\.txt|llms-full\\.txt)",
        headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }],
      },
    ];
  },
  async rewrites() {
    if (process.env.NODE_ENV !== "development") return [];
    return [{ source: localDemoMediaPath, destination: "/images/home/order-preview.png" }];
  },
  // /admin (Decap CMS) is served by app/admin/route.ts (compute route) because
  // a static-file rewrite does not resolve on Amplify WEB_COMPUTE.
};

export default nextConfig;
