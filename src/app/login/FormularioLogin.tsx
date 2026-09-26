"use client";

import { useState, type FormEvent } from "react";
import { crearClienteNavegador } from "@/lib/supabase/navegador";

type Estado = "inicio" | "enviando" | "enviado" | "error";

export function FormularioLogin() {
  const [email, setEmail] = useState("");
  const [estado, setEstado] = useState<Estado>("inicio");

  const vuelta = () => `${window.location.origin}/auth/callback`;

  async function conGoogle() {
    await crearClienteNavegador().auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: vuelta() },
    });
  }

  async function conEmail(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setEstado("enviando");
    const { error } = await crearClienteNavegador().auth.signInWithOtp({
      email,
      options: { emailRedirectTo: vuelta() },
    });
    setEstado(error ? "error" : "enviado");
  }

  if (estado === "enviado") {
    return (
      <p role="status" className="mt-8 rounded-lg border border-borde bg-superficie p-4 text-sm">
        Te hemos enviado un enlace a <strong>{email}</strong>. Ábrelo en este mismo dispositivo para entrar.
      </p>
    );
  }

  return (
    <div className="mt-8 flex flex-col gap-6">
      <button
        type="button"
        onClick={conGoogle}
        className="rounded-full bg-acento px-6 py-3 font-semibold text-sobre-acento hover:brightness-95"
      >
        Continuar con Google
      </button>

      <div className="flex items-center gap-3 text-xs text-suave">
        <span className="h-px flex-1 bg-borde" />o<span className="h-px flex-1 bg-borde" />
      </div>

      <form onSubmit={conEmail} className="flex flex-col gap-3">
        <label htmlFor="email" className="text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-lg border border-borde bg-superficie px-4 py-3"
          placeholder="tu@email.com"
        />
        <button
          type="submit"
          disabled={estado === "enviando"}
          className="rounded-full border border-texto px-6 py-3 font-semibold hover:bg-superficie disabled:opacity-50"
        >
          {estado === "enviando" ? "Enviando…" : "Enviarme un enlace"}
        </button>
        {estado === "error" && (
          <p role="alert" className="text-sm text-error">
            No se pudo enviar el enlace. Revisa el email e inténtalo de nuevo.
          </p>
        )}
      </form>
    </div>
  );
}
