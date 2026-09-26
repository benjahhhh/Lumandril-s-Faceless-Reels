import "server-only";
import Stripe from "stripe";
import { claveSecretaStripe } from "@/lib/entorno";

let cliente: Stripe | undefined;

export function stripe() {
  cliente ??= new Stripe(claveSecretaStripe());
  return cliente;
}

// Los precios se buscan por su clave (lookup_key), así no hay IDs de Stripe en el código.
export async function precioPorClave(clave: string) {
  const { data } = await stripe().prices.list({ lookup_keys: [clave], active: true, limit: 1 });
  const precio = data[0];
  if (!precio) {
    throw new Error(`No existe el precio "${clave}" en Stripe. Ejecuta npm run stripe:configurar.`);
  }
  return precio;
}

export const METADATOS_PORTAL = { app: "lumandril-reels" };

// Configuración del portal de cliente creada por scripts/configurar-stripe.ts.
export async function configuracionPortal() {
  const { data } = await stripe().billingPortal.configurations.list({ active: true, limit: 100 });
  return data.find((c) => c.metadata?.app === METADATOS_PORTAL.app)?.id;
}
