export default function DemoModeBadge() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;

  return (
    <div className="inline-flex items-center rounded-full border border-yellow/50 bg-yellow/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-light">
      Modo demo
    </div>
  );
}
