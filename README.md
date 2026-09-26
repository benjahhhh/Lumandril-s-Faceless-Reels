# Lumandril Reels

App web para crear vídeos faceless (TikTok, Reels, Shorts) en español. Los usuarios compran créditos y cada vídeo gasta créditos según lo que cuesta generarlo.

- Investigación de formatos y competencia: [`docs/investigacion-formatos-virales.md`](docs/investigacion-formatos-virales.md)
- Plan técnico y de cobro: [`docs/plan-tecnico-y-cobro.md`](docs/plan-tecnico-y-cobro.md)

## Estado

**Fase 1 hecha:** web, login, sistema de créditos y Stripe en modo prueba.
La generación de vídeos llega en la fase 2.

## Estructura

| Carpeta | Qué hay |
|---|---|
| `src/app` | Páginas: portada, `/login`, `/panel` y las rutas de pago (`/api/checkout`, `/api/portal`, `/api/stripe/webhook`) |
| `src/lib/catalogo.ts` | Planes, precios, créditos de bienvenida y recarga |
| `src/formatos` | Formatos de vídeo (nombre, descripción, tipo). Su precio en créditos está en la base de datos |
| `supabase/migrations` | Tablas y funciones de créditos: reservar, devolver, renovar plan, recargas |
| `scripts/configurar-stripe.ts` | Crea en Stripe los planes, la recarga y el portal de cliente |
| `tests` | Pruebas de créditos y del webhook de Stripe |

## Cómo funcionan los créditos

- Dos bolsas: **del plan** (caducan en cada renovación) y **extra** (bienvenida y recargas, no caducan).
- Al generar se reservan los créditos antes de llamar a ninguna IA. Primero se gastan los del plan.
- Si el vídeo falla, se devuelven a su bolsa.
- Los créditos solo se dan desde el webhook de Stripe. Si Stripe repite un evento, no se dan dos veces.
- El precio de cada formato está en la tabla `formatos`. Se cambia editando esa fila en Supabase, sin desplegar.

## Puesta en marcha (modo prueba)

1. **Supabase**: crea un proyecto y ejecuta `supabase/migrations/20260926170000_creditos.sql` en el SQL Editor.
   - En Authentication → Providers activa Google (y email).
   - En Authentication → URL Configuration añade `http://localhost:3000/auth/callback` a las URLs de redirección.
2. **Variables**: copia `.env.example` a `.env.local` y rellénalo.
3. **Stripe (modo prueba)**:
   ```bash
   npm install
   npm run stripe:configurar          # crea planes, recarga y portal
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
   Copia el `whsec_...` que muestra `stripe listen` en `STRIPE_WEBHOOK_SECRET`.
4. **Arrancar**: `npm run dev` y abre http://localhost:3000.
   Tarjeta de prueba de Stripe: `4242 4242 4242 4242`, cualquier fecha futura y cualquier CVC.

En producción el webhook se da de alta en Stripe → Developers → Webhooks, con los eventos
`invoice.paid`, `checkout.session.completed`, `checkout.session.async_payment_succeeded` y `customer.subscription.deleted`.

## Comprobaciones

```bash
npm test            # créditos y webhook (Postgres en memoria)
npm run typecheck
npm run lint
npm run build
```
