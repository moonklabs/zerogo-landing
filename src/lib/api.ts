/// <reference types="vite/client" />

const IS_DEV = import.meta.env.DEV;

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  description: string;
}

export interface Post extends PostMeta {
  body: string;
}

export async function fetchPosts(): Promise<PostMeta[]> {
  const url = IS_DEV ? "/api/posts" : "/api/posts/index.json";
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.status}`);
  return res.json();
}

export async function fetchPost(slug: string): Promise<Post> {
  const url = IS_DEV ? `/api/posts/${slug}` : `/api/posts/${slug}.json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Post not found: ${res.status}`);
  return res.json();
}
