"use client";

import React from "react";
import {
  Bookmark,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
} from "lucide-react";
import type { InstagramContent, NewsDemoImage } from "@/types/news-demo";

type Props = {
  content: InstagramContent;
  images?: NewsDemoImage[];
};

export default function InstagramMobilePreview({ content, images = [] }: Props) {
  const instagramImages = images.filter((image) => image.useInInstagram);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const activeImage = instagramImages[activeIndex];
  const hashtagsText = content.hashtags.join(" ");
  const hasCarousel = instagramImages.length > 1;

  React.useEffect(() => {
    setActiveIndex(0);
  }, [instagramImages.length]);

  function previousImage() {
    setActiveIndex((current) =>
      current === 0 ? instagramImages.length - 1 : current - 1
    );
  }

  function nextImage() {
    setActiveIndex((current) =>
      current === instagramImages.length - 1 ? 0 : current + 1
    );
  }

  return (
    <div className="mx-auto w-full max-w-[390px] rounded-[28px] border border-neutral-800 bg-neutral-950 p-3 shadow-2xl">
      <div className="overflow-hidden rounded-[22px] bg-white text-neutral-950">
        <div className="flex items-center justify-between border-b border-neutral-200 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary via-primary-dark to-yellow text-xs font-bold text-white">
              RL
            </div>
            <div>
              <p className="text-sm font-semibold leading-tight">
                reserva.lago.escondido
              </p>
              <p className="text-[11px] leading-tight text-neutral-500">
                Rio Negro, Argentina
              </p>
            </div>
          </div>
          <MoreHorizontal className="h-5 w-5" aria-hidden="true" />
        </div>

        <div className="relative aspect-square bg-neutral-100">
          {activeImage ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activeImage.url}
                alt={content.altText || activeImage.altText}
                className="h-full w-full object-cover"
              />

              {hasCarousel && (
                <>
                  <button
                    type="button"
                    onClick={previousImage}
                    className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65"
                    aria-label="Imagen anterior"
                  >
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={nextImage}
                    className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65"
                    aria-label="Imagen siguiente"
                  >
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                  <div className="absolute right-3 top-3 rounded-full bg-black/65 px-2.5 py-1 text-xs font-medium text-white">
                    {activeIndex + 1}/{instagramImages.length}
                  </div>
                </>
              )}
            </>
          ) : (
            <div className="flex h-full flex-col justify-between bg-[radial-gradient(circle_at_top_left,#389c99,transparent_34%),linear-gradient(135deg,#101827,#1f2937_45%,#0a0a0a)] p-6 text-white">
              <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
                Reserva natural
              </p>
              <p className="text-2xl font-semibold leading-tight">
                Novedades para visitar y cuidar mejor
              </p>
              <p className="text-sm text-neutral-200">{content.callToAction}</p>
            </div>
          )}
        </div>

        <div className="space-y-3 px-3 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Heart className="h-6 w-6" aria-hidden="true" />
              <MessageCircle className="h-6 w-6" aria-hidden="true" />
              <Send className="h-6 w-6" aria-hidden="true" />
            </div>
            <Bookmark className="h-6 w-6" aria-hidden="true" />
          </div>

          {hasCarousel && (
            <div className="flex justify-center gap-1.5">
              {instagramImages.map((image, index) => (
                <button
                  key={image.id}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    index === activeIndex ? "bg-blue-500" : "bg-neutral-300"
                  }`}
                  aria-label={`Ver imagen ${index + 1}`}
                />
              ))}
            </div>
          )}

          <p className="text-sm font-semibold">128 Me gusta</p>

          <div className="space-y-1 text-sm leading-5">
            <p className="whitespace-pre-wrap">
              <span className="font-semibold">reserva.lago.escondido </span>
              {content.caption}
            </p>
            {hashtagsText && <p className="text-blue-700">{hashtagsText}</p>}
            {content.callToAction && (
              <p className="font-medium">{content.callToAction}</p>
            )}
          </div>

          <p className="text-xs uppercase text-neutral-500">Hace 2 horas</p>

          {content.altText && (
            <div className="rounded-lg bg-neutral-100 p-2 text-xs leading-5 text-neutral-600">
              <p className="font-semibold text-neutral-800">Accesibilidad</p>
              <p>{content.altText}</p>
            </div>
          )}
        </div>
      </div>

      <p className="px-2 pt-3 text-center text-xs text-neutral-500">
        Vista previa simulada de publicacion en Instagram
      </p>
    </div>
  );
}
