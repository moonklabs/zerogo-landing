/**
 * 블로그 글 발행 스크립트 — Content API Worker 클라이언트
 *
 * 사용법:
 *   ZGO_API_KEY=zgo_... npx tsx scripts/publish-post.ts path/to/post.md
 *   ZGO_API_KEY=zgo_... npx tsx scripts/publish-post.ts --title "제목" --body "# 내용" [--draft]
 *   ZGO_API_KEY=zgo_... npx tsx scripts/publish-post.ts --update <slug> path/to/post.md
 *
 * 환경변수:
 *   ZGO_API_KEY    필수. zgo_ 접두어 Bearer 키.
 *   ZGO_API_URL    선택. 기본: https://zerogo-content-api.sellerking.workers.dev
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// ── Inline frontmatter parser (no gray-matter dep) ───────────────────────────

function parseFrontmatter(raw: string): { data: Record<string, string | boolean>; content: string } {
  const data: Record<string, string | boolean> = {};
  if (!raw.startsWith('---')) return { data, content: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { data, content: raw };
  const fm = raw.slice(3, end).trim();
  const content = raw.slice(end + 4).trimStart();
  for (const line of fm.split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    if (val === 'true') { data[key] = true; continue; }
    if (val === 'false') { data[key] = false; continue; }
    data[key] = val;
  }
  return { data, content };
}

// ── Config ────────────────────────────────────────────────────────────────────

const API_URL = process.env.ZGO_API_URL ?? 'https://zerogo-content-api.sellerking.workers.dev';
const API_KEY = process.env.ZGO_API_KEY ?? '';

if (!API_KEY) {
  console.error('❌  ZGO_API_KEY 환경변수가 필요합니다.');
  console.error('   export ZGO_API_KEY=zgo_...');
  process.exit(1);
}

// ── Arg parsing ───────────────────────────────────────────────────────────────

interface PostPayload {
  title: string;
  body: string;
  description?: string;
  date?: string;
  slug?: string;
  draft?: boolean;
}

function parseArgs(argv: string[]): { method: 'POST' | 'PUT'; slug?: string; payload: PostPayload } {
  const args = argv.slice(2);

  let updateSlug: string | undefined;
  let filePath: string | undefined;
  let title: string | undefined;
  let body: string | undefined;
  let description: string | undefined;
  let date: string | undefined;
  let slug: string | undefined;
  let draft = false;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--update') { updateSlug = args[++i]; continue; }
    if (a === '--title') { title = args[++i]; continue; }
    if (a === '--body') { body = args[++i]; continue; }
    if (a === '--description') { description = args[++i]; continue; }
    if (a === '--date') { date = args[++i]; continue; }
    if (a === '--slug') { slug = args[++i]; continue; }
    if (a === '--draft') { draft = true; continue; }
    // positional: markdown file path
    if (!a.startsWith('--')) { filePath = a; }
  }

  if (filePath) {
    const resolved = path.isAbsolute(filePath) ? filePath : path.join(process.cwd(), filePath);
    if (!fs.existsSync(resolved)) {
      console.error(`❌  파일을 찾을 수 없습니다: ${resolved}`);
      process.exit(1);
    }
    const raw = fs.readFileSync(resolved, 'utf-8');
    const { data, content } = parseFrontmatter(raw);
    title = title ?? String(data.title ?? '');
    description = description ?? (data.description ? String(data.description) : undefined);
    date = date ?? (data.date ? String(data.date) : undefined);
    slug = slug ?? (data.slug ? String(data.slug) : undefined);
    draft = draft || data.draft === true;
    body = body ?? content.trim();
  }

  if (!title || !body) {
    console.error('❌  title 과 body 가 필요합니다.');
    console.error('   파일 경로 또는 --title / --body 플래그를 사용하세요.');
    printUsage();
    process.exit(1);
  }

  const payload: PostPayload = { title, body };
  if (description !== undefined) payload.description = description;
  if (date !== undefined) payload.date = date;
  if (slug !== undefined) payload.slug = slug;
  if (draft) payload.draft = true;

  return updateSlug
    ? { method: 'PUT', slug: updateSlug, payload }
    : { method: 'POST', payload };
}

function printUsage(): void {
  console.error('');
  console.error('사용법:');
  console.error('  ZGO_API_KEY=zgo_... npx tsx scripts/publish-post.ts post.md');
  console.error('  ZGO_API_KEY=zgo_... npx tsx scripts/publish-post.ts --title "제목" --body "# 내용" [--draft]');
  console.error('  ZGO_API_KEY=zgo_... npx tsx scripts/publish-post.ts --update <slug> post.md');
}

// ── Request ───────────────────────────────────────────────────────────────────

async function request(method: 'POST' | 'PUT', endpoint: string, payload: PostPayload): Promise<void> {
  const url = `${API_URL}${endpoint}`;
  console.log(`\n▶ ${method} ${url}`);
  console.log(`  title:       ${payload.title}`);
  console.log(`  draft:       ${payload.draft ?? false}`);
  if (payload.description) console.log(`  description: ${payload.description}`);
  if (payload.date) console.log(`  date:        ${payload.date}`);

  const res = await fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const json = await res.json() as Record<string, unknown>;

  if (!res.ok) {
    console.error(`\n❌  HTTP ${res.status}: ${JSON.stringify(json)}`);
    process.exit(1);
  }

  const slug = String(json.slug ?? '');
  const isDraft = payload.draft === true;

  console.log(`\n✅  발행 완료!`);
  console.log(`   slug: ${slug}`);
  if (isDraft) {
    console.log(`   상태: 임시저장 (목록 숨김)`);
    console.log(`   미리보기: ${API_URL}/api/posts/${slug}`);
  } else {
    console.log(`   상태: 발행됨 (Amplify 빌드 후 노출)`);
  }
  console.log('');
}

// ── Main ──────────────────────────────────────────────────────────────────────

const { method, slug, payload } = parseArgs(process.argv);
const endpoint = method === 'PUT' && slug ? `/api/posts/${slug}` : '/api/posts';
await request(method, endpoint, payload);
