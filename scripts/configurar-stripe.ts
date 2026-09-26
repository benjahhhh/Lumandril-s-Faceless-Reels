// Crea en Stripe los productos, precios y el portal de cliente del catálogo.
// Se puede ejecutar varias veces: lo que ya existe no se duplica.
//
//   STRIPE_SECRET_KEY=sk_test_... npm run stripe:configurar
//
// Si cambias un precio en src/lib/catalogo.ts, cambia también su claveStripe
// (p. ej. creador_mensual_v2): los precios de Stripe no se pueden editar.

import Stripe from "stripe";
import { NOMBRE_APP, PLANES_DE_PAGO, RECARGA } from "../src/lib/catalogo";

const METADATOS_PORTAL = { app: "lumandril-reels" }; // igual que en src/lib/stripe.ts

const clave = process.env.STRIPE_SECRET_KEY;
if (!clave) {
  console.error("Falta STRIPE_SECRET_KEY");
  process.exit(1);
}
const stripe = new Stripe(clave);

async function asegurarPrecio(opciones: {
  clave: string;
  nombre: string;
  centimos: number;
  mensual: boolean;
}) {
  const { data } = await stripe.prices.list({ lookup_keys: [opciones.clave], limit: 1 });
  if (data[0]) {
    console.log(`✓ ${opciones.clave} ya existe (${data[0].id})`);
    return data[0];
  }

  const producto = await stripe.products.create({ name: opciones.nombre });
  const precio = await stripe.prices.create({
    product: producto.id,
    currency: "eur",
    unit_amount: opciones.centimos,
    lookup_key: opciones.clave,
    tax_behavior: "inclusive", // precios con IVA incluido
    ...(opciones.mensual ? { recurring: { interval: "month" } } : {}),
  });
  console.log(`+ ${opciones.clave} creado (${precio.id})`);
  return precio;
}

async function main() {
  const precios = [];
  for (const plan of PLANES_DE_PAGO) {
    precios.push(
      await asegurarPrecio({
        clave: plan.claveStripe!,
        nombre: `${NOMBRE_APP} · Plan ${plan.nombre}`,
        centimos: plan.precioEuros * 100,
        mensual: true,
      }),
    );
  }

  await asegurarPrecio({
    clave: RECARGA.claveStripe,
    nombre: `${NOMBRE_APP} · ${RECARGA.nombre}`,
    centimos: RECARGA.precioEuros * 100,
    mensual: false,
  });

  const { data: configuraciones } = await stripe.billingPortal.configurations.list({ active: true, limit: 100 });
  if (configuraciones.some((c) => c.metadata?.app === METADATOS_PORTAL.app)) {
    console.log("✓ portal de cliente ya configurado");
    return;
  }

  await stripe.billingPortal.configurations.create({
    metadata: METADATOS_PORTAL,
    features: {
      customer_update: { enabled: true, allowed_updates: ["email", "address", "tax_id"] },
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: "at_period_end" },
      subscription_update: {
        enabled: true,
        default_allowed_updates: ["price"],
        // Cobrar la diferencia al momento: así el webhook da los créditos del plan nuevo.
        proration_behavior: "always_invoice",
        products: precios.map((p) => ({
          product: typeof p.product === "string" ? p.product : p.product.id,
          prices: [p.id],
        })),
      },
    },
  });
  console.log("+ portal de cliente configurado");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
