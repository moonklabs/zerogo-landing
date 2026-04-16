# zerogo-landing

zerogo.ai 한국어 랜딩 페이지 및 블로그

**Stack**: React 19 + TypeScript + Vite 6 + TailwindCSS v4 + Express

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

## 배포

### 브랜치 전략

| 브랜치 | 환경 | URL |
|--------|------|-----|
| `dev` | 개발 | `https://dev.zerogo.ai` |
| `main` | 운영 | `https://zerogo.ai` |

### GitHub Actions

`dev` 브랜치 push 시 자동 실행 (`.github/workflows/deploy-amplify-dev.yml`):

1. TypeScript 타입 체크
2. Cloudflare Workers 배포 (`apply-api`, `decap-oauth`)
3. 정적 빌드 및 블로그 인덱스 생성
4. AWS Amplify에 zip 업로드 및 배포

**필요한 GitHub Secrets**:

| Secret | 설명 |
|--------|------|
| `AWS_ACCESS_KEY_ID` | AWS 자격증명 |
| `AWS_SECRET_ACCESS_KEY` | AWS 자격증명 |
| `CLOUDFLARE_API_TOKEN` | Cloudflare 배포 토큰 |
| `CLOUDFLARE_ACCOUNT_ID` | Cloudflare 계정 ID |

**필요한 GitHub Variables**:

| Variable | 설명 |
|----------|------|
| `AWS_REGION` | AWS 리전 (예: `ap-northeast-2`) |
| `AMPLIFY_APP_ID` | Amplify 앱 ID |

---

## 경로 별칭

`@`는 프로젝트 루트(`/Users/drumcap/workspace/zerogo-landing`)로 resolve됩니다 (`vite.config.ts` 설정).
