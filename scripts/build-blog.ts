import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, "../content/blog");
const OUT_DIR = path.join(__dirname, "../dist/api/posts");

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
}

interface Post extends PostMeta {
  body: string;
}

fs.mkdirSync(OUT_DIR, { recursive: true });

if (!fs.existsSync(BLOG_DIR)) {
  fs.writeFileSync(path.join(OUT_DIR, "index.json"), "[]");
  console.log("No blog content directory found, writing empty index");
  process.exit(0);
}

const files = fs.readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
const posts: PostMeta[] = [];

for (const file of files) {
  const slug = file.replace(".md", "");
  const raw = fs.readFileSync(path.join(BLOG_DIR, file), "utf-8");
  try {
    const { data, content: body } = matter(raw);
    if (!data.title || !data.date) {
      console.warn(`Warning: ${file} is missing required frontmatter (title, date) — skipping`);
      continue;
    }
    const isDraft = data.draft === true;
    const post: Post = {
      slug,
      title: String(data.title),
      date: String(data.date),
      description: String(data.description ?? ""),
      body,
    };
    fs.writeFileSync(path.join(OUT_DIR, `${slug}.json`), JSON.stringify(post));
    if (!isDraft) posts.push({ slug: post.slug, title: post.title, date: post.date, description: post.description });
  } catch (err) {
    console.warn(`Warning: failed to parse ${file} — skipping. Error: ${err}`);
  }
}

posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
fs.writeFileSync(path.join(OUT_DIR, "index.json"), JSON.stringify(posts));
console.log(`Blog build complete: ${posts.length} posts written to ${OUT_DIR}`);
