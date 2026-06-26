import type { Metadata } from "next";
import HomeClient from "@/app/_components/HomeClient";
import { buildServerLandingAttribution } from "@/lib/activation-attribution";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function Home({ searchParams }: PageProps) {
  const initialAttribution = buildServerLandingAttribution({
    landingPath: "/",
    searchParams: await searchParams,
  });
  return <HomeClient initialAttribution={initialAttribution} />;
}
