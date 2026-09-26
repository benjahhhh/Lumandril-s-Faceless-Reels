// Formatos de vídeo. Cada formato tendrá su carpeta con guion y plantilla (fase 2).
// El precio en créditos está en la tabla `formatos` de la base de datos.

export type TipoCoste = "A" | "B" | "C";

export type Formato = {
  id: string;
  nombre: string;
  descripcion: string;
  tipo: TipoCoste;
};

export const TIPOS: Record<TipoCoste, string> = {
  A: "Plantilla",
  B: "Imágenes IA",
  C: "Vídeo IA",
};

export const FORMATOS: Formato[] = [
  {
    id: "chat-whatsapp",
    nombre: "Chat de WhatsApp",
    descripcion: "Una conversación que aparece mensaje a mensaje, con una voz por contacto.",
    tipo: "A",
  },
  {
    id: "historia-reddit",
    nombre: "Historia estilo Reddit",
    descripcion: "Narración con gameplay de Minecraft parkour de fondo.",
    tipo: "A",
  },
  {
    id: "quiz",
    nombre: "Quiz y ¿Qué prefieres?",
    descripcion: "Pregunta, cuenta atrás y respuesta. Engancha y genera comentarios.",
    tipo: "A",
  },
  {
    id: "terror",
    nombre: "Terror y leyendas",
    descripcion: "Creepypastas y leyendas latinas con imágenes oscuras y voz grave.",
    tipo: "B",
  },
  {
    id: "frutinovela-estandar",
    nombre: "Frutinovela · Estándar",
    descripcion: "Drama de frutas con imágenes y sincronía de labios.",
    tipo: "B",
  },
  {
    id: "frutinovela-cine",
    nombre: "Frutinovela · Cine",
    descripcion: "Drama de frutas con vídeo IA completo.",
    tipo: "C",
  },
];

export function formatoPorId(id: string): Formato | undefined {
  return FORMATOS.find((f) => f.id === id);
}
