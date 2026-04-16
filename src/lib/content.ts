import matter from 'gray-matter';
import fs from 'fs/promises';
import path from 'path';

export interface PostInput {
  title: string;
  description?: string;
  body: string;
  date?: string;
  slug?: string;
}

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
}

export interface Post extends PostMeta {
  body: string;
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateSlug(date: Date, title: string): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const slug = slugify(title);
  return `${y}-${m}-${d}-${slug}`;
}

export async function readPost(filePath: string): Promise<Post> {
  const raw = await fs.readFile(filePath, 'utf-8');
  const { data, content: body } = matter(raw);
  const slug = path.basename(filePath, '.md');
  return {
    slug,
    title: String(data.title || ''),
    date: String(data.date || ''),
    description: String(data.description || ''),
    body,
  };
}

export async function writePost(
  dirPath: string,
  slug: string,
  input: PostInput
): Promise<string> {
  const date = input.date ? new Date(input.date) : new Date();
  const finalSlug = slug || input.slug || generateSlug(date, input.title);
  
  const frontmatter = {
    title: input.title,
    date: date.toISOString(),
    description: input.description || '',
  };
  
  const mdContent = matter.stringify(input.body, frontmatter);
  const filePath = path.join(dirPath, `${finalSlug}.md`);
  await fs.writeFile(filePath, mdContent, 'utf-8');
  
  return finalSlug;
}

export async function deletePost(dirPath: string, slug: string): Promise<void> {
  const filePath = path.join(dirPath, `${slug}.md`);
  await fs.unlink(filePath);
}

export async function listPosts(dirPath: string): Promise<PostMeta[]> {
  try {
    const files = await fs.readdir(dirPath);
    const posts: PostMeta[] = [];
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue;
      
      try {
        const post = await readPost(path.join(dirPath, file));
        posts.push({
          slug: post.slug,
          title: post.title,
          date: post.date,
          description: post.description,
        });
      } catch {
      }
    }
    
    return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  } catch {
    return [];
  }
}
