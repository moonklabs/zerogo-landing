# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Express + Vite middleware) on port 3001
npm run build     # Build React app to dist/
npm run lint      # TypeScript type check (tsc --noEmit)
npm run clean     # Remove dist/
npm run preview   # Preview production build via Vite
npm run promote   # dev → main fast-forward 후 운영 배포 트리거
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
5. 기존 `deploy-amplify.yml` 워크플로우가 `on: push: main` 으로 자동 운영 배포 시작

### 분기(non-FF) 에러 발생 시
스크립트가 에러 메시지를 출력합니다. 사용자에게 "dev와 main이 분기 상태라 자동 반영이 어렵습니다. 개발자에게 문의가 필요합니다"라고 안내하세요.

## Environment Variables

Copy `.env.local` and set:
- `GEMINI_API_KEY` – Gemini API key (exposed to client via Vite define)
- `GAS_AUTH_KEY` – Auth key for Google Apps Script webhook (server-side only)
- `PORT` – Server port (default: 3001)

## Architecture

This is a **Korean-language landing page with a blog**, built on React 19 + TypeScript + Vite 6 + TailwindCSS v4.

### Server (`server.ts`)

Express server that doubles as dev and production host:
- **Dev**: Mounts Vite as middleware (`createViteServer({ middlewareMode: true })`)
- **Prod**: Serves `dist/` as static files with SPA fallback

API routes (server-side only, not in src/):
- `POST /api/apply` → Forwards form submissions to a Google Apps Script webhook
- `GET /api/posts` → Reads all `content/blog/*.md` files, returns frontmatter list sorted by date
- `GET /api/posts/:slug` → Returns frontmatter + body of a single markdown post

Static: `public/` is served directly; `/admin` and `/admin/*` serve `public/admin/index.html` (Decap CMS).

### Frontend (`src/`)

Single-page app with three routes (`src/App.tsx`):
- `/` → `src/pages/Home.tsx`
- `/blog` → `src/pages/BlogList.tsx`
- `/blog/:slug` → `src/pages/BlogPost.tsx`

### Blog Content (`content/blog/`)

File-based blog: markdown files with gray-matter frontmatter (`title`, `date`, `description`). The Express server reads these at request time — no build step required for new posts.

### CMS (`public/admin/`)

Decap CMS served at `/admin`. Config in `public/admin/config.yml`:
- `local_backend: true` for local development (requires running Decap's local proxy separately)
- Writes new posts to `content/blog/` and images to `public/images/blog/`
- GitHub backend configured for production (repo field is placeholder — update before deploying)

### Cloudflare Workers (`cloudflare-workers/apply-api/`)

Alternative deployment of the `/api/apply` endpoint as a Cloudflare Worker (Wrangler-based). Independent from the main Express server. Deploy with `wrangler deploy` from that directory.

## 운영 환경 규칙 (CRITICAL)

### `/admin` 접근 차단

**운영(zerogo.ai)에서 `/admin`은 절대 접근 가능해서는 안 된다.**

- Decap CMS는 **dev 전용** 도구이며 운영 노출 금지
- `vite.config.ts`의 `remove-admin-in-prod` 플러그인이 production 빌드 시 `dist/admin/`을 자동 삭제
- Amplify는 `dist/`를 정적으로 서빙하므로 `server.ts`의 404 처리만으로는 부족 — **Vite 빌드 레벨 차단 필수**
- `vite.config.ts` 수정 시 이 플러그인을 제거하거나 비활성화하지 말 것

### Path Alias

`@` resolves to the project root (`/Users/drumcap/workspace/zerogo-landing`), configured in `vite.config.ts`.
