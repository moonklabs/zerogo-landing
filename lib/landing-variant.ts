import { unstable_cache } from "next/cache";
import { readTrustedLandingMediaPath } from "@/lib/landing-media-gcs";

// 랜딩 변형 config — utm_content(=메타 광고 ID)로 zerogo-backend에서 히어로 슬롯을
// 가져온다. 실험 대시보드에서 발행하면 /api/revalidate 훅이 태그를 무효화해
// ~1초 내 반영된다. config가 없거나 API가 죽으면 null → 기본 문구로 렌더.
export type LandingVariantSlots = {
  headline: string;
  subheadline: string;
  ctaText: string;
  variantId: number;
  heroSchemaVersion?: 1;
  badgeText?: string;
  heroMedia?: LandingHeroMedia;
};

export type LandingHeroMedia = {
  assetId: number;
  kind: "image" | "video";
  path: string;
  mimeType: "image/jpeg" | "image/png" | "video/mp4";
  width?: number;
  height?: number;
  alt: string;
};

const CONFIG_API_BASE =
  process.env.LANDING_CONFIG_API_BASE ?? "https://api.zerogo.ai";

const CONTROL_CHARACTER = /[\u0000-\u0009\u000b-\u001f\u007f-\u009f\u202a-\u202e\u2066-\u2069]/u;

type PublicVariantPayload = {
  headline?: unknown;
  subheadline?: unknown;
  cta_text?: unknown;
  variant_id?: unknown;
  hero_schema_version?: unknown;
  badge_text?: unknown;
  hero_media?: unknown;
};

function validHeadline(value: unknown): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.split("\n").length <= 3 &&
    !value.includes("\r") &&
    !CONTROL_CHARACTER.test(value)
  );
}

function parseHeroMedia(value: unknown): LandingHeroMedia | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const media = value as Record<string, unknown>;
  const trustedPath =
    typeof media.path === "string"
      ? readTrustedLandingMediaPath(media.path)
      : null;
  if (
    typeof media.asset_id !== "number" ||
    !Number.isSafeInteger(media.asset_id) ||
    media.asset_id <= 0 ||
    (media.kind !== "image" && media.kind !== "video") ||
    !trustedPath ||
    typeof media.mime_type !== "string" ||
    typeof media.alt !== "string" ||
    media.alt.trim().length === 0 ||
    CONTROL_CHARACTER.test(media.alt)
  ) {
    return undefined;
  }

  const extension = trustedPath.extension;
  const matchesKind =
    (media.kind === "video" && media.mime_type === "video/mp4" && extension === "mp4") ||
    (media.kind === "image" && media.mime_type === "image/png" && extension === "png") ||
    (media.kind === "image" && media.mime_type === "image/jpeg" && extension === "jpg");
  if (!matchesKind) return undefined;

  const width = typeof media.width === "number" && Number.isSafeInteger(media.width) ? media.width : undefined;
  const height = typeof media.height === "number" && Number.isSafeInteger(media.height) ? media.height : undefined;
  if (media.kind === "image" && (!width || !height || width > 8192 || height > 8192 || width * height > 40_000_000)) {
    return undefined;
  }
  if ((width !== undefined && width <= 0) || (height !== undefined && height <= 0)) return undefined;

  return {
    assetId: media.asset_id,
    kind: media.kind,
    path: trustedPath.path,
    mimeType: media.mime_type as LandingHeroMedia["mimeType"],
    width,
    height,
    alt: media.alt.trim(),
  };
}

export function parseLandingVariantPayload(data: PublicVariantPayload): LandingVariantSlots | null {
  if (!validHeadline(data.headline) || typeof data.variant_id !== "number" || !Number.isSafeInteger(data.variant_id)) {
    return null;
  }
  if (typeof data.subheadline !== "string" && data.subheadline !== undefined) return null;
  if (typeof data.cta_text !== "string" && data.cta_text !== undefined) return null;

  const base: LandingVariantSlots = {
    headline: data.headline,
    subheadline: data.subheadline ?? "",
    ctaText: data.cta_text ?? "",
    variantId: data.variant_id,
  };
  if (data.hero_schema_version === undefined || data.hero_schema_version === null) return base;
  if (data.hero_schema_version !== 1 || typeof data.badge_text !== "string" || !data.badge_text.trim() || CONTROL_CHARACTER.test(data.badge_text)) {
    return null;
  }
  return {
    ...base,
    heroSchemaVersion: 1,
    badgeText: data.badge_text.trim(),
    heroMedia: parseHeroMedia(data.hero_media),
  };
}

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
        const data = (await response.json()) as PublicVariantPayload;
        return parseLandingVariantPayload(data);
      } catch {
        // config API 장애가 랜딩을 막으면 안 된다 — 기본 렌더로 폴백
        return null;
      }
    },
    ["landing-variant", utmContent],
    { tags: [`variant:${utmContent}`], revalidate: 60 }
  )();
}
