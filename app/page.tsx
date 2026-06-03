import type { Metadata } from "next";
import HomeClient from "@/app/_components/HomeClient";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default function Home() {
  return <HomeClient />;
}
