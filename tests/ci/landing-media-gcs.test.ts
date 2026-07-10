import { afterEach, describe, expect, it, vi } from "vitest";
import nextConfig from "../../next.config";
import {
  LANDING_MEDIA_GCS_PUBLIC_BASE,
  readTrustedLandingMediaPath,
  validatedLandingMediaGCSBase,
} from "../../lib/landing-media-gcs";

const sha = "a".repeat(64);
const directPNG = `${LANDING_MEDIA_GCS_PUBLIC_BASE}/landing-media/${sha}.png`;

afterEach(() => vi.unstubAllEnvs());

describe("landing media direct GCS delivery", () => {
  it("enables direct delivery only for the exact compile-time base", () => {
    expect(validatedLandingMediaGCSBase(LANDING_MEDIA_GCS_PUBLIC_BASE)).toBe(
      LANDING_MEDIA_GCS_PUBLIC_BASE,
    );
    for (const rejected of [
      undefined,
      "",
      `${LANDING_MEDIA_GCS_PUBLIC_BASE}/`,
      "http://storage.googleapis.com/zerogo-494800-landing-media-prod",
      "https://storage.googleapis.com/other-bucket",
      "https://storage.googleapis.com:443/zerogo-494800-landing-media-prod",
    ]) {
      expect(validatedLandingMediaGCSBase(rejected)).toBeNull();
    }
  });

  it("accepts legacy relative media and canonical direct GCS images", () => {
    expect(readTrustedLandingMediaPath(`/landing-media/${sha}.jpg`)).toEqual({
      path: `/landing-media/${sha}.jpg`,
      extension: "jpg",
      delivery: "relative",
    });
    expect(readTrustedLandingMediaPath(`/landing-media/${sha}.png`)).toEqual({
      path: `/landing-media/${sha}.png`,
      extension: "png",
      delivery: "relative",
    });
    expect(readTrustedLandingMediaPath(`/landing-media/${sha}.mp4`)).toEqual({
      path: `/landing-media/${sha}.mp4`,
      extension: "mp4",
      delivery: "relative",
    });
    expect(
      readTrustedLandingMediaPath(directPNG, LANDING_MEDIA_GCS_PUBLIC_BASE),
    ).toEqual({ path: directPNG, extension: "png", delivery: "gcs" });
    const directJPG = `${LANDING_MEDIA_GCS_PUBLIC_BASE}/landing-media/${sha}.jpg`;
    expect(
      readTrustedLandingMediaPath(directJPG, LANDING_MEDIA_GCS_PUBLIC_BASE),
    ).toEqual({ path: directJPG, extension: "jpg", delivery: "gcs" });
  });

  it("fails closed for unconfigured or non-canonical absolute media", () => {
    expect(readTrustedLandingMediaPath(directPNG, "")).toBeNull();
    for (const rejected of [
      `${LANDING_MEDIA_GCS_PUBLIC_BASE}/landing-media/${sha}.mp4`,
      `${directPNG}?generation=1`,
      `${directPNG}#fragment`,
      `https://storage.googleapis.com/other-bucket/landing-media/${sha}.png`,
      `https://storage.googleapis.com.evil.example/zerogo-494800-landing-media-prod/landing-media/${sha}.png`,
      `https://user@storage.googleapis.com/zerogo-494800-landing-media-prod/landing-media/${sha}.png`,
      `https://storage.googleapis.com:443/zerogo-494800-landing-media-prod/landing-media/${sha}.png`,
      `${LANDING_MEDIA_GCS_PUBLIC_BASE}/landing-media/${sha}.%70ng`,
      `${LANDING_MEDIA_GCS_PUBLIC_BASE}/prefix/landing-media/${sha}.png`,
    ]) {
      expect(
        readTrustedLandingMediaPath(
          rejected,
          LANDING_MEDIA_GCS_PUBLIC_BASE,
        ),
      ).toBeNull();
    }
    expect(
      readTrustedLandingMediaPath(
        directPNG,
        "https://storage.googleapis.com/other-bucket",
      ),
    ).toBeNull();
  });

  it("uses the exact public compile-time environment value by default", () => {
    vi.stubEnv(
      "NEXT_PUBLIC_LANDING_MEDIA_GCS_PUBLIC_BASE",
      LANDING_MEDIA_GCS_PUBLIC_BASE,
    );
    expect(readTrustedLandingMediaPath(directPNG)?.path).toBe(directPNG);
    vi.stubEnv(
      "NEXT_PUBLIC_LANDING_MEDIA_GCS_PUBLIC_BASE",
      "https://storage.googleapis.com/other-bucket",
    );
    expect(readTrustedLandingMediaPath(directPNG)).toBeNull();
  });

  it("retains only the exact development demo rewrite", async () => {
    vi.stubEnv("NODE_ENV", "development");
    await expect(nextConfig.rewrites?.()).resolves.toEqual([
      {
        source: `/landing-media/${sha}.png`,
        destination: "/images/home/order-preview.png",
      },
    ]);
  });

  it("does not proxy landing media in production", async () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv(
      "NEXT_PUBLIC_LANDING_MEDIA_GCS_PUBLIC_BASE",
      LANDING_MEDIA_GCS_PUBLIC_BASE,
    );
    await expect(nextConfig.rewrites?.()).resolves.toEqual([]);
  });
});
