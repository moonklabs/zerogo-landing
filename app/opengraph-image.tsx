import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ZEROGO AI - 쿠팡 판매자를 위한 품절 방지 AI 에이전트";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          gap: "24px",
          padding: "60px",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            fontSize: "72px",
            fontWeight: "900",
            color: "#FF5619",
            letterSpacing: "-2px",
          }}
        >
          ZEROGO
        </div>

        <div
          style={{
            fontSize: "32px",
            fontWeight: "500",
            color: "#4B5563",
            textAlign: "center",
            lineHeight: "1.4",
          }}
        >
          쿠팡 판매자를 위한 품절 방지 AI 에이전트
        </div>
      </div>
    ),
    { ...size }
  );
}
