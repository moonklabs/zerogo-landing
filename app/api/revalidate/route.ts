import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// 실험 발행/롤백 훅 — zerogo-backend가 변형을 발행하면 여기로 POST해서
// 해당 utm_content 태그 캐시를 즉시 무효화한다(빌드/배포 없이 ~1초 반영).
// 시크릿 헤더로 보호: X-Revalidate-Secret == LANDING_REVALIDATE_SECRET.
export async function POST(request: Request) {
  const secret = process.env.LANDING_REVALIDATE_SECRET;
  if (!secret || request.headers.get("x-revalidate-secret") !== secret) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as {
    utm_contents?: unknown;
  } | null;
  const utmContents = Array.isArray(body?.utm_contents)
    ? body.utm_contents.filter(
        (utm): utm is string => typeof utm === "string" && utm.length > 0
      )
    : [];
  if (utmContents.length === 0) {
    return NextResponse.json(
      { error: "utm_contents_required" },
      { status: 400 }
    );
  }

  for (const utm of utmContents) {
    revalidateTag(`variant:${utm}`);
  }
  return NextResponse.json({ revalidated: true, count: utmContents.length });
}
