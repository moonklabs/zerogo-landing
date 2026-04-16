# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server (Express + Vite middleware) on port 3001
npm run build     # Build React app to dist/
npm run lint      # TypeScript type check (tsc --noEmit)
npm run clean     # Remove dist/
npm run preview   # Preview production build via Vite
```

No test suite is configured.

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

### Path Alias

`@` resolves to the project root (`/Users/drumcap/workspace/zerogo-landing`), configured in `vite.config.ts`.
