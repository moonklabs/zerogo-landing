# Testing Guide

This document describes the testing strategy for the Content API and how to run tests.

## Test Categories

### 1. Unit Tests

Tests individual functions and modules in isolation.

**Location:** `src/__tests__/`

**Run:** `npm test`

**What they test:**
- `content.test.ts` - Markdown file operations (read, write, delete, slug generation)
- `github-client.test.ts` - GitHub API interactions (mocked)
- `build-trigger.test.ts` - Build process triggering

### 2. Integration Tests

Tests API routes with a test content directory.

**Location:** `src/__tests__/api.integration.test.ts`

**Run:** `npm test`

**What they test:**
- Full request/response cycle for all CRUD endpoints
- File system operations
- Error handling

### 3. E2E Tests

Tests the full user flow with a running dev server.

**Location:** `tests/content-api.spec.ts`

**Run:** `npm run test:e2e`

**Prerequisites:**
- Dev server must be running (`npm run dev`)
- Playwright browsers installed (`npx playwright install`)

**What they test:**
- Create → Read → Update → Delete lifecycle
- Error cases
- API response formats

### 4. CI/CD Tests

Tests the deployment pipeline and configuration.

**Location:** `tests/ci/`

**Run:** `npm test` (includes CI tests)

**What they test:**
- GitHub Actions workflow validity
- Build process
- Environment configuration

## Running Tests

### All Tests
```bash
npm test
```

### Unit + Integration Only
```bash
npm run test:unit
```

### E2E Only
```bash
npm run test:e2e
```

### With Coverage
```bash
npm run coverage
```

### CI Mode (no watch, junit output)
```bash
npm run test:ci
```

## Test Fixtures

Test files use temporary directories that are cleaned up after each test. Fixtures are located in:
- `src/__tests__/__fixtures__/` - Unit test fixtures
- `tests/__fixtures__/` - E2E test fixtures

## Writing Tests

### Unit Test Example

```typescript
import { describe, it, expect } from 'vitest';
import { slugify } from '../lib/content.js';

describe('slugify()', () => {
  it('converts title to lowercase slug', () => {
    expect(slugify('Hello World')).toBe('hello-world');
  });
});
```

### Integration Test Example

```typescript
import request from 'supertest';
import { createApp } from '../lib/create-app.js';

const app = createApp({ contentDir: '/tmp/test-blog' });

request(app)
  .post('/api/posts')
  .send({ title: 'Test', body: 'Content' })
  .expect(201)
  .then(res => {
    expect(res.body.success).toBe(true);
  });
```

### E2E Test Example

```typescript
import { test, expect } from '@playwright/test';

test('should create and retrieve a post', async ({ request }) => {
  const createRes = await request.post('/api/posts', {
    data: { title: 'Test', body: 'Content' }
  });
  
  const { slug } = await createRes.json();
  
  const getRes = await request.get(`/api/posts/${slug}`);
  expect(getRes.ok()).toBe(true);
});
```

## Test Data Cleanup

Tests automatically clean up temporary files and directories. For E2E tests, test posts are tracked and deleted in `afterAll`.

## Debugging Tests

### Run single test file
```bash
npm test -- src/__tests__/content.test.ts
```

### Run with UI
```bash
npm run test:ui
```

### Run single test
```bash
npm test -- --grep "should create a new post"
```

## Continuous Integration

In CI, tests run in this order:
1. `npm run lint` - TypeScript type checking
2. `npm test` - Unit + Integration tests
3. `npm run test:e2e` - E2E tests (requires dev server)

GitHub Actions runs all tests before deployment.

## Mock Strategy

- **GitHub API**: Mocked with `vi.mock()` in unit tests
- **File System**: Uses temporary directories in tests
- **External Services**: All external calls are mocked

## CI Test Results

Test results are published to:
- Console output (all runs)
- JUnit XML (`junit.xml`) - CI mode
- HTML coverage report (`coverage/`)
- Playwright HTML report (`playwright-report/`)
```