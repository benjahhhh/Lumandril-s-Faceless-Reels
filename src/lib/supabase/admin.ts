import "server-only";
import { createClient } from "@supabase/supabase-js";
import { claveSecretaSupabase, urlSupabase } from "@/lib/entorno";

// Cliente con la clave secreta: salta RLS y puede ejecutar las funciones de créditos.
// Solo en el servidor, y siempre después de comprobar quién es el usuario.
export function crearClienteAdmin() {
  return createClient(urlSupabase(), claveSecretaSupabase(), {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
