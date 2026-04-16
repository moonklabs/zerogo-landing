import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { fetchPost, type Post } from "../lib/api";

const LOGO_URL = "https://cdn.prod.website-files.com/6523c202a6a9763a268a7a7d/69d8eb3622c77fc93875d989_logo-zerogo-black.png";

export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetchPost(slug)
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-neutral-400">로딩 중...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-white">
        <h1 className="mb-4 text-2xl font-bold">게시글을 찾을 수 없습니다.</h1>
        <Link to="/blog" className="text-brand hover:underline">블로그 목록으로 돌아가기</Link>
      </div>
    );
  }

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

      <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        <Link to="/blog" className="mb-8 inline-flex items-center text-sm font-medium text-neutral-400 hover:text-black">
          ← 블로그 목록으로
        </Link>
        
        <article>
          <header className="mb-12">
            <div className="mb-4 text-sm font-medium text-neutral-400">
              {new Date(post.date).toLocaleDateString('ko-KR')}
            </div>
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-black sm:text-5xl lg:text-6xl leading-tight">
              {post.title}
            </h1>
            <p className="text-xl leading-relaxed text-black/60">
              {post.description}
            </p>
          </header>

          <div className="prose prose-neutral max-w-none prose-headings:text-black prose-p:text-black/80 prose-a:text-brand prose-strong:text-black">
            <ReactMarkdown>{post.body}</ReactMarkdown>
          </div>
        </article>
      </main>

      <footer className="border-t border-neutral-100 bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-xs text-black/50">
          @ Moongclelabs Co., Ltd. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
