import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import HomeClient from "../../app/_components/HomeClient";
import { LANDING_MEDIA_GCS_PUBLIC_BASE } from "../../lib/landing-media-gcs";
import { parseLandingVariantPayload } from "../../lib/landing-variant";

const SHA = "a".repeat(64);

afterEach(() => vi.unstubAllEnvs());

describe("landing Hero V1", () => {
  it("keeps legacy copy without accepting Hero V1 fields", () => {
    expect(
      parseLandingVariantPayload({
        headline: "저장된 레거시 문구",
        subheadline: "레거시 설명",
        cta_text: "레거시 CTA",
        variant_id: 7,
        badge_text: "무시해야 하는 배지",
        hero_media: { path: `https://evil.example/${SHA}.png` },
      }),
    ).toEqual({
      headline: "저장된 레거시 문구",
      subheadline: "레거시 설명",
      ctaText: "레거시 CTA",
      variantId: 7,
    });
  });

  it("accepts immutable Hero V1 media and drops only an invalid media descriptor", () => {
    const valid = parseLandingVariantPayload({
      headline: "첫 줄\n둘째 줄",
      subheadline: "설명",
      cta_text: "시작하기",
      variant_id: 8,
      hero_schema_version: 1,
      badge_text: "품절 방지",
      hero_media: {
        asset_id: 42,
        kind: "image",
        path: `/landing-media/${SHA}.png`,
        mime_type: "image/png",
        width: 1200,
        height: 800,
        alt: "대시보드 화면",
      },
    });
    expect(valid?.heroMedia?.path).toBe(`/landing-media/${SHA}.png`);
    const imageHtml = renderToStaticMarkup(
      React.createElement(HomeClient, { variantSlots: valid }),
    );
    expect(imageHtml).toContain('data-slot="hero"');
    expect(imageHtml).toContain('data-slot="badge"');
    expect(imageHtml).toContain('data-slot="headline"');
    expect(imageHtml).toContain('data-slot="sub"');
    expect(imageHtml).toContain('data-slot="cta"');
    expect(imageHtml).toContain('data-slot="media"');
    expect(imageHtml.indexOf('data-slot="badge"')).toBeLessThan(
      imageHtml.indexOf('data-slot="headline"'),
    );
    expect(imageHtml).toContain(`src="/landing-media/${SHA}.png"`);
    expect(imageHtml).toContain('alt="대시보드 화면"');

    vi.stubEnv(
      "NEXT_PUBLIC_LANDING_MEDIA_GCS_PUBLIC_BASE",
      LANDING_MEDIA_GCS_PUBLIC_BASE,
    );
    const directPath = `${LANDING_MEDIA_GCS_PUBLIC_BASE}/landing-media/${SHA}.png`;
    const direct = parseLandingVariantPayload({
      headline: "첫 줄\n둘째 줄",
      subheadline: "설명",
      cta_text: "시작하기",
      variant_id: 8,
      hero_schema_version: 1,
      badge_text: "품절 방지",
      hero_media: {
        asset_id: 42,
        kind: "image",
        path: directPath,
        mime_type: "image/png",
        width: 1200,
        height: 800,
        alt: "대시보드 화면",
      },
    });
    expect(direct?.heroMedia?.path).toBe(directPath);
    expect(
      renderToStaticMarkup(
        React.createElement(HomeClient, { variantSlots: direct }),
      ),
    ).toContain(`src="${directPath}"`);

    const invalid = parseLandingVariantPayload({
      headline: "첫 줄\n둘째 줄",
      subheadline: "설명",
      cta_text: "시작하기",
      variant_id: 8,
      hero_schema_version: 1,
      badge_text: "품절 방지",
      hero_media: {
        asset_id: 42,
        kind: "image",
        path: `https://storage.googleapis.com/other-bucket/landing-media/${SHA}.png`,
        mime_type: "image/png",
        width: 1200,
        height: 800,
        alt: "대시보드 화면",
      },
    });
    expect(invalid).toMatchObject({ headline: "첫 줄\n둘째 줄", badgeText: "품절 방지" });
    expect(invalid?.heroMedia).toBeUndefined();
  });

  it("renders custom video media with its configured accessible label", () => {
    const video = parseLandingVariantPayload({
      headline: "영상 헤드라인",
      subheadline: "설명",
      cta_text: "시작하기",
      variant_id: 11,
      hero_schema_version: 1,
      badge_text: "품절 방지",
      hero_media: {
        asset_id: 43,
        kind: "video",
        path: `/landing-media/${SHA}.mp4`,
        mime_type: "video/mp4",
        width: 1280,
        height: 720,
        alt: "재고 대시보드 영상",
      },
    });
    const html = renderToStaticMarkup(
      React.createElement(HomeClient, { variantSlots: video }),
    );
    expect(html).toContain('aria-label="재고 대시보드 영상"');
    expect(html).toContain(`src="/landing-media/${SHA}.mp4"`);
  });

  it("rejects malformed whole responses and renders headline lines as escaped text", () => {
    expect(
      parseLandingVariantPayload({
        headline: "하나\n둘\n셋\n넷",
        variant_id: 9,
      }),
    ).toBeNull();
    expect(
      parseLandingVariantPayload({
        headline: "문구",
        variant_id: 9,
        hero_schema_version: 1,
      }),
    ).toBeNull();

    const html = renderToStaticMarkup(
      React.createElement(HomeClient, {
        variantSlots: {
          headline: "첫 줄\n<script>alert(1)</script>",
          subheadline: "설명",
          ctaText: "시작하기",
          variantId: 9,
          heroSchemaVersion: 1,
          badgeText: "품절 방지",
        },
      }),
    );
    expect(html).toContain("첫 줄<br/>&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>alert(1)</script>");
    expect(html).toContain('src="/zerogo_demo.mp4"');
  });

  it("preserves intentionally empty configured subheadline and CTA", () => {
    const html = renderToStaticMarkup(
      React.createElement(HomeClient, {
        variantSlots: {
          headline: "구성된 헤드라인",
          subheadline: "",
          ctaText: "",
          variantId: 10,
        },
      }),
    );
    const hero = html.match(/<section[^>]*>[\s\S]*?<\/section>/)?.[0] ?? "";
    expect(hero).toContain("구성된 헤드라인");
    expect(hero).not.toContain("계정마다 열어보던 재고 확인을");
    expect(hero).not.toContain("카카오로 7일 무료체험 시작하기");
  });
});
