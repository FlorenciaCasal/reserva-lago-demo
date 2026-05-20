"use client";

import { FileText } from "lucide-react";
import type { GeneratedNews, NewsDemoImage } from "@/types/news-demo";

type Props = {
  news: GeneratedNews;
  images?: NewsDemoImage[];
  onChange: (news: GeneratedNews) => void;
  disabled?: boolean;
};

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

export default function GeneratedNewsPreview({
  news,
  images = [],
  onChange,
  disabled,
}: Props) {
  const webImages = images.filter((image) => image.useInWeb);
  const mainImage = webImages[0];
  const galleryImages = webImages.slice(1);

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950">
      <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-3">
        <FileText className="h-4 w-4 text-primary-light" aria-hidden="true" />
        <h2 className="text-base font-semibold text-neutral-100">Novedad generada</h2>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.85fr)]">
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Titulo
            </span>
            <input
              className={inputClass}
              disabled={disabled}
              value={news.titulo}
              onChange={(event) => onChange({ ...news, titulo: event.target.value })}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Resumen
            </span>
            <textarea
              className={`${inputClass} min-h-24 resize-y`}
              disabled={disabled}
              value={news.resumen}
              onChange={(event) => onChange({ ...news, resumen: event.target.value })}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Contenido
            </span>
            <textarea
              className={`${inputClass} min-h-56 resize-y leading-relaxed`}
              disabled={disabled}
              value={news.contenido}
              onChange={(event) => onChange({ ...news, contenido: event.target.value })}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Slug sugerido
            </span>
            <input
              className={inputClass}
              disabled={disabled}
              value={news.slug}
              onChange={(event) => onChange({ ...news, slug: event.target.value })}
            />
          </label>
        </div>

        <article className="rounded-xl border border-neutral-800 bg-neutral-900/70 p-5">
          <p className="mb-3 text-xs font-medium uppercase tracking-wide text-primary-light">
            Preview sitio web
          </p>

          {mainImage && (
            <figure className="mb-5 overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mainImage.url}
                alt={mainImage.altText}
                className="aspect-video w-full object-cover"
              />
              <figcaption className="space-y-1 px-3 py-2 text-xs text-neutral-400">
                <p>{mainImage.description || "Imagen principal de la novedad"}</p>
                {mainImage.altText && <p>Alt: {mainImage.altText}</p>}
              </figcaption>
            </figure>
          )}

          <h3 className="text-xl font-semibold leading-tight text-white">{news.titulo}</h3>
          <p className="mt-3 text-sm leading-6 text-neutral-300">{news.resumen}</p>
          <div className="mt-5 whitespace-pre-wrap border-t border-neutral-800 pt-5 text-sm leading-7 text-neutral-200">
            {news.contenido}
          </div>

          {galleryImages.length > 0 && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              {galleryImages.map((image) => (
                <figure
                  key={image.id}
                  className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={image.url}
                    alt={image.altText}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <figcaption className="px-2 py-2 text-xs leading-5 text-neutral-500">
                    <p>{image.description || "Imagen complementaria"}</p>
                    {image.altText && <p>Alt: {image.altText}</p>}
                  </figcaption>
                </figure>
              ))}
            </div>
          )}

          <p className="mt-5 rounded-lg bg-black/30 px-3 py-2 text-xs text-neutral-400">
            /novedades/{news.slug || "slug-sugerido"}
          </p>
        </article>
      </div>
    </section>
  );
}
