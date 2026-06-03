"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { LOGO_URL, APP_URL_PROD, APP_URL_DEV } from "@/lib/site";

// Shared header used across all pages.

export function SiteHeader() {
  const [appUrl, setAppUrl] = useState(APP_URL_PROD);

  useEffect(() => {
    const hostname = window.location.hostname;
    if (
      hostname.includes("localhost") ||
      hostname.includes("127.0.0.1") ||
      hostname.includes("dev")
    ) {
      setAppUrl(APP_URL_DEV);
    } else {
      setAppUrl(APP_URL_PROD);
    }
  }, []);

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-1 items-center">
          <Link href="/" className="shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_URL}
              alt="Zerogo"
              className="h-6 w-auto sm:h-7 lg:h-8"
              referrerPolicy="no-referrer"
            />
          </Link>
        </div>
        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium text-black md:flex">
          <Link href="/#problem" className="transition hover:opacity-70">
            문제
          </Link>
          <Link href="/#how" className="transition hover:opacity-70">
            작동 방식
          </Link>
          <Link href="/#guide" className="transition hover:opacity-70">
            가이드
          </Link>
          <Link href="/blog" className="font-bold transition hover:opacity-70">
            블로그
          </Link>
        </nav>
        <div className="flex flex-1 items-center justify-end gap-4">
          <a
            href={appUrl}
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90"
          >
            무료로 시작하기
          </a>
        </div>
      </div>
    </header>
  );
}

export function BlogFooter() {
  return (
    <footer className="border-t border-neutral-100 bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 text-center text-xs text-black/50 sm:px-6 lg:px-8">
        @ Moongclelabs Co., Ltd. All rights reserved.
      </div>
    </footer>
  );
}
