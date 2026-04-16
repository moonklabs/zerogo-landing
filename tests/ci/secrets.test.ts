import { describe, it, expect } from 'vitest';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.join(__dirname, '../..');

describe('Security Configuration', () => {
  describe('Required Secrets Documentation', () => {
    it('should document all required GitHub secrets', async () => {
      const readmePath = path.join(PROJECT_ROOT, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');
      
      const requiredSecrets = [
        'AWS_ACCESS_KEY_ID',
        'AWS_SECRET_ACCESS_KEY',
        'CLOUDFLARE_API_TOKEN',
        'CLOUDFLARE_ACCOUNT_ID',
        'GITHUB_TOKEN',
      ];
      
      for (const secret of requiredSecrets) {
        expect(content).toContain(secret);
      }
    });

    it('should document GitHub Actions Variables', async () => {
      const readmePath = path.join(PROJECT_ROOT, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');
      
      const requiredVars = [
        'AWS_REGION',
        'AMPLIFY_APP_ID',
        'AMPLIFY_BRANCH',
      ];
      
      for (const variable of requiredVars) {
        expect(content).toContain(variable);
      }
    });
  });

  describe('Content API Security', () => {
    it('should document GITHUB_TOKEN for content operations', async () => {
      const readmePath = path.join(PROJECT_ROOT, 'README.md');
      const content = await fs.readFile(readmePath, 'utf-8');
      
      expect(content).toContain('GITHUB_TOKEN');
    });
  });
});
