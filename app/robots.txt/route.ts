import { SITE_URL } from "@/lib/site";

// Production (zerogo.ai): open to all crawlers with sitemap reference.
function productionRobots(): string {
  return [
    "User-agent: *",
    "Allow: /",
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ].join("\n");
}

// dev.zerogo.ai / localhost: block all crawling so draft content is never
// indexed before it is promoted to production.
function protectedRobots(): string {
  return ["User-agent: *", "Disallow: /", ""].join("\n");
}

export function GET(request: Request): Response {
  // Block crawling unconditionally on dev.zerogo.ai and localhost.
  // All other hosts (zerogo.ai, preview branches) get the open robots.txt.
  const host = (request.headers.get("host") ?? "").toLowerCase();
  const isDevHost =
    host.startsWith("dev.") ||
    host.startsWith("localhost") ||
    host.startsWith("127.0.0.1");

  const body = isDevHost ? protectedRobots() : productionRobots();

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
