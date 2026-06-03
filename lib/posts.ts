import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const BLOG_DIR = path.join(process.cwd(), "content/blog");

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
  draft?: boolean;
}

export interface Post extends PostMeta {
  body: string;
}

function readMarkdownFiles(): string[] {
  if (!fs.existsSync(BLOG_DIR)) return [];
  return fs.readdirSync(BLOG_DIR).filter((file) => file.endsWith(".md"));
}

/**
 * Normalize a frontmatter date to an ISO 8601 string. gray-matter parses an
 * unquoted YAML date (e.g. `date: 2026-04-13T12:00:00.000Z`) into a JS Date,
 * while a quoted value stays a string. Both must serialize to ISO so that
 * JSON-LD `datePublished`, OG `article:published_time`, and sitemaps are valid.
 */
function toISODate(value: unknown): string {
  if (value instanceof Date) return value.toISOString();
  const parsed = new Date(String(value));
  if (Number.isNaN(parsed.getTime())) {
    console.error(`Invalid date in blog frontmatter: ${String(value)}`);
    return String(value);
  }
  return parsed.toISOString();
}

function parseFile(file: string): Post | null {
  const slug = file.replace(/\.md$/, "");
  try {
    const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
    const { data, content } = matter(raw);
    if (!data.title || !data.date) return null;
    return {
      slug,
      title: String(data.title),
      date: toISODate(data.date),
      description: String(data.description ?? ""),
      draft: data.draft === true,
      body: content,
    };
  } catch {
    return null;
  }
}

/** Published posts (drafts excluded), newest first. Used by /blog and sitemap. */
export function getAllPosts(): PostMeta[] {
  return readMarkdownFiles()
    .map(parseFile)
    .filter((post): post is Post => post !== null && !post.draft)
    .map(({ body: _body, ...meta }) => meta)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

/** Single post by slug. Returns drafts too so a direct link still resolves. */
export function getPostBySlug(slug: string): Post | null {
  // Defensive: only the slug characters Decap generates — no path traversal.
  if (!/^[a-z0-9-]+$/i.test(slug)) return null;
  const file = `${slug}.md`;
  if (!fs.existsSync(path.join(BLOG_DIR, file))) return null;
  return parseFile(file);
}

/** Slugs of published posts — for generateStaticParams / sitemap. */
export function getAllSlugs(): string[] {
  return getAllPosts().map((post) => post.slug);
}
