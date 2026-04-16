import { describe, it, expect } from 'vitest';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../..');

describe('Deployment Smoke Tests', () => {
  it('should create valid production build', async () => {
    await execAsync('npm run clean', { cwd: PROJECT_ROOT });
    
    const { stdout, stderr } = await execAsync('npm run build', {
      cwd: PROJECT_ROOT,
      timeout: 120000,
    });
    
    const distIndexPath = path.join(PROJECT_ROOT, 'dist/index.html');
    const fs = await import('fs/promises');
    const exists = await fs.access(distIndexPath).then(() => true).catch(() => false);
    expect(exists).toBe(true);
  });

  it('should have correct file structure in dist', async () => {
    const fs = await import('fs/promises');
    
    const apiDir = path.join(PROJECT_ROOT, 'dist/api');
    const apiExists = await fs.access(apiDir).then(() => true).catch(() => false);
    expect(apiExists).toBe(true);
    
    const postsDir = path.join(PROJECT_ROOT, 'dist/api/posts');
    const postsExists = await fs.access(postsDir).then(() => true).catch(() => false);
    expect(postsExists).toBe(true);
  });
});
