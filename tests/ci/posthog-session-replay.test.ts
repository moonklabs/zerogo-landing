// @vitest-environment jsdom

import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect, afterEach, beforeEach } from "vitest";
import {
  buildPostHogReplayConfig,
  LANDING_REPLAY_ROUTE_DECISIONS,
  shouldRecordLandingActivationReplay,
  syncSessionReplayRecording,
} from "../../lib/posthog-session-replay";
import {
  buildLandingAttribution,
  getLandingReplayDistinctId,
} from "../../lib/activation-attribution";

const root = join(__dirname, "../..");

function createStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.get(key) ?? null;
    },
    key(index) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
  };
}

describe("landing PostHog session replay contract", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createStorage(),
    });
    window.history.replaceState(null, "", "/?utm_source=google");
  });

  afterEach(() => {
    Reflect.deleteProperty(process.env, "NEXT_PUBLIC_POSTHOG_HOST");
  });

  it("uses the canonical PostHog host and conservative replay privacy config", () => {
    const config = buildPostHogReplayConfig();

    expect(config.api_host).toBe("https://us.i.posthog.com");
    expect(config.autocapture).toBe(false);
    expect(config.capture_pageview).toBe(false);
    expect(config.capture_pageleave).toBe(false);
    expect(config.disable_session_recording).toBe(true);
    expect(config.enable_recording_console_log).toBe(false);
    expect(config.capture_performance).toBe(false);
    expect(config.session_recording.maskAllInputs).toBe(true);
    expect(config.session_recording.maskTextSelector).toContain("zerogo-replay-mask");
    expect(config.session_recording.blockSelector).toContain("ph-no-capture");
    expect(config.session_recording.recordHeaders).toBe(false);
    expect(config.session_recording.recordBody).toBe(false);
  });

  it("records only the public activation landing route", () => {
    expect(shouldRecordLandingActivationReplay("/")).toBe(true);
    expect(shouldRecordLandingActivationReplay(null)).toBe(false);
    expect(shouldRecordLandingActivationReplay(undefined)).toBe(false);
    expect(shouldRecordLandingActivationReplay("/blog")).toBe(false);
    expect(shouldRecordLandingActivationReplay("/blog/rocket-growth")).toBe(false);
    expect(shouldRecordLandingActivationReplay("/admin")).toBe(false);
    expect(shouldRecordLandingActivationReplay("/api/anything")).toBe(false);
    expect(shouldRecordLandingActivationReplay("/order-timing-calculator")).toBe(false);
  });

  it("requires every current landing app route to declare a replay decision", () => {
    expect(discoverAppRoutes(join(root, "app"))).toEqual(
      Object.keys(LANDING_REPLAY_ROUTE_DECISIONS).sort()
    );
  });

  it("binds replay identity to the existing landing distinct id", () => {
    const attribution = buildLandingAttribution({
      id: "home_hero_primary",
      label: "오늘 발주할 상품 확인하기",
    });

    expect(getLandingReplayDistinctId()).toBe(attribution.landing_distinct_id);
  });

  it("starts and stops recording through the explicit replay controller", () => {
    const calls: Array<["start", true] | ["stop"]> = [];
    const controller = {
      startSessionRecording(override?: true) {
        calls.push(["start", override ?? true]);
      },
      stopSessionRecording() {
        calls.push(["stop"]);
      },
    };

    syncSessionReplayRecording(controller, true);
    syncSessionReplayRecording(controller, false);

    expect(calls).toEqual([["start", true], ["stop"]]);

    const source = readFileSync(
      join(root, "app/_components/PostHogSessionReplayProvider.tsx"),
      "utf8"
    );
    expect(source).toContain("useLayoutEffect");
  });

  it("wires the provider into the landing root layout", () => {
    const source = readFileSync(join(root, "app/layout.tsx"), "utf8");

    expect(source).toContain("PostHogSessionReplayProvider");
    expect(source).toContain("<PostHogSessionReplayProvider />");
  });
});

function discoverAppRoutes(appDir: string): string[] {
  const routes: string[] = [];

  function walk(dir: string, segments: string[]) {
    const entries = readdirSync(dir, { withFileTypes: true });
    const names = new Set(entries.map((entry) => entry.name));
    if (names.has("page.tsx")) routes.push(toRoute(segments));
    if (names.has("route.ts")) routes.push(toRoute(segments));
    if (names.has("opengraph-image.tsx")) routes.push(toRoute([...segments, "opengraph-image"]));
    if (names.has("sitemap.ts")) routes.push("/sitemap.xml");
    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (entry.name.startsWith("_") || entry.name.startsWith("@")) continue;
      const nextSegments =
        entry.name.startsWith("(") && entry.name.endsWith(")")
          ? segments
          : [...segments, entry.name];
      walk(join(dir, entry.name), nextSegments);
    }
  }

  walk(appDir, []);
  return routes.sort();
}

function toRoute(segments: string[]): string {
  const path = `/${segments.join("/")}`.replace(/\/$/, "");
  return path || "/";
}
