import type { Metadata } from "next";
import { Anton, Schibsted_Grotesk } from "next/font/google";
import { NOMBRE_APP } from "@/lib/catalogo";
import "./globals.css";

// Anton: titulares y subtítulos (la letra de los vídeos virales). Schibsted Grotesk: todo lo demás.
const display = Anton({
  variable: "--font-display",
  weight: "400",
  subsets: ["latin", "latin-ext"],
});

const cuerpo = Schibsted_Grotesk({
  variable: "--font-cuerpo",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: `${NOMBRE_APP} · Vídeos virales sin salir en cámara`,
  description:
    "Crea vídeos para TikTok, Reels y Shorts en español: frutinovelas, chats de WhatsApp, historias de terror y más. La IA hace el guion, la voz y el montaje.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className={`${display.variable} ${cuerpo.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
