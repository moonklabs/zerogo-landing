import { test, expect } from '@playwright/test';

/**
 * Content API — Read-only E2E tests
 *
 * Write operations (POST/PUT/DELETE) are handled by the Cloudflare Worker
 * (cloudflare-workers/content-api) and tested in its own test suite.
 * These tests cover the local dev Express server's read endpoints only.
 */

const PORT = process.env.PORT || '3001';
const API_BASE = `http://127.0.0.1:${PORT}`;

test.describe('GET /api/posts', () => {
  test('should return array of posts', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/posts`);

    expect(response.ok()).toBe(true);
    expect(response.status()).toBe(200);

    const posts = await response.json();
    expect(Array.isArray(posts)).toBe(true);
  });

  test('should include required metadata fields when posts exist', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/posts`);
    const posts = await response.json();

    if (posts.length > 0) {
      const post = posts[0];
      expect(post).toHaveProperty('slug');
      expect(post).toHaveProperty('title');
      expect(post).toHaveProperty('date');
      expect(post).toHaveProperty('description');
    }
  });

  test('should return posts sorted by date descending', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/posts`);
    const posts = await response.json();

    if (posts.length > 1) {
      for (let i = 0; i < posts.length - 1; i++) {
        const a = new Date(posts[i].date).getTime();
        const b = new Date(posts[i + 1].date).getTime();
        expect(a).toBeGreaterThanOrEqual(b);
      }
    }
  });
});

test.describe('GET /api/posts/:slug', () => {
  test('should return 404 for non-existent post', async ({ request }) => {
    const response = await request.get(`${API_BASE}/api/posts/nonexistent-post-xyz-12345`);
    expect(response.status()).toBe(404);
  });

  test('should return full post content for an existing post', async ({ request }) => {
    const listRes = await request.get(`${API_BASE}/api/posts`);
    const posts = await listRes.json();

    if (posts.length === 0) {
      test.skip();
      return;
    }

    const { slug } = posts[0];
    const response = await request.get(`${API_BASE}/api/posts/${slug}`);

    expect(response.ok()).toBe(true);
    const post = await response.json();
    expect(post.slug).toBe(slug);
    expect(post).toHaveProperty('title');
    expect(post).toHaveProperty('date');
    expect(post).toHaveProperty('body');
  });
});
