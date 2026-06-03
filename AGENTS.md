# Project Versioning

- **ver1**: Completed on 2026-04-10.
  - Features:
    - Responsive Hero section with AI Agent copy.
    - Updated branding colors (#363636 for dark backgrounds).
    - Pretendard font integration.
    - Polished Footer design matching provided PRD.
    - Centered Header navigation.
    - Updated Hero image.

---

# Architecture Notes for Agents

## 브랜치 & 환경

| 브랜치 | 환경 | URL |
|--------|------|-----|
| `dev` | 개발 | https://dev.zerogo.ai |
| `main` | 운영 | https://zerogo.ai |

## 운영 반영 (Promote)

실제 작업자는 **마케터·디자이너** (GitHub 비친화, Decap CMS 사용). AI agent가 보조.

사용자가 "운영에 반영/게시/배포해줘" 요청 시:
```bash
npm run promote   # scripts/promote.ts — dev→main fast-forward + 운영 배포 트리거
```

비기술자 셀프서비스: https://dev.zerogo.ai/publish.html (웹 버튼)

## 배포 모델

AWS Amplify **WEB_COMPUTE**에 GitHub 저장소가 직접 연결됨:
- main 또는 dev 브랜치에 push → 자동 빌드 (`amplify.yml`) → Next.js 런타임 배포
- 이전의 GitHub Actions 정적 zip 배포는 제거됨

## CRITICAL: 운영 환경 제약

### `/admin` 차단 (절대 규칙)

- **운영(zerogo.ai)에서 `/admin`은 접근 불가여야 한다**
- `middleware.ts`의 admin gate가 `/admin` 접근을 차단합니다:
  - 주 검사: `DEPLOY_ENV === "production"` (Amplify 환경 변수 설정)
  - 방어 심화: 호스트가 `dev.*` 또는 `localhost`여야 함
- **CRITICAL**: Amplify의 **main 브랜치**에서 반드시 `DEPLOY_ENV=production` 환경 변수 설정
  - **dev 브랜치**는 `DEPLOY_ENV=development` 또는 미설정
- 이 환경 변수를 제거하거나 잘못 설정하지 말 것

## Cloudflare Workers

| 워커 | 용도 | 환경 |
|------|------|------|
| `apply-api` | 신청 폼 → GAS 전달 (지원 중지 — 같은 출처 요청 사용) | dev + 운영 |
| `decap-oauth` | Decap CMS GitHub OAuth 프록시 | dev 전용 |

dev 배포는 `decap-oauth` 배포. 운영 배포는 Cloudflare Workers 스킵.
