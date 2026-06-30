import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const root = join(__dirname, "../..");

describe("landing channel talk integration", () => {
  it("mounts the anonymous channel talk provider from the root layout", async () => {
    const source = await readFile(join(root, "app/layout.tsx"), "utf8");

    expect(source).toContain("ChannelTalkProvider");
    expect(source).toContain("<ChannelTalkProvider />");
  });

  it("boots anonymously and tracks SPA page views only when a plugin key exists", async () => {
    const source = await readFile(
      join(root, "app/_components/ChannelTalkProvider.tsx"),
      "utf8"
    );

    expect(source).toContain("NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY");
    expect(source).toContain("boot({");
    expect(source).toContain("trackDefaultEvent: false");
    expect(source).toContain("setPage(pathname)");
    expect(source).toContain('track("PageView")');
    expect(source).not.toContain("memberId");
    expect(source).not.toContain("memberHash");
  });

  it("documents the public plugin key environment variable", async () => {
    const source = await readFile(join(root, ".env.example"), "utf8");

    expect(source).toContain("NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY=");
  });
});
