import { NextResponse } from "next/server";

/**
 * Decap CMS entry point, served as a compute route (NOT a static public/ file
 * behind a next.config rewrite). On Amplify WEB_COMPUTE, rewrites that target a
 * static public asset do not resolve, so the bare /admin path 404s. Serving the
 * HTML directly from the compute layer is reliable on every platform.
 *
 * Access is gated by middleware.ts (dev hosts only / DEPLOY_ENV !== production).
 * The `cms-config-url` link pins Decap to the absolute /admin/config.yml so the
 * config loads regardless of trailing slash. config.yml stays in public/admin/.
 */
const DECAP_HTML = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Content Manager</title>
  <link href="/admin/config.yml" type="text/yaml" rel="cms-config-url" />
</head>
<body>
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
</body>
</html>`;

export function GET(): NextResponse {
  return new NextResponse(DECAP_HTML, {
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}
