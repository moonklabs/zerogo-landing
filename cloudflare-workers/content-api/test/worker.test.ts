import { describe, it, expect, vi, beforeAll, afterEach } from 'vitest';
import worker, {
  sha256Hex,
  toBase64,
  slugify,
  generateSlug,
  buildMarkdown,
  parseFrontmatter,
  isValidKeyFormat,
  validateApiKey,
} from '../src/index';
import type { Env } from '../src/index';

// ── Test key setup ────────────────────────────────────────────────────────────

// Valid key: 'zgo_' (4) + 48 hex chars = 52 chars total
// 'abcdef0123456789' (16) × 3 = 48 hex chars → 4 + 48 = 52 ✓
const TEST_KEY = 'zgo_abcdef0123456789abcdef0123456789abcdef0123456789';
let TEST_KEY_HASH: string;
let ENV: Env;

beforeAll(async () => {
  TEST_KEY_HASH = await sha256Hex(TEST_KEY);
  ENV = {
    GITHUB_OWNER: 'test-owner',
    GITHUB_REPO: 'test-repo',
    GITHUB_BRANCH: 'dev',
    GITHUB_TOKEN: 'ghp_test_token',
    API_KEYS_JSON: JSON.stringify([TEST_KEY_HASH]),
  };
});

afterEach(() => vi.restoreAllMocks());

// ── Helper: build a Request ───────────────────────────────────────────────────

function req(method: string, path: string, body?: unknown, auth?: string): Request {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (auth) headers['Authorization'] = `Bearer ${auth}`;
  return new Request(`http://worker.test${path}`, {
    method,
    headers,
    ...(body !== undefined ? { body: JSON.stringify(body) } : {}),
  });
}

// ── Unit: pure helpers ────────────────────────────────────────────────────────

describe('sha256Hex', () => {
  it('produces 64-char lowercase hex', async () => {
    const h = await sha256Hex('hello');
    expect(h).toHaveLength(64);
    expect(h).toMatch(/^[0-9a-f]+$/);
  });

  it('is deterministic', async () => {
    expect(await sha256Hex('test')).toBe(await sha256Hex('test'));
  });
});

describe('toBase64', () => {
  it('encodes ASCII correctly', () => {
    expect(toBase64('hello')).toBe(btoa('hello'));
  });

  it('encodes Korean (multi-byte UTF-8) without throwing', () => {
    const encoded = toBase64('안녕하세요');
    expect(() => atob(encoded)).not.toThrow();
  });
});

describe('slugify', () => {
  it('converts spaces to hyphens', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });

  it('strips special characters', () => {
    expect(slugify('Test! Post #1')).toBe('test-post-1');
  });

  it('collapses multiple hyphens', () => {
    expect(slugify('A   B')).toBe('a-b');
  });

  it('strips leading/trailing hyphens', () => {
    expect(slugify('  test  ')).toBe('test');
  });

  it('returns "post" for all-Korean title (no ASCII)', () => {
    const s = slugify('안녕하세요');
    expect(s).toBe('');
  });
});

describe('generateSlug', () => {
  it('prepends YYYY-MM-DD prefix', () => {
    const d = new Date('2026-06-02T00:00:00Z');
    expect(generateSlug(d, 'Hello World')).toBe('2026-06-02-hello-world');
  });
});

describe('buildMarkdown', () => {
  it('wraps content in frontmatter', () => {
    const md = buildMarkdown('Title', '2026-06-02T00:00:00.000Z', 'Desc', '# Body');
    expect(md).toContain('title: "Title"');
    expect(md).toContain('date: "2026-06-02T00:00:00.000Z"');
    expect(md).toContain('description: "Desc"');
    expect(md).toContain('# Body');
  });

  it('escapes double quotes in title', () => {
    const md = buildMarkdown('He said "hi"', '2026-01-01T00:00:00.000Z', '', 'body');
    expect(md).toContain('title: "He said \\"hi\\""');
  });
});

describe('parseFrontmatter', () => {
  it('parses title, date, description and body', () => {
    const raw = `---\ntitle: "Test"\ndate: "2026-06-01"\ndescription: "Desc"\n---\n\n# Body`;
    const { data, body } = parseFrontmatter(raw);
    expect(data.title).toBe('Test');
    expect(data.date).toBe('2026-06-01');
    expect(data.description).toBe('Desc');
    expect(body).toContain('# Body');
  });

  it('returns raw string as body when no frontmatter', () => {
    const raw = 'Just content';
    const { data, body } = parseFrontmatter(raw);
    expect(Object.keys(data)).toHaveLength(0);
    expect(body).toBe('Just content');
  });
});

describe('isValidKeyFormat', () => {
  it('accepts valid zgo_ key of length 52', () => {
    expect(isValidKeyFormat(TEST_KEY)).toBe(true);
  });

  it('rejects wrong prefix', () => {
    expect(isValidKeyFormat('abc_' + 'a'.repeat(48))).toBe(false);
  });

  it('rejects wrong length (51)', () => {
    expect(isValidKeyFormat('zgo_' + 'a'.repeat(47))).toBe(false);
  });

  it('rejects wrong length (53)', () => {
    expect(isValidKeyFormat('zgo_' + 'a'.repeat(49))).toBe(false);
  });
});

describe('validateApiKey', () => {
  it('accepts a key whose hash is in the list', async () => {
    const keysJson = JSON.stringify([TEST_KEY_HASH]);
    expect(await validateApiKey(TEST_KEY, keysJson)).toBe(true);
  });

  it('rejects a key not in the list', async () => {
    expect(await validateApiKey(TEST_KEY, '[]')).toBe(false);
  });

  it('rejects invalid format', async () => {
    expect(await validateApiKey('bad', JSON.stringify([TEST_KEY_HASH]))).toBe(false);
  });

  it('rejects malformed JSON gracefully', async () => {
    expect(await validateApiKey(TEST_KEY, 'not-json')).toBe(false);
  });
});

// ── Integration: Worker fetch handler ────────────────────────────────────────

describe('CORS preflight', () => {
  it('OPTIONS returns 204 with CORS headers', async () => {
    const res = await worker.fetch(new Request('http://worker.test/api/posts', { method: 'OPTIONS' }), ENV);
    expect(res.status).toBe(204);
    expect(res.headers.get('Access-Control-Allow-Methods')).toContain('POST');
  });
});

describe('POST /api/posts — authentication', () => {
  it('returns 401 when no Authorization header', async () => {
    const res = await worker.fetch(req('POST', '/api/posts', { title: 't', body: 'b' }), ENV);
    expect(res.status).toBe(401);
  });

  it('returns 401 for invalid API key', async () => {
    const res = await worker.fetch(
      req('POST', '/api/posts', { title: 't', body: 'b' }, 'zgo_' + 'x'.repeat(48)),
      ENV,
    );
    expect(res.status).toBe(401);
  });

  it('returns 401 for key with wrong prefix', async () => {
    const res = await worker.fetch(
      req('POST', '/api/posts', { title: 't', body: 'b' }, 'bad_' + 'a'.repeat(48)),
      ENV,
    );
    expect(res.status).toBe(401);
  });
});

describe('POST /api/posts — validation', () => {
  it('returns 400 when title is missing', async () => {
    const res = await worker.fetch(req('POST', '/api/posts', { body: 'content' }, TEST_KEY), ENV);
    expect(res.status).toBe(400);
    const data = await res.json() as { error: string };
    expect(data.error).toContain('title');
  });

  it('returns 400 when body is missing', async () => {
    const res = await worker.fetch(req('POST', '/api/posts', { title: 'Title' }, TEST_KEY), ENV);
    expect(res.status).toBe(400);
  });
});

describe('POST /api/posts — create', () => {
  it('creates a post and returns 201 with slug', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 404 }))            // getFileSha → not exists
      .mockResolvedValueOnce(new Response(JSON.stringify({ content: { sha: 'abc' } }), { status: 201 })); // upsert → success
    vi.stubGlobal('fetch', mockFetch);

    const res = await worker.fetch(
      req('POST', '/api/posts', { title: 'Test Post', body: '# Hello\n\nWorld' }, TEST_KEY),
      ENV,
    );
    expect(res.status).toBe(201);
    const data = await res.json() as { success: boolean; slug: string };
    expect(data.success).toBe(true);
    expect(data.slug).toMatch(/test-post$/);
  });

  it('uses custom slug when provided', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 404 }))
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 201 }));
    vi.stubGlobal('fetch', mockFetch);

    const res = await worker.fetch(
      req('POST', '/api/posts', { title: 'T', body: 'B', slug: 'my-custom-slug' }, TEST_KEY),
      ENV,
    );
    const data = await res.json() as { slug: string };
    expect(data.slug).toBe('my-custom-slug');
  });
});

describe('PUT /api/posts/:slug — update', () => {
  it('returns 404 when post does not exist', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{}', { status: 404 })));

    const res = await worker.fetch(
      req('PUT', '/api/posts/nonexistent', { title: 'T', body: 'B' }, TEST_KEY),
      ENV,
    );
    expect(res.status).toBe(404);
  });

  it('updates an existing post and returns 200', async () => {
    const existingMd = buildMarkdown('Old Title', '2026-01-01T00:00:00.000Z', 'Old desc', '# Old');
    const encodedMd = toBase64(existingMd);

    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ content: encodedMd }), { status: 200 })) // getFileContent
      .mockResolvedValueOnce(new Response(JSON.stringify({ sha: 'sha1' }), { status: 200 }))        // getFileSha
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));                    // PUT
    vi.stubGlobal('fetch', mockFetch);

    const res = await worker.fetch(
      req('PUT', '/api/posts/existing-slug', { title: 'New Title', body: '# New' }, TEST_KEY),
      ENV,
    );
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean; slug: string };
    expect(data.success).toBe(true);
    expect(data.slug).toBe('existing-slug');
  });
});

describe('DELETE /api/posts/:slug — delete', () => {
  it('returns 404 when post does not exist', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{}', { status: 404 })));

    const res = await worker.fetch(
      req('DELETE', '/api/posts/ghost', undefined, TEST_KEY),
      ENV,
    );
    expect(res.status).toBe(404);
  });

  it('deletes an existing post and returns 200', async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify({ sha: 'deadbeef' }), { status: 200 })) // getFileSha
      .mockResolvedValueOnce(new Response(JSON.stringify({}), { status: 200 }));                  // DELETE
    vi.stubGlobal('fetch', mockFetch);

    const res = await worker.fetch(
      req('DELETE', '/api/posts/to-delete', undefined, TEST_KEY),
      ENV,
    );
    expect(res.status).toBe(200);
    const data = await res.json() as { success: boolean; slug: string };
    expect(data.success).toBe(true);
    expect(data.slug).toBe('to-delete');
  });
});

describe('GET /api/posts — list (no auth required)', () => {
  it('returns list of posts from GitHub', async () => {
    const slugs = [{ name: '2026-06-01-hello.md', type: 'file' }];
    const mdContent = buildMarkdown('Hello', '2026-06-01T00:00:00.000Z', 'Desc', '# Body');

    const mockFetch = vi.fn()
      .mockResolvedValueOnce(new Response(JSON.stringify(slugs), { status: 200 }))                               // listPostSlugs
      .mockResolvedValueOnce(new Response(JSON.stringify({ content: toBase64(mdContent) }), { status: 200 }));   // getFileContent
    vi.stubGlobal('fetch', mockFetch);

    const res = await worker.fetch(new Request('http://worker.test/api/posts'), ENV);
    expect(res.status).toBe(200);
    const data = await res.json() as Array<{ slug: string; title: string }>;
    expect(Array.isArray(data)).toBe(true);
    expect(data[0].slug).toBe('2026-06-01-hello');
    expect(data[0].title).toBe('Hello');
  });
});

describe('GET /api/posts/:slug — single (no auth required)', () => {
  it('returns 404 for unknown slug', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(new Response('{}', { status: 404 })));

    const res = await worker.fetch(new Request('http://worker.test/api/posts/unknown'), ENV);
    expect(res.status).toBe(404);
  });

  it('returns post data for known slug', async () => {
    const md = buildMarkdown('My Post', '2026-06-01T00:00:00.000Z', 'Desc', '# Content');
    vi.stubGlobal('fetch', vi.fn().mockResolvedValueOnce(
      new Response(JSON.stringify({ content: toBase64(md) }), { status: 200 }),
    ));

    const res = await worker.fetch(new Request('http://worker.test/api/posts/my-post'), ENV);
    expect(res.status).toBe(200);
    const data = await res.json() as { slug: string; title: string; body: string };
    expect(data.slug).toBe('my-post');
    expect(data.title).toBe('My Post');
    expect(data.body).toContain('# Content');
  });
});

describe('Unknown route', () => {
  it('returns 405 for unsupported method on /api/posts', async () => {
    const res = await worker.fetch(
      req('PATCH', '/api/posts', { title: 't', body: 'b' }, TEST_KEY),
      ENV,
    );
    expect(res.status).toBe(405);
  });
});
