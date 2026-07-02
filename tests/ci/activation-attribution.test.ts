// @vitest-environment jsdom

import React from "react";
import { renderToString } from "react-dom/server";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import HomeClient from "../../app/_components/HomeClient";
import {
  buildAttributedAppUrl,
  buildLandingAttribution,
  buildServerLandingAttribution,
  captureLandingCtaClicked,
  captureLandingPageViewed,
} from "../../lib/activation-attribution";

vi.mock("motion/react", async () => {
  const ReactModule = await import("react");
  function stripMotionProps(props: Record<string, unknown>) {
    const {
      animate: _animate,
      exit: _exit,
      initial: _initial,
      transition: _transition,
      variants: _variants,
      viewport: _viewport,
      whileInView: _whileInView,
      ...domProps
    } = props;
    return domProps;
  }
  function createMotionComponent(tag: string) {
    return ({ children, ...props }: React.PropsWithChildren<Record<string, unknown>>) =>
      ReactModule.createElement(tag, stripMotionProps(props), children);
  }
  return {
    AnimatePresence: ({ children }: React.PropsWithChildren) => children,
    motion: new Proxy(
      {},
      {
        get: (_target, tag) => createMotionComponent(String(tag)),
      }
    ),
  };
});

const CTA = {
  id: "home_hero_primary",
  label: "카카오로 무료체험 시작하기",
};

function createStorage(): Storage {
  const store = new Map<string, string>();
  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.get(key) ?? null;
    },
    key(index: number) {
      return [...store.keys()][index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };
}

describe("landing activation attribution", () => {
  beforeEach(() => {
    Object.defineProperty(window, "localStorage", {
      configurable: true,
      value: createStorage(),
    });
    Object.defineProperty(window, "sessionStorage", {
      configurable: true,
      value: createStorage(),
    });
    window.history.replaceState(
      null,
      "",
      "/?utm_source=google&utm_medium=cpc&utm_campaign=rocket&email=seller@example.com&token=secret"
    );
    Reflect.deleteProperty(window, "dataLayer");
  });

  afterEach(() => {
    window.localStorage.clear();
    window.sessionStorage.clear();
    vi.restoreAllMocks();
    Reflect.deleteProperty(window, "dataLayer");
    Reflect.deleteProperty(process.env, "NEXT_PUBLIC_POSTHOG_KEY");
  });

  it("builds app login URLs with stable landing identity and canonical CTA key", () => {
    const url = new URL(buildAttributedAppUrl("https://app.zerogo.ai", CTA));

    expect(url.origin).toBe("https://app.zerogo.ai");
    expect(url.pathname).toBe("/login");
    expect(url.searchParams.get("entry_source")).toBe("landing");
    expect(url.searchParams.get("landing_distinct_id")).toBeTruthy();
    expect(url.searchParams.get("activation_journey_id")).toBeTruthy();
    expect(url.searchParams.get("landing_cta_id")).toBe("home_hero_primary");
    expect(url.searchParams.get("landing_cta_label")).toBe("카카오로 무료체험 시작하기");
    expect(url.searchParams.get("landing_path")).toBe("/");
    expect(url.searchParams.get("utm_source")).toBe("google");
    expect(url.searchParams.get("utm_medium")).toBe("cpc");
    expect(url.searchParams.has("email")).toBe(false);
    expect(url.searchParams.has("token")).toBe(false);
    expect(url.searchParams.has("cta_id")).toBe(false);
  });

  it("keeps the same landing distinct id across CTA links in one browser", () => {
    const first = buildLandingAttribution(CTA);
    const second = buildLandingAttribution({
      id: "home_bottom_primary",
      label: "카카오로 무료체험 시작하기",
    });

    expect(second.landing_distinct_id).toBe(first.landing_distinct_id);
    expect(second.activation_journey_id).toBe(first.activation_journey_id);
    expect(second.landing_cta_id).toBe("home_bottom_primary");
  });

  it("builds hydration-safe initial href attribution from server-visible fields only", () => {
    const initialAttribution = buildServerLandingAttribution({
      landingPath: "/blog/rocket-growth",
      searchParams: {
        utm_source: "newsletter",
        utm_campaign: "summer",
        email: "seller@example.com",
        token: "secret",
      },
    });
    const originalWindow = globalThis.window;
    try {
      Reflect.deleteProperty(globalThis, "window");
      const url = new URL(
        buildAttributedAppUrl("https://app.zerogo.ai", CTA, initialAttribution)
      );

      expect(url.pathname).toBe("/login");
      expect(url.searchParams.get("entry_source")).toBe("landing");
      expect(url.searchParams.get("landing_path")).toBe("/blog/rocket-growth");
      expect(url.searchParams.get("utm_source")).toBe("newsletter");
      expect(url.searchParams.get("utm_campaign")).toBe("summer");
      expect(url.searchParams.get("landing_cta_id")).toBe("home_hero_primary");
      expect(url.searchParams.has("landing_distinct_id")).toBe(false);
      expect(url.searchParams.has("email")).toBe(false);
      expect(url.searchParams.has("token")).toBe(false);
    } finally {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: originalWindow,
      });
    }
  });

  it("keeps initial href attribution identical on the client hydration pass", () => {
    const initialAttribution = buildServerLandingAttribution({
      landingPath: "/",
      searchParams: {
        utm_source: "newsletter",
        utm_medium: "email",
      },
    });
    const originalWindow = globalThis.window;
    let serverHref = "";
    try {
      Reflect.deleteProperty(globalThis, "window");
      serverHref = buildAttributedAppUrl("https://app.zerogo.ai", CTA, initialAttribution);
    } finally {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: originalWindow,
      });
    }

    const clientHydrationHref = buildAttributedAppUrl(
      "https://app.zerogo.ai",
      CTA,
      initialAttribution
    );

    expect(clientHydrationHref).toBe(serverHref);
    expect(new URL(clientHydrationHref).searchParams.has("landing_distinct_id")).toBe(false);
  });

  it("passes home initial attribution into the pre-hydration header CTA href", () => {
    const initialAttribution = buildServerLandingAttribution({
      landingPath: "/",
      searchParams: {
        utm_source: "newsletter",
        utm_medium: "email",
      },
    });

    const originalWindow = globalThis.window;
    try {
      Reflect.deleteProperty(globalThis, "window");
      const html = renderToString(React.createElement(HomeClient, { initialAttribution }));
      expect(html).toContain("landing_cta_id=header_primary");
      expect(html).toContain("landing_path=%2F");
      expect(html).toContain("utm_source=newsletter");
      expect(html).toContain("utm_medium=email");
    } finally {
      Object.defineProperty(globalThis, "window", {
        configurable: true,
        value: originalWindow,
      });
    }
  });

  it("captures landing_page_viewed once per session with the CTA identity", () => {
    process.env.NEXT_PUBLIC_POSTHOG_KEY = "ph_test";
    const fetchMock = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue({ ok: true } as Response);

    captureLandingPageViewed();
    captureLandingPageViewed();
    captureLandingCtaClicked(CTA);

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://us.i.posthog.com/capture/");
    expect(String(fetchMock.mock.calls[1][0])).toBe("https://us.i.posthog.com/capture/");
    const [pageViewRequest, ctaRequest] = fetchMock.mock.calls.map((call) =>
      JSON.parse((call[1] as RequestInit).body as string)
    );

    expect(pageViewRequest.event).toBe("landing_page_viewed");
    expect(pageViewRequest.distinct_id).toBeTruthy();
    expect(pageViewRequest.properties).toMatchObject({
      category: "activation",
      funnel: "activation",
      step: "landing_page",
      result: "viewed",
      entry_source: "landing",
      landing_path: "/",
      utm_source: "google",
    });
    expect(pageViewRequest.properties).not.toHaveProperty("landing_cta_id");
    expect(JSON.stringify(pageViewRequest)).not.toContain("seller@example.com");
    expect(JSON.stringify(pageViewRequest)).not.toContain("secret");

    expect(ctaRequest.event).toBe("landing_cta_clicked");
    expect(ctaRequest.distinct_id).toBe(pageViewRequest.distinct_id);
    expect(ctaRequest.properties.landing_cta_id).toBe("home_hero_primary");
    expect(ctaRequest.properties.activation_journey_id).toBe(
      pageViewRequest.properties.activation_journey_id
    );

    expect(window.dataLayer).toHaveLength(2);
    expect(window.dataLayer?.[0]).toMatchObject({
      event: "landing_page_viewed",
      category: "activation",
      funnel: "activation",
      step: "landing_page",
      result: "viewed",
      landing_path: "/",
      utm_source: "google",
    });
    expect(window.dataLayer?.[0]).not.toHaveProperty("landing_cta_id");
    expect(window.dataLayer?.[1]).toMatchObject({
      event: "landing_cta_clicked",
      category: "activation",
      funnel: "activation",
      step: "landing_cta",
      result: "clicked",
      landing_cta_id: "home_hero_primary",
    });
    expect(window.dataLayer?.[1].activation_journey_id).toBe(
      window.dataLayer?.[0].activation_journey_id
    );
    expect(JSON.stringify(window.dataLayer)).not.toContain("seller@example.com");
    expect(JSON.stringify(window.dataLayer)).not.toContain("secret");
  });

  it("pushes GTM dataLayer events even when PostHog direct capture is disabled", () => {
    const fetchMock = vi.spyOn(globalThis, "fetch");

    captureLandingPageViewed();
    captureLandingCtaClicked(CTA);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(window.dataLayer?.map((entry) => entry.event)).toEqual([
      "landing_page_viewed",
      "landing_cta_clicked",
    ]);
  });
});
