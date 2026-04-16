import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { 
  slugify, 
  generateSlug, 
  writePost, 
  readPost, 
  deletePost, 
  listPosts 
} from '../lib/content.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEST_DIR = path.join(__dirname, '__fixtures__/blog-test');

describe('content.ts', () => {
  beforeEach(async () => {
    await fs.mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    try {
      await fs.rm(TEST_DIR, { recursive: true, force: true });
    } catch {
    }
  });

  describe('slugify()', () => {
    it('converts title to lowercase slug', () => {
      expect(slugify('Hello World')).toBe('hello-world');
    });
    
    it('handles special characters', () => {
      expect(slugify('Test @#$% Post!')).toBe('test-post');
    });
    
    it('removes leading/trailing dashes', () => {
      expect(slugify('  Hello  ')).toBe('hello');
    });
  });

  describe('generateSlug()', () => {
    it('creates date-prefixed slug', () => {
      const date = new Date('2026-04-16T12:00:00Z');
      const slug = generateSlug(date, 'Test Post');
      expect(slug).toBe('2026-04-16-test-post');
    });
  });

  describe('writePost()', () => {
    it('writes markdown file with frontmatter', async () => {
      const input = {
        title: 'Test Post',
        description: 'Test description',
        body: '# Hello World\n\nThis is content.',
      };
      
      const slug = await writePost(TEST_DIR, '', input);
      expect(slug).toMatch(/^\d{4}-\d{2}-\d{2}-test-post$/);
      
      const filePath = path.join(TEST_DIR, `${slug}.md`);
      const content = await fs.readFile(filePath, 'utf-8');
      expect(content).toContain('title: Test Post');
      expect(content).toContain('description: Test description');
      expect(content).toContain('# Hello World');
    });

    it('uses provided slug if given', async () => {
      const input = {
        title: 'Test',
        body: 'Content',
        slug: 'custom-slug-post',
      };
      
      const slug = await writePost(TEST_DIR, '', input);
      expect(slug).toBe('custom-slug-post');
    });
  });

  describe('readPost()', () => {
    it('parses markdown with frontmatter', async () => {
      const input = {
        title: 'Read Test',
        description: 'Description',
        body: '# Content',
      };
      
      const writtenSlug = await writePost(TEST_DIR, '', input);
      const post = await readPost(path.join(TEST_DIR, `${writtenSlug}.md`));
      
      expect(post.title).toBe('Read Test');
      expect(post.description).toBe('Description');
      expect(post.body.trim()).toBe('# Content');
    });
  });

  describe('deletePost()', () => {
    it('deletes markdown file', async () => {
      const input = { title: 'To Delete', body: 'Content' };
      const slug = await writePost(TEST_DIR, '', input);
      
      await deletePost(TEST_DIR, slug);
      
      const filePath = path.join(TEST_DIR, `${slug}.md`);
      await expect(fs.access(filePath)).rejects.toThrow();
    });
  });

  describe('listPosts()', () => {
    it('returns posts sorted by date descending', async () => {
      await writePost(TEST_DIR, '', { 
        title: 'Post 1', 
        body: 'Content 1',
        date: '2026-04-14T12:00:00Z',
      });
      await writePost(TEST_DIR, '', { 
        title: 'Post 2', 
        body: 'Content 2',
        date: '2026-04-16T12:00:00Z',
      });
      
      const posts = await listPosts(TEST_DIR);
      expect(posts).toHaveLength(2);
      expect(posts[0].title).toBe('Post 2');
      expect(posts[1].title).toBe('Post 1');
    });
  });
});
