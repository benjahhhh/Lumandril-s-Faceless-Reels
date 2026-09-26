// Prueba el webhook de Stripe de punta a punta contra la base de datos real
// (PGlite con la migración). Stripe y el cliente de Supabase se sustituyen
// por dobles mínimos: Stripe devuelve el evento tal cual y Supabase ejecuta SQL.

import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it, vi } from "vitest";

const doble = vi.hoisted(() => ({
  db: undefined as unknown as import("@electric-sql/pglite").PGlite,
  suscripciones: {} as Record<string, unknown>,
}));

vi.mock("@/lib/stripe", () => ({
  stripe: () => ({
    webhooks: {
      constructEventAsync: async (cuerpo: string, firma: string) => {
        if (firma !== "firma-valida") throw new Error("firma no válida");
        return JSON.parse(cuerpo);
      },
    },
    subscriptions: {
      retrieve: async (id: string) => doble.suscripciones[id],
    },
  }),
}));

vi.mock("@/lib/supabase/admin", () => ({
  crearClienteAdmin: () => ({
    async rpc(funcion: string, args: Record<string, unknown>) {
      const claves = Object.keys(args);
      const sql = `select public.${funcion}(${claves.map((k, i) => `${k} => $${i + 1}`).join(", ")}) as r`;
      try {
        const { rows } = await doble.db.query<{ r: unknown }>(sql, Object.values(args));
        return { data: rows[0].r, error: null };
      } catch (e) {
        return { data: null, error: { message: (e as Error).message } };
      }
    },
    from(tabla: string) {
      return {
        select: (columnas: string) => ({
          eq: (columna: string, valor: unknown) => ({
            async maybeSingle() {
              const { rows } = await doble.db.query(
                `select ${columnas} from public.${tabla} where ${columna} = $1`,
                [valor],
              );
              return { data: rows[0] ?? null, error: null };
            },
          }),
        }),
        update: (valores: Record<string, unknown>) => ({
          async eq(columna: string, valor: unknown) {
            const claves = Object.keys(valores);
            await doble.db.query(
              `update public.${tabla} set ${claves.map((k, i) => `${k} = $${i + 1}`).join(", ")} where ${columna} = $${claves.length + 1}`,
              [...Object.values(valores), valor],
            );
            return { error: null };
          },
        }),
      };
    },
  }),
}));

process.env.STRIPE_WEBHOOK_SECRET = "whsec_prueba";
const { POST } = await import("@/app/api/stripe/webhook/route");

const DIR_MIGRACIONES = join(__dirname, "..", "supabase", "migrations");
const ANA = "00000000-0000-0000-0000-00000000000a";

function enviar(evento: unknown, firma = "firma-valida") {
  return POST(
    new Request("http://localhost/api/stripe/webhook", {
      method: "POST",
      headers: { "stripe-signature": firma },
      body: JSON.stringify(evento),
    }),
  );
}

const facturaPagada = (id: string, suscripcion = "sub_1") => ({
  id: `evt_${id}`,
  type: "invoice.paid",
  data: {
    object: {
      id,
      customer: "cus_1",
      parent: { subscription_details: { subscription: suscripcion, metadata: {} } },
    },
  },
});

async function saldo() {
  const { rows } = await doble.db.query<{ mensual: number; extra: number }>(
    "select mensual, extra from public.saldo_de($1)",
    [ANA],
  );
  return rows[0];
}

async function perfil() {
  const { rows } = await doble.db.query<{ plan: string; stripe_subscription_id: string | null }>(
    "select plan, stripe_subscription_id from public.perfiles where id = $1",
    [ANA],
  );
  return rows[0];
}

beforeEach(async () => {
  doble.db = new PGlite();
  await doble.db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth;
    create table auth.users (id uuid primary key, email text);
    create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
  `);
  for (const f of readdirSync(DIR_MIGRACIONES).filter((f) => f.endsWith(".sql")).sort()) {
    await doble.db.exec(readFileSync(join(DIR_MIGRACIONES, f), "utf8"));
  }
  await doble.db.query("insert into auth.users (id, email) values ($1, 'ana@ejemplo.com')", [ANA]);
  await doble.db.query("select public.asegurar_perfil($1, 'ana@ejemplo.com', 60)", [ANA]);
  await doble.db.query("update public.perfiles set stripe_customer_id = 'cus_1' where id = $1", [ANA]);

  doble.suscripciones = {
    sub_1: { id: "sub_1", metadata: { usuario_id: ANA }, items: { data: [{ price: { lookup_key: "creador_mensual" } }] } },
    sub_rara: { id: "sub_rara", metadata: {}, items: { data: [{ price: { lookup_key: "otra_cosa" } }] } },
  };
});

describe("webhook de Stripe", () => {
  it("rechaza eventos sin firma válida", async () => {
    const respuesta = await enviar(facturaPagada("in_1"), "firma-falsa");
    expect(respuesta.status).toBe(400);
    expect(await saldo()).toEqual({ mensual: 0, extra: 60 });
  });

  it("al pagar la primera factura da los créditos del plan", async () => {
    expect((await enviar(facturaPagada("in_1"))).status).toBe(200);
    expect(await saldo()).toEqual({ mensual: 1000, extra: 60 });
    expect(await perfil()).toEqual({ plan: "creador", stripe_subscription_id: "sub_1" });
  });

  it("si Stripe repite el evento no da créditos dos veces", async () => {
    await enviar(facturaPagada("in_1"));
    await enviar(facturaPagada("in_1"));
    expect(await saldo()).toEqual({ mensual: 1000, extra: 60 });
  });

  it("en la renovación caducan los créditos del mes anterior", async () => {
    await enviar(facturaPagada("in_1"));
    await doble.db.query("select public.reservar_creditos($1, 'terror', '{}'::jsonb, 30)", [ANA]);
    await enviar(facturaPagada("in_2"));
    expect(await saldo()).toEqual({ mensual: 1000, extra: 60 });
  });

  it("devuelve 500 si el precio no es de ningún plan, para que Stripe reintente", async () => {
    const respuesta = await enviar(facturaPagada("in_1", "sub_rara"));
    expect(respuesta.status).toBe(500);
    expect(await saldo()).toEqual({ mensual: 0, extra: 60 });
  });

  it("una recarga pagada suma 500 extra una sola vez", async () => {
    const evento = {
      id: "evt_cs_1",
      type: "checkout.session.completed",
      data: {
        object: { id: "cs_1", mode: "payment", payment_status: "paid", metadata: { usuario_id: ANA, producto: "recarga" } },
      },
    };
    await enviar(evento);
    await enviar(evento);
    expect(await saldo()).toEqual({ mensual: 0, extra: 560 });
  });

  it("una recarga con pago aún pendiente no da créditos", async () => {
    await enviar({
      id: "evt_cs_2",
      type: "checkout.session.completed",
      data: {
        object: { id: "cs_2", mode: "payment", payment_status: "unpaid", metadata: { usuario_id: ANA, producto: "recarga" } },
      },
    });
    expect(await saldo()).toEqual({ mensual: 0, extra: 60 });
  });

  it("al terminar la suscripción vuelve a gratis y caducan los créditos del plan", async () => {
    await enviar(facturaPagada("in_1"));
    await enviar({
      id: "evt_del",
      type: "customer.subscription.deleted",
      data: { object: { id: "sub_1", customer: "cus_1", metadata: { usuario_id: ANA } } },
    });
    expect(await saldo()).toEqual({ mensual: 0, extra: 60 });
    expect(await perfil()).toEqual({ plan: "gratis", stripe_subscription_id: null });
  });
});
