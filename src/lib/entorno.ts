// Variables de entorno. Las NEXT_PUBLIC_* se escriben literalmente para que
// Next.js las incluya en el código del navegador.

function requerida(nombre: string, valor: string | undefined): string {
  if (!valor) {
    throw new Error(`Falta la variable de entorno ${nombre}. Mira .env.example.`);
  }
  return valor;
}

export const urlSitio = () =>
  requerida("NEXT_PUBLIC_SITE_URL", process.env.NEXT_PUBLIC_SITE_URL).replace(/\/$/, "");

export const urlSupabase = () =>
  requerida("NEXT_PUBLIC_SUPABASE_URL", process.env.NEXT_PUBLIC_SUPABASE_URL);

export const clavePublicaSupabase = () =>
  requerida("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY", process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);

export const claveSecretaSupabase = () =>
  requerida("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY);

export const claveSecretaStripe = () =>
  requerida("STRIPE_SECRET_KEY", process.env.STRIPE_SECRET_KEY);

export const secretoWebhookStripe = () =>
  requerida("STRIPE_WEBHOOK_SECRET", process.env.STRIPE_WEBHOOK_SECRET);

// Stripe Tax: activar cuando esté configurado en el panel de Stripe (fase 5).
export const impuestosAutomaticos = () => process.env.STRIPE_IMPUESTOS_AUTOMATICOS === "true";
