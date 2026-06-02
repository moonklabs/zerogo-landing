import { test, expect } from '@playwright/test';

const PORT = process.env.PORT || '3001';
const API_BASE = `http://127.0.0.1:${PORT}`;

test.describe('Content API E2E', () => {
  let apiKey: string = '';
  let apiKeyId: string = '';
  const testSlugs: string[] = [];

  test.beforeAll(async ({ request }) => {
    const adminToken = process.env.ADMIN_TOKEN;
    const headers = adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {};
    const response = await request.post(`${API_BASE}/api/keys`, {
      headers,
      data: { name: 'E2E Test Key' }
    });
    expect(response.ok()).toBe(true);
    const body = await response.json();
    apiKey = body.key;
    apiKeyId = body.id;
  });

  test.afterAll(async ({ request }) => {
    if (apiKeyId) {
      const adminToken = process.env.ADMIN_TOKEN;
      const headers = adminToken ? { 'Authorization': `Bearer ${adminToken}` } : {};
      const response = await request.delete(`${API_BASE}/api/keys/${apiKeyId}`, { headers });
      expect(response.ok()).toBe(true);
    }
  });

  test.describe('POST /api/posts', () => {
    test('should create a new blog post', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/posts`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        data: {
          title: 'E2E Test Post',
          description: 'This is a test post created by Playwright',
          body: '# Hello World\n\nThis is an E2E test post.',
        },
      });

      expect(response.ok()).toBe(true);
      expect(response.status()).toBe(201);
      
      const body = await response.json();
      expect(body.success).toBe(true);
      expect(body.slug).toBeDefined();
      
      testSlugs.push(body.slug);
    });

    test('should reject post without title', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/posts`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        data: {
          body: 'Content without title',
        },
      });

      expect(response.status()).toBe(400);
    });

    test('should reject post without body', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/posts`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        data: {
          title: 'Title Only',
        },
      });

      expect(response.status()).toBe(400);
    });

    test('should create post with custom slug', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/posts`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        data: {
          title: 'Custom Slug Post',
          slug: 'e2e-custom-slug-test',
          body: '# Custom Slug\n\nTesting custom slug support',
        },
      });

      expect(response.ok()).toBe(true);
      const body = await response.json();
      expect(body.slug).toBe('e2e-custom-slug-test');
      
      testSlugs.push(body.slug);
    });
  });

  test.describe('GET /api/posts', () => {
    test('should return list of posts', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/posts`);
      
      expect(response.ok()).toBe(true);
      expect(response.status()).toBe(200);
      
      const posts = await response.json();
      expect(Array.isArray(posts)).toBe(true);
    });

    test('should include post metadata', async ({ request }) => {
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
  });

  test.describe('GET /api/posts/:slug', () => {
    test('should return 404 for non-existent post', async ({ request }) => {
      const response = await request.get(`${API_BASE}/api/posts/nonexistent-post-12345`);
      
      expect(response.status()).toBe(404);
    });

    test('should return full post content', async ({ request }) => {
      const createRes = await request.post(`${API_BASE}/api/posts`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        data: {
          title: 'Content Test Post',
          description: 'For content retrieval test',
          body: '# Content Test\n\nTesting content retrieval.',
        },
      });
      
      const { slug } = await createRes.json();
      testSlugs.push(slug);
      
      const response = await request.get(`${API_BASE}/api/posts/${slug}`);
      
      expect(response.ok()).toBe(true);
      const post = await response.json();
      
      expect(post.slug).toBe(slug);
      expect(post.title).toBe('Content Test Post');
      expect(post.body).toContain('# Content Test');
    });
  });

  test.describe('PUT /api/posts/:slug', () => {
    test('should update existing post', async ({ request }) => {
      const createRes = await request.post(`${API_BASE}/api/posts`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        data: {
          title: 'Original Title',
          body: 'Original content',
        },
      });
      
      const { slug } = await createRes.json();
      testSlugs.push(slug);
      
      const updateRes = await request.put(`${API_BASE}/api/posts/${slug}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        data: {
          title: 'Updated Title',
          body: 'Updated content',
        },
      });
      
      expect(updateRes.ok()).toBe(true);
      
      const getRes = await request.get(`${API_BASE}/api/posts/${slug}`);
      const post = await getRes.json();
      
      expect(post.title).toBe('Updated Title');
      expect(post.body).toContain('Updated content');
    });

    test('should return 404 for non-existent post', async ({ request }) => {
      const response = await request.put(`${API_BASE}/api/posts/nonexistent-post`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        data: {
          title: 'Test',
          body: 'Content',
        },
      });
      
      expect(response.status()).toBe(404);
    });
  });

  test.describe('DELETE /api/posts/:slug', () => {
    test('should delete existing post', async ({ request }) => {
      const createRes = await request.post(`${API_BASE}/api/posts`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        data: {
          title: 'To Be Deleted',
          body: 'This will be deleted',
        },
      });
      
      const { slug } = await createRes.json();
      
      const deleteRes = await request.delete(`${API_BASE}/api/posts/${slug}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      expect(deleteRes.ok()).toBe(true);
      
      const getRes = await request.get(`${API_BASE}/api/posts/${slug}`);
      expect(getRes.status()).toBe(404);
      
      testSlugs.splice(testSlugs.indexOf(slug), 1);
    });

    test('should return 404 for non-existent post', async ({ request }) => {
      const response = await request.delete(`${API_BASE}/api/posts/nonexistent-post`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      
      expect(response.status()).toBe(404);
    });
  });

  test.describe('Authentication', () => {
    test('should return 401 when no auth header on POST /api/posts', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/posts`, {
        data: { title: 'No Auth', body: 'content' },
      });
      expect(response.status()).toBe(401);
    });

    test('should return 401 for invalid API key on POST /api/posts', async ({ request }) => {
      const response = await request.post(`${API_BASE}/api/posts`, {
        headers: { 'Authorization': 'Bearer zgo_invalidkeyinvalidkeyinvalidkeyinvalidkeyinval' },
        data: { title: 'Bad Key', body: 'content' },
      });
      expect(response.status()).toBe(401);
    });

    test('should return 401 when no auth header on PUT /api/posts/:slug', async ({ request }) => {
      const response = await request.put(`${API_BASE}/api/posts/some-slug`, {
        data: { title: 'No Auth', body: 'content' },
      });
      expect(response.status()).toBe(401);
    });

    test('should return 401 when no auth header on DELETE /api/posts/:slug', async ({ request }) => {
      const response = await request.delete(`${API_BASE}/api/posts/some-slug`);
      expect(response.status()).toBe(401);
    });

    test('should return 401 when creating key without admin token (if ADMIN_TOKEN is set)', async ({ request }) => {
      const adminToken = process.env.ADMIN_TOKEN;
      if (!adminToken) {
        test.skip();
        return;
      }
      const response = await request.post(`${API_BASE}/api/keys`, {
        data: { name: 'Unauthorized Key' },
      });
      expect(response.status()).toBe(401);
    });
  });

  test.describe('Full Content Lifecycle', () => {
    test('should handle create -> read -> update -> delete flow', async ({ request }) => {
      const createRes = await request.post(`${API_BASE}/api/posts`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        data: {
          title: 'Lifecycle Test Post',
          description: 'Testing full CRUD lifecycle',
          body: '# Initial Content\n\nThis is the initial content.',
        },
      });
      
      expect(createRes.ok()).toBe(true);
      const { slug } = await createRes.json();
      testSlugs.push(slug);
      
      const readRes = await request.get(`${API_BASE}/api/posts/${slug}`);
      expect(readRes.ok()).toBe(true);
      let post = await readRes.json();
      expect(post.title).toBe('Lifecycle Test Post');
      expect(post.body).toContain('Initial Content');
      
      const updateRes = await request.put(`${API_BASE}/api/posts/${slug}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
        data: {
          title: 'Lifecycle Test Post (Updated)',
          body: '# Updated Content\n\nThis is the updated content.',
        },
      });
      expect(updateRes.ok()).toBe(true);
      
      const updatedRes = await request.get(`${API_BASE}/api/posts/${slug}`);
      post = await updatedRes.json();
      expect(post.title).toBe('Lifecycle Test Post (Updated)');
      expect(post.body).toContain('Updated Content');
      
      const deleteRes = await request.delete(`${API_BASE}/api/posts/${slug}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });
      expect(deleteRes.ok()).toBe(true);
      
      const getRes = await request.get(`${API_BASE}/api/posts/${slug}`);
      expect(getRes.status()).toBe(404);
      
      testSlugs.splice(testSlugs.indexOf(slug), 1);
    });
  });
});
