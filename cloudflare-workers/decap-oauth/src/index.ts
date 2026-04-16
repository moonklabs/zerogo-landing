export interface Env {
  DECAP_GITHUB_CLIENT_ID: string;
  DECAP_GITHUB_CLIENT_SECRET: string;
}

const ALLOWED_ORIGIN = "https://dev.zerogo.ai";

function corsHeaders(origin: string) {
  const allowed = origin === ALLOWED_ORIGIN || origin === "http://localhost:3001";
  return {
    "Access-Control-Allow-Origin": allowed ? origin : ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function oauthCallbackHtml(token: string | null, error: string | null): string {
  const provider = "github";
  const message = token
    ? `authorization:${provider}:success:${JSON.stringify({ token, provider })}`
    : `authorization:${provider}:error:${error ?? "Unknown error"}`;
  return `<!DOCTYPE html>
<html>
<head><title>Authenticating...</title></head>
<body>
<script>
(function() {
  var message = ${JSON.stringify(message)};
  function receiveMessage(e) {
    window.opener.postMessage(message, e.origin);
  }
  window.addEventListener("message", receiveMessage, false);
  window.opener.postMessage("authorizing:${provider}", "*");
})();
</script>
</body>
</html>`;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") ?? "";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    // GET /auth — redirect to GitHub OAuth
    if (url.pathname === "/auth") {
      if (!env.DECAP_GITHUB_CLIENT_ID) {
        return new Response("DECAP_GITHUB_CLIENT_ID not configured", { status: 500 });
      }
      const callbackUrl = `${url.origin}/callback`;
      const params = new URLSearchParams({
        client_id: env.DECAP_GITHUB_CLIENT_ID,
        redirect_uri: callbackUrl,
        scope: "repo,user",
        state: crypto.randomUUID(),
      });
      return Response.redirect(`https://github.com/login/oauth/authorize?${params}`, 302);
    }

    // GET /callback — exchange code for token
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response(oauthCallbackHtml(null, "No authorization code provided"), {
          headers: { "Content-Type": "text/html" },
        });
      }
      if (!env.DECAP_GITHUB_CLIENT_ID || !env.DECAP_GITHUB_CLIENT_SECRET) {
        return new Response(oauthCallbackHtml(null, "GitHub OAuth not configured"), {
          headers: { "Content-Type": "text/html" },
        });
      }
      try {
        const response = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            client_id: env.DECAP_GITHUB_CLIENT_ID,
            client_secret: env.DECAP_GITHUB_CLIENT_SECRET,
            code,
          }),
        });
        const data = (await response.json()) as { access_token?: string; error?: string };
        if (data.access_token) {
          return new Response(oauthCallbackHtml(data.access_token, null), {
            headers: { "Content-Type": "text/html" },
          });
        }
        return new Response(oauthCallbackHtml(null, data.error ?? "Token exchange failed"), {
          headers: { "Content-Type": "text/html" },
        });
      } catch {
        return new Response(oauthCallbackHtml(null, "Token exchange failed"), {
          headers: { "Content-Type": "text/html" },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
};
