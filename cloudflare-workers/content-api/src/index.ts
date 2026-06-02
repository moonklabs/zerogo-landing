export interface Env {
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
  GITHUB_BRANCH: string;
  GITHUB_TOKEN: string;
  API_KEYS_JSON: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export async function sha256Hex(s: string): Promise<string> {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** UTF-8 safe base64 encoder (handles Korean/multi-byte) — for GitHub Contents API */
export function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  let bin = '';
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin);
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateSlug(date: Date, title: string): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const s = slugify(title) || 'post';
  return `${y}-${m}-${d}-${s}`;
}

export function buildMarkdown(
  title: string,
  date: string,
  description: string,
  body: string,
): string {
  const esc = (s: string): string => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `---\ntitle: "${esc(title)}"\ndate: "${date}"\ndescription: "${esc(description)}"\n---\n\n${body}`;
}

export function parseFrontmatter(raw: string): { data: Record<string, string>; body: string } {
  const data: Record<string, string> = {};
  if (!raw.startsWith('---')) return { data, body: raw };
  const end = raw.indexOf('\n---', 3);
  if (end === -1) return { data, body: raw };
  const fm = raw.slice(3, end).trim();
  const body = raw.slice(end + 4).trimStart();
  for (const line of fm.split('\n')) {
    const colon = line.indexOf(':');
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim().replace(/^["']|["']$/g, '');
    data[key] = val;
  }
  return { data, body };
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  });
}

// ── API Key Auth ──────────────────────────────────────────────────────────────

export function isValidKeyFormat(key: string): boolean {
  return key.startsWith('zgo_') && key.length === 52;
}

export async function validateApiKey(key: string, apiKeysJson: string): Promise<boolean> {
  if (!isValidKeyFormat(key)) return false;
  let hashes: string[];
  try { hashes = JSON.parse(apiKeysJson); } catch { return false; }
  if (!Array.isArray(hashes)) return false;
  const hash = await sha256Hex(key);
  return hashes.includes(hash);
}

// ── GitHub API ────────────────────────────────────────────────────────────────

interface GitHubConfig {
  owner: string;
  repo: string;
  branch: string;
  token: string;
}

function ghHeaders(token: string): HeadersInit {
  return {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github.v3+json',
    'Content-Type': 'application/json',
    'User-Agent': 'zerogo-content-api/1.0',
  };
}

export async function getFileSha(cfg: GitHubConfig, path: string): Promise<string | null> {
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${cfg.branch}`;
  const res = await fetch(url, { headers: ghHeaders(cfg.token) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub getFileSha failed: ${res.status}`);
  const data = await res.json() as { sha?: string };
  return data.sha ?? null;
}

export async function upsertFile(
  cfg: GitHubConfig,
  path: string,
  content: string,
  message: string,
): Promise<void> {
  const sha = await getFileSha(cfg, path);
  const body: Record<string, unknown> = {
    message,
    content: toBase64(content),
    branch: cfg.branch,
    ...(sha ? { sha } : {}),
  };
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`;
  const res = await fetch(url, { method: 'PUT', headers: ghHeaders(cfg.token), body: JSON.stringify(body) });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`GitHub upsert failed (${res.status}): ${err}`);
  }
}

export async function deleteFile(cfg: GitHubConfig, path: string, message: string): Promise<boolean> {
  const sha = await getFileSha(cfg, path);
  if (!sha) return false;
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: ghHeaders(cfg.token),
    body: JSON.stringify({ message, sha, branch: cfg.branch }),
  });
  if (!res.ok) throw new Error(`GitHub delete failed: ${res.status}`);
  return true;
}

export async function getFileContent(cfg: GitHubConfig, path: string): Promise<string | null> {
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/${path}?ref=${cfg.branch}`;
  const res = await fetch(url, { headers: ghHeaders(cfg.token) });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub getFileContent failed: ${res.status}`);
  const data = await res.json() as { content?: string };
  if (!data.content) return null;
  const cleaned = data.content.replace(/\n/g, '');
  const bytes = Uint8Array.from(atob(cleaned), c => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

export async function listPostSlugs(cfg: GitHubConfig): Promise<string[]> {
  const url = `https://api.github.com/repos/${cfg.owner}/${cfg.repo}/contents/content/blog?ref=${cfg.branch}`;
  const res = await fetch(url, { headers: ghHeaders(cfg.token) });
  if (res.status === 404) return [];
  if (!res.ok) throw new Error(`GitHub list failed: ${res.status}`);
  const files = await res.json() as Array<{ name: string; type: string }>;
  return files
    .filter(f => f.type === 'file' && f.name.endsWith('.md'))
    .map(f => f.name.replace('.md', ''));
}

// ── CORS ──────────────────────────────────────────────────────────────────────

const CORS_HEADERS: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// ── Worker ────────────────────────────────────────────────────────────────────

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: CORS_HEADERS });
    }

    const { pathname } = new URL(request.url);
    const isPostsList = pathname === '/api/posts';
    const slugMatch = pathname.match(/^\/api\/posts\/([^/]+)$/);
    const slugParam = slugMatch?.[1];

    const cfg: GitHubConfig = {
      owner: env.GITHUB_OWNER,
      repo: env.GITHUB_REPO,
      branch: env.GITHUB_BRANCH,
      token: env.GITHUB_TOKEN,
    };

    // ── Public reads (no auth required) ──────────────────────────────────────
    if (request.method === 'GET' && isPostsList) {
      try {
        const slugs = await listPostSlugs(cfg);
        const posts: Array<Record<string, string>> = [];
        for (const slug of slugs) {
          const raw = await getFileContent(cfg, `content/blog/${slug}.md`);
          if (!raw) continue;
          const { data } = parseFrontmatter(raw);
          posts.push({ slug, title: data.title ?? '', date: data.date ?? '', description: data.description ?? '' });
        }
        posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        return json(posts);
      } catch {
        return json({ error: 'Failed to list posts' }, 500);
      }
    }

    if (request.method === 'GET' && slugParam) {
      try {
        const raw = await getFileContent(cfg, `content/blog/${slugParam}.md`);
        if (!raw) return json({ error: 'Post not found' }, 404);
        const { data, body } = parseFrontmatter(raw);
        return json({ slug: slugParam, ...data, body });
      } catch {
        return json({ error: 'Failed to fetch post' }, 500);
      }
    }

    // ── Auth check for writes ─────────────────────────────────────────────────
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return json({ error: 'Missing or invalid authorization header' }, 401);
    }
    const apiKey = authHeader.slice(7);
    const valid = await validateApiKey(apiKey, env.API_KEYS_JSON ?? '[]');
    if (!valid) {
      return json({ error: 'Invalid or expired API key' }, 401);
    }

    // ── POST /api/posts — create ──────────────────────────────────────────────
    if (request.method === 'POST' && isPostsList) {
      let body: Record<string, unknown>;
      try { body = await request.json() as Record<string, unknown>; }
      catch { return json({ error: 'Invalid JSON body' }, 400); }

      const { title, description, body: postBody, date, slug: customSlug } = body as {
        title?: string; description?: string; body?: string; date?: string; slug?: string;
      };
      if (!title || !postBody) {
        return json({ error: 'title and body are required' }, 400);
      }

      const postDate = date ? new Date(date) : new Date();
      const slug = customSlug ?? generateSlug(postDate, title);
      const mdContent = buildMarkdown(title, postDate.toISOString(), description ?? '', postBody);

      try {
        await upsertFile(cfg, `content/blog/${slug}.md`, mdContent, `Add blog post: ${title}`);
        return json({ success: true, slug }, 201);
      } catch {
        return json({ error: 'Failed to create post' }, 500);
      }
    }

    // ── PUT /api/posts/:slug — update ─────────────────────────────────────────
    if (request.method === 'PUT' && slugParam) {
      let body: Record<string, unknown>;
      try { body = await request.json() as Record<string, unknown>; }
      catch { return json({ error: 'Invalid JSON body' }, 400); }

      const { title, description, body: postBody, date } = body as {
        title?: string; description?: string; body?: string; date?: string;
      };
      if (!title || !postBody) {
        return json({ error: 'title and body are required' }, 400);
      }

      const existingRaw = await getFileContent(cfg, `content/blog/${slugParam}.md`);
      if (!existingRaw) return json({ error: 'Post not found' }, 404);

      const { data: existing } = parseFrontmatter(existingRaw);
      const postDate = date ? new Date(date) : new Date(existing.date ?? new Date().toISOString());
      const mdContent = buildMarkdown(
        title,
        postDate.toISOString(),
        description ?? existing.description ?? '',
        postBody,
      );

      try {
        await upsertFile(cfg, `content/blog/${slugParam}.md`, mdContent, `Update blog post: ${title}`);
        return json({ success: true, slug: slugParam });
      } catch {
        return json({ error: 'Failed to update post' }, 500);
      }
    }

    // ── DELETE /api/posts/:slug ───────────────────────────────────────────────
    if (request.method === 'DELETE' && slugParam) {
      try {
        const deleted = await deleteFile(
          cfg,
          `content/blog/${slugParam}.md`,
          `Delete blog post: ${slugParam}`,
        );
        if (!deleted) return json({ error: 'Post not found' }, 404);
        return json({ success: true, slug: slugParam });
      } catch {
        return json({ error: 'Failed to delete post' }, 500);
      }
    }

    return json({ error: 'Method not allowed' }, 405);
  },
};
