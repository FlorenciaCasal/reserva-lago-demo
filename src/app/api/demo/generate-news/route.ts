import { NextResponse } from "next/server";
import type { GeneratedNews, NewsDemoInput } from "@/types/news-demo";

export const dynamic = "force-dynamic";

const DEFAULT_MODEL = "gpt-4.1-mini";

const newsSchema = {
  type: "object",
  additionalProperties: false,
  required: ["titulo", "resumen", "contenido", "slug"],
  properties: {
    titulo: { type: "string" },
    resumen: { type: "string" },
    contenido: { type: "string" },
    slug: { type: "string" },
  },
};

function jsonError(error: string, status: number) {
  return NextResponse.json({ error }, { status });
}

function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function generateDemoNews(input: NewsDemoInput): GeneratedNews {
  const topic = input.descripcion.trim().replace(/\.$/, "");
  const titulo = topic.toLowerCase().includes("sendero")
    ? "Nuevo sendero interpretativo para conectar con la naturaleza"
    : "Nueva propuesta para fortalecer la visita responsable";

  return {
    titulo,
    resumen:
      "La reserva suma una novedad pensada para acercar a visitantes y comunidad al ambiente natural, con una mirada educativa, responsable y respetuosa del entorno.",
    contenido: `La Reserva Natural Lago Escondido presenta una nueva propuesta vinculada a: ${topic}.

Esta iniciativa busca acompañar la experiencia de quienes visitan el area, promoviendo el conocimiento del entorno, la educacion ambiental y el cuidado de los espacios naturales.

La propuesta fue pensada para ${input.publicoObjetivo.toLowerCase()}, con un tono ${input.tono.toLowerCase()}. Desde la reserva invitamos a recorrer, observar y disfrutar con responsabilidad, respetando la señalizacion, los tiempos del ambiente y las recomendaciones del equipo.

Cada visita es una oportunidad para fortalecer el vinculo con la naturaleza y valorar la importancia de conservar estos paisajes para la comunidad actual y las generaciones futuras.`,
    slug: slugify(titulo),
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
    "OpenAI no pudo generar la novedad."
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

function isValidInput(value: Partial<NewsDemoInput>): value is NewsDemoInput {
  return Boolean(
    value.descripcion?.trim() &&
      value.tono?.trim() &&
      value.publicoObjetivo?.trim()
  );
}

function isGeneratedNews(value: Partial<GeneratedNews>): value is GeneratedNews {
  return Boolean(
    value.titulo?.trim() &&
      value.resumen?.trim() &&
      value.contenido?.trim() &&
      value.slug?.trim()
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
        name: "generated_news",
        strict: true,
        schema: newsSchema,
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

  const parsed = JSON.parse(extractJson(text)) as Partial<GeneratedNews>;
  if (!isGeneratedNews(parsed)) {
    throw new Error("OpenAI devolvio JSON incompleto para la novedad.");
  }

  return parsed;
}

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;
    const model = process.env.OPENAI_MODEL || DEFAULT_MODEL;
    const demoFallbackEnabled = process.env.DEMO_AI_FALLBACK === "true";

    const body = (await req.json().catch(() => null)) as Partial<NewsDemoInput> | null;

    if (!body || !isValidInput(body)) {
      return jsonError("Completa descripcion, tono y publico objetivo.", 400);
    }

    if (!apiKey) {
      if (demoFallbackEnabled) {
        console.warn("[generate-news] Using demo fallback because OPENAI_API_KEY is missing.");
        return NextResponse.json(generateDemoNews(body));
      }

      return jsonError(
        "Falta configurar OPENAI_API_KEY en .env.local o en el entorno del servidor.",
        500
      );
    }

    const prompt = `Sos un redactor institucional especializado en comunicacion ambiental para reservas naturales.

Genera una novedad para el sitio web de una reserva natural.

Reglas:
- Usar lenguaje institucional, claro, calido y amigable.
- Evitar tono comercial exagerado.
- No inventar datos concretos que no esten en la descripcion.
- Transmitir cuidado ambiental, educacion, visita responsable y vinculo con la naturaleza.
- Escribir en espanol de Argentina.
- Devolver unicamente JSON valido, sin markdown ni texto adicional:
{
  "titulo": "",
  "resumen": "",
  "contenido": "",
  "slug": ""
}

Descripcion: ${body.descripcion}
Tono: ${body.tono}
Publico objetivo: ${body.publicoObjetivo}`;

    try {
      const structuredResponse = await callOpenAi(prompt, apiKey, model, true);
      const generated = await parseOpenAiResponse(structuredResponse);
      return NextResponse.json(generated);
    } catch (structuredError) {
      console.error("[generate-news] Structured Outputs failed", structuredError);

      try {
        const fallbackResponse = await callOpenAi(prompt, apiKey, model, false);
        const generated = await parseOpenAiResponse(fallbackResponse);
        return NextResponse.json(generated);
      } catch (fallbackError) {
        if (demoFallbackEnabled) {
          console.warn("[generate-news] Using demo fallback after OpenAI failure.", fallbackError);
          return NextResponse.json(generateDemoNews(body));
        }

        throw fallbackError;
      }
    }
  } catch (error) {
    console.error("[generate-news] Error", error);
    return jsonError(
      error instanceof Error ? error.message : "No se pudo generar la novedad con IA.",
      502
    );
  }
}
