"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import posthog from "posthog-js";
import { getLandingReplayDistinctId } from "@/lib/activation-attribution";
import {
  buildPostHogReplayConfig,
  posthogReplayKey,
  shouldRecordLandingActivationReplay,
  syncSessionReplayRecording,
} from "@/lib/posthog-session-replay";

export function PostHogSessionReplayProvider() {
  const pathname = usePathname();
  const initializedRef = useRef(false);

  useLayoutEffect(() => {
    if (pathname.startsWith("/preview")) return;
    const key = posthogReplayKey();
    if (!key) return;

    const shouldRecord = shouldRecordLandingActivationReplay(pathname);

    if (!initializedRef.current) {
      posthog.init(key, buildPostHogReplayConfig());
      initializedRef.current = true;
    }

    if (shouldRecord) {
      const landingDistinctId = getLandingReplayDistinctId();
      if (landingDistinctId) posthog.identify(landingDistinctId);
    }

    syncSessionReplayRecording(posthog, shouldRecord);
  }, [pathname]);

  useEffect(() => {
    return () => {
      syncSessionReplayRecording(posthog, false);
    };
  }, []);

  return null;
}
