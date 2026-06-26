export type LandingCta = {
  id: string;
  label: string;
};

export type LandingInitialAttribution = Partial<Record<AttributionKey, string>>;

type AttributionKey =
  | "entry_source"
  | "activation_journey_id"
  | "landing_distinct_id"
  | "landing_host"
  | "landing_path"
  | "landing_cta_id"
  | "landing_cta_label"
  | "utm_source"
  | "utm_medium"
  | "utm_campaign"
  | "utm_term"
  | "utm_content"
  | "referrer_domain";

type ServerSearchParams = Record<string, string | string[] | undefined>;

const DISTINCT_ID_STORAGE_KEY = "zerogo.landingDistinctId.v1";
const JOURNEY_ID_STORAGE_KEY = "zerogo.activationJourneyId.v1";
const PAGE_VIEWED_STORAGE_KEY = "zerogo.landingPageViewed.v1";
const POSTHOG_HOST = (process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com").replace(/\/$/, "");
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const SERVER_ATTRIBUTION_KEYS: AttributionKey[] = [
  "entry_source",
  "landing_path",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "referrer_domain",
];

function normalizeValue(value: string | undefined): string | undefined {
  const normalized = value?.trim();
  if (!normalized) return undefined;
  return normalized.slice(0, 255);
}

function firstSearchParam(
  searchParams: ServerSearchParams | undefined,
  key: string
): string | undefined {
  const value = searchParams?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function randomId(prefix: string): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2)}`;
}

function readStorage(storage: Storage | undefined, key: string): string | null {
  try {
    return storage?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

function writeStorage(storage: Storage | undefined, key: string, value: string): void {
  try {
    storage?.setItem(key, value);
  } catch {
    // Attribution must not block navigation.
  }
}

function stableLocalId(key: string, prefix: string): string {
  if (typeof window === "undefined") return randomId(prefix);
  const existing = readStorage(window.localStorage, key);
  if (existing) return existing;
  const next = randomId(prefix);
  writeStorage(window.localStorage, key, next);
  return next;
}

function stableSessionId(key: string, prefix: string): string {
  if (typeof window === "undefined") return randomId(prefix);
  const existing = readStorage(window.sessionStorage, key);
  if (existing) return existing;
  const next = randomId(prefix);
  writeStorage(window.sessionStorage, key, next);
  return next;
}

function referrerDomain(): string | undefined {
  if (typeof document === "undefined" || !document.referrer) return undefined;
  try {
    return new URL(document.referrer).hostname || undefined;
  } catch {
    return undefined;
  }
}

function posthogKey(): string | undefined {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim() || undefined;
}

function hasCapturedLandingPageView(activationJourneyId: string | undefined): boolean {
  if (typeof window === "undefined" || !activationJourneyId) return false;
  const existing = readStorage(window.sessionStorage, PAGE_VIEWED_STORAGE_KEY);
  if (existing === activationJourneyId) return true;
  writeStorage(window.sessionStorage, PAGE_VIEWED_STORAGE_KEY, activationJourneyId);
  return false;
}

export function buildServerLandingAttribution({
  landingPath,
  searchParams,
}: {
  landingPath: string;
  searchParams?: ServerSearchParams;
}): LandingInitialAttribution {
  const attribution: LandingInitialAttribution = {
    entry_source: "landing",
    landing_path: landingPath,
  };
  for (const key of UTM_KEYS) {
    const value = normalizeValue(firstSearchParam(searchParams, key));
    if (value) attribution[key] = value;
  }
  return attribution;
}

function buildLandingBaseAttribution(
  initialAttribution: LandingInitialAttribution = {}
): Record<string, string> {
  if (typeof window === "undefined") {
    const attribution: Record<string, string> = {
      entry_source: "landing",
    };
    for (const key of SERVER_ATTRIBUTION_KEYS) {
      const value = normalizeValue(initialAttribution[key]);
      if (value) attribution[key] = value;
    }
    return attribution;
  }

  const params = new URLSearchParams(window.location.search);
  const attribution: Record<string, string> = {
    entry_source: "landing",
    activation_journey_id: stableSessionId(JOURNEY_ID_STORAGE_KEY, "journey"),
    landing_distinct_id: stableLocalId(DISTINCT_ID_STORAGE_KEY, "landing"),
    landing_host: window.location.hostname,
    landing_path: window.location.pathname,
  };
  for (const key of UTM_KEYS) {
    const value = params.get(key)?.trim();
    if (value) attribution[key] = value;
  }
  const referrer = referrerDomain();
  if (referrer) attribution.referrer_domain = referrer;
  return attribution;
}

export function buildLandingAttribution(
  cta: LandingCta,
  initialAttribution: LandingInitialAttribution = {}
): Record<string, string> {
  return {
    ...buildLandingBaseAttribution(initialAttribution),
    landing_cta_id: cta.id,
    landing_cta_label: cta.label,
  };
}

export function buildAttributedAppUrl(
  appBaseUrl: string,
  cta: LandingCta,
  initialAttribution?: LandingInitialAttribution
): string {
  const url = new URL("/login", appBaseUrl);
  const attribution = buildLandingAttribution(cta, initialAttribution);
  for (const [key, value] of Object.entries(attribution)) {
    url.searchParams.set(key, value);
  }
  return url.toString();
}

export function captureLandingPageViewed(): void {
  const key = posthogKey();
  if (!key || typeof window === "undefined") return;
  const attribution = buildLandingBaseAttribution();
  if (hasCapturedLandingPageView(attribution.activation_journey_id)) return;
  const payload = JSON.stringify({
    api_key: key,
    event: "landing_page_viewed",
    distinct_id: attribution.landing_distinct_id,
    properties: {
      category: "activation",
      funnel: "activation",
      step: "landing_page",
      result: "viewed",
      ...attribution,
    },
  });
  try {
    void fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      mode: "cors",
      credentials: "omit",
    }).catch(() => {});
  } catch {
    // Attribution must not block rendering.
  }
}

export function captureLandingCtaClicked(cta: LandingCta): void {
  const key = posthogKey();
  if (!key || typeof window === "undefined") return;
  const attribution = buildLandingAttribution(cta);
  const payload = JSON.stringify({
    api_key: key,
    event: "landing_cta_clicked",
    distinct_id: attribution.landing_distinct_id,
    properties: {
      category: "activation",
      funnel: "activation",
      step: "landing_cta",
      result: "clicked",
      ...attribution,
    },
  });
  try {
    void fetch(`${POSTHOG_HOST}/capture/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: payload,
      keepalive: true,
      mode: "cors",
      credentials: "omit",
    }).catch(() => {});
  } catch {
    // Attribution must not block navigation.
  }
}
