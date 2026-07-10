import { expect, test } from "@playwright/test";

test("keeps the default hero and attribution contract", async ({ page }) => {
  await page.goto("/");
  const hero = page.locator('[data-slot="hero"]');
  const badge = hero.locator('[data-slot="badge"]');
  const headline = hero.locator('[data-slot="headline"]');
  await expect(badge).toHaveText("로켓그로스 품절 방지");
  await expect(headline).toContainText("여러 계정 판매로");
  expect((await badge.boundingBox())?.y).toBeLessThan((await headline.boundingBox())?.y ?? 0);
  await expect(hero.locator('[data-slot="media"] video source[src="/zerogo_demo.mp4"]')).toHaveCount(1);
  const cta = hero.locator('[data-slot="cta"]');
  await expect(cta).toHaveAttribute("href", /landing_cta_id=home_hero_primary/);
  await hero.screenshot({ path: ".omx/artifacts/public-hero-default.png", animations: "disabled" });
});

test("does not autoplay the hero video when reduced motion is requested", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator('[data-slot="hero"] [data-slot="media"] video')).not.toHaveAttribute("autoplay", "");
});

test("provides a secure scrollable live preview without navigation side effects", async ({ page, request }) => {
  await page.addInitScript(() => {
    const original = URL.revokeObjectURL.bind(URL);
    Object.defineProperty(window, "__revokedPreviewURLs", { value: [], writable: true });
    URL.revokeObjectURL = (url: string) => {
      (window as Window & { __revokedPreviewURLs?: string[] }).__revokedPreviewURLs?.push(url);
      original(url);
    };
  });
  const nonce = "1234567890abcdef";
  const parentOrigin = new URL(test.info().project.use.baseURL as string).origin;
  const previewURL = `/preview?nonce=${nonce}&origin=${encodeURIComponent(parentOrigin)}`;
  const previewResponse = await request.get(previewURL);
  expect(previewResponse.status()).toBe(200);
  expect(previewResponse.headers()["content-security-policy"]).toContain("frame-ancestors");
  expect(previewResponse.headers()["x-frame-options"]).toBeUndefined();
  const homeResponse = await request.get("/");
  expect(homeResponse.headers()["x-frame-options"]).toBe("SAMEORIGIN");

  await page.goto("/");
  await page.setContent(`<!doctype html><html><body style="margin:0">
    <script>
      window.__heroPreviewTest = { ready: false, applied: 0 };
      addEventListener('message', (event) => {
        if (event.origin !== ${JSON.stringify(parentOrigin)}) return;
        if (event.data?.type === 'hero.preview.ready' && event.data?.nonce === ${JSON.stringify(nonce)}) window.__heroPreviewTest.ready = true;
        if (event.data?.type === 'hero.preview.applied' && event.data?.nonce === ${JSON.stringify(nonce)}) window.__heroPreviewTest.applied = event.data.payload.revision;
      });
    </script>
    <iframe title="테스트 실시간 랜딩 미리보기" src="${previewURL}" style="width:1280px;height:700px;border:0"></iframe>
  </body></html>`);
  await expect.poll(() => page.evaluate(() => Boolean((window as Window & { __heroPreviewTest?: { ready: boolean } }).__heroPreviewTest?.ready))).toBe(true);

  await page.evaluate(({ nonce, parentOrigin }) => {
    const iframe = document.querySelector("iframe")!;
    const file = new File([new Uint8Array([137, 80, 78, 71])], "hero.png", { type: "image/png" });
    iframe.contentWindow!.postMessage({ protocolVersion: 1, nonce, type: "hero.preview.file", payload: { id: "local-preview-1", file } }, parentOrigin);
    iframe.contentWindow!.postMessage({
      protocolVersion: 1,
      nonce,
      type: "hero.preview.update",
      revision: 1,
      payload: {
        badge: "실시간 배지",
        headline: "실시간 첫 줄\n실시간 둘째 줄",
        subheadline: "실시간 설명",
        ctaText: "미리보기 CTA",
        media: { source: "local", kind: "image", id: "local-preview-1", alt: "즉시 업로드 이미지" },
      },
    }, parentOrigin);
  }, { nonce, parentOrigin });
  await expect.poll(() => page.evaluate(() => (window as Window & { __heroPreviewTest?: { applied: number } }).__heroPreviewTest?.applied)).toBe(1);
  const preview = page.frameLocator('iframe[title="테스트 실시간 랜딩 미리보기"]');
  await expect(preview.locator('[data-slot="badge"]')).toHaveText("실시간 배지");
  await expect(preview.locator('[data-slot="headline"]')).toContainText("실시간 둘째 줄");
  await expect(preview.locator('[data-slot="media"] img')).toHaveAttribute("src", /^blob:/);
  const localURL = await preview.locator('[data-slot="media"] img').getAttribute("src");

  const frame = page.frames().find((candidate) => candidate.url().includes("/preview?"));
  if (!frame) throw new Error("preview frame missing");
  await frame.evaluate(() => window.scrollTo(0, 900));
  const scrollBefore = await frame.evaluate(() => window.scrollY);
  const frameURL = frame.url();
  await page.evaluate(({ nonce, parentOrigin }) => {
    const iframe = document.querySelector("iframe")!;
    iframe.contentWindow!.postMessage({
      protocolVersion: 1,
      nonce,
      type: "hero.preview.update",
      revision: 2,
      payload: {
        badge: "변경 배지",
        headline: "스크롤 위치\n그대로 유지",
        subheadline: "변경 설명",
        ctaText: "이동 금지",
        media: { source: "local", kind: "image", id: "local-preview-1", alt: "즉시 업로드 이미지" },
      },
    }, parentOrigin);
  }, { nonce, parentOrigin });
  await expect.poll(() => page.evaluate(() => (window as Window & { __heroPreviewTest?: { applied: number } }).__heroPreviewTest?.applied)).toBe(2);
  expect(frame.url()).toBe(frameURL);
  expect(await frame.evaluate(() => window.scrollY)).toBe(scrollBefore);

  await page.evaluate(({ nonce, parentOrigin }) => {
    const iframe = document.querySelector("iframe")!;
    iframe.contentWindow!.postMessage({
      protocolVersion: 1,
      nonce,
      type: "hero.preview.update",
      revision: 3,
      payload: {
        badge: "기본 미디어",
        headline: "blob 정리",
        subheadline: "전환",
        ctaText: "이동 금지",
        media: { source: "default", alt: "기본 미디어" },
      },
    }, parentOrigin);
  }, { nonce, parentOrigin });
  await expect.poll(() => page.evaluate(() => (window as Window & { __heroPreviewTest?: { applied: number } }).__heroPreviewTest?.applied)).toBe(3);
  expect(await frame.evaluate(() => (window as Window & { __revokedPreviewURLs?: string[] }).__revokedPreviewURLs ?? [])).toContain(localURL);

  const frameURLBeforeClick = frame.url();
  await preview.locator('[data-slot="cta"]').click();
  expect(frame.url()).toBe(frameURLBeforeClick);
});
