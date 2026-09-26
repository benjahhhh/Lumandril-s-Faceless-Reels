import Link from "next/link";
import { CREDITOS_BIENVENIDA, NOMBRE_APP, PLANES, RECARGA } from "@/lib/catalogo";
import { FORMATOS, TIPOS } from "@/formatos";

const PASOS = [
  { titulo: "Eliges un formato", texto: "Frutinovela, chat de WhatsApp, terror, quiz… y el tema." },
  { titulo: "La IA lo monta", texto: "Escribe el guion, pone la voz, crea las imágenes y los subtítulos." },
  { titulo: "Revisas y publicas", texto: "En TikTok, Instagram y YouTube, desde el móvil." },
];

function PantallaEjemplo() {
  return (
    <figure className="mx-auto w-full max-w-[260px]">
      <div
        className="relative flex aspect-[9/16] max-w-full flex-col justify-between overflow-hidden rounded-[28px] border-4 border-texto p-4 text-white"
        style={{
          background:
            "radial-gradient(circle at 25% 30%, #ffb224 0 18%, transparent 40%), radial-gradient(circle at 80% 45%, #e8446b 0 16%, transparent 42%), radial-gradient(circle at 50% 85%, #3c8d4a 0 20%, transparent 50%), #2a1f33",
        }}
        aria-hidden="true"
      >
        <span className="text-xs font-semibold opacity-90">@frutinovelas · Cap. 3</span>
        <p className="subtitulo text-center text-[28px]">
          ¿Y tú qué hacías <span style={{ color: "#ffb224" }}>con la piña?</span>
        </p>
        <span className="self-end rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold">Contenido IA</span>
      </div>
      <figcaption className="mt-3 text-center text-xs tracking-wide text-suave tabular-nums">
        1080 × 1920 · 61 s · voz y subtítulos automáticos
      </figcaption>
    </figure>
  );
}

export default function Inicio() {
  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
      <header className="flex items-center justify-between py-5">
        <span className="font-titular text-xl tracking-wide uppercase">{NOMBRE_APP}</span>
        <Link href="/login" className="text-sm font-semibold hover:underline">
          Entrar
        </Link>
      </header>

      <section className="grid items-center gap-10 py-10 md:grid-cols-[1fr_auto] md:py-16">
        <div>
          <h1 className="font-titular text-5xl leading-[1.02] uppercase sm:text-7xl">
            Vídeos virales sin salir en cámara
          </h1>
          <p className="mt-5 max-w-[48ch] text-lg text-suave">
            Para TikTok, Reels y Shorts, en español. Elige un formato y la IA escribe el guion, pone la voz y monta
            el vídeo.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Link
              href="/login"
              className="rounded-full bg-acento px-6 py-3 font-semibold text-sobre-acento hover:brightness-95"
            >
              Empieza gratis
            </Link>
            <span className="text-sm text-suave">{CREDITOS_BIENVENIDA} créditos de regalo, sin tarjeta.</span>
          </div>
        </div>
        <PantallaEjemplo />
      </section>

      <section className="border-t border-borde py-12">
        <h2 className="text-2xl font-bold">Cómo funciona</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {PASOS.map((paso, i) => (
            <li key={paso.titulo} className="flex gap-4">
              <span className="font-titular text-3xl text-acento tabular-nums">{i + 1}</span>
              <div>
                <h3 className="font-semibold">{paso.titulo}</h3>
                <p className="mt-1 text-sm text-suave">{paso.texto}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="border-t border-borde py-12">
        <h2 className="text-2xl font-bold">Formatos</h2>
        <p className="mt-2 max-w-[60ch] text-suave">
          Los que ya funcionan en TikTok en español. Cada mes añadimos los que se hacen virales.
        </p>
        <ul className="mt-6 divide-y divide-borde border-t border-borde">
          {FORMATOS.map((formato) => (
            <li key={formato.id} className="flex items-start justify-between gap-4 py-4">
              <div>
                <h3 className="font-semibold">{formato.nombre}</h3>
                <p className="mt-0.5 text-sm text-suave">{formato.descripcion}</p>
              </div>
              <span className="shrink-0 rounded-full border border-borde px-2.5 py-0.5 text-xs text-suave">
                {TIPOS[formato.tipo]}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-borde py-12">
        <h2 className="text-2xl font-bold">Precios</h2>
        <p className="mt-2 max-w-[60ch] text-suave">
          Cada vídeo gasta créditos según lo que cuesta generarlo. Los créditos del plan se renuevan cada mes. Precios
          con IVA incluido.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-3">
          {Object.values(PLANES).map((plan) => (
            <li
              key={plan.id}
              className={`flex flex-col rounded-xl border bg-superficie p-5 ${plan.id === "creador" ? "border-acento border-2" : "border-borde"}`}
            >
              <h3 className="font-semibold">{plan.nombre}</h3>
              <p className="mt-3 font-titular text-4xl tabular-nums">
                {plan.precioEuros} €
                {plan.precioEuros > 0 && <span className="font-sans text-base font-normal text-suave"> /mes</span>}
              </p>
              <p className="mt-3 text-sm font-semibold tabular-nums">
                {plan.creditosMensuales
                  ? `${plan.creditosMensuales.toLocaleString("es-ES")} créditos al mes`
                  : `${CREDITOS_BIENVENIDA} créditos una vez`}
              </p>
              <p className="mt-1 text-sm text-suave">{plan.ejemplo}</p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-suave">
          ¿Te quedas sin créditos antes de fin de mes? {RECARGA.nombre}: {RECARGA.precioEuros} € (para suscriptores).
        </p>
      </section>

      <footer className="border-t border-borde pt-6 text-sm text-suave">
        © {new Date().getFullYear()} {NOMBRE_APP}. Los vídeos llevan la etiqueta de contenido generado con IA.
      </footer>
    </main>
  );
}
