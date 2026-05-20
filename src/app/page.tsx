import Image from "next/image";
import Link from "next/link";
import HomeStatus from "../components/Home";
import ProjectsGrid from "@/components/ProjectsGrid";
// import ContactSection from "@/components/ContactSection";

export default function Page() {

  return (
    <main className="flex flex-col bg-background">
      <section className="
  relative w-full overflow-hidden
  h-[45vh]
  sm:h-[55vh]
  lg:h-[65vh]
">
        <div className="relative mx-auto h-full ">
          <Image
            src="/img/home.jpeg"
            alt="Reserva Natural Lago Escondido"
            fill
            priority
            className="object-cover object-center"
          />
          {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
            <div className="absolute inset-x-0 bottom-6 z-10 flex justify-center px-4">
              <Link
                href="/admin/novedades-demo"
                className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-white shadow-lg transition hover:bg-primary-dark"
              >
                Entrar a demo Novedades IA
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ===== PROTECCIÓN ACTIVA ===== */}
      <section className="py-6 bg-primary">
        <h2 className="text-center text-white text-lg font-semibold">
          PROTECCIÓN ACTIVA DE LA NATURALEZA
        </h2>
      </section>

      {/* ===== QUIÉNES SOMOS ===== */}
      <section className="text-primary py-10 px-6 min-h-[420px] flex flex-col justify-center">
        <h3 className="text-center text-lg font-semibold mb-4">
          QUIÉNES SOMOS
        </h3>

        <p className="max-w-xl lg:max-w-2xl mx-auto px-8 sm:text-[16px] text-center text-justify text-sm leading-relaxed">
          Somos un espacio protegido ubicado en el paraje El Foyel, Río Negro, que garantiza un ambiente sano para las generaciones presentes y futuras.
          <br /><br />
          Nuestro propósito es conservar bosques milenarios y proteger la fauna en riesgo a través de diversos proyectos.
        </p>
      </section>

      {/* ===== PROYECTOS DE CONSERVACIÓN ===== */}

      <ProjectsGrid />


      {/* ===== CLIMA ===== */}
      <section className="py-10">
        <h3 className="text-center text-primary text-lg font-semibold mb-4">
          CLIMA
        </h3>

        <div className="flex justify-center px-4">
          <HomeStatus />
        </div>
      </section>
      {/* ===== CONTACTO ===== */}
      {/* <ContactSection /> */}

    </main>
  );
}







