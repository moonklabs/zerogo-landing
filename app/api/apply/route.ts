import { NextResponse, after } from "next/server";

export const dynamic = "force-dynamic";

interface ApplyPayload {
  name: string;
  email: string;
  channel: string;
}

async function sendSlackNotification(payload: ApplyPayload): Promise<void> {
  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
  if (!SLACK_WEBHOOK_URL) {
    console.warn("SLACK_WEBHOOK_URL not configured, skipping Slack notification");
    return;
  }

  const timestamp = new Date().toLocaleString("ko-KR", { timeZone: "Asia/Seoul" });
  const channelLabel = payload.channel === "instagram" ? "인스타그램" : "네이버 지식인";

  const slackBody = {
    text: "🎉 새 사전 신청!",
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
      body: JSON.stringify(slackBody)
    });
    if (!response.ok) {
      console.error("Slack notification failed:", await response.text());
    }
  } catch (error) {
    console.error("Slack notification error:", error);
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body = await req.json();
    const name = typeof body?.name === "string" ? body.name.trim() : "";
    const email = typeof body?.email === "string" ? body.email.trim() : "";
    const channel = typeof body?.channel === "string" ? body.channel.trim() : "";

    if (!name || !email || !channel) {
      return NextResponse.json(
        { error: "모든 필드를 입력해주세요." },
        { status: 400 }
      );
    }

    const emailValid =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
    if (!emailValid || name.length > 100 || channel.length > 50) {
      return NextResponse.json(
        { error: "입력값을 다시 확인해주세요." },
        { status: 400 }
      );
    }

    const GAS_URL = process.env.GAS_URL ?? "https://script.google.com/macros/s/AKfycbw68O2Im54Jmpy4DHKxdALwHGXVUrZPkQT8wTVS0XrOAx9QKVjr4BBNyBq_7cRyv1bW/exec";
    const AUTH_KEY = process.env.GAS_AUTH_KEY;

    if (!AUTH_KEY) {
      console.error("GAS_AUTH_KEY not configured");
      return NextResponse.json(
        { error: "서버 설정 오류입니다. 관리자에게 문의해주세요." },
        { status: 500 }
      );
    }

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
      // Schedule Slack notification to run after response is sent
      after(() => sendSlackNotification({ name, email, channel }));
      return NextResponse.json({ success: true });
    } else {
      console.error("GAS Error Response:", responseText);
      return NextResponse.json(
        { error: "신청 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Submission Error Details:", error);
    return NextResponse.json(
      { error: "서버 연결에 실패했습니다. 네트워크 상태를 확인해주세요." },
      { status: 500 }
    );
  }
}
