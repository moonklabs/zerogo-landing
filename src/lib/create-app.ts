import express, { Express, Request, Response, NextFunction } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { PostInput, writePost, deletePost, listPosts, readPost } from './content.js';
import { GitHubConfig, upsertFile, deleteFile } from './github-client.js';
import { triggerBlogBuild } from './build-trigger.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export interface AppConfig {
  contentDir: string;
  github?: GitHubConfig;
  isProduction: boolean;
}

export function createApp(config: AppConfig): Express {
  const app = express();
  app.use(express.json());
  
  const BLOG_DIR = config.contentDir;
  
  function validatePostInput(body: unknown): PostInput {
    if (!body || typeof body !== 'object') {
      throw new Error('Invalid request body');
    }
    const { title, description, body: postBody, date, slug } = body as Record<string, unknown>;
    
    if (!title || typeof title !== 'string') {
      throw new Error('title is required and must be a string');
    }
    if (!postBody || typeof postBody !== 'string') {
      throw new Error('body is required and must be a string');
    }
    
    return {
      title,
      description: typeof description === 'string' ? description : undefined,
      body: postBody,
      date: typeof date === 'string' ? date : undefined,
      slug: typeof slug === 'string' ? slug : undefined,
    };
  }
  
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('API Error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  });
  
  app.post('/api/posts', async (req: Request, res: Response) => {
    try {
      const input = validatePostInput(req.body);
      
      const slug = await writePost(BLOG_DIR, '', input);
      
      if (config.github) {
        const filePath = `content/blog/${slug}.md`;
        const fs = await import('fs/promises');
        const mdContent = await fs.readFile(path.join(BLOG_DIR, `${slug}.md`), 'utf-8');
        await upsertFile(config.github, filePath, mdContent, `Add blog post: ${input.title}`);
      }
      
      triggerBlogBuild().catch(console.error);
      
      res.status(201).json({ success: true, slug });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create post';
      res.status(400).json({ error: message });
    }
  });
  
  app.put('/api/posts/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const input = validatePostInput(req.body);
      
      const existingPath = path.join(BLOG_DIR, `${slug}.md`);
      const fs = await import('fs/promises');
      
      try {
        await fs.access(existingPath);
      } catch {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      const finalSlug = await writePost(BLOG_DIR, slug, input);
      
      if (config.github) {
        const mdContent = await fs.readFile(path.join(BLOG_DIR, `${finalSlug}.md`), 'utf-8');
        await upsertFile(config.github, `content/blog/${finalSlug}.md`, mdContent, `Update blog post: ${input.title}`);
      }
      
      triggerBlogBuild().catch(console.error);
      
      res.json({ success: true, slug: finalSlug });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update post';
      res.status(400).json({ error: message });
    }
  });
  
  app.delete('/api/posts/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const fs = await import('fs/promises');
      const filePath = path.join(BLOG_DIR, `${slug}.md`);
      
      try {
        await fs.access(filePath);
      } catch {
        return res.status(404).json({ error: 'Post not found' });
      }
      
      if (config.github) {
        await deleteFile(config.github, `content/blog/${slug}.md`, `Delete blog post: ${slug}`);
      }
      
      await deletePost(BLOG_DIR, slug);
      
      triggerBlogBuild().catch(console.error);
      
      res.json({ success: true, slug });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete post';
      res.status(400).json({ error: message });
    }
  });
  
  app.get('/api/posts', async (_req: Request, res: Response) => {
    try {
      const posts = await listPosts(BLOG_DIR);
      res.json(posts);
    } catch (error) {
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  });
  
  app.get('/api/posts/:slug', async (req: Request, res: Response) => {
    try {
      const { slug } = req.params;
      const post = await readPost(path.join(BLOG_DIR, `${slug}.md`));
      res.json(post);
    } catch {
      res.status(404).json({ error: 'Post not found' });
    }
  });
  
  return app;
}
