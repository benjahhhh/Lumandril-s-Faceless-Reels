# Plan técnico y de cobro

Fecha: 26/09/2026. Cómo genera vídeos la app, quién paga la IA y cómo se mantiene con poco trabajo.

## 1. Decisión

**Créditos prepago.** El usuario compra créditos antes de generar. Cada vídeo descuenta créditos según su coste real. La app paga a los proveedores de IA con ese dinero. Sin créditos no se genera nada.

- **Tú nunca adelantas el coste de un usuario:** cada crédito vale más de lo que cuesta la IA que consume.
- **Descartado: que cada usuario ponga su propia clave de API.** Tendría que abrir cuenta en 3 proveedores y meter tarjeta en cada uno. La mayoría abandonaría en el registro. Ningún competidor lo hace así.

## 2. Cómo circula el dinero

```
Usuario ──paga 19 €──▶ Stripe ──(días después)──▶ tu cuenta bancaria
   │
   └─ recibe 1.000 créditos
          │
          └─ genera un vídeo (−50 créditos)
                 │
                 └─ la app gasta ~0,20 $ de tu saldo prepago en fal y Anthropic
```

Stripe te paga unos días después de cada venta, pero la IA se consume al momento. Por eso necesitas un **colchón inicial de ~70 $** (50 $ en fal y 20 $ en Anthropic) con recarga automática. Es solo un desfase de fechas: el dinero de los usuarios lo repone.

## 3. Cinco reglas para que nunca pagues tú

1. **El crédito es un tope de gasto.** 1 crédito equivale como máximo a 0,005 $ de coste de IA. El coste en créditos de cada formato se calcula así: `créditos = coste real máximo ÷ 0,005`.
2. **Reserva antes de generar.** Al pulsar "Generar", la base de datos reserva los créditos de forma atómica. Sin saldo suficiente, se muestra la página de pago y no se llama a ninguna IA.
3. **Devolución automática si falla.** Si un paso falla, se devuelven los créditos reservados. Solo se cobran los vídeos terminados.
4. **Límites por usuario y globales.** Máximo de vídeos al día por cuenta. Si el gasto diario total supera un umbral, se cortan las generaciones y te llega un email.
5. **Saldos prepago en los proveedores.** fal y Anthropic funcionan con saldo prepago. Si algo falla en el código, como mucho se gasta el saldo, nunca llega una factura sorpresa.

---

## 4. Precios y créditos

### Coste real por vídeo de 60 s

Estimación actualizada: sustituye a la §5 de `investigacion-formatos-virales.md`. Ahora incluye el guion con Claude y el render en servidor.

| Paso | A · Plantilla | B · Imágenes | C · Vídeo IA |
|---|---|---|---|
| Guion (`claude-opus-5`) | 0,02–0,06 $ | 0,02–0,06 $ | 0,02–0,06 $ |
| Voz (ElevenLabs en fal, 0,10 $/1.000 caracteres) | 0,09 $ | 0,09 $ | 0,09–0,15 $ |
| Imágenes (~0,03 $/imagen) | — | 0,30–0,45 $ | 0,10 $ (fichas de personaje) |
| Vídeo IA | — | — | 1,32 $ (Seedance 2.0 Fast) |
| Render (Trigger.dev) | 0,02–0,10 $ | 0,02–0,10 $ | 0,02–0,10 $ |
| **Máximo** | **0,25 $** | **0,70 $** | **~2 $** |
| **Créditos** | **50** | **140** | **400** |

Modo premium de vídeo (Kling 3.0, 0,10 $/s): ~6,50 $ → **1.300 créditos**. Solo en el plan Pro.

**Idea para abaratar las frutinovelas:** ofrecer dos calidades.
- **Estándar:** imagen de la fruta + sincronía de labios, el estilo "low cost" que ya se ve en TikTok. Se acerca al coste del tipo B.
- **Cine:** vídeo IA completo.

### Planes

| Plan | Precio (IVA incl.) | Créditos | Ejemplos |
|---|---|---|---|
| Gratis | 0 € | 60 una sola vez | 1 vídeo de plantilla, con marca de agua |
| Creador | 19 €/mes | 1.000/mes | 20 plantillas, o 7 de terror, o 2 frutinovelas de calidad Cine |
| Pro | 49 €/mes | 3.000/mes + modelos premium | 60 plantillas, o 7 frutinovelas de calidad Cine |
| Recarga | 12 € | 500 | Pago único, solo suscriptores |

**Reglas para sacar más margen:**

1. **Los créditos del plan caducan en cada renovación y no se acumulan.** Los extra (bienvenida y recargas) no caducan.
2. **La recarga es más cara por crédito que el plan** (0,024 €/crédito frente a 0,019 € del Creador) y solo la pueden comprar los suscriptores.
3. **Plan anual con 2 meses gratis** (fase 5): cobras 12 meses por adelantado. Necesita un proceso mensual que renueve los créditos, por eso va al final.

### Margen en el peor caso (el usuario gasta todos sus créditos)

| Plan | Ingreso neto¹ | Coste IA máximo² | Margen |
|---|---|---|---|
| Creador 19 € | ~15,00 € | ~4,60 € | **~10,40 €** |
| Pro 49 € | ~39,30 € | ~13,80 € | **~25,50 €** |
| Recarga 12 € | ~9,40 € | ~2,30 € | **~7,10 €** |

¹ Descontando IVA del 21 %, Stripe (1,5 % + 0,25 € con tarjetas estándar de la UE) y Stripe Tax (~0,5 %).
² Créditos × 0,005 $, pasado a euros de forma aproximada.

---

## 5. Stack

Todo en TypeScript, para que el mantenimiento y los formatos nuevos se hagan en un solo lenguaje.

| Pieza | Servicio | Por qué | Coste fijo |
|---|---|---|---|
| Web y API | Next.js en **Vercel** | Web instalable en el móvil (PWA). El plan gratis de Vercel no permite uso comercial. | 20 $/mes (Pro) |
| Usuarios, base de datos y archivos | **Supabase** | Login con Google, Postgres para los créditos y almacenamiento de los vídeos. | 25 $/mes (Pro) |
| Cobros | **Stripe** + Stripe Tax | Acepta generadores de contenido con IA (sin contenido adulto). Paddle prohíbe los generadores de imágenes con IA y Lemon Squeezy revisa a mano los productos de IA. | 0 € fijos |
| Guiones | **Claude API** (`claude-opus-5`) | Guiones en español. También filtra los guiones que infrinjan normas. | Por uso |
| Imágenes, vídeo y voz | **fal.ai** | Una sola cuenta y un solo saldo para Seedance, Kling, Veo, imágenes y ElevenLabs. La voz devuelve tiempos por palabra, que sirven para los subtítulos. | Por uso |
| Montaje | **Remotion** | Cada formato es una plantilla de código. Gratis para empresas de hasta 3 empleados. | 0 € |
| Tareas largas | **Trigger.dev** | Generar un vídeo tarda minutos. Trigger.dev reintenta los pasos fallidos y ejecuta el render. | 10 $/mes (gratis al principio) |

### Por qué web y no app de móvil

Si los créditos se venden dentro de una app de iPhone, Apple se queda una comisión. En la UE, desde el 01/10/2026:
- 26 % si se usa su sistema de pago.
- 15 % si la app enlaza a tu web para pagar.

Con una web instalable (PWA) la comisión es 0 %. FacelessReels también es solo web.

---

## 6. Cómo se genera un vídeo

1. El usuario elige formato y opciones, y pulsa "Generar".
2. Se reservan los créditos. Sin saldo suficiente → página de pago.
3. Trigger.dev arranca la tarea:
   1. **Guion:** Claude escribe el guion con el prompt del formato. En la misma llamada comprueba las normas: nada adulto, nada sobre personas reales, nada de crímenes reales.
   2. **Voz:** ElevenLabs en fal, con tiempos por palabra.
   3. **Visuales:** según el tipo, nada (A), imágenes (B) o clips de vídeo (C).
   4. **Render:** Remotion monta la plantilla, los subtítulos, la música y la etiqueta de IA.
   5. **Guardado:** el vídeo se sube a Supabase Storage.
4. Si todo va bien, se confirma el cobro de créditos. Si algo falla, se devuelven.
5. Se guarda el coste real de cada paso, para ver el margen de cada formato.
6. El usuario revisa el vídeo y lo publica, o lo programa.

---

## 7. Formatos como módulos

Cada formato vive en su carpeta:

```
formatos/
  chat-whatsapp/
    formato.ts        # nombre, tipo (A/B/C), créditos, duración, opciones
    guion.prompt.md   # instrucciones para Claude
    Plantilla.tsx     # plantilla de Remotion
  frutinovela/
    ...
```

**Añadir un formato de moda:** vuelves aquí → creamos una carpeta nueva → PR → despliegue. El resto de la app no cambia.

**Los créditos de cada formato se guardan en la base de datos.** Si un proveedor cambia de precio, se edita una fila, sin tocar código.

---

## 8. Costes fijos y punto de equilibrio

| Concepto | Al mes |
|---|---|
| Vercel Pro | 20 $ |
| Supabase Pro | 25 $ |
| Trigger.dev | 10 $ |
| Dominio | ~1 € |
| Cuota de autónomo (tarifa plana, 12 meses) | ~88,64 € (80 € + MEI) |
| **Total** | **~140 €** |

**Punto de equilibrio: ~14 suscriptores del plan Creador**, calculado con el margen del peor caso (140 € ÷ 10,40 €). Lo normal es que los usuarios no gasten todos sus créditos, así que en la práctica harían falta menos.

Mientras se construye, todo funciona en los planes gratuitos. Los costes fijos empiezan cuando empieces a cobrar.

---

## 9. Qué tienes que hacer tú

| Cuándo | Tarea |
|---|---|
| Ya | Crear cuentas en fal.ai, Anthropic Console, Supabase, Vercel, Trigger.dev y Stripe (modo prueba). Nada de esto obliga a pagar todavía. |
| Ya | Comprar el dominio. |
| Antes de cobrar | **Darte de alta como autónomo.** Con la tarifa plana pagas 80 €/mes (+ MEI) durante 12 meses. Requisito: no haber sido autónomo en los últimos 2 años. |
| Antes de cobrar | Activar Stripe en real. Hace falta la web con precios, términos de uso y política de reembolsos. |
| Antes de cobrar | Meter el colchón inicial: ~50 $ en fal y ~20 $ en Anthropic, con recarga automática. |
| Recomendado | Una gestoría para el IVA. Por debajo de 10.000 €/año en ventas a particulares de otros países de la UE se aplica el IVA español. Por encima hay que usar el régimen OSS (modelo 369). Los clientes de Latinoamérica tienen sus propias reglas. |

---

## 10. Mantenimiento mensual (~1 hora)

1. Revisar en el panel de admin el margen por formato (coste real frente a créditos cobrados).
2. Revisar los saldos de fal y Anthropic y la recarga automática.
3. Actualizar precios si algún proveedor ha cambiado los suyos (editar la tabla de créditos).
4. Revisar los guiones marcados por el filtro y los emails de soporte.
5. Actualizar dependencias: lo hacemos aquí con un PR.

---

## 11. Orden de construcción

| Fase | Qué se construye | Resultado |
|---|---|---|
| 1 | Web, login, tabla de créditos (con reserva y devolución), Stripe en modo prueba, panel del usuario. | Puedes registrarte y comprar créditos de prueba. |
| 2 | Motor de generación (Trigger.dev + Remotion) y el primer formato completo: **chat de WhatsApp**. | Primer vídeo real, pagado con créditos. |
| 3 | Resto del MVP: historia estilo Reddit + gameplay, quiz, terror, frutinovela (Estándar y Cine). | Los 5 formatos del MVP. |
| 4 | Publicación: YouTube (API), Instagram (API) y TikTok (borradores). | Publicar desde la app. |
| 5 | Lanzamiento: alta de autónomo, Stripe en real, planes de pago, marca de agua en el plan gratis. | Cobrar de verdad. |

---

## 12. Riesgos

| Riesgo | Mitigación |
|---|---|
| Los proveedores suben precios | Créditos en la base de datos. Revisión mensual del margen. |
| Abuso del plan gratis | Login con Google, 60 créditos una sola vez, marca de agua, límite diario. |
| Stripe bloquea la cuenta por el contenido | Filtro de guiones. Prohibido el contenido adulto y las personas reales en los términos de uso. |
| Un modelo de vídeo deja de funcionar | Con fal, cambiar de modelo es cambiar un nombre en el código. |
| Precios sacados de fuentes secundarias | Comprobarlos en cada proveedor antes de fijar los créditos. |

---

## Fuentes

- [fal.ai: precios y modelos – CostBench](https://costbench.com/software/ai-ml-platforms/fal/)
- [fal.ai: ElevenLabs TTS v3](https://fal.ai/models/fal-ai/elevenlabs/tts/eleven-v3)
- [Precios de APIs de vídeo IA 2026 – BuildMVPFast](https://www.buildmvpfast.com/api-costs/ai-video)
- [Comisiones de Stripe en España – Quipu](https://getquipu.com/blog/comisiones-stripe/)
- [Stripe: negocios prohibidos y restringidos](https://stripe.com/legal/restricted-businesses)
- [Restricciones a apps de IA en plataformas de pago – Freemius](https://freemius.com/blog/payment-platform-restrictions-ai-apps/)
- [Paddle: qué no se puede vender](https://www.paddle.com/help/start/intro-to-paddle/what-am-i-not-allowed-to-sell-on-paddle)
- [Stripe Managed Payments: comisiones – Dodo Payments](https://dodopayments.com/blogs/stripe-managed-payments-fees-explained)
- [Comisiones de Apple en la UE 2026 – FunnelFox](https://blog.funnelfox.com/apple-app-store-fees-2026-eu-dma/)
- [Remotion: licencia y precios](https://www.remotion.dev/docs/license/pricing)
- [Trigger.dev: precios – ZenML](https://www.zenml.io/blog/trigger-dev-pricing)
- [Vercel: plan Hobby](https://vercel.com/docs/plans/hobby)
- [Supabase: precios 2026 – MakerKit](https://makerkit.dev/blog/saas/supabase-pricing)
- [Tarifa plana de autónomos 2026 – Infoautónomos](https://www.infoautonomos.com/seguridad-social/tarifa-plana-autonomos/)
- [IVA OSS para autónomos – Zerogest](https://zerogest.es/blog/facturacion/iva-oss-ventanilla-unica-vender-ue)
