"use client";

import Link from "next/link";
import React from "react";
import DemoModeBadge from "@/components/admin/news-demo/DemoModeBadge";
import { clearDemoNews, getDemoNewsList } from "@/services/newsDemoStorage";
import type { PublishedDemoNews } from "@/types/news-demo";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export default function DemoPublicNewsList() {
  const [news, setNews] = React.useState<PublishedDemoNews[]>([]);
  const [loaded, setLoaded] = React.useState(false);

  React.useEffect(() => {
    setNews(getDemoNewsList());
    setLoaded(true);
  }, []);

  function onClear() {
    clearDemoNews();
    setNews([]);
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8">
      <section className="rounded-lg border border-border bg-white p-5 text-main shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-primary">
              Novedades demo
            </p>
            <h1 className="mt-2 text-2xl font-semibold text-main sm:text-3xl">
              Novedades publicadas
            </h1>
            <div className="mt-3">
              <DemoModeBadge />
            </div>
          </div>
          <Link
            href="/admin/novedades-demo"
            className="inline-flex items-center justify-center rounded-lg border border-primary px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            Volver al panel admin
          </Link>
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-text-muted">
          Esta pagina es una demo local. Las novedades se guardan temporalmente en
          este navegador.
        </p>
      </section>

      {loaded && news.length === 0 && (
        <section className="rounded-lg border border-border bg-white p-8 text-center text-main">
          <h2 className="text-lg font-semibold">Todavia no hay novedades demo</h2>
          <p className="mt-2 text-sm text-text-muted">
            Publica una novedad desde el panel admin para verla aca.
          </p>
          <Link
            href="/admin/novedades-demo"
            className="mt-5 inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Ir al admin demo
          </Link>
        </section>
      )}

      {news.length > 0 && (
        <>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClear}
              className="rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-main hover:bg-neutral-100"
            >
              Limpiar demo local
            </button>
          </div>

          <section className="grid gap-5 md:grid-cols-2">
            {news.map((item) => {
              const mainImage = item.images[0];

              return (
                <article
                  key={item.id}
                  className="overflow-hidden rounded-lg border border-border bg-white shadow-sm"
                >
                  {mainImage && (
                    <div className="bg-neutral-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={mainImage.url}
                        alt={mainImage.altText}
                        className="aspect-video w-full object-cover"
                      />
                    </div>
                  )}

                  <div className="space-y-3 p-5">
                    <p className="text-xs font-medium text-text-muted">
                      Publicada el {formatDate(item.publishedAt)}
                    </p>
                    <h2 className="text-xl font-semibold leading-tight text-main">
                      {item.titulo}
                    </h2>
                    <p className="text-sm leading-6 text-text-muted">{item.resumen}</p>
                    <Link
                      href={`/novedades-demo/${item.slug}`}
                      className="inline-flex rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary-dark"
                    >
                      Ver mas
                    </Link>
                  </div>
                </article>
              );
            })}
          </section>
        </>
      )}
    </div>
  );
}
