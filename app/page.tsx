import type { Metadata } from "next";
import HomeClient from "@/app/_components/HomeClient";
import { buildServerLandingAttribution } from "@/lib/activation-attribution";
import { getLandingVariant } from "@/lib/landing-variant";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams;
  const initialAttribution = buildServerLandingAttribution({
    landingPath: "/",
    searchParams: resolvedSearchParams,
  });
  // 실험 변형 슬롯 — utm_content(메타 광고 ID)에 발행된 문구가 있으면 히어로를 덮어쓴다
  const utmContent =
    typeof resolvedSearchParams.utm_content === "string"
      ? resolvedSearchParams.utm_content
      : undefined;
  const variantSlots = await getLandingVariant(utmContent);
  return (
    <HomeClient
      initialAttribution={initialAttribution}
      variantSlots={variantSlots}
    />
  );
}
