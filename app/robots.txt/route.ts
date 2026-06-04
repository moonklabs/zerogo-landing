import { SITE_URL } from "@/lib/site";

// AI/search crawlers we explicitly welcome in production — maximizing the
// surface for AI citation (GEO) and traditional search indexing.
const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "PerplexityBot",
  "ClaudeBot",
  "anthropic-ai",
  "Google-Extended",
  "Bingbot",
] as const;

// Content Signals Policy directive. In production we welcome search indexing,
// AI citation (ai-input), and model training (ai-train). robots.txt groups are
// matched most-specific-only, so each user-agent group repeats this line — a
// bot obeying its own named group would otherwise ignore the "*" group signal.
const CONTENT_SIGNAL = "Content-Signal: search=yes, ai-input=yes, ai-train=yes";

// Production (zerogo.ai): open to every crawler and explicitly opted into AI
// citation + training for maximum generative-engine visibility.
function productionRobots(): string {
  return [
    "User-agent: *",
    CONTENT_SIGNAL,
    "Allow: /",
    "",
    ...AI_BOTS.flatMap((bot) => [
      `User-agent: ${bot}`,
      CONTENT_SIGNAL,
      "Allow: /",
      "",
    ]),
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    `Host: ${SITE_URL}`,
    "",
  ].join("\n");
}

// Non-production (dev.zerogo.ai / previews): block all crawling so unreleased
// draft content is never indexed, cited, or used for AI training before it is
// promoted to the main (production) branch. Mirrors the dev-only /admin gate.
function protectedRobots(): string {
  return ["User-agent: *", "Disallow: /", ""].join("\n");
}

export function GET(request: Request): Response {
  // Two independent gates, mirroring the /admin middleware — either one forces
  // the protected (block-all) robots.txt:
  //   1. DEPLOY_ENV — set to "production" on the Amplify main branch. Primary
  //      gate: server-controlled, cannot be spoofed by a client.
  //   2. Host — dev.zerogo.ai (and localhost) must NEVER be crawlable, even if
  //      DEPLOY_ENV is misconfigured. Defense-in-depth so the dev site is
  //      unconditionally excluded from search/AI.
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const isDevHost =
    host.startsWith("dev.") ||
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1");

  const isProduction =
    process.env.DEPLOY_ENV === "production" && !isDevHost;
  const body = isProduction ? productionRobots() : protectedRobots();

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
