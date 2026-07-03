"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { LOGO_URL, APP_URL_PROD, APP_URL_DEV } from "@/lib/site";
import {
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
      className={`sticky top-0 z-50 backdrop-blur-md transition-colors duration-150 ${
        menuOpen
          ? "bg-white"
          : "border-b border-neutral-100 bg-white/80"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <div className="flex flex-1 items-center gap-2">
          <Link href="/" className="shrink-0" onClick={() => setMenuOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_URL}
              alt="Zerogo"
              className="h-6 w-auto sm:h-7 lg:h-8"
              referrerPolicy="no-referrer"
            />
          </Link>
          <span
            className="rounded-full bg-brand/10 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-brand ring-1 ring-brand/20 sm:text-xs"
            aria-label="베타 버전"
          >
            Beta
          </span>
        </div>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium text-black md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:opacity-70"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster: CTA + hamburger */}
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
          <a
            href={headerHref}
            onClick={(event) => {
              event.currentTarget.href = buildAttributedAppUrl(appUrl, HEADER_CTA);
              captureLandingCtaClicked(HEADER_CTA);
            }}
            className="whitespace-nowrap rounded-full bg-brand px-3 py-2 text-xs font-semibold text-white transition hover:opacity-90 sm:px-5 sm:py-2.5 sm:text-sm"
          >
            <span className="sm:hidden">시작하기</span>
            <span className="hidden sm:inline">카카오로 무료체험 시작하기</span>
          </a>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full text-black transition hover:bg-neutral-100 md:hidden"
            aria-label={menuOpen ? "메뉴 닫기" : "메뉴 열기"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
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
            className="absolute inset-x-0 top-full z-50 border-t border-neutral-100 bg-white shadow-lg md:hidden"
          >
            <ul className="mx-auto max-w-7xl px-4 py-2 sm:px-6">
              {NAV_ITEMS.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-2 py-3.5 text-base font-medium text-black transition hover:text-brand"
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
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
