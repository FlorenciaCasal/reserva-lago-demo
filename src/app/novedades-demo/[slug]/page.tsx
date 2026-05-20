import DemoPublicNewsDetail from "@/components/admin/news-demo/DemoPublicNewsDetail";

type Props = {
  params: Promise<{ slug: string }>;
};

export const metadata = {
  title: "Detalle de novedad demo | Reserva Lago Escondido",
};

export default async function NovedadesDemoDetailPage({ params }: Props) {
  const { slug } = await params;
  return <DemoPublicNewsDetail slug={slug} />;
}
