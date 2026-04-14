import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const LOGO_URL = "https://cdn.prod.website-files.com/6523c202a6a9763a268a7a7d/69d8eb3622c77fc93875d989_logo-zerogo-black.png";

interface Post {
  slug: string;
  title: string;
  date: string;
  description: string;
}

export default function BlogList() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <header className="sticky top-0 z-50 border-b border-neutral-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-1 items-center">
            <Link to="/" className="shrink-0">
              <img src={LOGO_URL} alt="Zerogo" className="h-6 w-auto sm:h-7 lg:h-8" referrerPolicy="no-referrer" />
            </Link>
          </div>
          <nav className="hidden flex-1 items-center justify-center gap-8 text-sm font-medium text-black md:flex">
            <Link to="/" className="transition hover:opacity-70">홈</Link>
            <Link to="/blog" className="transition hover:opacity-70 font-bold">블로그</Link>
          </nav>
          <div className="flex flex-1 items-center justify-end gap-4">
            <Link to="/#cta" className="rounded-full bg-brand px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90">
              사전 신청하기
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="mb-12 text-4xl font-extrabold tracking-tight text-black sm:text-5xl">블로그</h1>
        
        {loading ? (
          <div className="py-20 text-center text-neutral-400">로딩 중...</div>
        ) : posts.length === 0 ? (
          <div className="py-20 text-center text-neutral-400">게시글이 없습니다.</div>
        ) : (
          <div className="grid gap-8">
            {posts.map((post) => (
              <Link 
                key={post.slug} 
                to={`/blog/${post.slug}`}
                className="group block rounded-3xl border border-neutral-100 bg-white p-6 transition hover:border-neutral-200 hover:shadow-lg sm:p-8"
              >
                <div className="mb-3 text-sm font-medium text-neutral-400">
                  {new Date(post.date).toLocaleDateString('ko-KR')}
                </div>
                <h2 className="mb-3 text-2xl font-bold text-black transition group-hover:text-brand sm:text-3xl">
                  {post.title}
                </h2>
                <p className="text-base leading-relaxed text-black/70 sm:text-lg">
                  {post.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>

      <footer className="border-t border-neutral-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-black/50">
          @ Moongclelabs Co., Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
