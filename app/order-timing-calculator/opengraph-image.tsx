import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "쿠팡 로켓그로스 발주 타이밍 계산기";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#ffffff",
          padding: 76,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div
            style={{
              color: "#FF5619",
              fontSize: 34,
              fontWeight: 900,
              letterSpacing: "-0.02em",
            }}
          >
            ZEROGO
          </div>
          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              color: "#18181B",
              fontSize: 24,
              fontWeight: 800,
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                background: "#F0453A",
                display: "flex",
              }}
            />
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                background: "#F59E0B",
                display: "flex",
              }}
            />
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: 999,
                background: "#16A34A",
                display: "flex",
              }}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: "#FF5619",
              fontSize: 30,
              fontWeight: 800,
              marginBottom: 24,
            }}
          >
            로켓그로스 셀러용 무료 도구
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "#18181B",
              fontSize: 74,
              lineHeight: 1.12,
              fontWeight: 900,
              letterSpacing: "-0.04em",
            }}
          >
            <span>이 상품,</span>
            <span>오늘 발주해야 할까요?</span>
          </div>
          <div
            style={{
              marginTop: 28,
              color: "#52525B",
              fontSize: 30,
              fontWeight: 600,
            }}
          >
            재고 몇 개 말고, 며칠 남았는지로 보세요.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            color: "#18181B",
            fontSize: 24,
            fontWeight: 800,
          }}
        >
          <div
            style={{
              border: "2px solid #E5E7EB",
              borderRadius: 999,
              padding: "14px 24px",
            }}
          >
            발주 타이밍
          </div>
          <div
            style={{
              border: "2px solid #E5E7EB",
              borderRadius: 999,
              padding: "14px 24px",
            }}
          >
            권장 수량
          </div>
          <div
            style={{
              border: "2px solid #E5E7EB",
              borderRadius: 999,
              padding: "14px 24px",
            }}
          >
            공유 복사
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
