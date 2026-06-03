import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Decap CMS (/admin) is a DEV-ONLY tool and must never be reachable in
 * production (zerogo.ai). This is the runtime replacement for the old Vite
 * `remove-admin-in-prod` build plugin (under Next SSR all routes exist in the
 * bundle). Two independent gates, either of which blocks the request:
 *
 *   1. DEPLOY_ENV — set to "production" on the Amplify `main` branch. This is
 *      server-controlled and cannot be spoofed by a client, so it is the
 *      primary gate. MUST be configured in Amplify env vars per branch.
 *   2. Host — admin is only served on a dev.* subdomain or localhost. This is
 *      defense-in-depth against a misconfigured DEPLOY_ENV and against a
 *      crafted Host header reaching the dev deployment.
 */
export function middleware(req: NextRequest): NextResponse {
  // Primary gate: never serve /admin on the production deployment.
  if (process.env.DEPLOY_ENV === "production") {
    return new NextResponse("Not Found", { status: 404 });
  }

  // Defense-in-depth: only allow on dev hosts / localhost.
  const host = (req.headers.get("host") ?? "").toLowerCase();
  const isDevHost =
    host.startsWith("dev.") ||
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1");

  if (!isDevHost) {
    return new NextResponse("Not Found", { status: 404 });
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
