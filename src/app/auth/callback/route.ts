import { NextResponse } from "next/server";
import { crearClienteServidor } from "@/lib/supabase/servidor";

// Vuelta del login con Google o del enlace mágico por email.
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const codigo = searchParams.get("code");

  if (codigo) {
    const supabase = await crearClienteServidor();
    const { error } = await supabase.auth.exchangeCodeForSession(codigo);
    if (!error) {
      return NextResponse.redirect(`${origin}/panel`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=enlace`);
}
