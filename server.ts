import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import fetch from "node-fetch";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3001;

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
        headers: {
          "Content-Type": "application/json",
        },
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

startServer();
