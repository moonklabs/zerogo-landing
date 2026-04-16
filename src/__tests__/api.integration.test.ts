import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createApp, AppConfig } from '../lib/create-app.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DIR = path.join(__dirname, '__fixtures__/api-test');

describe('Content API Integration Tests', () => {
  let app: express.Express;
  let config: AppConfig;

  beforeEach(async () => {
    await fs.mkdir(TEST_DIR, { recursive: true });
    config = {
      contentDir: TEST_DIR,
      isProduction: false,
    };
    app = createApp(config);
  });

  afterEach(async () => {
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {
    }
  });

  describe('POST /api/posts', () => {
    it('creates new blog post', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          title: 'Test Post',
          description: 'A test description',
          body: '# Hello World\n\nThis is a test post.',
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.slug).toBeDefined();
      
      const filePath = path.join(TEST_DIR, `${response.body.slug}.md`);
      const exists = await fs.access(filePath).then(() => true).catch(() => false);
      expect(exists).toBe(true);
    });

    it('returns 400 for missing title', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          body: 'Content without title',
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('title');
    });

    it('returns 400 for missing body', async () => {
      const response = await request(app)
        .post('/api/posts')
        .send({
          title: 'Title Only',
        });
      
      expect(response.status).toBe(400);
      expect(response.body.error).toContain('body');
    });
  });

  describe('GET /api/posts', () => {
    it('returns empty array when no posts', async () => {
      const response = await request(app).get('/api/posts');
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it('returns list of posts sorted by date', async () => {
      await request(app).post('/api/posts').send({
        title: 'First Post',
        body: 'Content 1',
        date: '2026-04-10T12:00:00Z',
      });
      await request(app).post('/api/posts').send({
        title: 'Second Post',
        body: 'Content 2',
        date: '2026-04-15T12:00:00Z',
      });
      
      const response = await request(app).get('/api/posts');
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0].title).toBe('Second Post');
    });
  });

  describe('GET /api/posts/:slug', () => {
    it('returns 404 for non-existent post', async () => {
      const response = await request(app).get('/api/posts/nonexistent-post');
      expect(response.status).toBe(404);
    });

    it('returns post content for existing post', async () => {
      const createRes = await request(app).post('/api/posts').send({
        title: 'Test Post',
        body: '# Test Content',
      });
      
      const response = await request(app).get(`/api/posts/${createRes.body.slug}`);
      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Test Post');
      expect(response.body.body).toContain('# Test Content');
    });
  });

  describe('PUT /api/posts/:slug', () => {
    it('updates existing post', async () => {
      const createRes = await request(app).post('/api/posts').send({
        title: 'Original Title',
        body: 'Original content',
      });
      
      const response = await request(app)
        .put(`/api/posts/${createRes.body.slug}`)
        .send({
          title: 'Updated Title',
          body: 'Updated content',
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      
      const postRes = await request(app).get(`/api/posts/${createRes.body.slug}`);
      expect(postRes.body.title).toBe('Updated Title');
    });

    it('returns 404 for non-existent post', async () => {
      const response = await request(app)
        .put('/api/posts/nonexistent')
        .send({
          title: 'Test',
          body: 'Content',
        });
      
      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/posts/:slug', () => {
    it('deletes existing post', async () => {
      const createRes = await request(app).post('/api/posts').send({
        title: 'To Delete',
        body: 'Content',
      });
      
      const deleteRes = await request(app).delete(`/api/posts/${createRes.body.slug}`);
      expect(deleteRes.status).toBe(200);
      expect(deleteRes.body.success).toBe(true);
      
      const getRes = await request(app).get(`/api/posts/${createRes.body.slug}`);
      expect(getRes.status).toBe(404);
    });

    it('returns 404 for non-existent post', async () => {
      const response = await request(app).delete('/api/posts/nonexistent');
      expect(response.status).toBe(404);
    });
  });
});
