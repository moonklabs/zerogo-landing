/**
 * Welcome to Cloudflare Workers!
 */

export interface Env {
  GAS_AUTH_KEY: string;
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    // 1. CORS Preflight (OPTIONS)
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Access-Control-Max-Age": "86400",
        },
      });
    }

    // 2. Only allow POST requests
    if (request.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    try {
      const { name, email, channel } = await request.json() as any;

      if (!name || !email || !channel) {
        return new Response(JSON.stringify({ error: "모든 필드를 입력해주세요." }), {
          status: 400,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      const GAS_URL = "https://script.google.com/macros/s/AKfycbw68O2Im54Jmpy4DHKxdALwHGXVUrZPkQT8wTVS0XrOAx9QKVjr4BBNyBq_7cRyv1bW/exec";
      const AUTH_KEY = env.GAS_AUTH_KEY;
      if (!AUTH_KEY) {
        console.error("GAS_AUTH_KEY not configured");
        return new Response(JSON.stringify({ error: "서버 설정 오류입니다. 관리자에게 문의해주세요." }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }

      const gasResponse = await fetch(GAS_URL, {
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

      const responseText = await gasResponse.text();

      if (gasResponse.ok || responseText.includes("성공")) {
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      } else {
        console.error("GAS Error Response:", responseText);
        return new Response(JSON.stringify({ error: "신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }), {
          status: 500,
          headers: {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
          },
        });
      }
    } catch (error) {
      console.error("Submission Error Details:", error);
      return new Response(JSON.stringify({ error: "서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요." }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }
  },
};
