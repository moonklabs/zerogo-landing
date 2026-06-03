# zerogo-landing

**ZEROGO** — 쿠팡 셀러를 위한 품절 방지 AI 에이전트 랜딩 페이지

> 재고를 보여주는 도구가 아닙니다. AI가 오늘 발주해야 할 상품을 먼저 알려드립니다.

**서비스 URL**: https://zerogo.ai | **개발**: https://dev.zerogo.ai

**Stack**: React 19 + TypeScript + Vite 6 + TailwindCSS v4 + Express

---

## 서비스 소개

ZEROGO는 쿠팡 로켓그로스 셀러의 품절을 방지하는 AI 에이전트 서비스입니다.

| 기능 | 설명 |
|------|------|
| **AI 발주 판단 엔진** | 현재 추정 재고·판매 속도·예상 품절일·발주 마감일을 분석해 위험도 자동 분류 |
| **스파이크 감지** | 주문 속도 급증을 실시간 감지 → 재계산 트리거 → 긴급 알림 발송 |
| **Push + Workspace** | 카카오 알림 + 데스크탑 웹 워크스페이스로 우선순위 큐 제공 |
| **최소 액션 로깅** | 확인 완료 / 오늘은 보류 / 발주 완료를 클릭 한 번으로 기록 |

랜딩 페이지는 서비스 소개와 **무료 사전 신청 폼**으로 구성되며, 신청 데이터는 Google Apps Script → Slack으로 전달됩니다.

---

## 로컬 개발

**사전 요구사항**: Node.js 22+

```bash
# 의존성 설치
npm install

# 환경변수 설정
cp .env.example .env.local
# .env.local 편집 후 필요한 값 입력

# 개발 서버 실행 (포트 3001)
npm run dev
```

### 환경변수

| 변수 | 설명 | 필수 |
|------|------|------|
| `GAS_AUTH_KEY` | Google Apps Script 웹훅 인증키 | 운영 |
| `DECAP_GITHUB_CLIENT_ID` | GitHub OAuth App Client ID (CMS 로컬 인증용) | CMS 사용 시 |
| `DECAP_GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret | CMS 사용 시 |
| `GEMINI_API_KEY` | Gemini API 키 | 기능 사용 시 |
| `SLACK_WEBHOOK_URL` | Slack 알림 웹훅 URL | 선택 |
| `PORT` | 서버 포트 (기본값: 3001) | 선택 |

---

## 명령어

```bash
npm run dev      # 개발 서버 실행 (Express + Vite 미들웨어)
npm run build    # React 앱 빌드 → dist/
npm run lint     # TypeScript 타입 체크 (tsc --noEmit)
npm run clean    # dist/ 삭제
npm run preview  # 프로덕션 빌드 미리보기
```

---

## 아키텍처

### 서버 (`server.ts`)

Express 서버가 개발/운영 호스트 역할을 겸합니다:

- **개발**: Vite를 미들웨어로 마운트 (`createViteServer({ middlewareMode: true })`)
- **운영**: `dist/`를 정적 파일로 서빙 (SPA 폴백 포함)

**API 라우트** (서버 사이드):
- `POST /api/apply` → Google Apps Script 웹훅으로 폼 제출 전달
- `GET /api/posts` → `content/blog/*.md` 파일 목록 반환 (날짜순 정렬)
- `GET /api/posts/:slug` → 단일 마크다운 포스트 반환

### Content API (External Agent Integration)

The Content API allows external AI agents to create, update, and delete blog posts via REST API.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/posts` | Create new blog post |
| GET | `/api/posts` | List all posts |
| GET | `/api/posts/:slug` | Get single post |
| PUT | `/api/posts/:slug` | Update post |
| DELETE | `/api/posts/:slug` | Delete post |

For full documentation, see [docs/CONTENT-API.md](docs/CONTENT-API.md).

**Setup for external agents:**
```bash
# .env for external agent
GITHUB_TOKEN=ghp_your_personal_access_token
GITHUB_OWNER=moonklabs
GITHUB_REPO=zerogo-landing
GITHUB_BRANCH=dev
```

**Example usage:**
```bash
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title": "AI Post", "body": "# Hello\n\nContent"}'
```

**어드민 (비운영 환경 전용)**:
- `GET /admin/config.yml` → Decap CMS 설정을 동적 생성 (환경에 맞는 `base_url` 주입)
- `GET /api/auth` → GitHub OAuth 리다이렉트
- `GET /api/auth/callback` → GitHub 토큰 교환 후 CMS로 전달

### 프론트엔드 (`src/`)

라우트 3개의 싱글페이지 앱 (`src/App.tsx`):

| 경로 | 컴포넌트 |
|------|---------|
| `/` | `src/pages/Home.tsx` |
| `/blog` | `src/pages/BlogList.tsx` |
| `/blog/:slug` | `src/pages/BlogPost.tsx` |

### 블로그 콘텐츠 (`content/blog/`)

파일 기반 블로그: gray-matter 프론트매터(`title`, `date`, `description`)가 포함된 마크다운 파일. Express 서버가 요청 시 읽어서 반환 (빌드 스텝 불필요).

### CMS (`/admin`)

Decap CMS를 `/admin`에서 서빙. **비운영 환경에서만 접근 가능** (운영에서는 404 반환).

- **로컬 개발**: GitHub OAuth 프록시가 `server.ts`에 내장되어 있어 `npm run dev`만으로 동작
- **dev.zerogo.ai**: Cloudflare Worker(`zerogo-decap-oauth`)가 OAuth 프록시 역할

### Cloudflare Workers (`cloudflare-workers/`)

| Worker | 역할 |
|--------|------|
| `apply-api` | `/api/apply` 엔드포인트 (CF 배포용) |
| `decap-oauth` | Decap CMS GitHub OAuth 프록시 |

---

## 빌드

```bash
# React 앱 빌드
npm run build

# 블로그 정적 인덱스 생성 (빌드 후 필수)
npx tsx scripts/build-blog.ts

# 빌드 결과 확인
test -f dist/index.html
test -f dist/api/posts/index.json
```

빌드 결과물은 `dist/`에 생성됩니다. 로컬에서 빌드 결과를 미리보려면:

```bash
npm run preview
```

---

## 배포

### 브랜치 전략

| 브랜치 | 환경 | URL | 워크플로우 |
|--------|------|-----|-----------|
| `dev` | 개발 | https://dev.zerogo.ai | `deploy-amplify-dev.yml` |
| `main` | 운영 | https://zerogo.ai | `deploy-amplify.yml` |

### 자동 배포 (개발자)

브랜치에 push하면 GitHub Actions가 자동으로 배포합니다:

```bash
# 개발 환경 배포
git push origin dev

# 운영 환경 배포 (직접 push — 아래 '운영 승급' 방법 권장)
git push origin main
```

**개발(dev) 파이프라인:**
1. TypeScript 타입 체크 (`tsc --noEmit`)
2. Cloudflare Workers 배포 (`apply-api`, `decap-oauth`, `content-api`)
3. 정적 빌드 (`npm run build` + `build-blog.ts`)
4. AWS Amplify 배포 (완료까지 최대 10분) → **dev.zerogo.ai**

**운영(main) 파이프라인:**
1. TypeScript 타입 체크 (`tsc --noEmit`)
2. Cloudflare Workers 배포 (`apply-api` 만)
3. 정적 빌드 (`npm run build` + `build-blog.ts`)
4. AWS Amplify 배포 (완료까지 최대 10분) → **zerogo.ai**

### 운영 승급 — 경로 A: AI agent (마케터·디자이너 권장)

마케터·디자이너가 dev.zerogo.ai에서 검토를 마친 뒤 AI agent에게 "운영에 반영해줘"라고 요청하면, agent가 아래 명령을 실행합니다:

```bash
npm run promote
```

스크립트가 dev → main을 fast-forward 후 운영 배포를 자동 시작합니다. GitHub를 직접 만지지 않아도 됩니다.

### 운영 승급 — 경로 B: 웹 버튼 (비기술자 셀프서비스)

**https://dev.zerogo.ai/publish.html** 에 접속 → **"운영에 게시하기"** 버튼 클릭 → GitHub 로그인 → 자동 반영.

- GitHub 저장소 쓰기 권한이 있는 계정이 필요합니다 (Decap CMS 계정과 동일).
- dev 환경(dev.zerogo.ai)에서만 동작합니다.

### 수동 배포 (GitHub Actions)

GitHub Actions 탭 → 워크플로우 선택 → **Run workflow** 버튼으로 수동 트리거 가능.

### 운영 환경 제약

| 기능 | dev.zerogo.ai | zerogo.ai |
|------|:---:|:---:|
| `/admin` (Decap CMS) | ✅ | ❌ 차단 |
| `/publish.html` | ✅ | 접속은 가능하나 OAuth 비동작 |
| 블로그 CRUD (content-api) | ✅ | ❌ (dev 브랜치 전용) |

**`/admin` 차단 구현**: `vite.config.ts`의 `remove-admin-in-prod` 플러그인이 production 빌드 시 `dist/admin/`을 자동 삭제합니다. Amplify는 `dist/`를 정적으로 서빙하므로 `server.ts` 404만으로는 부족하며, 빌드 레벨 차단이 필수입니다.

### 필요한 GitHub Secrets / Variables

| 키 | 종류 | 설명 |
|----|------|------|
| `AWS_ACCESS_KEY_ID` | Secret | AWS 자격증명 |
| `AWS_SECRET_ACCESS_KEY` | Secret | AWS 자격증명 |
| `CLOUDFLARE_API_TOKEN` | Secret | Cloudflare 배포 토큰 |
| `CLOUDFLARE_ACCOUNT_ID` | Secret | Cloudflare 계정 ID |
| `AWS_REGION` | Variable | AWS 리전 (예: `ap-northeast-2`) |
| `AMPLIFY_APP_ID` | Variable | Amplify 앱 ID |
| `AMPLIFY_BRANCH` | Variable | Amplify 배포 브랜치 (예: `main`, `dev`) |
| `GITHUB_TOKEN` | Secret | Content API 연동용 GitHub PAT |

---

## 경로 별칭

`@`는 프로젝트 루트로 resolve됩니다 (`vite.config.ts` 설정).
