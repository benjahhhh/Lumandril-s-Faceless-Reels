import Link from "next/link";
import { redirect } from "next/navigation";
import { CREDITOS_BIENVENIDA, NOMBRE_APP, PLANES, PLANES_DE_PAGO, RECARGA, type PlanId } from "@/lib/catalogo";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/servidor";
import { FORMATOS, TIPOS, formatoPorId } from "@/formatos";
import { cerrarSesion } from "./acciones";

const AVISOS: Record<string, { texto: string; error?: boolean }> = {
  ok: { texto: "Pago recibido. Los créditos aparecen en unos segundos; recarga la página si aún no los ves." },
  cancelado: { texto: "Has cancelado el pago. No se ha cobrado nada." },
  producto: { texto: "Ese producto no existe. Elige un plan o una recarga de esta página.", error: true },
  perfil: { texto: "No encontramos tu perfil. Cierra sesión y vuelve a entrar.", error: true },
  recarga_solo_suscriptores: { texto: "Las recargas son para suscriptores. Elige primero un plan.", error: true },
  ya_suscrito: { texto: "Ya tienes un plan. Para cambiarlo, entra en «Gestionar suscripción».", error: true },
  sin_suscripcion: { texto: "Todavía no tienes suscripción. Elige un plan para empezar.", error: true },
};

const ESTADOS: Record<string, { texto: string; clase: string }> = {
  pendiente: { texto: "En cola", clase: "text-suave border-borde" },
  procesando: { texto: "Generando", clase: "text-aviso border-aviso" },
  completado: { texto: "Listo", clase: "text-ok border-ok" },
  fallido: { texto: "Falló · créditos devueltos", clase: "text-error border-error" },
};

const numero = (n: number) => n.toLocaleString("es-ES");

export default async function Panel({ searchParams }: PageProps<"/panel">) {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Primer acceso: crea el perfil y da los créditos de bienvenida (una sola vez).
  const { error: errorPerfil } = await crearClienteAdmin().rpc("asegurar_perfil", {
    p_usuario: user.id,
    p_email: user.email,
    p_bienvenida: CREDITOS_BIENVENIDA,
  });
  if (errorPerfil) throw new Error(errorPerfil.message);

  const [perfil, saldo, precios, videos] = await Promise.all([
    supabase.from("perfiles").select("plan").eq("id", user.id).single(),
    supabase.from("saldos").select("mensual, extra, total").eq("usuario_id", user.id).maybeSingle(),
    supabase.from("formatos").select("id, creditos, solo_pro"),
    supabase
      .from("videos")
      .select("id, formato_id, estado, creditos, creado_en")
      .order("creado_en", { ascending: false })
      .limit(10),
  ]);

  const plan = PLANES[(perfil.data?.plan ?? "gratis") as PlanId];
  const { mensual = 0, extra = 0, total = 0 } = saldo.data ?? {};
  const precioDe = new Map((precios.data ?? []).map((f) => [f.id as string, f]));
  const porcentajeMensual = total > 0 ? Math.round((mensual / total) * 100) : 0;

  const { pago, error } = await searchParams;
  const aviso = AVISOS[String(pago ?? error ?? "")];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 pb-16 sm:px-6">
      <header className="flex flex-wrap items-center justify-between gap-4 py-5">
        <Link href="/" className="font-titular text-xl tracking-wide uppercase">
          {NOMBRE_APP}
        </Link>
        <div className="flex items-center gap-4 text-sm text-suave">
          <span className="hidden sm:inline">{user.email}</span>
          <form action={cerrarSesion}>
            <button className="font-semibold text-texto hover:underline">Cerrar sesión</button>
          </form>
        </div>
      </header>

      {aviso && (
        <p
          role={aviso.error ? "alert" : "status"}
          className={`rounded-lg p-3 text-sm ${aviso.error ? "bg-error-fondo text-error" : "bg-ok-fondo text-ok"}`}
        >
          {aviso.texto}
        </p>
      )}

      <section className="mt-6 grid gap-8 rounded-xl border border-borde bg-superficie p-5 sm:grid-cols-[1fr_auto] sm:p-6">
        <div>
          <h1 className="text-sm font-semibold text-suave">Créditos disponibles</h1>
          <p className="mt-1 font-titular text-6xl tabular-nums">{numero(total)}</p>
          <div className="mt-4 flex h-2 max-w-md overflow-hidden rounded-full bg-borde" aria-hidden="true">
            <span className="bg-acento" style={{ width: `${porcentajeMensual}%` }} />
            <span className="bg-suave/50" style={{ width: `${100 - porcentajeMensual}%` }} />
          </div>
          <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm tabular-nums">
            <div className="flex gap-1.5">
              <dt className="text-suave">Del plan:</dt>
              <dd className="font-semibold">{numero(mensual)}</dd>
              <dd className="text-suave">(caducan al renovar)</dd>
            </div>
            <div className="flex gap-1.5">
              <dt className="text-suave">Extra:</dt>
              <dd className="font-semibold">{numero(extra)}</dd>
              <dd className="text-suave">(no caducan)</dd>
            </div>
          </dl>
        </div>

        <div className="flex flex-col gap-3 sm:items-end">
          <p className="text-sm text-suave">
            Plan <span className="rounded-full border border-texto px-2.5 py-0.5 font-semibold text-texto">{plan.nombre}</span>
          </p>
          {plan.id === "gratis" ? (
            PLANES_DE_PAGO.map((p) => (
              <form key={p.id} action="/api/checkout" method="post">
                <input type="hidden" name="producto" value={p.id} />
                <button className="w-full rounded-full bg-acento px-5 py-2.5 text-sm font-semibold text-sobre-acento hover:brightness-95 sm:w-auto">
                  {p.nombre}: {numero(p.creditosMensuales)} créditos/mes · {p.precioEuros} €
                </button>
              </form>
            ))
          ) : (
            <>
              <form action="/api/checkout" method="post">
                <input type="hidden" name="producto" value="recarga" />
                <button className="w-full rounded-full bg-acento px-5 py-2.5 text-sm font-semibold text-sobre-acento hover:brightness-95 sm:w-auto">
                  Recargar {numero(RECARGA.creditos)} créditos · {RECARGA.precioEuros} €
                </button>
              </form>
              <form action="/api/portal" method="post">
                <button className="w-full rounded-full border border-texto px-5 py-2.5 text-sm font-semibold hover:bg-fondo sm:w-auto">
                  Gestionar suscripción
                </button>
              </form>
            </>
          )}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-bold">Formatos</h2>
          <p className="text-sm text-suave">La generación de vídeos se activa muy pronto.</p>
        </div>
        <ul className="mt-4 divide-y divide-borde border-y border-borde">
          {FORMATOS.map((formato) => {
            const precio = precioDe.get(formato.id);
            return (
              <li key={formato.id} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <h3 className="font-semibold">
                    {formato.nombre}
                    {precio?.solo_pro && <span className="ml-2 text-xs font-normal text-aviso">Solo Pro</span>}
                  </h3>
                  <p className="mt-0.5 text-sm text-suave">
                    {TIPOS[formato.tipo]} · {formato.descripcion}
                  </p>
                </div>
                <span className="shrink-0 text-right text-sm tabular-nums">
                  <span className="font-semibold">{precio ? numero(precio.creditos) : "—"}</span>
                  <span className="block text-xs text-suave">créditos</span>
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-bold">Tus vídeos</h2>
        {videos.data?.length ? (
          <ul className="mt-4 divide-y divide-borde border-y border-borde">
            {videos.data.map((v) => {
              const estado = ESTADOS[v.estado] ?? ESTADOS.pendiente;
              return (
                <li key={v.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span className="font-semibold">{formatoPorId(v.formato_id)?.nombre ?? v.formato_id}</span>
                  <span className="flex items-center gap-3 tabular-nums">
                    <span className="text-suave">{numero(v.creditos)} créditos</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-semibold ${estado.clase}`}>
                      {estado.texto}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-4 text-sm text-suave">
            Aún no has generado vídeos. Cuando se active la generación, aparecerán aquí con su estado.
          </p>
        )}
      </section>
    </main>
  );
}
