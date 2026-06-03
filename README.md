# zerogo-landing

**ZEROGO** — 쿠팡 셀러를 위한 품절 방지 AI 에이전트 랜딩 페이지

> 재고를 보여주는 도구가 아닙니다. AI가 오늘 발주해야 할 상품을 먼저 알려드립니다.

**서비스 URL**: https://zerogo.ai | **개발**: https://dev.zerogo.ai

**Stack**: Next.js 15 (App Router, SSR) + React 19 + TypeScript + TailwindCSS v4

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
npm run dev      # 개발 서버 실행 (Next.js, 포트 3001)
npm run build    # Next.js 앱 빌드 → .next/
npm run start    # 프로덕션 서버 시작 (포트 3001)
npm run lint     # TypeScript 타입 체크 (tsc --noEmit)
npm run promote  # dev → main fast-forward + 운영 배포
npm run publish  # 블로그 포스트 공개 (Decap CMS 헬퍼)
```

---

## 아키텍처

### Next.js App Router (`app/`)

서버 렌더링(SSR) Next.js 앱:

- `app/layout.tsx` – Root layout (메타데이터, Organization/SoftwareApplication/FAQPage JSON-LD)
- `app/page.tsx` + `app/_components/HomeClient.tsx` – 홈 페이지 (모션용 클라이언트 컴포넌트)
- `app/blog/page.tsx` – 블로그 목록 (서버 렌더링, ItemList JSON-LD)
- `app/blog/[slug]/page.tsx` – 블로그 포스트 (서버 렌더링, generateMetadata, BlogPosting + BreadcrumbList JSON-LD)
- `app/api/apply/route.ts` – 폼 제출 엔드포인트 (Google Apps Script로 전달)
- `app/sitemap.ts` – 동적 사이트맵 (블로그 + AI 봇 포함)
- `app/robots.ts` – 동적 robots.txt (AI 봇 허용)
- `app/opengraph-image.tsx` + `app/blog/opengraph-image.tsx` + `app/blog/[slug]/opengraph-image.tsx` – next/og로 동적 OG 이미지
- `middleware.ts` – Admin gate: 운영 환경에서 `/admin` 차단 (DEPLOY_ENV=production)

**API 라우트**:
- `POST /api/apply` → Google Apps Script 웹훅으로 폼 제출 전달. **GAS_URL 및 GAS_AUTH_KEY 필수.**

### 블로그 콘텐츠 (`content/blog/`)

파일 기반 블로그: gray-matter 프론트매터(`title`, `date`, `description`)가 포함된 마크다운 파일. Next.js가 서버 사이드에서 요청 시 읽음 (빌드 스텝 불필요).

### CMS (`/admin`)

Decap CMS를 `/admin`에서 서빙. 정적 HTML이 `next.config.ts` 리라이트로 제공됨 (`/admin` → `/admin/index.html`). Config in `public/admin/config.yml`:
- `content/blog/`과 `public/images/blog/`에 포스트 및 이미지 기록
- 운영 배포를 위해 GitHub 백엔드 구성됨

### 헬퍼 라이브러리

- `lib/posts.ts` – 마크다운 읽기 및 프론트매터 파싱 (gray-matter)
- `lib/site.ts` – 사이트 상수 (URL, 메타데이터)

### Cloudflare Workers (`cloudflare-workers/`)

| Worker | 역할 |
|--------|------|
| `apply-api` | `/api/apply` 엔드포인트 (CF 배포용, 지원 중지 — 같은 출처 요청 사용) |
| `decap-oauth` | Decap CMS GitHub OAuth 프록시 (dev 전용) |

---

## 빌드

```bash
# Next.js 앱 빌드
npm run build

# 빌드 결과 확인
test -d .next
```

빌드 결과물은 `.next/`에 생성됩니다.

---

## 배포 / 운영 반영

### 브랜치 전략

| 브랜치 | 환경 | URL | 배포 방식 |
|--------|------|-----|----------|
| `dev` | 개발 | https://dev.zerogo.ai | Amplify WEB_COMPUTE (자동 빌드) |
| `main` | 운영 | https://zerogo.ai | Amplify WEB_COMPUTE (자동 빌드) |

### 배포 모델 (Amplify WEB_COMPUTE)

AWS Amplify가 GitHub 저장소에 직접 연결되어, main 또는 dev 브랜치에 push하면 자동으로 빌드 및 배포합니다:
1. `amplify.yml`에 정의된 빌드 단계 실행 (`npm run build`)
2. `.next/` 출력물 배포
3. Next.js 런타임 (WEB_COMPUTE) 위에서 SSR 제공

### 운영 승급 — 경로 A: AI agent (마케터·디자이너 권장)

마케터·디자이너가 dev.zerogo.ai에서 검토를 마친 뒤 AI agent에게 "운영에 반영해줘"라고 요청하면, agent가 아래 명령을 실행합니다:

```bash
npm run promote
```

스크립트가 dev → main을 fast-forward 후 푸시합니다. Amplify가 자동으로 main 브랜치 배포를 시작합니다. GitHub를 직접 만지지 않아도 됩니다.

### 운영 승급 — 경로 B: 웹 버튼 (비기술자 셀프서비스)

**https://dev.zerogo.ai/publish.html** 에 접속 → **"운영에 게시하기"** 버튼 클릭 → GitHub 로그인 → 자동 반영.

- GitHub 저장소 쓰기 권한이 있는 계정이 필요합니다 (Decap CMS 계정과 동일).
- dev 환경(dev.zerogo.ai)에서만 동작합니다.

### 운영 환경 제약

| 기능 | dev.zerogo.ai | zerogo.ai |
|------|:---:|:---:|
| `/admin` (Decap CMS) | ✅ | ❌ 차단 |
| `/publish.html` | ✅ | 접속은 가능하나 OAuth 비동작 |

**`/admin` 차단 구현**: `middleware.ts`의 admin gate가 `/admin` 접근을 두 가지 검사로 차단합니다:
- 주 검사: `DEPLOY_ENV === "production"` (Amplify 환경 변수, 서버 제어)
- 방어 심화: 호스트가 `dev.*` 또는 `localhost`여야 함

**CRITICAL**: Amplify의 **main 브랜치**에서 `DEPLOY_ENV=production`을 반드시 설정하세요. **dev 브랜치**는 `DEPLOY_ENV=development` 또는 미설정.

### 필요한 Amplify 환경 변수

| 브랜치 | 변수 | 값 |
|--------|------|-----|
| `dev` | `DEPLOY_ENV` | `development` (또는 미설정) |
| `main` | `DEPLOY_ENV` | `production` |
| 모두 | `GAS_URL` | Google Apps Script 웹훅 URL |
| 모두 | `GAS_AUTH_KEY` | GAS 인증 키 |
| dev | `DECAP_GITHUB_CLIENT_ID` | GitHub OAuth App Client ID |
| dev | `DECAP_GITHUB_CLIENT_SECRET` | GitHub OAuth App Client Secret |

### Cloudflare Workers 배포

Cloudflare Workers는 여전히 GitHub Actions로 배포됩니다:
- `decap-oauth` (dev 전용)
- `apply-api` (지원 중지 — 같은 출처 요청 사용)

---

## 경로 별칭

`@`는 프로젝트 루트로 resolve됩니다 (`tsconfig.json`, `next.config.ts` 설정).
