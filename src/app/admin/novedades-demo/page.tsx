import NewsDemoForm from "@/components/admin/news-demo/NewsDemoForm";
import DemoModeBadge from "@/components/admin/news-demo/DemoModeBadge";

export const metadata = {
  title: "Novedades con IA | Demo",
};

export default function NovedadesDemoPage() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-2 py-4 sm:px-4">
      <header className="rounded-xl border border-neutral-800 bg-neutral-950 p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-primary-light">
              Prototipo funcional
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold text-white sm:text-3xl">
                Novedades con IA
              </h1>
              <DemoModeBadge />
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-neutral-400">
              Creación, edición editorial, adaptación a Instagram y envío simulado,
              sin tocar backend, base de datos ni servicios externos de publicación.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs text-neutral-300">
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
              Local state
            </div>
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
              Next API
            </div>
            <div className="rounded-lg border border-neutral-800 bg-neutral-900 px-3 py-2">
              OpenAI
            </div>
          </div>
        </div>
      </header>

      <NewsDemoForm />
    </div>
  );
}
