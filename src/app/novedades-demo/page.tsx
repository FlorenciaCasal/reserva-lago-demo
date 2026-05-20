import DemoPublicNewsList from "@/components/admin/news-demo/DemoPublicNewsList";

export const metadata = {
  title: "Novedades demo | Reserva Lago Escondido",
};

export default function NovedadesDemoPublicPage() {
  return (
    <main className="min-h-screen bg-background">
      <DemoPublicNewsList />
    </main>
  );
}
