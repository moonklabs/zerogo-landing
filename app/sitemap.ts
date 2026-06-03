import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  // Use the newest post date for site/blog lastModified so crawlers only see a
  // change when content actually changes (posts are sorted newest-first).
  const latestContentDate =
    posts.length > 0 ? new Date(posts[0].date) : new Date();

  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${SITE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    {
      url: SITE_URL,
      lastModified: latestContentDate,
      changeFrequency: "weekly" as const,
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/blog`,
      lastModified: latestContentDate,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
    ...postEntries,
  ];
}
