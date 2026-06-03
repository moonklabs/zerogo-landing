import { ImageResponse } from "next/og";
import { getPostBySlug } from "@/lib/posts";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ZEROGO 블로그";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);

  const title = post?.title || "ZEROGO 블로그";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fafafa",
          fontFamily: "system-ui, -apple-system, sans-serif",
          padding: "60px",
          gap: "40px",
        }}
      >
        {/* Left accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: "8px",
            backgroundColor: "#FF5619",
          }}
        />

        {/* Eyebrow */}
        <div
          style={{
            fontSize: "18px",
            fontWeight: "600",
            color: "#FF5619",
            letterSpacing: "0.5px",
          }}
        >
          ZEROGO 블로그
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: "800",
            color: "#1a202c",
            lineHeight: "1.2",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            wordBreak: "break-word",
          }}
        >
          {title}
        </div>
      </div>
    ),
    { ...size }
  );
}
