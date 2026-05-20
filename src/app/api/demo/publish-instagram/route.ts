import { NextResponse } from "next/server";
import type { InstagramContent, PublishInstagramResponse } from "@/types/news-demo";

export const dynamic = "force-dynamic";

function isValidInstagramContent(
  value: Partial<InstagramContent>
): value is InstagramContent {
  return Boolean(
    value.caption?.trim() &&
      Array.isArray(value.hashtags) &&
      value.callToAction?.trim() &&
      typeof value.altText === "string"
  );
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as Partial<InstagramContent> | null;

  if (!body || !isValidInstagramContent(body)) {
    return NextResponse.json(
      { message: "Completá la publicación antes de simular el envío." },
      { status: 400 }
    );
  }

  const response: PublishInstagramResponse = {
    success: true,
    message: "✅ Publicación enviada a Instagram",
  };

  return NextResponse.json(response);
}
