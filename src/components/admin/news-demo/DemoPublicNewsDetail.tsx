"use client";

import Link from "next/link";
import React from "react";
import { getDemoNewsBySlug } from "@/services/newsDemoStorage";
import type { PublishedDemoNews } from "@/types/news-demo";

type Props = {
  slug: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function DemoPublicNewsDetail({ slug }: Props) {
  const [news, setNews] = React.useState<PublishedDemoNews | null>(null);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setNews(getDemoNewsBySlug(slug));
    setLoaded(true);
  }, [slug]);

  if (!loaded) return null;

  if (!news) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <section className="rounded-lg border border-border bg-white p-8 text-center text-main">
          <h1 className="text-2xl font-semibold">Novedad no encontrada</h1>
          <p className="mt-2 text-sm text-text-muted">
            Puede que esta demo haya sido limpiada o que estes usando otro navegador.
          </p>
          <Link
            href="/novedades-demo"
            className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Volver al listado
          </Link>
        </section>
      </main>
    );
  }

  const mainImage = news.images[0];
  const gallery = news.images.slice(1);

  return (
    <main className="bg-background">
      <article className="mx-auto max-w-4xl space-y-6 px-4 py-8 text-main">
        <Link href="/novedades-demo" className="text-sm font-medium text-primary">
          Volver a novedades
        </Link>

        <header className="space-y-3 rounded-lg border border-border bg-white p-5 shadow-sm">
          <p className="text-xs font-medium text-text-muted">
            Publicada el {formatDate(news.publishedAt)}
          </p>
          <h1 className="text-3xl font-semibold leading-tight text-main">
            {news.titulo}
          </h1>
          <p className="text-base leading-7 text-text-muted">{news.resumen}</p>
        </header>

        {mainImage && (
          <figure className="overflow-hidden rounded-lg border border-border bg-white shadow-sm">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainImage.url}
              alt={mainImage.altText}
              className="aspect-video w-full object-cover"
            />
            <figcaption className="space-y-1 p-3 text-xs text-text-muted">
              <p>{mainImage.description}</p>
              {mainImage.altText && <p>Alt: {mainImage.altText}</p>}
            </figcaption>
          </figure>
        )}

        <section className="rounded-lg border border-border bg-white p-5 shadow-sm">
          <div className="whitespace-pre-wrap text-sm leading-7 text-main">
            {news.contenido}
          </div>
        </section>

        {gallery.length > 0 && (
          <section className="grid gap-4 sm:grid-cols-2">
            {gallery.map((image) => (
              <figure
                key={image.id}
                className="overflow-hidden rounded-lg border border-border bg-white shadow-sm"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.altText}
                  className="aspect-[4/3] w-full object-cover"
                />
                <figcaption className="space-y-1 p-3 text-xs text-text-muted">
                  <p>{image.description}</p>
                  {image.altText && <p>Alt: {image.altText}</p>}
                </figcaption>
              </figure>
            ))}
          </section>
        )}
      </article>
    </main>
  );
}
