import type Stripe from "stripe";
import { planPorClaveStripe, RECARGA } from "@/lib/catalogo";
import { secretoWebhookStripe } from "@/lib/entorno";
import { stripe } from "@/lib/stripe";
import { crearClienteAdmin } from "@/lib/supabase/admin";

// Stripe avisa aquí de cada pago. Los créditos SOLO se dan desde este archivo.
// Si algo falla devolvemos 500 y Stripe reintenta; las funciones SQL son
// idempotentes, así que un reintento nunca da créditos dos veces.

type Admin = ReturnType<typeof crearClienteAdmin>;

function idDe(valor: string | { id: string } | null | undefined) {
  return typeof valor === "string" ? valor : valor?.id;
}

async function usuarioPorCliente(admin: Admin, cliente: string | undefined, respaldo?: string) {
  if (cliente) {
    const { data } = await admin.from("perfiles").select("id").eq("stripe_customer_id", cliente).maybeSingle();
    if (data) return data.id as string;
  }
  return respaldo;
}

async function rpc(admin: Admin, funcion: string, args: Record<string, unknown>) {
  const { data, error } = await admin.rpc(funcion, args);
  if (error) throw new Error(`${funcion}: ${error.message}`);
  return data;
}

// Alta y cada renovación del plan: caducan los créditos del mes y se dan los nuevos.
async function alPagarFactura(admin: Admin, factura: Stripe.Invoice) {
  const idSuscripcion = idDe(factura.parent?.subscription_details?.subscription);
  if (!idSuscripcion) return;

  const suscripcion = await stripe().subscriptions.retrieve(idSuscripcion);
  const plan = planPorClaveStripe(suscripcion.items.data[0]?.price.lookup_key);
  if (!plan) throw new Error(`Suscripción ${idSuscripcion} con un precio que no es de ningún plan`);

  const usuario = await usuarioPorCliente(admin, idDe(factura.customer), suscripcion.metadata.usuario_id);
  if (!usuario) throw new Error(`Factura ${factura.id} sin usuario`);

  await rpc(admin, "conceder_plan_mensual", {
    p_usuario: usuario,
    p_plan: plan.id,
    p_creditos: plan.creditosMensuales,
    p_referencia: factura.id,
  });

  const { error } = await admin
    .from("perfiles")
    .update({ stripe_subscription_id: idSuscripcion })
    .eq("id", usuario);
  if (error) throw new Error(error.message);
}

// Recargas (pago único).
async function alCompletarPago(admin: Admin, sesion: Stripe.Checkout.Session) {
  if (sesion.mode !== "payment" || sesion.payment_status !== "paid") return;
  if (sesion.metadata?.producto !== "recarga") return;

  const usuario = sesion.metadata.usuario_id;
  if (!usuario) throw new Error(`Checkout ${sesion.id} sin usuario`);

  await rpc(admin, "anadir_creditos_extra", {
    p_usuario: usuario,
    p_cantidad: RECARGA.creditos,
    p_motivo: "recarga",
    p_referencia: sesion.id,
  });
}

async function alTerminarSuscripcion(admin: Admin, suscripcion: Stripe.Subscription) {
  const usuario = await usuarioPorCliente(admin, idDe(suscripcion.customer), suscripcion.metadata.usuario_id);
  if (!usuario) return;
  await rpc(admin, "terminar_plan", { p_usuario: usuario, p_referencia: suscripcion.id });
}

export async function POST(request: Request) {
  const firma = request.headers.get("stripe-signature");
  if (!firma) return new Response("Falta la firma", { status: 400 });

  let evento: Stripe.Event;
  try {
    evento = await stripe().webhooks.constructEventAsync(await request.text(), firma, secretoWebhookStripe());
  } catch {
    return new Response("Firma no válida", { status: 400 });
  }

  const admin = crearClienteAdmin();
  try {
    switch (evento.type) {
      case "invoice.paid":
        await alPagarFactura(admin, evento.data.object);
        break;
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded":
        await alCompletarPago(admin, evento.data.object);
        break;
      case "customer.subscription.deleted":
        await alTerminarSuscripcion(admin, evento.data.object);
        break;
    }
  } catch (error) {
    console.error(`Webhook ${evento.type} (${evento.id}) falló:`, error);
    return new Response("Error procesando el evento", { status: 500 });
  }

  return Response.json({ recibido: true });
}
