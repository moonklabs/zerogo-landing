"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  boot,
  loadScript,
  setPage,
  shutdown,
  track,
} from "@channel.io/channel-web-sdk-loader";

const pluginKey = process.env.NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY?.trim();

export function ChannelTalkProvider() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pluginKey || pathname.startsWith("/preview")) return;

    loadScript();
    boot({
      pluginKey,
      language: "ko",
      trackDefaultEvent: false,
    });

    return () => {
      shutdown();
    };
  }, [pathname]);

  useEffect(() => {
    if (!pluginKey || pathname.startsWith("/preview")) return;

    setPage(pathname);
    track("PageView");
  }, [pathname]);

  return null;
}
