# Content API Documentation

External AI agents can use this API to create, update, and delete blog posts on the Zerogo platform.

## Overview

The Content API allows external services (like AI writing agents) to submit blog content programmatically. Content is stored as Markdown files in the `content/blog/` directory and automatically synced to GitHub for Decap CMS compatibility.

## Base URL

```
Development: http://localhost:3001
Production: https://zerogo.ai (static export, write operations not available)
```

## Authentication

For write operations, a GitHub Personal Access Token is required:

```bash
GITHUB_TOKEN=ghp_your_token_here
GITHUB_OWNER=moonklabs
GITHUB_REPO=zerogo-landing
GITHUB_BRANCH=dev  # or 'main'
```

## Endpoints

### Create Post

**POST** `/api/posts`

Creates a new blog post from Markdown content.

**Request Body:**
```json
{
  "title": "Post Title (required)",
  "description": "SEO description (optional)",
  "body": "# Markdown Content (required)",
  "date": "2026-04-16T12:00:00Z",  // ISO 8601, optional
  "slug": "custom-url-slug"  // optional, auto-generated if not provided
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "slug": "2026-04-16-post-title"
}
```

**Example:**
```bash
curl -X POST http://localhost:3001/api/posts \
  -H "Content-Type: application/json" \
  -d '{
    "title": "AI Generated Post",
    "description": "How AI helps e-commerce",
    "body": "# AI in E-commerce\n\nAI is transforming...",
    "slug": "ai-ecommerce-2026"
  }'
```

---

### Get All Posts

**GET** `/api/posts`

Returns a list of all blog posts, sorted by date (newest first).

**Response:**
```json
[
  {
    "slug": "2026-04-16-post-title",
    "title": "Post Title",
    "date": "2026-04-16T12:00:00Z",
    "description": "SEO description"
  }
]
```

---

### Get Single Post

**GET** `/api/posts/:slug`

Returns the full content of a specific post.

**Response:**
```json
{
  "slug": "2026-04-16-post-title",
  "title": "Post Title",
  "date": "2026-04-16T12:00:00Z",
  "description": "SEO description",
  "body": "# Markdown content here..."
}
```

---

### Update Post

**PUT** `/api/posts/:slug`

Updates an existing blog post.

**Request Body:**
```json
{
  "title": "Updated Title (optional)",
  "description": "Updated description (optional)",
  "body": "# Updated content (optional)"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "slug": "2026-04-16-post-title"
}
```

---

### Delete Post

**DELETE** `/api/posts/:slug`

Deletes a blog post.

**Response (200 OK):**
```json
{
  "success": true,
  "slug": "2026-04-16-post-title"
}
```

---

## AI Agent Integration Example

### Claude Integration

```javascript
// Claude agent code to create a blog post
const postContent = await claudia.generateBlogPost({
  topic: "ZeroGo AI Agent Features",
  audience: "E-commerce sellers",
  tone: "professional but friendly"
});

const response = await fetch('http://localhost:3001/api/posts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    title: postContent.title,
    description: postContent.excerpt,
    body: postContent.markdown,
    date: new Date().toISOString()
  })
});

const { slug } = await response.json();
console.log(`Post published: ${slug}`);
```

### External AI Service Integration

```javascript
// Any AI writing service can POST to this endpoint
async function publishAIGeneratedContent(content) {
  const response = await fetch('https://zerogo.ai/api/posts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer YOUR_GITHUB_TOKEN'  // For production auth
    },
    body: JSON.stringify(content)
  });
  
  if (!response.ok) {
    throw new Error(`Failed to publish: ${response.statusText}`);
  }
  
  return response.json();
}
```

## Content Format

All blog posts are stored as Markdown files with YAML frontmatter:

```markdown
---
title: "Post Title"
date: 2026-04-16T12:00:00Z
description: "SEO description"
---

# Markdown Content

Your content here...
```

## Decap CMS Compatibility

Posts created via the API are immediately visible in the Decap CMS admin panel at `/admin`. The CMS uses GitHub as its backend, so any post created via the API will appear in the CMS editor.

## Error Handling

All errors return a JSON response with an `error` field:

```json
{
  "error": "Error message description"
}
```

Common status codes:
- `400` - Invalid request (missing required fields)
- `404` - Post not found (for GET/PUT/DELETE)
- `500` - Server error (file system or GitHub API issues)

## Build Pipeline

When content is created, updated, or deleted:
1. The change is saved to `content/blog/*.md`
2. A build trigger initiates `scripts/build-blog.ts`
3. Static JSON files are generated in `dist/api/posts/`
4. If GitHub token is configured, changes are committed to GitHub

## Rate Limits

There are no strict rate limits for the Content API, but be reasonable. The build process runs asynchronously and may queue if multiple requests come in quickly.

## Support

For issues or questions about the Content API, contact the Zerogo development team.