import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fetch from "node-fetch";
import fs from "fs";
import matter from "gray-matter";

// Slack notification helper
async function sendSlackNotification(payload: { name: string; email: string; channel: string }) {
  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
  if (!SLACK_WEBHOOK_URL) {
    console.warn("SLACK_WEBHOOK_URL not configured, skipping Slack notification");
    return;
  }

  const timestamp = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const channelLabel = payload.channel === "instagram" ? "인스타그램" : "네이버 지식인";

  const slackBody = {
    text: `🎉 새 사전 신청!`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "🎉 새 사전 신청!", emoji: true }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*이름:*\n${payload.name}` },
          { type: "mrkdwn", text: `*이메일:*\n${payload.email}` },
          { type: "mrkdwn", text: `*채널:*\n${channelLabel}` },
          { type: "mrkdwn", text: `*신청시간:*\n${timestamp}` }
        ]
      }
    ]
  };

  try {
    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(slackBody),
    });
    if (!response.ok) {
      console.error("Slack notification failed:", await response.text());
    }
  } catch (error) {
    console.error("Slack notification error:", error);
  }
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);





async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || "3001", 10);

  app.use(express.json());

  // API Routes
  app.post("/api/apply", async (req, res) => {
    const { name, email, channel } = req.body;

    if (!name || !email || !channel) {
      return res.status(400).json({ error: "모든 필드를 입력해주세요." });
    }

    try {
      const GAS_URL = "https://script.google.com/macros/s/AKfycbw68O2Im54Jmpy4DHKxdALwHGXVUrZPkQT8wTVS0XrOAx9QKVjr4BBNyBq_7cRyv1bW/exec";
      const AUTH_KEY = process.env.GAS_AUTH_KEY || "my_zero098aidl_secret_123";

      const response = await fetch(GAS_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          auth_key: AUTH_KEY,
          name,
          email,
          channel,
          timestamp: new Date().toISOString()
        }),
        redirect: "follow"
      });

      const responseText = await response.text();

      if (response.ok || responseText.includes("성공")) {
        // Send Slack notification (non-blocking)
        sendSlackNotification({ name, email, channel });
        res.json({ success: true });
      } else {
        console.error("GAS Error Response:", responseText);
        res.status(500).json({ error: "신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." });
      }
    } catch (error) {
      console.error("Submission Error Details:", error);
      res.status(500).json({ error: "서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요." });
    }
  });
  // Blog read-only routes (local dev SPA — production uses static JSON from build-blog.ts)
  const BLOG_DIR = path.join(__dirname, "content/blog");

  app.get("/api/posts", (req, res) => {
    try {
      if (!fs.existsSync(BLOG_DIR)) {
        return res.json([]);
      }
      const files = fs.readdirSync(BLOG_DIR);
      const posts = files
        .filter((file) => file.endsWith(".md"))
        .map((file) => {
          const slug = file.replace(".md", "");
          const content = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
          const { data } = matter(content);
          return { slug, ...data };
        })
        .filter((post: any) => !post.draft)
        .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());
      res.json(posts);
    } catch (error) {
      console.error("Error fetching posts:", error);
      res.status(500).json({ error: "Failed to fetch posts" });
    }
  });

  app.get("/api/posts/:slug", (req, res) => {
    try {
      const { slug } = req.params;
      const filePath = path.join(BLOG_DIR, `${slug}.md`);
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ error: "Post not found" });
      }
      const content = fs.readFileSync(filePath, "utf-8");
      const { data, content: body } = matter(content);
      res.json({ slug, ...data, body });
    } catch (error) {
      console.error("Error fetching post:", error);
      res.status(500).json({ error: "Failed to fetch post" });
    }
  });
  const publicDir = path.join(__dirname, "public");

  if (process.env.NODE_ENV !== "production") {
    const GITHUB_CLIENT_ID = process.env.DECAP_GITHUB_CLIENT_ID;
    const GITHUB_CLIENT_SECRET = process.env.DECAP_GITHUB_CLIENT_SECRET;

    // Serve config.yml dynamically to inject correct base_url per environment
    app.get("/admin/config.yml", (req, res) => {
      const host = req.get("host") || "";
      const isLocalhost = host.includes("localhost") || host.includes("127.0.0.1");
      const forceLocal = req.query.local;
      const useLocalBackend = forceLocal !== undefined 
        ? forceLocal === "true" 
        : isLocalhost;

      const baseUrl = `${req.protocol}://${host}`;
      const config = `${useLocalBackend ? "local_backend: true\n" : ""}
backend:
  name: github
  repo: moonklabs/zerogo-landing
  branch: dev
  base_url: ${baseUrl}
  auth_endpoint: /api/auth

media_folder: "public/images/blog"
public_folder: "/images/blog"

collections:
  - name: "blog"
    label: "Blog"
    folder: "content/blog"
    create: true
    slug: "{{year}}-{{month}}-{{day}}-{{slug}}"
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Publish Date", name: "date", widget: "datetime" }
      - { label: "Description", name: "description", widget: "text" }
      - { label: "Body", name: "body", widget: "markdown" }
`;
      res.type("text/yaml").send(config);
    });

    // GitHub OAuth proxy
    app.get("/api/auth", (req, res) => {
      if (!GITHUB_CLIENT_ID) {
        return res.status(500).send("GITHUB_CLIENT_ID not configured");
      }
      const params = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID,
        scope: "repo,user",
        state: Math.random().toString(36).substring(2),
      });
      res.redirect(`https://github.com/login/oauth/authorize?${params}`);
    });

    app.get("/api/auth/callback", async (req, res) => {
      const { code } = req.query;
      if (!code || typeof code !== "string") {
        return res.send(oauthCallbackHtml(null, "No authorization code provided"));
      }
      if (!GITHUB_CLIENT_ID || !GITHUB_CLIENT_SECRET) {
        return res.send(oauthCallbackHtml(null, "GitHub OAuth not configured"));
      }
      try {
        const response = await fetch("https://github.com/login/oauth/access_token", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ client_id: GITHUB_CLIENT_ID, client_secret: GITHUB_CLIENT_SECRET, code }),
        });
        const data = (await response.json()) as { access_token?: string; error?: string };
        if (data.access_token) {
          res.send(oauthCallbackHtml(data.access_token, null));
        } else {
          res.send(oauthCallbackHtml(null, data.error ?? "Token exchange failed"));
        }
      } catch {
        res.send(oauthCallbackHtml(null, "Token exchange failed"));
      }
    });

    app.use(express.static(publicDir));
    app.get("/admin", (req, res) => {
      res.sendFile(path.join(publicDir, "admin", "index.html"));
    });
    app.get("/admin/*", (req, res) => {
      res.sendFile(path.join(publicDir, "admin", "index.html"));
    });
  } else {
    // Serve public assets except admin/ in production
    app.use(express.static(publicDir, { index: false }));
    app.get("/admin", (req, res) => res.status(404).end());
    app.get("/admin/*", (req, res) => res.status(404).end());
  }

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
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

startServer();
