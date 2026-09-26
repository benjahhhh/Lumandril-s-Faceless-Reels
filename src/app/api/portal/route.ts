import { NextResponse } from "next/server";
import { urlSitio } from "@/lib/entorno";
import { configuracionPortal, stripe } from "@/lib/stripe";
import { crearClienteAdmin } from "@/lib/supabase/admin";
import { crearClienteServidor } from "@/lib/supabase/servidor";

// "Gestionar suscripción" → portal de Stripe (cambiar plan, tarjeta, cancelar, facturas).
export async function POST() {
  const supabase = await crearClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.redirect(`${urlSitio()}/login`, 303);
  }

  const { data: perfil } = await crearClienteAdmin()
    .from("perfiles")
    .select("stripe_customer_id")
    .eq("id", user.id)
    .single();
  if (!perfil?.stripe_customer_id) {
    return NextResponse.redirect(`${urlSitio()}/panel?error=sin_suscripcion`, 303);
  }

  const sesion = await stripe().billingPortal.sessions.create({
    customer: perfil.stripe_customer_id,
    return_url: `${urlSitio()}/panel`,
    configuration: await configuracionPortal(),
    locale: "es",
  });
  return NextResponse.redirect(sesion.url, 303);
}
