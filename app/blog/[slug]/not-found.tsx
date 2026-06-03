import Link from "next/link";
import { SiteHeader, BlogFooter } from "@/app/_components/BlogChrome";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white font-sans text-neutral-900">
      <SiteHeader />

      <main className="flex flex-1 flex-col items-center justify-center px-4 py-32 sm:px-6 lg:px-8">
        <h1 className="mb-4 text-2xl font-bold">게시글을 찾을 수 없습니다.</h1>
        <Link href="/blog" className="text-brand hover:underline">
          블로그 목록으로 돌아가기
        </Link>
      </main>

      <BlogFooter />
    </div>
  );
}
