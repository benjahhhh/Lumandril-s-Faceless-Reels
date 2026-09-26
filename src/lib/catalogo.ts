// Planes, recargas y reglas de créditos. Única fuente de verdad en el código:
// si cambias un precio aquí, ejecuta `npm run stripe:configurar` para crearlo en Stripe.
// El coste en créditos de cada formato vive en la base de datos (tabla `formatos`).

export const NOMBRE_APP = "Lumandril Reels";

export const CREDITOS_BIENVENIDA = 60;

export type PlanId = "gratis" | "creador" | "pro";

export type Plan = {
  id: PlanId;
  nombre: string;
  precioEuros: number;
  creditosMensuales: number;
  limiteDiario: number;
  // Clave del precio en Stripe; null para el plan gratis.
  claveStripe: string | null;
  ejemplo: string;
};

export const PLANES: Record<PlanId, Plan> = {
  gratis: {
    id: "gratis",
    nombre: "Gratis",
    precioEuros: 0,
    creditosMensuales: 0,
    limiteDiario: 3,
    claveStripe: null,
    ejemplo: `${CREDITOS_BIENVENIDA} créditos de regalo: 1 vídeo de plantilla`,
  },
  creador: {
    id: "creador",
    nombre: "Creador",
    precioEuros: 19,
    creditosMensuales: 1000,
    limiteDiario: 30,
    claveStripe: "creador_mensual",
    ejemplo: "20 vídeos de plantilla, 7 de terror o 2 frutinovelas Cine",
  },
  pro: {
    id: "pro",
    nombre: "Pro",
    precioEuros: 49,
    creditosMensuales: 3000,
    limiteDiario: 100,
    claveStripe: "pro_mensual",
    ejemplo: "60 vídeos de plantilla o 7 frutinovelas Cine, y modelos premium",
  },
};

export const PLANES_DE_PAGO = [PLANES.creador, PLANES.pro];

// Más cara por crédito que los planes a propósito: solo para suscriptores.
export const RECARGA = {
  nombre: "Recarga de 500 créditos",
  precioEuros: 12,
  creditos: 500,
  claveStripe: "recarga_500",
};

export function planPorClaveStripe(clave: string | null | undefined): Plan | undefined {
  return PLANES_DE_PAGO.find((p) => p.claveStripe === clave);
}
