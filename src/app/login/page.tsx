import Link from "next/link";
import { CREDITOS_BIENVENIDA, NOMBRE_APP } from "@/lib/catalogo";
import { FormularioLogin } from "./FormularioLogin";

export default async function Login({ searchParams }: PageProps<"/login">) {
  const { error } = await searchParams;

  return (
    <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center px-4 py-16">
      <Link href="/" className="font-titular text-xl tracking-wide uppercase">
        {NOMBRE_APP}
      </Link>
      <h1 className="mt-8 text-2xl font-bold">Entra o crea tu cuenta</h1>
      <p className="mt-2 text-sm text-suave">Las cuentas nuevas reciben {CREDITOS_BIENVENIDA} créditos de regalo.</p>
      {error === "enlace" && (
        <p role="alert" className="mt-4 rounded-lg bg-error-fondo p-3 text-sm text-error">
          El enlace no es válido o ha caducado. Pide uno nuevo.
        </p>
      )}
      <FormularioLogin />
    </main>
  );
}
