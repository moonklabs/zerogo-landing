import type { LandingHeroMedia, LandingVariantSlots } from "@/lib/landing-variant";

export const HERO_PREVIEW_PROTOCOL_VERSION = 1 as const;
export const HERO_PREVIEW_READY = "hero.preview.ready" as const;
export const HERO_PREVIEW_UPDATE = "hero.preview.update" as const;
export const HERO_PREVIEW_FILE = "hero.preview.file" as const;
export const HERO_PREVIEW_APPLIED = "hero.preview.applied" as const;

const NONCE = /^[a-zA-Z0-9-]{16,128}$/;
const LOCAL_MEDIA_ID = /^[a-zA-Z0-9-]{8,128}$/;
const IMMUTABLE_MEDIA_PATH = /^\/landing-media\/[a-f0-9]{64}\.(?:jpg|png|mp4)$/;
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export type HeroPreviewMedia =
  | { source: "default"; alt: string }
  | { source: "asset"; kind: "image" | "video"; path: string; mimeType: "image/jpeg" | "image/png" | "video/mp4"; alt: string; width?: number; height?: number }
  | { source: "local"; kind: "image"; id: string; alt: string };

export type HeroPreviewUpdate = {
  protocolVersion: typeof HERO_PREVIEW_PROTOCOL_VERSION;
  nonce: string;
  type: typeof HERO_PREVIEW_UPDATE;
  revision: number;
  payload: {
    badge: string;
    headline: string;
    subheadline: string;
    ctaText: string;
    media: HeroPreviewMedia;
  };
};

export type HeroPreviewFile = {
  protocolVersion: typeof HERO_PREVIEW_PROTOCOL_VERSION;
  nonce: string;
  type: typeof HERO_PREVIEW_FILE;
  payload: { id: string; file: File };
};

export type HeroPreviewReady = {
  protocolVersion: typeof HERO_PREVIEW_PROTOCOL_VERSION;
  nonce: string;
  type: typeof HERO_PREVIEW_READY;
  payload: Record<string, never>;
};

export type HeroPreviewApplied = {
  protocolVersion: typeof HERO_PREVIEW_PROTOCOL_VERSION;
  nonce: string;
  type: typeof HERO_PREVIEW_APPLIED;
  payload: { revision: number };
};

function plainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function safeText(value: unknown, max: number): value is string {
  return typeof value === "string" && value.length <= max && !/[\u0000-\u0008\u000b-\u001f\u007f-\u009f]/u.test(value);
}

export function isPreviewNonce(value: unknown): value is string {
  return typeof value === "string" && NONCE.test(value);
}

export function isExpectedPreviewParent(event: Pick<MessageEvent, "origin" | "source">, parentOrigin: string, parentWindow: Window): boolean {
  return event.origin === parentOrigin && event.source === parentWindow;
}

function readMedia(value: unknown): HeroPreviewMedia | null {
  if (!plainObject(value) || !safeText(value.alt, 500)) return null;
  if (value.source === "default") return { source: "default", alt: value.alt };
  if (value.source === "local" && value.kind === "image" && typeof value.id === "string" && LOCAL_MEDIA_ID.test(value.id)) {
    return { source: "local", kind: "image", id: value.id, alt: value.alt };
  }
  if (value.source !== "asset" || (value.kind !== "image" && value.kind !== "video") || typeof value.path !== "string" || !IMMUTABLE_MEDIA_PATH.test(value.path)) return null;
  const extension = value.path.slice(value.path.lastIndexOf(".") + 1);
  const validKind =
    (value.kind === "video" && value.mimeType === "video/mp4" && extension === "mp4") ||
    (value.kind === "image" && value.mimeType === "image/png" && extension === "png") ||
    (value.kind === "image" && value.mimeType === "image/jpeg" && extension === "jpg");
  if (!validKind) return null;
  const mimeType = value.mimeType as "image/jpeg" | "image/png" | "video/mp4";
  const width = typeof value.width === "number" && Number.isSafeInteger(value.width) && value.width > 0 ? value.width : undefined;
  const height = typeof value.height === "number" && Number.isSafeInteger(value.height) && value.height > 0 ? value.height : undefined;
  return { source: "asset", kind: value.kind, path: value.path, mimeType, alt: value.alt, width, height };
}

export function readHeroPreviewUpdate(value: unknown, nonce: string): HeroPreviewUpdate | null {
  if (!plainObject(value) || value.protocolVersion !== HERO_PREVIEW_PROTOCOL_VERSION || value.nonce !== nonce || value.type !== HERO_PREVIEW_UPDATE || !Number.isSafeInteger(value.revision) || Number(value.revision) < 1 || !plainObject(value.payload)) return null;
  const payload = value.payload;
  if (!safeText(payload.badge, 100) || !safeText(payload.headline, 300) || !safeText(payload.subheadline, 500) || !safeText(payload.ctaText, 100)) return null;
  const media = readMedia(payload.media);
  if (!media) return null;
  return {
    protocolVersion: HERO_PREVIEW_PROTOCOL_VERSION,
    nonce,
    type: HERO_PREVIEW_UPDATE,
    revision: Number(value.revision),
    payload: { badge: payload.badge, headline: payload.headline, subheadline: payload.subheadline, ctaText: payload.ctaText, media },
  };
}

export function readHeroPreviewFile(value: unknown, nonce: string): HeroPreviewFile | null {
  if (!plainObject(value) || value.protocolVersion !== HERO_PREVIEW_PROTOCOL_VERSION || value.nonce !== nonce || value.type !== HERO_PREVIEW_FILE || !plainObject(value.payload)) return null;
  const { id, file } = value.payload;
  if (typeof id !== "string" || !LOCAL_MEDIA_ID.test(id) || !(file instanceof File) || !["image/jpeg", "image/png"].includes(file.type) || file.size <= 0 || file.size > MAX_IMAGE_BYTES) return null;
  return { protocolVersion: HERO_PREVIEW_PROTOCOL_VERSION, nonce, type: HERO_PREVIEW_FILE, payload: { id, file } };
}

export function toPreviewSlots(update: HeroPreviewUpdate, localMedia: { id: string; url: string; mimeType: "image/jpeg" | "image/png" } | null): LandingVariantSlots | null {
  const media = update.payload.media;
  let heroMedia: LandingHeroMedia | undefined;
  if (media.source === "local") {
    if (!localMedia || localMedia.id !== media.id) return null;
    heroMedia = { assetId: 1, kind: "image", path: localMedia.url, mimeType: localMedia.mimeType, alt: media.alt || "업로드 이미지 미리보기" };
  } else if (media.source === "asset") {
    heroMedia = { assetId: 1, kind: media.kind, path: media.path, mimeType: media.mimeType, width: media.width, height: media.height, alt: media.alt || "히어로 미디어 미리보기" };
  }
  return {
    variantId: -1,
    heroSchemaVersion: 1,
    badgeText: update.payload.badge,
    headline: update.payload.headline,
    subheadline: update.payload.subheadline,
    ctaText: update.payload.ctaText,
    heroMedia,
  };
}
