"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { LOGO_URL, APP_URL_PROD, APP_URL_DEV } from "@/lib/site";

const NAV_ITEMS = [
  { href: "/#problem", label: "문제" },
  { href: "/#how", label: "작동 방식" },
  { href: "/#guide", label: "가이드" },
  { href: "/blog", label: "블로그", bold: true },
];

// Shared header used across all pages.

export function SiteHeader() {
  const [appUrl, setAppUrl] = useState(APP_URL_PROD);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

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

  // Close on scroll
  useEffect(() => {
    if (!menuOpen) return;
    const handleScroll = () => setMenuOpen(false);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
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
        <div className="flex flex-1 items-center">
          <Link href="/" className="shrink-0" onClick={() => setMenuOpen(false)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={LOGO_URL}
              alt="Zerogo"
              className="h-6 w-auto sm:h-7 lg:h-8"
              referrerPolicy="no-referrer"
            />
          </Link>
        </div>

        {/* Desktop nav */}
        <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium text-black md:flex">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`transition hover:opacity-70${item.bold ? " font-bold" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Right cluster: CTA + hamburger */}
        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-4">
          <a
            href={appUrl}
            className="whitespace-nowrap rounded-full bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 sm:px-5 sm:py-2.5"
          >
            무료로 시작하기
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
                    className={`block px-2 py-3.5 text-base font-medium text-black transition hover:text-brand${item.bold ? " font-bold" : ""}`}
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
