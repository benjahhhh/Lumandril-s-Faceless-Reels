import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { beforeEach, describe, expect, it } from "vitest";

// Imita lo mínimo de Supabase que usa la migración: esquema auth y roles.
const PRELUDIO_SUPABASE = `
  create role anon;
  create role authenticated;
  create role service_role;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as $$ select null::uuid $$;
`;

const DIR_MIGRACIONES = join(__dirname, "..", "supabase", "migrations");
const migraciones = readdirSync(DIR_MIGRACIONES)
  .filter((f) => f.endsWith(".sql"))
  .sort()
  .map((f) => readFileSync(join(DIR_MIGRACIONES, f), "utf8"));

const ANA = "00000000-0000-0000-0000-00000000000a";
const LIMITE = 30;

let db: PGlite;

async function saldo(usuario = ANA) {
  const { rows } = await db.query<{ mensual: number; extra: number }>(
    "select mensual, extra from public.saldo_de($1)",
    [usuario],
  );
  return rows[0];
}

async function reservar(formato: string, limite = LIMITE, usuario = ANA) {
  const { rows } = await db.query<{ id: string }>(
    "select public.reservar_creditos($1, $2, '{}'::jsonb, $3) as id",
    [usuario, formato, limite],
  );
  return rows[0].id;
}

async function concederPlan(plan: string, creditos: number, factura: string) {
  const { rows } = await db.query<{ ok: boolean }>(
    "select public.conceder_plan_mensual($1, $2, $3, $4) as ok",
    [ANA, plan, creditos, factura],
  );
  return rows[0].ok;
}

async function finalizar(video: string, ok: boolean) {
  await db.query("select public.finalizar_video($1, $2, $3, $4)", [
    video,
    ok,
    ok ? 0.12 : null,
    ok ? null : "fallo de prueba",
  ]);
}

beforeEach(async () => {
  db = new PGlite();
  await db.exec(PRELUDIO_SUPABASE);
  for (const sql of migraciones) await db.exec(sql);
  await db.query("insert into auth.users (id, email) values ($1, 'ana@ejemplo.com')", [ANA]);
  await db.query("select public.asegurar_perfil($1, 'ana@ejemplo.com', 60)", [ANA]);
});

describe("bienvenida", () => {
  it("da 60 créditos extra una sola vez", async () => {
    await db.query("select public.asegurar_perfil($1, 'ana@ejemplo.com', 60)", [ANA]);
    expect(await saldo()).toEqual({ mensual: 0, extra: 60 });
  });
});

describe("reservar_creditos", () => {
  it("rechaza si no hay saldo suficiente y no crea vídeo", async () => {
    await expect(reservar("terror")).rejects.toThrow("saldo_insuficiente");
    const { rows } = await db.query("select * from public.videos");
    expect(rows).toHaveLength(0);
    expect(await saldo()).toEqual({ mensual: 0, extra: 60 });
  });

  it("gasta primero la bolsa mensual y luego la extra", async () => {
    await concederPlan("creador", 100, "in_1");
    await reservar("chat-whatsapp"); // 50 de mensual
    expect(await saldo()).toEqual({ mensual: 50, extra: 60 });
    await reservar("chat-whatsapp"); // 50 de mensual
    expect(await saldo()).toEqual({ mensual: 0, extra: 60 });
    await reservar("chat-whatsapp"); // 50 de extra
    expect(await saldo()).toEqual({ mensual: 0, extra: 10 });
  });

  it("parte la reserva entre bolsas cuando la mensual no llega", async () => {
    await concederPlan("creador", 30, "in_1");
    const video = await reservar("chat-whatsapp");
    const { rows } = await db.query<{ creditos_mensual: number; creditos_extra: number }>(
      "select creditos_mensual, creditos_extra from public.videos where id = $1",
      [video],
    );
    expect(rows[0]).toEqual({ creditos_mensual: 30, creditos_extra: 20 });
    expect(await saldo()).toEqual({ mensual: 0, extra: 40 });
  });

  it("bloquea formatos solo Pro para otros planes", async () => {
    await db.query("insert into public.formatos (id, creditos, solo_pro) values ('premium', 10, true)");
    await expect(reservar("premium")).rejects.toThrow("solo_pro");
    await concederPlan("pro", 3000, "in_1");
    await expect(reservar("premium")).resolves.toBeTypeOf("string");
  });

  it("bloquea formatos desactivados", async () => {
    await db.query("update public.formatos set activo = false where id = 'quiz'");
    await expect(reservar("quiz")).rejects.toThrow("formato_no_disponible");
  });

  it("respeta el límite diario de vídeos", async () => {
    await concederPlan("creador", 1000, "in_1");
    await reservar("quiz", 2);
    await reservar("quiz", 2);
    await expect(reservar("quiz", 2)).rejects.toThrow("limite_diario");
  });
});

describe("finalizar_video", () => {
  it("si falla devuelve los créditos a su bolsa, una sola vez", async () => {
    await concederPlan("creador", 30, "in_1");
    const video = await reservar("chat-whatsapp");
    await finalizar(video, false);
    await finalizar(video, false);
    expect(await saldo()).toEqual({ mensual: 30, extra: 60 });
    const { rows } = await db.query<{ estado: string }>("select estado from public.videos where id = $1", [video]);
    expect(rows[0].estado).toBe("fallido");
  });

  it("si termina bien mantiene el cobro y guarda el coste real", async () => {
    const video = await reservar("chat-whatsapp");
    await finalizar(video, true);
    await finalizar(video, false); // un fallo tardío no devuelve nada
    expect(await saldo()).toEqual({ mensual: 0, extra: 10 });
    const { rows } = await db.query<{ estado: string; coste_real_usd: string }>(
      "select estado, coste_real_usd from public.videos where id = $1",
      [video],
    );
    expect(rows[0]).toEqual({ estado: "completado", coste_real_usd: "0.1200" });
  });
});

describe("conceder_plan_mensual", () => {
  it("caducan los mensuales sobrantes, los extra se quedan", async () => {
    await concederPlan("creador", 1000, "in_1");
    await reservar("terror"); // 140 de mensual
    await concederPlan("creador", 1000, "in_2");
    expect(await saldo()).toEqual({ mensual: 1000, extra: 60 });
  });

  it("la misma factura no se procesa dos veces", async () => {
    expect(await concederPlan("creador", 1000, "in_1")).toBe(true);
    expect(await concederPlan("creador", 1000, "in_1")).toBe(false);
    expect(await saldo()).toEqual({ mensual: 1000, extra: 60 });
  });

  it("actualiza el plan del perfil", async () => {
    await concederPlan("pro", 3000, "in_1");
    const { rows } = await db.query<{ plan: string }>("select plan from public.perfiles where id = $1", [ANA]);
    expect(rows[0].plan).toBe("pro");
  });
});

describe("recargas y fin de plan", () => {
  it("una recarga suma a la bolsa extra una sola vez", async () => {
    const aplicar = () =>
      db.query<{ ok: boolean }>("select public.anadir_creditos_extra($1, 500, 'recarga', 'cs_1') as ok", [ANA]);
    expect((await aplicar()).rows[0].ok).toBe(true);
    expect((await aplicar()).rows[0].ok).toBe(false);
    expect(await saldo()).toEqual({ mensual: 0, extra: 560 });
  });

  it("al terminar el plan caducan los mensuales y vuelve a gratis", async () => {
    await concederPlan("pro", 3000, "in_1");
    await db.query("select public.terminar_plan($1, 'sub_1')", [ANA]);
    expect(await saldo()).toEqual({ mensual: 0, extra: 60 });
    const { rows } = await db.query<{ plan: string }>("select plan from public.perfiles where id = $1", [ANA]);
    expect(rows[0].plan).toBe("gratis");
  });
});
