export const LANDING_MEDIA_GCS_PUBLIC_BASE =
  "https://storage.googleapis.com/zerogo-494800-landing-media-prod";

const LEGACY_MEDIA_PATH =
  /^\/landing-media\/([a-f0-9]{64})\.(jpg|png|mp4)$/;
const DIRECT_IMAGE_SUFFIX =
  /^\/landing-media\/([a-f0-9]{64})\.(jpg|png)$/;

export type TrustedLandingMediaPath = {
  path: string;
  extension: "jpg" | "png" | "mp4";
  delivery: "relative" | "gcs";
};

export function validatedLandingMediaGCSBase(
  raw: string | undefined =
    process.env.NEXT_PUBLIC_LANDING_MEDIA_GCS_PUBLIC_BASE,
): string | null {
  return raw === LANDING_MEDIA_GCS_PUBLIC_BASE ? raw : null;
}

export function readTrustedLandingMediaPath(
  raw: string,
  configuredBase: string | undefined =
    process.env.NEXT_PUBLIC_LANDING_MEDIA_GCS_PUBLIC_BASE,
): TrustedLandingMediaPath | null {
  const legacy = LEGACY_MEDIA_PATH.exec(raw);
  if (legacy) {
    return {
      path: raw,
      extension: legacy[2] as TrustedLandingMediaPath["extension"],
      delivery: "relative",
    };
  }

  const base = validatedLandingMediaGCSBase(configuredBase);
  if (!base || raw.includes("%")) return null;

  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (
    url.protocol !== "https:" ||
    url.hostname !== "storage.googleapis.com" ||
    url.port ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    return null;
  }

  const baseURL = new URL(base);
  if (url.origin !== baseURL.origin || !url.pathname.startsWith(baseURL.pathname)) {
    return null;
  }
  const match = DIRECT_IMAGE_SUFFIX.exec(
    url.pathname.slice(baseURL.pathname.length),
  );
  if (!match) return null;
  const canonical = `${base}/landing-media/${match[1]}.${match[2]}`;
  if (raw !== canonical) return null;
  return {
    path: canonical,
    extension: match[2] as "jpg" | "png",
    delivery: "gcs",
  };
}
