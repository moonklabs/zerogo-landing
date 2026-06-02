# zerogo-content-api

Cloudflare Worker — 블로그 콘텐츠 발행 API.  
GitHub `dev` 브랜치의 `content/blog/*.md` 파일을 직접 읽고 쓴다.

---

## 역할 분담

| 경로 | 용도 |
|------|------|
| `/admin` (Decap CMS) | **사람이 직접 편집** — 리치 에디터, 이미지 업로드. `use_graphql: true`로 rate limit 안전. |
| Content API Worker (이 문서) | **AI·자동화 발행** — 스크립트/에이전트가 글을 commit. 요청을 절제(글 1건 = 커밋 1건)하므로 burst 없음. |

두 경로 모두 같은 `content/blog/*.md`(dev 브랜치)를 대상으로 하므로 충돌이 없다.

---

## 엔드포인트

### 공개 (인증 불필요)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `GET` | `/api/posts` | 전체 글 목록 `[{slug, title, date, description}]` — `draft: true` 제외, 날짜 내림차순 |
| `GET` | `/api/posts/:slug` | 글 본문 `{slug, title, date, description, body}` — draft도 반환(미리보기용) |

### 쓰기 (Bearer 인증 필요)

| 메서드 | 경로 | 설명 |
|--------|------|------|
| `POST` | `/api/posts` | 글 생성 → 201 `{success, slug}` |
| `PUT` | `/api/posts/:slug` | 글 수정 → 200 `{success, slug}` |
| `DELETE` | `/api/posts/:slug` | 글 삭제 → 200 `{success, slug}` |

#### POST / PUT 요청 본문

```json
{
  "title": "글 제목",          // 필수
  "body": "# 마크다운 본문",   // 필수
  "description": "요약",       // 선택 (기본: "")
  "date": "2026-06-03",        // 선택 (기본: 현재 시각)
  "slug": "custom-slug",       // 선택, POST 전용 (기본: YYYY-MM-DD-<title-slug>)
  "draft": true                // 선택 (기본: false)
}
```

PUT에서 `draft`를 생략하면 기존 값이 유지된다.

#### draft 동작

- `draft: true` — `GET /api/posts` 목록에서 숨김. 직접 URL(`/api/posts/:slug`)로는 접근 가능(미리보기).
- 발행 전환: `PUT /api/posts/:slug` with `{"draft": false}` → 다음 Amplify 빌드부터 목록 노출.

---

## 인증

```
Authorization: Bearer zgo_<48자 hex>
```

키 형식: `zgo_` 접두어 + 48자 hex = 총 52자.

---

## API 키 발급

```bash
# 루트 디렉터리에서 실행
npx tsx scripts/gen-key.ts <이름>
```

출력된 **SHA-256 해시**를 Worker의 `API_KEYS_JSON` 시크릿 배열에 추가:

```bash
cd cloudflare-workers/content-api
wrangler secret put API_KEYS_JSON
# 입력값 (기존 해시 보존): ["기존해시", "새해시"]
```

---

## 시크릿 설정

Worker는 두 개의 시크릿이 필요하다.

```bash
cd cloudflare-workers/content-api

# GitHub Personal Access Token (repo scope — contents 읽기/쓰기)
wrangler secret put GITHUB_TOKEN

# API 키 해시 배열 (JSON array of SHA-256 hashes)
wrangler secret put API_KEYS_JSON
# 예: ["abc123...", "def456..."]
```

> ⚠️ **주의:** `gh auth token`으로 발급한 토큰은 만료될 수 있다.  
> 장기 운영을 위해 GitHub에서 **별도 PAT(Fine-grained 또는 Classic, repo scope)**를 발급해 `GITHUB_TOKEN`에 설정하는 것을 권장한다.

`wrangler.toml` vars(비밀 아님):
- `GITHUB_OWNER = "moonklabs"`
- `GITHUB_REPO = "zerogo-landing"`
- `GITHUB_BRANCH = "dev"`

---

## 로컬 개발

```bash
# .dev.vars 파일 생성 (커밋하지 말 것)
cat > .dev.vars << 'EOF'
GITHUB_TOKEN=ghp_...
API_KEYS_JSON=["해시값"]
EOF

npx wrangler dev
```

---

## 배포

```bash
cd cloudflare-workers/content-api
npx wrangler deploy
```

또는 루트에서 `git push origin dev` → `.github/workflows/deploy-amplify-dev.yml`이 자동 배포.

---

## 발행 흐름

```
POST /api/posts
  → Worker가 content/blog/<slug>.md를 dev 브랜치에 커밋
  → GitHub push → Amplify 자동 빌드
  → build-blog.ts: draft 제외 index.json 생성
  → dev.zerogo.ai/blog 에 노출
```

로컬 발행 편의 스크립트:

```bash
ZGO_API_KEY=zgo_... npm run publish -- --title "제목" --body "# 내용" --draft
```

또는 마크다운 파일로:

```bash
ZGO_API_KEY=zgo_... npm run publish -- path/to/post.md
```
