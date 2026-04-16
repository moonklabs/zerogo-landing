import { test, expect } from '@playwright/test';

test.describe('Blog Frontend', () => {
  test('should display blog list page', async ({ page }) => {
    await page.goto('/blog');
    
    await expect(page).toHaveTitle(/ZEROGO|ZeroGo|Blog/i);
    
    const posts = page.locator('[data-testid="blog-post"], .blog-post, article');
  });

  test('should navigate to individual post', async ({ page }) => {
    const apiResponse = await page.request.post('http://127.0.0.1:3001/api/posts', {
      data: {
        title: 'Frontend Test Post',
        body: '# Test\n\nContent for frontend test',
      },
    });
    
    if (apiResponse.ok()) {
      const { slug } = await apiResponse.json();
      
      await page.goto(`/blog/${slug}`);
      
      await expect(page.locator('h1, h2').first()).toContainText('Test');
    }
  });
});
