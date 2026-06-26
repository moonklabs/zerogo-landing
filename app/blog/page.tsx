import type { Metadata } from "next";
import { getAllPosts } from "@/lib/posts";
import { SITE_URL } from "@/lib/site";
import { SiteHeader, BlogFooter } from "@/app/_components/BlogChrome";
import { buildServerLandingAttribution } from "@/lib/activation-attribution";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: "블로그",
    description:
      "쿠팡 로켓그로스 셀러를 위한 재고 관리·품절 방지 실전 가이드와 인사이트",
    alternates: { canonical: "/blog" },
    openGraph: {
      title: "ZEROGO 블로그",
      description:
        "쿠팡 로켓그로스 셀러를 위한 재고 관리·품절 방지 실전 가이드와 인사이트",
      url: "/blog",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: "ZEROGO 블로그",
      description:
        "쿠팡 로켓그로스 셀러를 위한 재고 관리·품절 방지 실전 가이드와 인사이트",
    },
  };
}

export default async function BlogListPage({ searchParams }: PageProps) {
  const posts = getAllPosts();
  const initialAttribution = buildServerLandingAttribution({
    landingPath: "/blog",
    searchParams: await searchParams,
  });

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: posts.map((post, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${SITE_URL}/blog/${post.slug}`,
      name: post.title,
      description: post.description,
      image: `${SITE_URL}/blog/${post.slug}/opengraph-image`,
    })),
  };

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <SiteHeader initialAttribution={initialAttribution} />

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-12 text-4xl font-extrabold tracking-tight text-black sm:text-5xl">
          블로그
        </h1>

        {posts.length === 0 ? (
          <div className="py-20 text-center text-neutral-400">
            게시글이 없습니다.
          </div>
        ) : (
          <div className="grid gap-8">
            {posts.map((post) => (
              <a
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block rounded-3xl border border-neutral-100 bg-white p-6 transition hover:border-neutral-200 hover:shadow-lg sm:p-8"
              >
                <div className="mb-3 text-sm font-medium text-neutral-400">
                  {new Date(post.date).toLocaleDateString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
                <h2 className="mb-3 text-2xl font-bold text-black transition group-hover:text-brand sm:text-3xl">
                  {post.title}
                </h2>
                <p className="text-base leading-relaxed text-black/70 sm:text-lg">
                  {post.description}
                </p>
              </a>
            ))}
          </div>
        )}
      </main>

      <BlogFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListSchema),
        }}
      />
    </div>
  );
}
