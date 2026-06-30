import type { PostHogConfig } from "posthog-js";

export const CANONICAL_POSTHOG_HOST = "https://us.i.posthog.com";
export const REPLAY_MASK_TEXT_SELECTOR = "[data-ph-mask], .ph-mask, [data-replay-mask], .zerogo-replay-mask";
export const REPLAY_BLOCK_SELECTOR = "[data-ph-block], .ph-no-capture, [data-replay-block], .zerogo-replay-block";
export const LANDING_REPLAY_ROUTE_DECISIONS = {
  "/": true,
  "/admin": false,
  "/api/apply": false,
  "/blog": false,
  "/blog/[slug]": false,
  "/blog/[slug]/opengraph-image": false,
  "/blog/opengraph-image": false,
  "/opengraph-image": false,
  "/order-timing-calculator": false,
  "/order-timing-calculator/opengraph-image": false,
  "/robots.txt": false,
  "/sitemap.xml": false,
} as const;

type ReplayConfig = Partial<PostHogConfig> & {
  session_recording: NonNullable<Partial<PostHogConfig>["session_recording"]> & {
    recordHeaders: false;
    recordBody: false;
  };
};

export type SessionReplayController = {
  startSessionRecording?: (override?: true) => void;
  stopSessionRecording?: () => void;
};

export function posthogReplayHost(): string {
  return (process.env.NEXT_PUBLIC_POSTHOG_HOST || CANONICAL_POSTHOG_HOST).replace(/\/$/, "");
}

export function posthogReplayKey(): string | null {
  const key = process.env.NEXT_PUBLIC_POSTHOG_KEY?.trim();
  return key || null;
}

export function buildPostHogReplayConfig(): ReplayConfig {
  return {
    api_host: posthogReplayHost(),
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    enable_recording_console_log: false,
    capture_performance: false,
    session_recording: {
      maskAllInputs: true,
      maskTextSelector: REPLAY_MASK_TEXT_SELECTOR,
      blockSelector: REPLAY_BLOCK_SELECTOR,
      recordHeaders: false,
      recordBody: false,
    },
  };
}

export function shouldRecordLandingActivationReplay(pathname: string | null | undefined): boolean {
  if (!pathname) return false;
  const path = normalizePath(pathname);
  return LANDING_REPLAY_ROUTE_DECISIONS[path as keyof typeof LANDING_REPLAY_ROUTE_DECISIONS] === true;
}

export function syncSessionReplayRecording(
  posthog: SessionReplayController,
  shouldRecord: boolean
): void {
  try {
    if (shouldRecord) {
      posthog.startSessionRecording?.(true);
      return;
    }
    posthog.stopSessionRecording?.();
  } catch {
    // Replay must never affect landing navigation.
  }
}

function normalizePath(pathname: string | null | undefined): string {
  if (!pathname) return "/";
  const path = pathname.split("?", 1)[0].split("#", 1)[0] || "/";
  return path.length > 1 ? path.replace(/\/+$/, "") : path;
}
