# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Next.js) on port 3001
npm run build     # Build Next.js app to .next/
npm run start     # Start production server on port 3001
npm run lint      # TypeScript type check (tsc --noEmit)
npm run promote   # dev → main fast-forward 후 운영 배포 트리거
npm run publish   # Publish a blog post (Decap CMS helpers)
```

No test suite is configured.

## 운영 반영 (Promote to Production)

이 프로젝트의 실제 콘텐츠 작업자는 **마케터·디자이너**로, Decap CMS(`/admin`)로 작업하며 GitHub에 익숙하지 않습니다. AI agent가 운영 반영을 보조합니다.

### 브랜치 전략
- `dev` → **dev.zerogo.ai** (개발·검토 환경)
- `main` → **zerogo.ai** (운영)
- `dev`가 항상 `main`을 선행하는 **선형 히스토리** (fast-forward 방식)

### 운영 반영 요청 처리 (Agent 역할)

사용자가 다음과 같이 요청하면 `npm run promote` 를 실행하세요:
- "운영에 반영해줘", "운영에 올려줘", "게시해줘", "배포해줘", "메인에 올려줘"

```bash
npm run promote
```

이 스크립트는:
1. dev/main 최신 상태를 fetch
2. 이미 동일하면 멱등 종료
3. fast-forward 가능 여부 검증 (분기 시 에러 + 안내)
4. `git push origin origin/dev:refs/heads/main` (로컬 체크아웃 없음)
5. AWS Amplify가 `on: push: main` 으로 자동 운영 배포 시작 (WEB_COMPUTE)

### 분기(non-FF) 에러 발생 시
스크립트가 에러 메시지를 출력합니다. 사용자에게 "dev와 main이 분기 상태라 자동 반영이 어렵습니다. 개발자에게 문의가 필요합니다"라고 안내하세요.

## Environment Variables

Copy `.env.example` and set (in local development and Amplify env vars):
- `GAS_URL` – Google Apps Script webhook URL (required for /api/apply)
- `GAS_AUTH_KEY` – Auth key for Google Apps Script webhook (server-side only, required for /api/apply)
- `DEPLOY_ENV` – Critical for production: set to `"production"` on Amplify main branch; `"development"` or unset on dev branch
- `SLACK_WEBHOOK_URL` – Optional Slack notification webhook
- `DECAP_GITHUB_CLIENT_ID` / `DECAP_GITHUB_CLIENT_SECRET` – GitHub OAuth for Decap CMS (dev.zerogo.ai only)
- `PORT` – Server port (default: 3001)

## Architecture

This is a **Korean-language landing page with a blog**, built on **Next.js 15 (App Router, SSR)** + React 19 + TypeScript + TailwindCSS v4.

### App Routes (`app/`)

Server-rendered (SSR) Next.js app:
- `app/layout.tsx` – Root layout with metadata, Organization/SoftwareApplication/FAQPage JSON-LD
- `app/page.tsx` + `app/_components/HomeClient.tsx` – Home page (client component for motion)
- `app/blog/page.tsx` – Blog list (server-rendered, ItemList JSON-LD)
- `app/blog/[slug]/page.tsx` – Blog post (server-rendered, generateMetadata, BlogPosting + BreadcrumbList JSON-LD)
- `app/api/apply/route.ts` – Form submission endpoint (forwards to Google Apps Script)
- `app/sitemap.ts` – Dynamic sitemap (includes blog posts + AI bots)
- `app/robots.ts` – Dynamic robots.txt (allow AI bots)
- `app/opengraph-image.tsx` + `app/blog/opengraph-image.tsx` + `app/blog/[slug]/opengraph-image.tsx` – Dynamic OG images via next/og
- `middleware.ts` – Admin gate: blocks `/admin` on production (DEPLOY_ENV=production)

### API Routes

- `POST /api/apply` → Forwards form submissions to Google Apps Script webhook. **Requires GAS_URL and GAS_AUTH_KEY.**

### Blog Content (`content/blog/`)

File-based blog: markdown files with gray-matter frontmatter (`title`, `date`, `description`). Next.js reads these at request time (server-side only) — no build step required for new posts.

### CMS (`public/admin/`)

Decap CMS served at `/admin`. Static HTML served via rewrite in `next.config.ts` (`/admin` → `/admin/index.html`). Config in `public/admin/config.yml`:
- Writes new posts to `content/blog/` and images to `public/images/blog/`
- GitHub backend configured for production deployments

### Helper Libraries

- `lib/posts.ts` – Markdown reading and frontmatter parsing (gray-matter)
- `lib/site.ts` – Site constants (URLs, metadata)

## 운영 환경 규칙 (CRITICAL)

### `/admin` 접근 차단

**운영(zerogo.ai)에서 `/admin`은 절대 접근 가능해서는 안 된다.**

- Decap CMS는 **dev 전용** 도구이며 운영 노출 금지
- `middleware.ts`의 admin gate가 `/admin` 접근을 차단합니다. 두 가지 검사 사용:
  - 주 검사: `DEPLOY_ENV === "production"` (Amplify 환경 변수로 설정, 서버 제어, 위변조 불가)
  - 방어 심화: 호스트가 `dev.*` 또는 `localhost`여야 함
- **CRITICAL**: Amplify의 main 브랜치에서 `DEPLOY_ENV=production`을 반드시 설정하세요. dev 브랜치는 `DEPLOY_ENV=development` 또는 미설정.

### Path Alias

`@` resolves to the project root, configured in `tsconfig.json` and `next.config.ts`.
