"use client";

import { useEffect, useRef, useState } from "react";
import HomeClient from "@/app/_components/HomeClient";
import {
  HERO_PREVIEW_APPLIED,
  HERO_PREVIEW_PROTOCOL_VERSION,
  HERO_PREVIEW_READY,
  isExpectedPreviewParent,
  readHeroPreviewFile,
  readHeroPreviewUpdate,
  toPreviewSlots,
  type HeroPreviewApplied,
  type HeroPreviewReady,
} from "@/lib/hero-preview-protocol";
import type { LandingVariantSlots } from "@/lib/landing-variant";

export default function HeroPreviewClient({ nonce, parentOrigin }: { nonce: string; parentOrigin: string }) {
  const [slots, setSlots] = useState<LandingVariantSlots | null>(null);
  const localMedia = useRef<{ id: string; url: string; mimeType: "image/jpeg" | "image/png" } | null>(null);

  useEffect(() => {
    const replaceLocalMedia = (next: { id: string; url: string; mimeType: "image/jpeg" | "image/png" } | null) => {
      const previous = localMedia.current;
      localMedia.current = next;
      if (previous && previous.url !== next?.url) URL.revokeObjectURL(previous.url);
    };
    const receive = (event: MessageEvent) => {
      if (!isExpectedPreviewParent(event, parentOrigin, window.parent)) return;
      const fileMessage = readHeroPreviewFile(event.data, nonce);
      if (fileMessage) {
        replaceLocalMedia({
          id: fileMessage.payload.id,
          url: URL.createObjectURL(fileMessage.payload.file),
          mimeType: fileMessage.payload.file.type as "image/jpeg" | "image/png",
        });
        return;
      }
      const update = readHeroPreviewUpdate(event.data, nonce);
      if (!update) return;
      if (update.payload.media.source !== "local") replaceLocalMedia(null);
      const nextSlots = toPreviewSlots(update, localMedia.current);
      if (!nextSlots) return;
      setSlots(nextSlots);
      const applied: HeroPreviewApplied = {
        protocolVersion: HERO_PREVIEW_PROTOCOL_VERSION,
        nonce,
        type: HERO_PREVIEW_APPLIED,
        payload: { revision: update.revision },
      };
      window.parent.postMessage(applied, parentOrigin);
    };
    window.addEventListener("message", receive);
    const ready: HeroPreviewReady = {
      protocolVersion: HERO_PREVIEW_PROTOCOL_VERSION,
      nonce,
      type: HERO_PREVIEW_READY,
      payload: {},
    };
    window.parent.postMessage(ready, parentOrigin);
    return () => {
      window.removeEventListener("message", receive);
      replaceLocalMedia(null);
    };
  }, [nonce, parentOrigin]);

  return <HomeClient variantSlots={slots} previewMode />;
}
