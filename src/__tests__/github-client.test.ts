import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GitHubConfig, getFileSha, upsertFile, deleteFile } from '../lib/github-client.js';

global.fetch = vi.fn();

describe('github-client.ts', () => {
  const mockConfig: GitHubConfig = {
    owner: 'test-owner',
    repo: 'test-repo',
    branch: 'main',
    token: 'test-token',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getFileSha()', () => {
    it('returns sha for existing file', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ sha: 'abc123' }),
      } as Response);
      
      const sha = await getFileSha(mockConfig, 'content/blog/test.md');
      expect(sha).toBe('abc123');
      expect(fetch).toHaveBeenCalledWith(
        'https://api.github.com/repos/test-owner/test-repo/contents/content/blog/test.md?ref=main',
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: 'Bearer test-token',
          }),
        })
      );
    });

    it('returns null for non-existent file', async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);
      
      const sha = await getFileSha(mockConfig, 'nonexistent.md');
      expect(sha).toBeNull();
    });
  });

  describe('upsertFile()', () => {
    it('creates new file without sha', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ sha: null }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ content: {} }),
        } as Response);
      
      const result = await upsertFile(
        mockConfig,
        'content/blog/new.md',
        '# New Post',
        'Add new post'
      );
      
      expect(result.success).toBe(true);
      expect(result.sha).toBeNull();
    });

    it('updates existing file with sha', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ sha: 'existing-sha' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ content: {} }),
        } as Response);
      
      const result = await upsertFile(
        mockConfig,
        'content/blog/existing.md',
        '# Updated Post',
        'Update post'
      );
      
      expect(result.success).toBe(true);
      expect(result.sha).toBe('existing-sha');
    });
  });

  describe('deleteFile()', () => {
    it('deletes existing file', async () => {
      vi.mocked(fetch)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ sha: 'file-sha' }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
        } as Response);
      
      const result = await deleteFile(mockConfig, 'content/blog/delete.md', 'Delete post');
      expect(result.success).toBe(true);
    });

    it('returns false for non-existent file', async () => {
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ sha: null }),
      } as Response);
      
      const result = await deleteFile(mockConfig, 'nonexistent.md', 'Delete');
      expect(result.success).toBe(false);
    });
  });
});
