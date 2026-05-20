"use client";

import { Instagram } from "lucide-react";
import InstagramMobilePreview from "@/components/admin/news-demo/InstagramMobilePreview";
import type { InstagramContent, NewsDemoImage } from "@/types/news-demo";

type Props = {
  content: InstagramContent;
  images?: NewsDemoImage[];
  onChange: (content: InstagramContent) => void;
  disabled?: boolean;
};

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

export default function InstagramPreview({
  content,
  images = [],
  onChange,
  disabled,
}: Props) {
  const hashtagsText = content.hashtags.join(" ");

  return (
    <section className="rounded-xl border border-neutral-800 bg-neutral-950">
      <div className="flex items-center gap-2 border-b border-neutral-800 px-4 py-3">
        <Instagram className="h-4 w-4 text-pink-300" aria-hidden="true" />
        <h2 className="text-base font-semibold text-neutral-100">Publicacion Instagram</h2>
      </div>

      <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-4">
          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Caption
            </span>
            <textarea
              className={`${inputClass} min-h-44 resize-y leading-relaxed`}
              disabled={disabled}
              value={content.caption}
              onChange={(event) => onChange({ ...content, caption: event.target.value })}
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Hashtags
            </span>
            <textarea
              className={`${inputClass} min-h-20 resize-y`}
              disabled={disabled}
              value={hashtagsText}
              onChange={(event) =>
                onChange({
                  ...content,
                  hashtags: event.target.value
                    .split(/\s+/)
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Llamada a la accion
            </span>
            <input
              className={inputClass}
              disabled={disabled}
              value={content.callToAction}
              onChange={(event) =>
                onChange({ ...content, callToAction: event.target.value })
              }
            />
          </label>

          <label className="block space-y-1">
            <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
              Texto alternativo
            </span>
            <textarea
              className={`${inputClass} min-h-20 resize-y leading-relaxed`}
              disabled={disabled}
              value={content.altText}
              onChange={(event) => onChange({ ...content, altText: event.target.value })}
            />
          </label>
        </div>

        <InstagramMobilePreview content={content} images={images} />
      </div>
    </section>
  );
}
