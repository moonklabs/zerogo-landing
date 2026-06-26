import type { Metadata } from "next";
import OrderTimingCalculatorClient from "@/app/_components/OrderTimingCalculatorClient";
import { SITE_NAME, SITE_URL } from "@/lib/site";

const title = "쿠팡 로켓그로스 발주 타이밍 계산기";
const description =
  "재고 몇 개가 아니라 며칠 남았는지로 보세요. 현재 재고와 일평균 판매량을 입력하면 오늘 발주해야 할지 30초 안에 계산합니다.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/order-timing-calculator" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: `${SITE_URL}/order-timing-calculator`,
    title,
    description,
    images: [
      {
        url: "/order-timing-calculator/opengraph-image",
        width: 1200,
        height: 630,
        alt: "쿠팡 로켓그로스 발주 타이밍 계산기",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/order-timing-calculator/opengraph-image"],
  },
};

const calculatorSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: title,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  url: `${SITE_URL}/order-timing-calculator`,
  description,
  offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
};

export default function OrderTimingCalculatorPage() {
  return (
    <>
      <OrderTimingCalculatorClient />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(calculatorSchema) }}
      />
    </>
  );
}
