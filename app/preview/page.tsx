import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HeroPreviewClient from "@/app/preview/HeroPreviewClient";
import { allowedPreviewParentOrigin } from "@/lib/hero-preview-parent-origin";
import { isPreviewNonce } from "@/lib/hero-preview-protocol";

export const metadata: Metadata = {
  title: "ZEROGO 랜딩 미리보기",
  robots: { index: false, follow: false, noarchive: true },
};

type PreviewPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PreviewPage({ searchParams }: PreviewPageProps) {
  const query = await searchParams;
  const nonce = typeof query.nonce === "string" ? query.nonce : undefined;
  const parentOrigin = allowedPreviewParentOrigin(typeof query.origin === "string" ? query.origin : undefined);
  if (!isPreviewNonce(nonce) || !parentOrigin) notFound();
  return <HeroPreviewClient nonce={nonce} parentOrigin={parentOrigin} />;
}
