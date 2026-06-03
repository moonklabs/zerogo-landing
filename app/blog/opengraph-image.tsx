import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ZEROGO 블로그 - 쿠팡 재고 관리·품절 방지 가이드";

// OG image for the /blog list segment. File-convention OG images are not
// inherited from the app-root image, so this segment needs its own.
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          backgroundColor: "#ffffff",
          padding: "100px",
        }}
      >
        <div
          style={{
            fontSize: 30,
            fontWeight: 700,
            color: "#FF5619",
            letterSpacing: "-0.02em",
          }}
        >
          ZEROGO 블로그
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 24,
            fontSize: 64,
            fontWeight: 800,
            color: "#171717",
            lineHeight: 1.25,
            letterSpacing: "-0.03em",
          }}
        >
          <span>쿠팡 재고 관리·품절 방지</span>
          <span>실전 가이드와 인사이트</span>
        </div>
        <div
          style={{
            marginTop: 40,
            height: 10,
            width: 220,
            backgroundColor: "#FF5619",
            borderRadius: 9999,
          }}
        />
      </div>
    ),
    { ...size }
  );
}
