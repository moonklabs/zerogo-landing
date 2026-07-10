import { afterEach, describe, expect, it, vi } from "vitest";
import {
  HERO_PREVIEW_PROTOCOL_VERSION,
  HERO_PREVIEW_UPDATE,
  isExpectedPreviewParent,
  readHeroPreviewUpdate,
  toPreviewSlots,
} from "../../lib/hero-preview-protocol";
import { allowedPreviewParentOrigin, configuredPreviewParentOrigins } from "../../lib/hero-preview-parent-origin";

const nonce = "1234567890abcdef";
const sha = "a".repeat(64);

afterEach(() => vi.unstubAllEnvs());

describe("Hero preview protocol", () => {
  it("accepts only configured production parent origins", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("LANDING_PREVIEW_ALLOWED_ORIGINS", "https://admin.zerogo.ai");
    expect(allowedPreviewParentOrigin("https://admin.zerogo.ai")).toBe("https://admin.zerogo.ai");
    expect(allowedPreviewParentOrigin("https://evil.example")).toBeNull();
    expect(allowedPreviewParentOrigin("https://admin.zerogo.ai/path")).toBeNull();
    expect(configuredPreviewParentOrigins("https://admin.zerogo.ai, https://admin.zerogo.ai/,http://admin.zerogo.ai,https://admin.zerogo.ai/path,not-a-url")).toEqual([
      "https://admin.zerogo.ai",
    ]);
  });

  it("requires the exact message origin and parent window", () => {
    const parent = {} as Window;
    expect(isExpectedPreviewParent({ origin: "https://admin.zerogo.ai", source: parent }, "https://admin.zerogo.ai", parent)).toBe(true);
    expect(isExpectedPreviewParent({ origin: "https://evil.example", source: parent }, "https://admin.zerogo.ai", parent)).toBe(false);
    expect(isExpectedPreviewParent({ origin: "https://admin.zerogo.ai", source: {} as Window }, "https://admin.zerogo.ai", parent)).toBe(false);
  });

  it("rejects malformed updates and maps immutable media into real landing slots", () => {
    const message = {
      protocolVersion: HERO_PREVIEW_PROTOCOL_VERSION,
      nonce,
      type: HERO_PREVIEW_UPDATE,
      revision: 3,
      payload: {
        badge: "품절 방지",
        headline: "첫 줄\n둘째 줄",
        subheadline: "설명",
        ctaText: "시작하기",
        media: { source: "asset", kind: "image", path: `/landing-media/${sha}.png`, mimeType: "image/png", alt: "재고 화면", width: 1200, height: 800 },
      },
    };
    const update = readHeroPreviewUpdate(message, nonce);
    expect(update).not.toBeNull();
    expect(toPreviewSlots(update!, null)?.heroMedia?.path).toBe(`/landing-media/${sha}.png`);
    expect(readHeroPreviewUpdate({ ...message, nonce: "wrong-nonce-0000" }, nonce)).toBeNull();
    expect(readHeroPreviewUpdate({ ...message, payload: { ...message.payload, media: { ...message.payload.media, path: "https://evil.example/a.png" } } }, nonce)).toBeNull();
  });
});
