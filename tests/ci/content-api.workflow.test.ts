import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../..');

describe('CI/CD Integration', () => {
  describe('Build Pipeline', () => {
    it('should successfully build the project', async () => {
      const { stdout, stderr } = await execAsync('npm run build', {
        cwd: PROJECT_ROOT,
        timeout: 120000,
      });
      
      // Ignore stderr as vite might output chunk size warnings
      
      const distExists = await fs.access(path.join(PROJECT_ROOT, 'dist')).then(() => true).catch(() => false);
      expect(distExists).toBe(true);
    });

    it('should run blog build script and generate posts', async () => {
      const contentDir = path.join(PROJECT_ROOT, 'content/blog');
      
      const files = await fs.readdir(contentDir).catch(() => []);
      
      if (files.length === 0) {
        await fs.writeFile(
          path.join(contentDir, '2026-04-16-test-ci-post.md'),
          `---
title: "CI Test Post"
date: 2026-04-16T12:00:00Z
description: "Testing CI/CD integration"
---

# CI Test Post

This is a test post for CI/CD validation.
`
        );
      }
      
      const { stdout } = await execAsync('npm run postbuild', {
        cwd: PROJECT_ROOT,
        timeout: 60000,
      });
      
      expect(stdout).toContain('Blog build complete');
      
      const indexPath = path.join(PROJECT_ROOT, 'dist/api/posts/index.json');
      const indexExists = await fs.access(indexPath).then(() => true).catch(() => false);
      expect(indexExists).toBe(true);
    });

    it('should pass TypeScript linting', async () => {
      const { stdout, stderr } = await execAsync('npm run lint', {
        cwd: PROJECT_ROOT,
        timeout: 60000,
      });
      
      expect(stderr).toBe('');
      expect(stdout).not.toContain('error');
    });
  });

  describe('GitHub Actions Workflow Validation', () => {
    it('should have valid deploy-amplify.yml workflow', async () => {
      const workflowPath = path.join(PROJECT_ROOT, '.github/workflows/deploy-amplify.yml');
      const content = await fs.readFile(workflowPath, 'utf-8');
      
      expect(content).toContain('on:');
      expect(content).toContain('push:');
      expect(content).toContain('branches:');
      expect(content).toContain('- main');
      expect(content).toContain('jobs:');
      expect(content).toContain('deploy:');
      expect(content).toContain('runs-on: ubuntu-latest');
    });

    it('should have valid deploy-amplify-dev.yml workflow', async () => {
      const workflowPath = path.join(PROJECT_ROOT, '.github/workflows/deploy-amplify-dev.yml');
      const content = await fs.readFile(workflowPath, 'utf-8');
      
      expect(content).toContain('dev');
      expect(content).toContain('workflow_dispatch');
    });

    it('should include blog build in CI pipeline', async () => {
      const workflowPath = path.join(PROJECT_ROOT, '.github/workflows/deploy-amplify.yml');
      const content = await fs.readFile(workflowPath, 'utf-8');
      
      expect(content).toContain('npm run build');
      expect(content).toContain('npm run postbuild');
    });

    it('should include Cloudflare Worker deployment', async () => {
      const workflowPath = path.join(PROJECT_ROOT, '.github/workflows/deploy-amplify.yml');
      const content = await fs.readFile(workflowPath, 'utf-8');
      
      expect(content).toContain('wrangler');
      expect(content).toContain('cloudflare-workers/apply-api');
    });
  });

  describe('Environment Configuration', () => {
    it('should have required env vars in .env.example', async () => {
      const envPath = path.join(PROJECT_ROOT, '.env.example');
      const content = await fs.readFile(envPath, 'utf-8');
      
      expect(content).toContain('GITHUB_TOKEN');
      expect(content).toContain('GITHUB_OWNER');
      expect(content).toContain('GITHUB_REPO');
    });

    it('should have Decap CMS configuration', async () => {
      const envPath = path.join(PROJECT_ROOT, '.env.example');
      const content = await fs.readFile(envPath, 'utf-8');
      
      expect(content).toContain('DECAP_GITHUB_CLIENT_ID');
      expect(content).toContain('DECAP_GITHUB_CLIENT_SECRET');
    });
  });

  describe('Cloudflare Worker Configuration', () => {
    it('should have valid wrangler.toml', async () => {
      const tomlPath = path.join(PROJECT_ROOT, 'cloudflare-workers/apply-api/wrangler.toml');
      const content = await fs.readFile(tomlPath, 'utf-8');
      
      expect(content).toContain('name = ');
      expect(content).toContain('main = ');
      expect(content).toContain('compatibility_date');
    });
  });
});
