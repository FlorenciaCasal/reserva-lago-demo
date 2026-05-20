import type {
  GenerateInstagramPayload,
  GeneratedNews,
  InstagramContent,
  NewsDemoInput,
  PublishInstagramResponse,
} from "@/types/news-demo";

async function parseJson<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : typeof data?.message === "string"
          ? data.message
          : `Error ${res.status} al procesar la demo`;
    throw new Error(message);
  }

  return data as T;
}

export async function generateNews(input: NewsDemoInput): Promise<GeneratedNews> {
  const res = await fetch("/api/demo/generate-news", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });

  return parseJson<GeneratedNews>(res);
}

export async function generateInstagram(
  payload: GenerateInstagramPayload
): Promise<InstagramContent> {
  const res = await fetch("/api/demo/generate-instagram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return parseJson<InstagramContent>(res);
}

export async function publishInstagram(
  content: InstagramContent
): Promise<PublishInstagramResponse> {
  const res = await fetch("/api/demo/publish-instagram", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(content),
  });

  return parseJson<PublishInstagramResponse>(res);
}
