import { NextResponse } from "next/server";
import type {
  GeneratedNews,
  GenerateInstagramPayload,
  InstagramContent,
  NewsDemoImage,
} from "@/types/news-demo";

export const dynamic = "force-dynamic";

const DEFAULT_MODEL = "gpt-4.1-mini";

const instagramSchema = {
  type: "object",
  additionalProperties: false,
  required: ["caption", "hashtags", "callToAction", "altText"],
  properties: {
    caption: { type: "string" },
    hashtags: {
      type: "array",
      items: { type: "string" },
    },
    callToAction: { type: "string" },
    altText: { type: "string" },
  },
};

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function imageContext(images: NewsDemoImage[]) {
  if (images.length === 0) {
    return "No hay imagenes seleccionadas para Instagram.";
  }

  return images
    .map(
      (image, index) =>
        `${index + 1}. Archivo: ${image.fileName || "imagen seleccionada"}\nAlt text actual: ${image.altText || "Imagen seleccionada para la novedad"}`
    )
    .join("\n\n");
}

function generateDemoInstagram(news: GeneratedNews, images: NewsDemoImage[]): InstagramContent {
  const firstImage = images[0];
  const visualLine = firstImage?.description
    ? `La imagen acompana esta novedad mostrando ${firstImage.description.toLowerCase()}.`
    : "Una invitacion a recorrer, observar y cuidar el entorno con una mirada mas atenta.";

  return {
    caption: `${news.titulo}\n\n${news.resumen}\n\n${visualLine}`,
    hashtags: [
      "#LagoEscondido",
      "#EducacionAmbiental",
      "#VisitaResponsable",
      "#ReservaNatural",
    ],
    callToAction: "Conoce mas y planifica tu visita.",
    altText:
      firstImage?.altText ||
      firstImage?.description ||
      "Imagen representativa de una reserva natural vinculada a visita responsable y educacion ambiental.",
  };
}

function getTextFromResponse(data: unknown): string | null {
  const maybe = data as { output_text?: unknown; output?: unknown };
  if (typeof maybe.output_text === "string") return maybe.output_text;

  if (!Array.isArray(maybe.output)) return null;

  for (const item of maybe.output) {
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;

    for (const part of content) {
      const text = (part as { text?: unknown }).text;
      if (typeof text === "string") return text;
    }
  }

  return null;
}

function getOpenAiError(data: unknown) {
  return (
    (data as { error?: { message?: string } } | null)?.error?.message ||
    "OpenAI no pudo generar la publicacion para Instagram."
  );
}

function extractJson(text: string) {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]?.trim();
  if (fenced) return fenced;

  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start >= 0 && end > start) return trimmed.slice(start, end + 1);

  return trimmed;
}

function isValidNews(value: Partial<GeneratedNews>): value is GeneratedNews {
  return Boolean(
    value.titulo?.trim() &&
      value.resumen?.trim() &&
      value.contenido?.trim() &&
      value.slug?.trim()
  );
}

function isNewsDemoImage(value: Partial<NewsDemoImage>): value is NewsDemoImage {
  return Boolean(
    value.id &&
      value.url?.trim() &&
      typeof value.description === "string" &&
      typeof value.altText === "string" &&
      (typeof value.fileName === "undefined" || typeof value.fileName === "string") &&
      typeof value.useInWeb === "boolean" &&
      typeof value.useInInstagram === "boolean"
  );
}

function normalizePayload(value: unknown): GenerateInstagramPayload | null {
  const maybe = value as Partial<GenerateInstagramPayload> & Partial<GeneratedNews>;

  if (maybe.news && isValidNews(maybe.news)) {
    const images = Array.isArray(maybe.images)
      ? maybe.images.filter((image): image is NewsDemoImage => isNewsDemoImage(image))
      : [];

    return {
      news: maybe.news,
      images: images.filter((image) => image.useInInstagram),
    };
  }

  if (isValidNews(maybe)) {
    return { news: maybe, images: [] };
  }

  return null;
}

function isInstagramContent(value: Partial<InstagramContent>): value is InstagramContent {
  return Boolean(
    value.caption?.trim() &&
      Array.isArray(value.hashtags) &&
      value.hashtags.length >= 3 &&
      value.hashtags.length <= 5 &&
      value.callToAction?.trim() &&
      typeof value.altText === "string"
  );
}

async function callOpenAi(prompt: string, apiKey: string, model: string, structured: boolean) {
  const body: Record<string, unknown> = {
    model,
    input: prompt,
  };

  if (structured) {
    body.text = {
      format: {
        type: "json_schema",
        name: "instagram_post",
        strict: true,
        schema: instagramSchema,
      },
    };
  }

  return fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function parseOpenAiResponse(response: Response) {
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(getOpenAiError(data));
  }

  const text = getTextFromResponse(data);
  if (!text) throw new Error("OpenAI respondio sin texto utilizable.");

  const parsed = JSON.parse(extractJson(text)) as Partial<InstagramContent>;
  if (!isInstagramContent(parsed)) {
    throw new Error("OpenAI devolvio JSON incompleto para Instagram.");
  }

  return parsed;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
    const demoFallbackEnabled = process.env.DEMO_AI_FALLBACK === "true";
    const payload = normalizePayload(await req.json().catch(() => null));

    if (!payload) {
      return jsonError("Primero genera o completa una novedad valida.", 400);
    }

    if (!apiKey) {
      if (demoFallbackEnabled) {
        console.warn("[generate-instagram] Using demo fallback because OPENAI_API_KEY is missing.");
        return NextResponse.json(generateDemoInstagram(payload.news, payload.images));
      }

      return jsonError(
        "Falta configurar OPENAI_API_KEY en .env.local o en el entorno del servidor.",
        500
      );
    }

    const prompt = `Sos un redactor de redes sociales para una reserva natural.

A partir de una novedad ya aprobada, genera una publicacion para Instagram.

Reglas:
- Generar un texto breve, natural y facil de leer.
- Ideal: entre 350 y 700 caracteres.
- Maximo absoluto: 900 caracteres.
- La primera linea debe funcionar como gancho.
- No escribir parrafos largos.
- Usar 1 a 3 emojis como maximo.
- Usar entre 3 y 5 hashtags, no mas.
- Los hashtags deben ser especificos y relevantes, no genericos ni spam.
- Incluir palabras clave naturales relacionadas con la novedad, la reserva, naturaleza, educacion ambiental o visita responsable.
- No usar tono publicitario exagerado.
- No repetir toda la novedad: resumirla y complementarla.
- Si hay imagenes, el texto debe acompanar lo que se ve en la imagen.
- Si hay imagenes, hacer referencia natural a lo visible solo usando description y altText. No inventar detalles no informados.
- Incluir un llamado a la accion breve.
- El campo altText debe ser una descripcion accesible de la imagen principal, util para accesibilidad y contexto.
- Si no hay imagen cargada, altText puede venir vacio o sugerir una descripcion generica.
- Devolver unicamente JSON valido, sin markdown ni texto adicional:
{
  "caption": "",
  "hashtags": [],
  "callToAction": "",
  "altText": ""
}

Novedad aprobada:
Titulo: ${payload.news.titulo}
Resumen: ${payload.news.resumen}
Contenido: ${payload.news.contenido}
Slug sugerido: ${payload.news.slug}

Imagenes seleccionadas para Instagram:
${imageContext(payload.images)}`;

    try {
      const structuredResponse = await callOpenAi(prompt, apiKey, model, true);
      const generated = await parseOpenAiResponse(structuredResponse);
      return NextResponse.json(generated);
    } catch (structuredError) {
      console.error("[generate-instagram] Structured Outputs failed", structuredError);

      try {
        const fallbackResponse = await callOpenAi(prompt, apiKey, model, false);
        const generated = await parseOpenAiResponse(fallbackResponse);
        return NextResponse.json(generated);
      } catch (fallbackError) {
        if (demoFallbackEnabled) {
          console.warn(
            "[generate-instagram] Using demo fallback after OpenAI failure.",
            fallbackError
          );
          return NextResponse.json(generateDemoInstagram(payload.news, payload.images));
        }

        throw fallbackError;
      }
    }
  } catch (error) {
    console.error("[generate-instagram] Error", error);
    return jsonError(
      error instanceof Error
        ? error.message
        : "No se pudo generar la publicacion para Instagram.",
      502
    );
  }
}
