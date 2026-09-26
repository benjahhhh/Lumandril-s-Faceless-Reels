import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { PLANES, RECARGA, type PlanId } from "@/lib/catalogo";
import { impuestosAutomaticos, urlSitio } from "@/lib/entorno";
import { precioPorClave, stripe } from "@/lib/stripe";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/servidor";

type Producto = Exclude<PlanId, "gratis"> | "recarga";

function volverAlPanel(parametros: string) {
  return NextResponse.redirect(`${urlSitio()}/panel?${parametros}`, 303);
}

// Formulario "Suscribirme" / "Comprar recarga" → página de pago de Stripe.
export async function POST(request: Request) {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${urlSitio()}/login`, 303);
  }

  const producto = (await request.formData()).get("producto") as Producto | null;
  if (producto !== "creador" && producto !== "pro" && producto !== "recarga") {
    return volverAlPanel("error=producto");
  }

  const admin = crearClienteAdmin();
  const { data: perfil, error } = await admin
    .from("perfiles")
    .select("plan, stripe_customer_id")
    .eq("id", user.id)
    .single();
  if (error || !perfil) {
    return volverAlPanel("error=perfil");
  }

  const esRecarga = producto === "recarga";
  if (esRecarga && perfil.plan === "gratis") {
    return volverAlPanel("error=recarga_solo_suscriptores");
  }
  if (!esRecarga && perfil.plan !== "gratis") {
    // Los cambios de plan se hacen desde el portal de Stripe.
    return volverAlPanel("error=ya_suscrito");
  }

  let cliente: string | null = perfil.stripe_customer_id;
  if (!cliente) {
    const nuevo = await stripe().customers.create(
      { email: user.email, metadata: { usuario_id: user.id } },
      { idempotencyKey: `cliente-${user.id}` },
    );
    cliente = nuevo.id;
    await admin.from("perfiles").update({ stripe_customer_id: cliente }).eq("id", user.id);
  }

  if (!esRecarga) {
    // El plan del perfil se actualiza cuando llega el webhook. Mientras tanto,
    // Stripe es quien sabe si ya hay una suscripción: evita pagar dos veces.
    const { data: activas } = await stripe().subscriptions.list({ customer: cliente, status: "active", limit: 1 });
    if (activas.length > 0) return volverAlPanel("error=ya_suscrito");
  }

  const precio = await precioPorClave(esRecarga ? RECARGA.claveStripe : PLANES[producto].claveStripe!);
  const metadatos = { usuario_id: user.id, producto };

  const parametros: Stripe.Checkout.SessionCreateParams = {
    mode: esRecarga ? "payment" : "subscription",
    customer: cliente,
    client_reference_id: user.id,
    line_items: [{ price: precio.id, quantity: 1 }],
    metadata: metadatos,
    locale: "es",
    allow_promotion_codes: true,
    success_url: `${urlSitio()}/panel?pago=ok`,
    cancel_url: `${urlSitio()}/panel?pago=cancelado`,
    ...(esRecarga
      ? { payment_intent_data: { metadata: metadatos } }
      : { subscription_data: { metadata: metadatos } }),
    ...(impuestosAutomaticos()
      ? {
          automatic_tax: { enabled: true },
          billing_address_collection: "required",
          customer_update: { address: "auto", name: "auto" },
        }
      : {}),
  };

  const sesion = await stripe().checkout.sessions.create(parametros);
  return NextResponse.redirect(sesion.url!, 303);
}
