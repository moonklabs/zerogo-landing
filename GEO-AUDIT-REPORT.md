---
brand_name: ZEROGO
domain: zerogo.ai
audit_date: 2026-06-04
location: 대한민국 (South Korea)
geo_score: 61
business_type: B2B SaaS (Korean-language)
---

# GEO + SEO Audit — ZEROGO (zerogo.ai)

**Date:** 2026-06-04
**Business type:** B2B SaaS — AI 품절 방지 에이전트 for Coupang Rocket Growth (로켓그로스) sellers
**Operating company:** (주)뭉클랩 (Moonklabs Co., Ltd.), CEO 윤도선
**Serving host:** `https://www.zerogo.ai` (apex `zerogo.ai` 302-redirects to www)

---

## Composite GEO Score: **61 / 100** — Fair-to-Good

A genuinely strong **technical + AI-crawler foundation** (SSR, robots allows all AI bots, llms.txt, 6 JSON-LD blocks) held back by a **near-empty content layer** (1 placeholder blog post), **no brand-authority signals**, and one **canonical-host bug**. The infrastructure to win AI citations is already in place — there is almost nothing for AI engines to cite yet.

| Category | Weight | Score | Notes |
|---|---|---|---|
| AI Citability & Visibility | 25% | **76/100** | Crawler access 95, llms.txt 85, on-page citability 68. Blog has nothing quotable. |
| Brand Authority Signals | 20% | **45/100** | Early-stage. Only sameAs = GitHub. No LinkedIn/Naver/Crunchbase/Wikidata, no press, no community. |
| Content Quality & E-E-A-T | 20% | **47/100** | 1 "Hello World" post. No case studies, no original data, no author bylines, no About/Privacy. |
| Technical Foundations | 15% | **72/100** | Excellent SSR + security headers. **Canonical-host inconsistency** is the one critical bug. |
| Structured Data | 10% | **62/100** | 6 valid schema types, server-rendered. Thin `sameAs`, no `logo`, author=Organization not Person. |
| Platform Optimization | 10% | **68/100** | Strongest: Gemini 75, AIO 72. Weakest: ChatGPT 58 (entity recognition), Bing 62 (no IndexNow). |

---

## What's Already Excellent (don't touch)

- **SSR everywhere** — Next.js 15, `x-nextjs-prerender: 1`. All content + all JSON-LD visible to GPTBot/ClaudeBot/PerplexityBot without JS execution.
- **AI crawler access — 95/100.** robots.txt explicitly allows GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, anthropic-ai, Google-Extended, Bingbot.
- **llms.txt — 85/100.** Present, comprehensive, well-structured (overview, features, target, differentiation, links, company info).
- **Security headers — 100/100.** nosniff, SAMEORIGIN, strict-origin-when-cross-origin, HTTP/2 + h3.
- **6 valid JSON-LD types** server-rendered: Organization, SoftwareApplication, FAQPage, BlogPosting, BreadcrumbList, ItemList.

---

## Two Convergent Problems (every subagent surfaced these)

### 🔴 #1 — Content layer is empty (the strategic blocker)
The blog has a single placeholder post ("Hello World", ~45 words, citability 18/100). For a Coupang-seller stockout product, the site has **~5-7% of the topical coverage** needed to be cited. AI engines asked "로켓그로스 품절 방지" or "발주 타이밍 계산" find **nothing to cite** from zerogo.ai. This single gap depresses Content, Citability, Platform, and Brand scores simultaneously.

### 🔴 #2 — Canonical-host inconsistency (the one technical bug)
Site **serves on `www.zerogo.ai`**, but every canonical signal points to the **apex `zerogo.ai`** which 302-redirects:
- `<link rel=canonical>` / `og:url` / JSON-LD `url` → `https://zerogo.ai`
- robots.txt → `Host: https://zerogo.ai` + `Sitemap: https://zerogo.ai/sitemap.xml`
- sitemap `<loc>` entries → all `https://zerogo.ai/...`

Every crawler hit must follow a 302 to reach the real page. Conflicting "preferred host" signals dilute ranking/crawl equity. **This is the highest-ROI fix** — a code change in this repo, ~1 hour. (Decide on ONE canonical host. Since the site already serves on www, either standardize everything on www, OR make apex serve 200 directly and drop the www redirect — pick one and align canonical + robots + sitemap + JSON-LD to it.)

---

## Prioritized Action Plan

### 🔴 CRITICAL (do first)
1. **Fix canonical host** — align canonical / `og:url` / JSON-LD `url` / robots `Host` & `Sitemap` / sitemap `<loc>` to ONE host. Files: `lib/site.ts`, `app/layout.tsx`, `app/robots.ts`, `app/sitemap.ts`. *In-repo, ~1h.*
2. **Replace the "Hello World" post + ship a content engine** — publish 3 substantive Korean articles in the next 4 weeks, then a steady cadence. Highest-impact titles:
   - "로켓그로스 품절: 원인 3가지와 예방 전략" (with the actual reorder formula + worked example)
   - "발주 타이밍 계산: 리드타임 × 판매속도 × 마진" (step-by-step, numbers)
   - "쿠팡 로켓그로스 셀러 사례: 품절 40% 줄인 방법" (anonymized case data)
3. **Add brand-authority `sameAs` + entity presence** — create LinkedIn company page, Naver place/company, Crunchbase; add all to Organization `sameAs` (currently GitHub-only). Naver is critical for the Korean market.

### 🟠 HIGH
4. **Add worked numeric examples to the homepage** "How it works" (e.g., "재고 50개 ÷ 7.5개/일 → 6.7일 후 품절, 발주 마감 X일") — the single most quotable content type for AI.
5. **Organization schema: add `logo` + `description`**; **SoftwareApplication: add `aggregateRating`** once you have reviews.
6. **Blog author → Person schema + visible byline + dates** (currently author=Organization). Boosts E-E-A-T for ChatGPT/Gemini.
7. **Add About + Privacy + Terms pages** — table-stakes trust signals for B2B SaaS handling seller data (Korean PIPA).

### 🟡 MEDIUM
8. **Bing: add `msvalidate.01` + IndexNow** — unlocks the weakest platform (62) for ~30 min work.
9. **Create `/llms-full.txt`** (extended FAQ, integrations, pricing, privacy) and link from llms.txt.
10. **Add `Content-Signal` directive** to robots.txt (`ai-train=yes, search=yes, ai-retrieval=yes`).
11. **`speakable` on articles** + `HowTo` schema on procedural guides.

### 🟢 LOW
12. HSTS header, preconnect to image CDN, `WebSite`+`SearchAction` schema (if/when search exists), founder/team credibility content.

---

## Per-Platform Readiness
| Platform | Score | Biggest lever |
|---|---|---|
| Google Gemini | 75 | Add video (YouTube demos) + downloadable guides |
| Google AI Overviews | 72 | Question-headed H2s + 40-60 word answer blocks in Korean |
| Perplexity | 65 | Original data / case studies; Reddit + seller-community presence |
| Bing Copilot | 62 | IndexNow + `msvalidate.01` + HowTo schema |
| ChatGPT Web Search | 58 | Entity recognition — Wikidata/LinkedIn, author bylines |

---

## Ready-to-Paste Schema Upgrades

### Organization — add logo, description, knowsAbout, expanded sameAs
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "(주) 뭉클랩",
  "legalName": "Moonklabs Co., Ltd.",
  "url": "https://www.zerogo.ai",
  "logo": "https://www.zerogo.ai/logo.png",
  "description": "ZEROGO는 쿠팡 로켓그로스 판매자를 위한 AI 품절 방지 에이전트로, 품절 위험을 감지하고 발주 타이밍을 자동으로 판단합니다.",
  "email": "zerogo@moonklabs.com",
  "sameAs": [
    "https://github.com/moonklabs",
    "https://www.linkedin.com/company/moonklabs",
    "https://www.crunchbase.com/organization/moonklabs"
  ],
  "knowsAbout": ["AI 재고관리", "쿠팡 로켓그로스", "품절 방지", "발주 타이밍", "이커머스 물류"]
}
```

### SoftwareApplication — add subcategory, languages, rating (when available)
```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "ZEROGO",
  "url": "https://www.zerogo.ai",
  "applicationCategory": "BusinessApplication",
  "applicationSubcategory": "Inventory Management Software",
  "operatingSystem": "Web",
  "availableLanguage": ["ko", "en"],
  "offers": { "@type": "Offer", "price": "0", "priceCurrency": "KRW", "url": "https://app.zerogo.ai" },
  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "REPLACE", "ratingCount": "REPLACE" },
  "publisher": { "@type": "Organization", "name": "Moonklabs Co., Ltd." }
}
```

### BlogPosting — author as Person (E-E-A-T)
```json
"author": {
  "@type": "Person",
  "name": "REPLACE_AUTHOR_NAME",
  "jobTitle": "REPLACE_TITLE",
  "worksFor": { "@type": "Organization", "name": "Moonklabs Co., Ltd." },
  "url": "https://www.zerogo.ai/authors/REPLACE_SLUG"
}
```

---

## Quick-Win Bundle (all in-repo, ~half a day, est. +8-10 to composite)
- Canonical host fix (CRITICAL #1)
- Organization `logo` + `description` + expanded `sameAs`
- robots.txt `Content-Signal`
- `/llms-full.txt`
- Homepage worked-example numbers

---

## Methodology
Phase 1 discovery (curl: headers, robots.txt, sitemap.xml, llms.txt) → Phase 2 five parallel specialist subagents (AI Visibility, Platform, Technical, Content, Schema) → Phase 3 weighted synthesis. Composite = AI Citability&Visibility 25% · Brand 20% · Content/E-E-A-T 20% · Technical 15% · Schema 10% · Platform 10%.
