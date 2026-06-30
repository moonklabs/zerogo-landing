import type { Metadata } from "next";
import "./globals.css";
import { ChannelTalkProvider } from "@/app/_components/ChannelTalkProvider";
import { GoogleTagManager } from "@/app/_components/GoogleTagManager";
import {
  SITE_URL,
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
  LOGO_URL,
  COMPANY,
  FAQ_ITEMS,
} from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    url: SITE_URL,
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    locale: "ko_KR",
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
  },
  robots: { index: true, follow: true },
};

// Structured data — emitted once at the document root so AI/search crawlers
// always have entity, product, and FAQ context.
const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: COMPANY.legalName,
  legalName: COMPANY.enName,
  url: SITE_URL,
  logo: LOGO_URL,
  description: SITE_DESCRIPTION,
  foundingDate: COMPANY.foundingDate,
  founders: [{ "@type": "Person", name: COMPANY.ceo }],
  email: COMPANY.email,
  address: {
    "@type": "PostalAddress",
    addressCountry: "KR",
    addressRegion: "경기도",
    streetAddress: COMPANY.address,
  },
  sameAs: [COMPANY.github],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    email: COMPANY.email,
  },
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description:
    "ZEROGO는 쿠팡 판매자를 위해 품절 위험을 감지하고 발주 타이밍을 알려주는 AI 에이전트입니다. 현재 추정 재고와 판매 속도를 분석하여 예상 품절일과 발주 마감일을 계산해 먼저 알려줍니다.",
  url: SITE_URL,
  offers: { "@type": "Offer", price: "0", priceCurrency: "KRW" },
  publisher: { "@type": "Organization", name: COMPANY.enName },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ_ITEMS.map((item) => ({
    "@type": "Question",
    name: item.q,
    acceptedAnswer: { "@type": "Answer", text: item.a },
  })),
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body className="font-sans antialiased">
        <GoogleTagManager />
        {children}
        <ChannelTalkProvider />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(softwareApplicationSchema),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </body>
    </html>
  );
}
