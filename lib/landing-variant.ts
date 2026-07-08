import { unstable_cache } from "next/cache";

// 랜딩 변형 config — utm_content(=메타 광고 ID)로 zerogo-backend에서 히어로 슬롯을
// 가져온다. 실험 대시보드에서 발행하면 /api/revalidate 훅이 태그를 무효화해
// ~1초 내 반영된다. config가 없거나 API가 죽으면 null → 기본 문구로 렌더.
export type LandingVariantSlots = {
  headline: string;
  subheadline: string;
  ctaText: string;
  variantId: number;
};

const CONFIG_API_BASE =
  process.env.LANDING_CONFIG_API_BASE ?? "https://api.zerogo.ai";

export async function getLandingVariant(
  utmContent: string | undefined
): Promise<LandingVariantSlots | null> {
  if (!utmContent) return null;
  return unstable_cache(
    async () => {
      try {
        const response = await fetch(
          `${CONFIG_API_BASE}/api/v1/landing-variant?utm_content=${encodeURIComponent(utmContent)}`,
          { signal: AbortSignal.timeout(1500) }
        );
        if (!response.ok) return null;
        const data = (await response.json()) as {
          headline?: string;
          subheadline?: string;
          cta_text?: string;
          variant_id?: number;
        };
        if (!data.headline || typeof data.variant_id !== "number") return null;
        return {
          headline: data.headline,
          subheadline: data.subheadline ?? "",
          ctaText: data.cta_text ?? "",
          variantId: data.variant_id,
        };
      } catch {
        // config API 장애가 랜딩을 막으면 안 된다 — 기본 렌더로 폴백
        return null;
      }
    },
    ["landing-variant", utmContent],
    { tags: [`variant:${utmContent}`], revalidate: 60 }
  )();
}
