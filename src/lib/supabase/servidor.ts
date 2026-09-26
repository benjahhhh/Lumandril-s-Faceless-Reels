import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { clavePublicaSupabase, urlSupabase } from "@/lib/entorno";

// Cliente con la sesión del usuario: respeta RLS (solo ve lo suyo).
// Crear uno nuevo en cada petición.
export async function crearClienteServidor() {
  const almacen = await cookies();

  return createServerClient(urlSupabase(), clavePublicaSupabase(), {
    cookies: {
      getAll() {
        return almacen.getAll();
      },
      setAll(cookiesNuevas) {
        try {
          cookiesNuevas.forEach(({ name, value, options }) => almacen.set(name, value, options));
        } catch {
          // Desde un Server Component no se pueden escribir cookies;
          // el proxy ya refresca la sesión en cada petición.
        }
      },
    },
  });
}
