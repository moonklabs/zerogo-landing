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

## CRITICAL: 운영 환경 제약

### `/admin` 차단 (절대 규칙)

- **운영(zerogo.ai)에서 `/admin`은 접근 불가여야 한다**
- `vite.config.ts`의 `remove-admin-in-prod` 플러그인이 production 빌드 시 `dist/admin/`을 삭제
- 이 플러그인을 제거하거나 우회하지 말 것
- Amplify 정적 호스팅은 `server.ts` 404를 거치지 않으므로 빌드 레벨 차단 필수

## Cloudflare Workers

| 워커 | 용도 | 환경 |
|------|------|------|
| `apply-api` | 신청 폼 → GAS 전달 | dev + 운영 |
| `decap-oauth` | Decap CMS GitHub OAuth 프록시 | dev 전용 |
| `content-api` | 블로그 콘텐츠 CRUD (GitHub API) | dev 전용 |

운영 배포(`deploy-amplify.yml`)는 `apply-api`만 배포. `decap-oauth`, `content-api`는 dev 전용.
