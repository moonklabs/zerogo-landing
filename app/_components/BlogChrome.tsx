"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { LOGO_URL, APP_URL_PROD, APP_URL_DEV } from "@/lib/site";
import {
  buildAttributedInternalHref,
  buildAttributedAppUrl,
  captureLandingCtaClicked,
  captureLandingPageViewed,
  type LandingInitialAttribution,
  type LandingCta,
} from "@/lib/activation-attribution";

const NAV_ITEMS = [
  { href: "/", label: "HOME" },
  { href: "/order-timing-calculator", label: "발주 타이밍 계산기" },
  { href: "/blog", label: "블로그" },
];
const HEADER_CTA: LandingCta = {
  id: "header_primary",
  label: "카카오로 무료체험 시작하기",
};

// Shared header used across all pages.

type SiteHeaderProps = {
  initialAttribution?: LandingInitialAttribution;
};

export function SiteHeader({ initialAttribution }: SiteHeaderProps = {}) {
  const [appUrl, setAppUrl] = useState(APP_URL_PROD);
  const [headerHref, setHeaderHref] = useState(() =>
    buildAttributedAppUrl(APP_URL_PROD, HEADER_CTA, initialAttribution)
  );
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const homeHref = buildAttributedInternalHref("/", initialAttribution);
  const navItems = NAV_ITEMS.map((item) => ({
    ...item,
    href: buildAttributedInternalHref(item.href, initialAttribution),
  }));

  useEffect(() => {
    captureLandingPageViewed();
    let nextAppUrl = APP_URL_PROD;
    const hostname = window.location.hostname;
    if (
      hostname.includes("localhost") ||
      hostname.includes("127.0.0.1") ||
      hostname.includes("dev")
    ) {
      nextAppUrl = APP_URL_DEV;
    } else {
      nextAppUrl = APP_URL_PROD;
    }
    setAppUrl(nextAppUrl);
    setHeaderHref(buildAttributedAppUrl(nextAppUrl, HEADER_CTA));
  }, []);

  // Close on Escape key
  useEffect(() => {
    if (!menuOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [menuOpen]);

  // Close on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [menuOpen]);

  // Close on scroll — listener is registered immediately but only activated
  // after 150 ms to skip tap-induced scroll events (iOS address-bar animation,
  // Playwright click scroll, momentum scroll residue) that fire right after
  // the hamburger tap and would otherwise close the menu instantly.
  useEffect(() => {
    if (!menuOpen) return;
    let active = false;
    const handleScroll = () => { if (active) setMenuOpen(false); };
    window.addEventListener("scroll", handleScroll, { passive: true });
    const id = setTimeout(() => { active = true; }, 150);
    return () => {
      clearTimeout(id);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-50 border-b border-black/5 bg-white/90 backdrop-blur-md"
    >
      <div className="relative mx-auto flex h-[70px] max-w-[1180px] items-center justify-between px-5 max-[900px]:px-4 min-[901px]:h-[78px] min-[1201px]:h-[84px]">
        {/* Logo */}
        <div className="flex flex-1 items-center gap-2.5">
          <Link
            href={homeHref}
            className="shrink-0"
            onClick={() => setMenuOpen(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_URL}
              alt="Zerogo"
              className="h-auto w-[132px] min-[901px]:w-[150px] min-[1201px]:w-[170px]"
              referrerPolicy="no-referrer"
            />
          </Link>
          <span
            className="inline-flex items-center justify-center rounded-full bg-brand/10 px-[9px] py-[2px] text-[12px] font-black text-brand ring-1 ring-inset ring-brand/20 min-[901px]:text-[14px]"
            aria-label="베타 버전"
          >
            Beta
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-[37px] text-[15px] font-semibold text-[#111] md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap transition hover:text-brand"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster: CTA + hamburger */}
        <div className="flex flex-1 items-center justify-end gap-3">
          <a
            href={headerHref}
            onClick={(event) => {
              event.currentTarget.href = buildAttributedAppUrl(appUrl, HEADER_CTA);
              captureLandingCtaClicked(HEADER_CTA);
            }}
            className="hidden min-h-[46px] items-center justify-center whitespace-nowrap rounded-full bg-brand px-[23px] text-[15.5px] font-extrabold text-white shadow-[0_10px_12px_rgba(255,86,25,0.18)] transition hover:-translate-y-px hover:shadow-[0_14px_26px_rgba(255,86,25,0.25)] md:inline-flex"
          >
            무료체험 시작하기
          </a>
          <button
            className="flex h-11 w-11 items-center justify-center rounded-[14px] border border-brand/20 bg-brand/10 text-brand transition hover:-translate-y-px hover:bg-[#ffe8dd] md:hidden"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              id="mobile-menu"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="absolute left-1/2 top-[calc(100%+10px)] w-[min(420px,calc(100vw-28px))] -translate-x-1/2 rounded-[22px] border border-black/10 bg-white/98 p-3.5 shadow-[0_18px_48px_rgba(0,0,0,0.14)] backdrop-blur-lg md:hidden"
            >
              <ul className="flex flex-col gap-1">
                {navItems.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="flex min-h-[46px] items-center rounded-2xl px-3.5 text-[15px] font-bold text-[#111] transition hover:bg-neutral-50"
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <a
                    href={headerHref}
                    onClick={(event) => {
                      event.currentTarget.href = buildAttributedAppUrl(appUrl, HEADER_CTA);
                      captureLandingCtaClicked(HEADER_CTA);
                      setMenuOpen(false);
                    }}
                    className="mt-2.5 flex min-h-[50px] items-center justify-center rounded-full bg-brand text-[15.5px] font-extrabold text-white"
                  >
                    무료체험 시작하기
                  </a>
                </li>
              </ul>
            </motion.nav>
          )}
        </AnimatePresence>
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
