"use client";

import React from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ImagePlus,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import GeneratedNewsPreview from "@/components/admin/news-demo/GeneratedNewsPreview";
import InstagramPreview from "@/components/admin/news-demo/InstagramPreview";
import {
  generateInstagram,
  generateNews,
  publishInstagram,
} from "@/services/newsDemo";
import {
  clearDemoNews,
  clearNewsDemoDraft,
  loadNewsDemoDraft,
  saveDemoNews,
  saveNewsDemoDraft,
} from "@/services/newsDemoStorage";
import type {
  GeneratedNews,
  InstagramContent,
  NewsDemoImage,
  NewsDemoInput,
} from "@/types/news-demo";

const initialInput: NewsDemoInput = {
  descripcion: "",
  tono: "",
  publicoObjetivo: "",
};

const emptyNews: GeneratedNews = {
  titulo: "",
  resumen: "",
  contenido: "",
  slug: "",
};

const emptyInstagram: InstagramContent = {
  caption: "",
  hashtags: [],
  callToAction: "",
  altText: "",
};

const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024;
const DEFAULT_IMAGE_ALT = "Imagen seleccionada para la novedad";

const inputClass =
  "w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-neutral-100 outline-none transition placeholder:text-neutral-500 focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  return "Ocurrio un error inesperado.";
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("No se pudo leer la imagen seleccionada."));
    };
    reader.onerror = () => reject(new Error("No se pudo leer la imagen seleccionada."));
    reader.readAsDataURL(file);
  });
}

export default function NewsDemoForm() {
  const [input, setInput] = React.useState<NewsDemoInput>(initialInput);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [images, setImages] = React.useState<NewsDemoImage[]>([]);
  const [news, setNews] = React.useState<GeneratedNews | null>(null);
  const [instagram, setInstagram] = React.useState<InstagramContent | null>(null);
  const [loadingNews, setLoadingNews] = React.useState(false);
  const [loadingInstagram, setLoadingInstagram] = React.useState(false);
  const [publishing, setPublishing] = React.useState(false);
  const [publishedInDemo, setPublishedInDemo] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);
  const [draftLoaded, setDraftLoaded] = React.useState(false);

  const hasInput =
    input.descripcion.trim() && input.tono.trim() && input.publicoObjetivo.trim();
  const hasNews =
    news?.titulo.trim() && news.resumen.trim() && news.contenido.trim() && news.slug.trim();
  const hasInstagram =
    instagram?.caption.trim() &&
    instagram.hashtags.length > 0 &&
    instagram.callToAction.trim() &&
    typeof instagram.altText === "string";

  const busy = loadingNews || loadingInstagram || publishing;

  React.useEffect(() => {
    const draft = loadNewsDemoDraft();

    if (draft) {
      setInput(draft.input);
      setImages(draft.images);
      setNews(draft.news);
      setInstagram(draft.instagram);
      setPublishedInDemo(draft.publishedInDemo);
    }

    setDraftLoaded(true);
  }, []);

  React.useEffect(() => {
    if (!draftLoaded) return;

    saveNewsDemoDraft({
      input,
      images,
      news,
      instagram,
      publishedInDemo,
    });
  }, [draftLoaded, images, input, instagram, news, publishedInDemo]);

  async function onSelectImageFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setError(null);
    setSuccess(null);

    if (files.length === 0) return;

    const invalidType = files.find((file) => !file.type.startsWith("image/"));
    if (invalidType) {
      setError(`"${invalidType.name}" no es una imagen valida.`);
      return;
    }

    const tooLarge = files.find((file) => file.size > MAX_IMAGE_SIZE_BYTES);
    if (tooLarge) {
      setError(`"${tooLarge.name}" supera el maximo permitido de 3MB.`);
      return;
    }

    try {
      const loadedImages = await Promise.all(
        files.map(async (file): Promise<NewsDemoImage> => ({
          id: createId(),
          url: await readFileAsDataUrl(file),
          fileName: file.name,
          description: file.name,
          altText: news?.titulo
            ? `Imagen de la novedad ${news.titulo}`
            : DEFAULT_IMAGE_ALT,
          useInWeb: true,
          useInInstagram: true,
        }))
      );

      setImages((current) => [...current, ...loadedImages]);
      setInstagram(null);
      setPublishedInDemo(false);
      setSuccess(
        loadedImages.length === 1
          ? "Imagen agregada a la demo."
          : `${loadedImages.length} imagenes agregadas a la demo.`
      );
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function removeImage(id: string) {
    setImages((current) => current.filter((image) => image.id !== id));
    setInstagram(null);
    setPublishedInDemo(false);
  }

  async function onGenerateNews() {
    setLoadingNews(true);
    setError(null);
    setSuccess(null);
    setInstagram(null);

    try {
      const generated = await generateNews(input);
      setNews(generated);
      setImages((current) =>
        current.map((image) => ({
          ...image,
          altText:
            !image.altText || image.altText === DEFAULT_IMAGE_ALT
              ? `Imagen de la novedad ${generated.titulo}`
              : image.altText,
        }))
      );
      setPublishedInDemo(false);
      setSuccess("Novedad generada. Podes editarla antes de avanzar.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingNews(false);
    }
  }

  async function onGenerateInstagram() {
    if (!news) return;

    setLoadingInstagram(true);
    setError(null);
    setSuccess(null);

    try {
      const generated = await generateInstagram({ news, images });
      setInstagram(generated);
      setSuccess("Publicacion para Instagram generada y lista para revision.");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoadingInstagram(false);
    }
  }

  async function onPublishInstagram() {
    if (!instagram) return;

    setPublishing(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await publishInstagram(instagram);
      setSuccess(result.message);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setPublishing(false);
    }
  }

  function onPublishDemoSite() {
    if (!news) return;

    setError(null);
    saveDemoNews({
      ...news,
      id: `${news.slug}-${Date.now()}`,
      publishedAt: new Date().toISOString(),
      images,
    });
    setPublishedInDemo(true);
    setSuccess("✅ Novedad publicada en la pagina demo");
  }

  function onClearDemo() {
    clearNewsDemoDraft();
    clearDemoNews();
    setInput(initialInput);
    setImages([]);
    setNews(null);
    setInstagram(null);
    setPublishedInDemo(false);
    setError(null);
    setSuccess(
      "Demo limpia. Se borraron el draft y las novedades publicadas en este navegador."
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-950 px-4 py-3 text-sm text-neutral-300 sm:flex-row sm:items-center sm:justify-between">
        <p>
          Los cambios de esta demo se conservan mientras la pestaña permanezca abierta.
        </p>
        <button
          type="button"
          disabled={busy}
          onClick={onClearDemo}
          className="inline-flex items-center justify-center rounded-lg border border-neutral-700 px-4 py-2 text-sm font-semibold text-neutral-100 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:text-neutral-500"
        >
          Limpiar demo
        </button>
      </div>

      {(error || success) && (
        <div
          className={`flex items-start gap-3 rounded-xl border p-4 text-sm ${
            error
              ? "border-red-800 bg-red-950/40 text-red-200"
              : "border-green-800 bg-green-950/40 text-green-200"
          }`}
        >
          {!error && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />}
          <p>{error || success}</p>
        </div>
      )}

      <section className="rounded-xl border border-neutral-800 bg-neutral-950">
        <div className="flex flex-col gap-3 border-b border-neutral-800 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
              Paso 1
            </p>
            <h2 className="text-base font-semibold text-neutral-100">
              Brief editorial
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-xs text-primary-light">
              Demo IA sin persistencia
            </span>
            <Link
              href="/novedades-demo"
              className="rounded-full border border-neutral-700 px-3 py-1 text-xs text-neutral-200 transition hover:bg-neutral-800"
            >
              Ver pagina publica demo
            </Link>
          </div>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="space-y-5">
            <label className="block space-y-1">
              <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                Descripcion
              </span>
              <textarea
                className={`${inputClass} min-h-32 resize-y leading-relaxed`}
                disabled={busy}
                placeholder="Ej: Queremos comunicar la inauguracion de un nuevo sendero interpretativo."
                value={input.descripcion}
                onChange={(event) =>
                  setInput({ ...input, descripcion: event.target.value })
                }
              />
            </label>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Tono
                </span>
                <input
                  className={inputClass}
                  disabled={busy}
                  placeholder="Ej: institucional, cercano y educativo"
                  value={input.tono}
                  onChange={(event) => setInput({ ...input, tono: event.target.value })}
                />
              </label>

              <label className="block space-y-1">
                <span className="text-xs font-medium uppercase tracking-wide text-neutral-400">
                  Publico objetivo
                </span>
                <input
                  className={inputClass}
                  disabled={busy}
                  placeholder="Ej: familias, visitantes y escuelas"
                  value={input.publicoObjetivo}
                  onChange={(event) =>
                    setInput({ ...input, publicoObjetivo: event.target.value })
                  }
                />
              </label>
            </div>

            <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <ImagePlus className="h-4 w-4 text-primary-light" aria-hidden="true" />
                    <h3 className="text-base font-semibold text-neutral-100">
                      Imagenes de la novedad
                    </h3>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-neutral-400">
                    Selecciona una o varias imagenes. Se guardan temporalmente en
                    este navegador; en produccion se subirian a un almacenamiento seguro.
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={onSelectImageFiles}
                />
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => fileInputRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-neutral-700 bg-neutral-950 px-4 py-2 text-sm font-semibold text-neutral-100 transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:text-neutral-500"
                >
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Seleccionar imagenes
                </button>
              </div>

              {images.length > 0 && (
                <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {images.map((image) => (
                    <figure
                      key={image.id}
                      className="overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950"
                    >
                      <div className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={image.url}
                          alt={image.altText}
                          className="aspect-video w-full object-cover"
                        />
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() => removeImage(image.id)}
                          className="absolute right-2 top-2 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-red-200 transition hover:bg-red-950 disabled:opacity-50"
                          aria-label="Eliminar imagen"
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </button>
                      </div>
                      <figcaption className="truncate px-3 py-2 text-xs text-neutral-400">
                        {image.fileName || "Imagen seleccionada"}
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col justify-between rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
            <div className="space-y-3">
              <p className="text-sm font-medium text-neutral-100">Flujo de la demo</p>
              <ol className="space-y-2 text-sm text-neutral-400">
                <li>1. Brief + imagenes</li>
                <li>2. Novedad IA</li>
                <li>3. Edicion manual</li>
                <li>4. Sitio demo</li>
                <li>5. Instagram IA</li>
                <li>6. Envio simulado</li>
              </ol>
            </div>

            <button
              type="button"
              disabled={!hasInput || loadingNews || busy}
              onClick={onGenerateNews}
              className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
            >
              {loadingNews ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Sparkles className="h-4 w-4" aria-hidden="true" />
              )}
              Generar novedad con IA
            </button>
          </div>
        </div>
      </section>

      {news && (
        <GeneratedNewsPreview
          news={news}
          images={images}
          onChange={setNews}
          disabled={busy}
        />
      )}

      {news && (
        <div className="flex flex-col gap-3 rounded-xl border border-neutral-800 bg-neutral-950 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-neutral-100">
              Publicacion en sitio demo
            </p>
            <p className="mt-1 text-xs text-neutral-400">
              Guarda esta novedad solo en localStorage de este navegador.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Link
              href="/novedades-demo"
              className="inline-flex items-center justify-center rounded-lg border border-neutral-700 px-4 py-2.5 text-sm font-semibold text-neutral-100 transition hover:bg-neutral-800"
            >
              Ver pagina publica demo
            </Link>
            <button
              type="button"
              disabled={!hasNews || busy}
              onClick={onPublishDemoSite}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400"
            >
              <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
              {publishedInDemo ? "Publicado en sitio demo" : "Publicar en sitio demo"}
            </button>
          </div>
        </div>
      )}

      {news && (
        <div className="flex justify-end">
          <button
            type="button"
            disabled={!hasNews || loadingInstagram || busy}
            onClick={onGenerateInstagram}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary-light px-4 py-2.5 text-sm font-semibold text-neutral-950 transition hover:bg-yellow disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400 sm:w-auto"
          >
            {loadingInstagram ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Sparkles className="h-4 w-4" aria-hidden="true" />
            )}
            Generar publicacion para Instagram
          </button>
        </div>
      )}

      {instagram && (
        <InstagramPreview
          content={instagram}
          images={images}
          onChange={setInstagram}
          disabled={busy}
        />
      )}

      {instagram && (
        <div className="flex justify-end rounded-xl border border-neutral-800 bg-neutral-950 p-4">
          <button
            type="button"
            disabled={!hasInstagram || publishing || busy}
            onClick={onPublishInstagram}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-pink-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:bg-neutral-700 disabled:text-neutral-400 sm:w-auto"
          >
            {publishing ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-4 w-4" aria-hidden="true" />
            )}
            Publicar en Instagram
          </button>
        </div>
      )}

      {!news && !instagram && (
        <GeneratedNewsPreview
          news={emptyNews}
          images={images}
          onChange={() => {}}
          disabled
        />
      )}
      {!instagram && (
        <InstagramPreview
          content={emptyInstagram}
          images={images}
          onChange={() => {}}
          disabled
        />
      )}
    </div>
  );
}
