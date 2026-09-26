-- Créditos prepago: perfiles, formatos, movimientos y vídeos.
--
-- Reglas:
--   * El saldo es la suma de `movimientos_creditos`. Nunca se edita un movimiento.
--   * Dos bolsas: 'mensual' (créditos del plan, caducan en cada renovación)
--     y 'extra' (bienvenida y recargas, no caducan).
--   * Al generar se reserva primero de la bolsa mensual y luego de la extra.
--   * Si el vídeo falla, se devuelven los créditos a la misma bolsa.
--   * Todas las funciones que tocan créditos son idempotentes por `referencia`
--     y solo las puede ejecutar el servidor (service_role).

-- Formatos: el nombre y la plantilla viven en el código (src/formatos);
-- aquí solo el precio en créditos, para cambiarlo sin desplegar.
create table public.formatos (
  id text primary key,
  creditos integer not null check (creditos > 0),
  solo_pro boolean not null default false,
  activo boolean not null default true
);

create table public.perfiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  plan text not null default 'gratis' check (plan in ('gratis', 'creador', 'pro')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  creado_en timestamptz not null default now()
);

create table public.movimientos_creditos (
  id bigint generated always as identity primary key,
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  bolsa text not null check (bolsa in ('mensual', 'extra')),
  cantidad integer not null check (cantidad <> 0),
  motivo text not null check (
    motivo in ('bienvenida', 'plan_mensual', 'caducidad', 'recarga', 'reserva', 'devolucion', 'ajuste')
  ),
  referencia text,
  creado_en timestamptz not null default now()
);

create index movimientos_creditos_usuario on public.movimientos_creditos (usuario_id);

-- Evita dar o quitar créditos dos veces por el mismo evento (webhook repetido, reintento...).
create unique index movimientos_creditos_idempotencia
  on public.movimientos_creditos (motivo, bolsa, referencia)
  where referencia is not null;

create table public.videos (
  id uuid primary key default gen_random_uuid(),
  usuario_id uuid not null references public.perfiles (id) on delete cascade,
  formato_id text not null references public.formatos (id),
  estado text not null default 'pendiente'
    check (estado in ('pendiente', 'procesando', 'completado', 'fallido')),
  creditos integer not null check (creditos > 0),
  creditos_mensual integer not null default 0,
  creditos_extra integer not null default 0,
  opciones jsonb not null default '{}'::jsonb,
  coste_real_usd numeric(10, 4),
  error text,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

create index videos_usuario_fecha on public.videos (usuario_id, creado_en desc);

-- Saldo por bolsa. security_invoker: cada usuario solo ve el suyo (RLS).
create view public.saldos with (security_invoker = true) as
select
  usuario_id,
  coalesce(sum(cantidad) filter (where bolsa = 'mensual'), 0)::integer as mensual,
  coalesce(sum(cantidad) filter (where bolsa = 'extra'), 0)::integer as extra,
  coalesce(sum(cantidad), 0)::integer as total
from public.movimientos_creditos
group by usuario_id;

-- ---------------------------------------------------------------------------
-- Seguridad: los usuarios solo leen lo suyo; escribir solo desde el servidor.
-- ---------------------------------------------------------------------------

alter table public.formatos enable row level security;
alter table public.perfiles enable row level security;
alter table public.movimientos_creditos enable row level security;
alter table public.videos enable row level security;

create policy "formatos activos visibles" on public.formatos
  for select to anon, authenticated using (activo);

create policy "ver mi perfil" on public.perfiles
  for select to authenticated using ((select auth.uid()) = id);

create policy "ver mis movimientos" on public.movimientos_creditos
  for select to authenticated using ((select auth.uid()) = usuario_id);

create policy "ver mis videos" on public.videos
  for select to authenticated using ((select auth.uid()) = usuario_id);

-- ---------------------------------------------------------------------------
-- Funciones (solo servidor)
-- ---------------------------------------------------------------------------

-- Crea el perfil si no existe y da los créditos de bienvenida una sola vez.
create function public.asegurar_perfil(p_usuario uuid, p_email text, p_bienvenida integer)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.perfiles (id, email)
  values (p_usuario, p_email)
  on conflict (id) do nothing;

  if p_bienvenida > 0 then
    insert into public.movimientos_creditos (usuario_id, bolsa, cantidad, motivo, referencia)
    values (p_usuario, 'extra', p_bienvenida, 'bienvenida', p_usuario::text)
    on conflict do nothing;
  end if;
end;
$$;

-- Saldo de un usuario por bolsa. Llamar con la fila del perfil bloqueada
-- si el resultado se va a usar para gastar.
create function public.saldo_de(p_usuario uuid, out mensual integer, out extra integer)
language sql
stable
security definer
set search_path = ''
as $$
  select
    coalesce(sum(cantidad) filter (where bolsa = 'mensual'), 0)::integer,
    coalesce(sum(cantidad) filter (where bolsa = 'extra'), 0)::integer
  from public.movimientos_creditos
  where usuario_id = p_usuario;
$$;

-- Reserva los créditos de un formato y crea el vídeo en estado 'pendiente'.
-- Errores posibles (en el mensaje): usuario_no_existe, formato_no_disponible,
-- solo_pro, limite_diario, saldo_insuficiente.
create function public.reservar_creditos(
  p_usuario uuid,
  p_formato text,
  p_opciones jsonb,
  p_limite_diario integer
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan text;
  v_formato public.formatos%rowtype;
  v_mensual integer;
  v_extra integer;
  v_de_mensual integer;
  v_de_extra integer;
  v_hoy integer;
  v_video uuid;
begin
  -- Bloquear el perfil serializa las reservas del mismo usuario:
  -- dos clics a la vez no pueden gastar el mismo saldo.
  select plan into v_plan from public.perfiles where id = p_usuario for update;
  if not found then
    raise exception 'usuario_no_existe';
  end if;

  select * into v_formato from public.formatos where id = p_formato;
  if not found or not v_formato.activo then
    raise exception 'formato_no_disponible';
  end if;

  if v_formato.solo_pro and v_plan <> 'pro' then
    raise exception 'solo_pro';
  end if;

  select count(*) into v_hoy
  from public.videos
  where usuario_id = p_usuario and creado_en >= now() - interval '24 hours';
  if v_hoy >= p_limite_diario then
    raise exception 'limite_diario';
  end if;

  select s.mensual, s.extra into v_mensual, v_extra from public.saldo_de(p_usuario) s;
  if v_mensual + v_extra < v_formato.creditos then
    raise exception 'saldo_insuficiente';
  end if;

  v_de_mensual := least(greatest(v_mensual, 0), v_formato.creditos);
  v_de_extra := v_formato.creditos - v_de_mensual;

  insert into public.videos (usuario_id, formato_id, creditos, creditos_mensual, creditos_extra, opciones)
  values (p_usuario, p_formato, v_formato.creditos, v_de_mensual, v_de_extra, coalesce(p_opciones, '{}'::jsonb))
  returning id into v_video;

  if v_de_mensual > 0 then
    insert into public.movimientos_creditos (usuario_id, bolsa, cantidad, motivo, referencia)
    values (p_usuario, 'mensual', -v_de_mensual, 'reserva', v_video::text);
  end if;
  if v_de_extra > 0 then
    insert into public.movimientos_creditos (usuario_id, bolsa, cantidad, motivo, referencia)
    values (p_usuario, 'extra', -v_de_extra, 'reserva', v_video::text);
  end if;

  return v_video;
end;
$$;

-- Cierra un vídeo. Si falló, devuelve los créditos reservados.
-- Idempotente: llamar dos veces no devuelve dos veces.
create function public.finalizar_video(
  p_video uuid,
  p_ok boolean,
  p_coste_real_usd numeric,
  p_error text
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v public.videos%rowtype;
begin
  select * into v from public.videos where id = p_video for update;
  if not found then
    raise exception 'video_no_existe';
  end if;
  if v.estado in ('completado', 'fallido') then
    return;
  end if;

  update public.videos
  set estado = case when p_ok then 'completado' else 'fallido' end,
      coste_real_usd = p_coste_real_usd,
      error = case when p_ok then null else p_error end,
      actualizado_en = now()
  where id = p_video;

  if not p_ok then
    if v.creditos_mensual > 0 then
      insert into public.movimientos_creditos (usuario_id, bolsa, cantidad, motivo, referencia)
      values (v.usuario_id, 'mensual', v.creditos_mensual, 'devolucion', p_video::text)
      on conflict do nothing;
    end if;
    if v.creditos_extra > 0 then
      insert into public.movimientos_creditos (usuario_id, bolsa, cantidad, motivo, referencia)
      values (v.usuario_id, 'extra', v.creditos_extra, 'devolucion', p_video::text)
      on conflict do nothing;
    end if;
  end if;
end;
$$;

-- Renovación o alta de plan (una factura pagada): caducan los créditos
-- mensuales que queden y se dan los del plan. Devuelve false si esa
-- factura ya se había procesado.
create function public.conceder_plan_mensual(
  p_usuario uuid,
  p_plan text,
  p_creditos integer,
  p_referencia text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_mensual integer;
begin
  perform 1 from public.perfiles where id = p_usuario for update;
  if not found then
    raise exception 'usuario_no_existe';
  end if;

  if exists (
    select 1 from public.movimientos_creditos
    where motivo = 'plan_mensual' and bolsa = 'mensual' and referencia = p_referencia
  ) then
    return false;
  end if;

  select s.mensual into v_mensual from public.saldo_de(p_usuario) s;
  if v_mensual > 0 then
    insert into public.movimientos_creditos (usuario_id, bolsa, cantidad, motivo, referencia)
    values (p_usuario, 'mensual', -v_mensual, 'caducidad', p_referencia);
  end if;

  insert into public.movimientos_creditos (usuario_id, bolsa, cantidad, motivo, referencia)
  values (p_usuario, 'mensual', p_creditos, 'plan_mensual', p_referencia);

  update public.perfiles set plan = p_plan where id = p_usuario;
  return true;
end;
$$;

-- Recargas y ajustes manuales en la bolsa extra. Devuelve false si ya se aplicó.
create function public.anadir_creditos_extra(
  p_usuario uuid,
  p_cantidad integer,
  p_motivo text,
  p_referencia text
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_filas integer;
begin
  if p_motivo not in ('recarga', 'ajuste') then
    raise exception 'motivo_no_valido';
  end if;

  insert into public.movimientos_creditos (usuario_id, bolsa, cantidad, motivo, referencia)
  values (p_usuario, 'extra', p_cantidad, p_motivo, p_referencia)
  on conflict do nothing;

  get diagnostics v_filas = row_count;
  return v_filas > 0;
end;
$$;

-- Fin de la suscripción: caducan los créditos mensuales y el plan pasa a gratis.
create function public.terminar_plan(p_usuario uuid, p_referencia text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_mensual integer;
begin
  perform 1 from public.perfiles where id = p_usuario for update;
  if not found then
    return;
  end if;

  select s.mensual into v_mensual from public.saldo_de(p_usuario) s;
  if v_mensual > 0 then
    insert into public.movimientos_creditos (usuario_id, bolsa, cantidad, motivo, referencia)
    values (p_usuario, 'mensual', -v_mensual, 'caducidad', p_referencia)
    on conflict do nothing;
  end if;

  update public.perfiles
  set plan = 'gratis', stripe_subscription_id = null
  where id = p_usuario;
end;
$$;

revoke execute on function
  public.asegurar_perfil(uuid, text, integer),
  public.saldo_de(uuid),
  public.reservar_creditos(uuid, text, jsonb, integer),
  public.finalizar_video(uuid, boolean, numeric, text),
  public.conceder_plan_mensual(uuid, text, integer, text),
  public.anadir_creditos_extra(uuid, integer, text, text),
  public.terminar_plan(uuid, text)
from public, anon, authenticated;

grant execute on function
  public.asegurar_perfil(uuid, text, integer),
  public.saldo_de(uuid),
  public.reservar_creditos(uuid, text, jsonb, integer),
  public.finalizar_video(uuid, boolean, numeric, text),
  public.conceder_plan_mensual(uuid, text, integer, text),
  public.anadir_creditos_extra(uuid, integer, text, text),
  public.terminar_plan(uuid, text)
to service_role;

-- ---------------------------------------------------------------------------
-- Precios iniciales (créditos = coste máximo en $ / 0,005). Ver docs/plan-tecnico-y-cobro.md §4.
-- ---------------------------------------------------------------------------

insert into public.formatos (id, creditos, solo_pro) values
  ('chat-whatsapp', 50, false),
  ('historia-reddit', 50, false),
  ('quiz', 50, false),
  ('terror', 140, false),
  ('frutinovela-estandar', 200, false),
  ('frutinovela-cine', 400, false);
