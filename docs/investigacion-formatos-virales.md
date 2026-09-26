# Investigación: formatos virales y competencia

Fecha: 26/09/2026. Base para decidir qué formatos lleva la app y qué copiamos de la competencia.

## Resumen

- **Hueco de mercado:** las herramientas grandes (FacelessReels, Crayo, AutoShorts) están pensadas en inglés y funcionan por *nichos* (terror, motivación…). Ninguna ofrece frutinovelas, chats de WhatsApp o leyendas latinas en español nativo.
- **Qué nos diferencia:** un catálogo de *formatos* (cada uno con su plantilla de montaje) y un radar de tendencias que mete formatos nuevos en días. Las frutinovelas nacieron en marzo de 2026 y a finales de septiembre siguen generando noticias.
- **Reglas que condicionan el producto:**
  1. TikTok exige que el usuario confirme cada publicación.
  2. YouTube e Instagram castigan el contenido repetitivo o reciclado.
  3. La ley europea de IA obliga a marcar el contenido generado desde el 02/08/2026.
- **Coste por vídeo de 60 s:** 0,07–0,17 $ (plantilla), 0,30–0,60 $ (imágenes animadas), 1,50–6,50 $ (vídeo IA). Los créditos tienen que costar distinto según el tipo de vídeo.
- **Recomendación MVP:** 5 formatos: chat de WhatsApp, historia estilo Reddit con gameplay, quiz, terror/leyendas y frutinovelas. Cuatro son baratos y dan margen. La frutinovela es el gancho de marketing.

---

## 1. Competencia

> No se pudieron abrir `facelessreels.com` ni `facelessreels.co` directamente: la red de este entorno las bloquea. Los datos salen de buscadores, reseñas y las páginas de precios indexadas.

### FacelessReels.com (la principal)

| Punto | Dato |
|---|---|
| Promesa | Eliges nicho y estilo. La IA escribe el guion, genera imágenes, voz y música, y publica sola en TikTok, Instagram y YouTube según un calendario. |
| Concepto clave | **"Series"**: 1 serie = 1 nicho + 1 frecuencia + cuentas conectadas. 1 serie por plan; cada serie extra añade una conexión por plataforma. |
| Precios (reseñas) | Desde 19 $/mes (3 vídeos/semana) hasta 69 $/mes (2 vídeos/día). No publica los precios en la web (a 29/08/2026). |
| Incluye | 6+ estilos de arte, música de fondo, voz personalizada, sin marca de agua. |
| Usuarios | ~709.000 según una reseña. 312 reseñas en Trustpilot, mayoría positivas. |
| Quejas | Editor muy limitado. Publica sin pedir aprobación. No hay ventana para revisar el texto antes de publicar. Solo web, sin app móvil. |

### facelessreels.co (la segunda)

| Punto | Dato |
|---|---|
| Promesa | "Sistema de vídeo corto con IA": hook y guion → mapa de escenas → subtítulos → clips con varios modelos de vídeo (desde texto o imagen de referencia). |
| Starter | 19 $/mes · 120 créditos · **sin publicación en redes** |
| Creator | 49 $/mes · 360 créditos · 2 canales · 20 publicaciones/mes |
| Studio | 99 $/mes · 750 créditos · 6 canales · 90 publicaciones/mes |

### Otros competidores relevantes

| Herramienta | Qué hace | Precio | Nota |
|---|---|---|---|
| Crayo | Historias de Reddit, chats falsos de iMessage, pantalla partida con gameplay, clips de streamers, preguntas y respuestas estilo ChatGPT. 15+ estilos de subtítulos. | 19 / 39 / 79 $/mes | Sin plan gratis ni prueba. Es la referencia de formatos "de plantilla". |
| AutoShorts.ai | Series automáticas. | Desde 19 $/mes | Solo publica en YouTube y TikTok. Tiene el mejor calendario: arrastrar para reprogramar y horas por plataforma. |
| Faceless.so | Series + clonación de voz. | Desde 29 $/mes | Publica en las 3 redes. |
| Vuela.ai | 80+ generadores (faceless, esqueletos, Ghibli, manga). | — | En español. Permite editar escena a escena. Generalista, no está centrado en formatos virales. |
| Revid.ai | Texto o enlace → vídeo, con voces en español. | — | Generalista. |

### Qué copiamos

1. **Series en piloto automático** (FacelessReels.com): formato + frecuencia + cuentas → cola de vídeos.
2. **Selector visual de estilos** con vista previa de cada uno (FacelessReels.com).
3. **Pipeline por pasos**: hook → guion → escenas → subtítulos, con varios modelos de vídeo (facelessreels.co).
4. **Plantillas de Crayo**: pantalla partida, chats, Reddit, 15+ estilos de subtítulos.
5. **Calendario de arrastrar y soltar** con horas por plataforma (AutoShorts).
6. **Créditos por plan con entrada a 19 $** (estándar del sector).
7. **Edición escena a escena** sin regenerar el vídeo entero (Vuela).

### Qué hacemos distinto

1. **Español nativo.** Guiones escritos en español, no traducidos. Voces de España y de LatAm, elegibles por separado.
2. **Formatos, no nichos.** Cada formato tiene su plantilla de montaje (chat de WhatsApp, pantalla partida, quiz, capítulo de frutinovela).
3. **Radar de tendencias.** Proceso para añadir un formato nuevo en días.
4. **Revisión en 1 toque desde el móvil antes de publicar.** Resuelve la queja principal de FacelessReels y cumple las normas de TikTok (ver §4).
5. **Personajes persistentes.** La misma fruta o el mismo gato en todos los capítulos de una serie. Es imprescindible para las microseries.
6. **Duración según la plataforma.** TikTok: más de 60 s, que es lo mínimo para cobrar. Shorts: hasta 3 min.
7. **Etiqueta de IA automática** en cada vídeo (TikTok y ley europea).

---

## 2. Catálogo de formatos

Tipo de coste: **A** = plantilla (sin generar imagen ni vídeo), **B** = imágenes IA animadas, **C** = vídeo IA. Costes en §5.

### 2.1 Tendencias de 2026

| # | Formato | Qué es | Datos | Coste | Riesgo | Fase |
|---|---|---|---|---|---|---|
| 1 | **Frutinovelas** | Telenovela con frutas humanizadas: infidelidades, venganzas, embarazos. Capítulos cortos con cliffhanger. | *Fruit Love Island* (13/03/2026): 3 M de seguidores en 9 días y 200 M+ de visualizaciones. 30 M de visualizaciones en una semana en TikTok. Personajes: Banana Negra, Chica Limón, Cocotelo, Cocardo. Siguen en las noticias el 25/09/2026. | C | Medio: críticas por hipersexualización y violencia. Hay que filtrar los guiones. | **MVP** |
| 2 | **Telenovela de gatos IA** | Gatos humanizados en dramas de traición y venganza, con música de fondo. | Un vídeo hizo 43 M de visualizaciones en una semana. Fue el vídeo n.º 1 mundial de TikTok el 08/08/2025. Se entiende sin idioma. | C | Bajo | 2 |
| 3 | **POV histórico** | "Te despiertas en la Edad Media": vlog en formato selfie por la época. | Hay vídeos de POV de la peste negra con 53 M de visualizaciones. Variantes: Egipto, Roma. | C | Bajo | 2 |
| 4 | **Vlogs bíblicos** | Personajes bíblicos grabándose con el móvil. | @holyvlogsz: 435 k seguidores en un mes. "Daniel en el foso de los leones": 9 M de visualizaciones. | C | Medio: tema religioso sensible. | 2 |
| 5 | **Vlogs de criaturas** | Bigfoot o Yeti haciendo vlogs de su día. Versión latina: Chupacabras, Cuco. | Empezó en mayo de 2025 con Veo 3 y sigue vivo. | C | Bajo | 2 |
| 6 | **Esqueletos explicativos** | Un esqueleto explica "¿qué pasa si…?" o qué le ocurre al cuerpo. | Formato asentado en TikTok y Shorts. Vuela ya tiene generador propio. | B/C | Bajo | 2 |
| 7 | **ASMR IA** | Cortar fruta de cristal, gotas de colores. Clips de menos de 15 s en bucle. | Millones de visualizaciones por clip. Sirve para crecer, no para cobrar: dura menos de 60 s. | C (8–15 s) | Bajo | 2 |
| 8 | **Brainrot propio** | Personajes absurdos al estilo italian brainrot (Tralalero, Tung Tung Sahur). | Sigue en 2026 (serie "Brainrot World Cup 2026"). | C | Medio: usar los personajes existentes. Crear personajes nuevos. | 3 |
| 9 | **Microdramas originales** | Serie vertical de romance o venganza, capítulos de 60–90 s. | Microdramas: 7.800 M $ en apps en 2026 (Deloitte). *Screen Time* de TikTok: 250 M de visualizaciones el primer mes. | C | Bajo | 3 |

### 2.2 Clásicos que siempre funcionan

| # | Formato | Qué es | Datos | Coste | Riesgo | Fase |
|---|---|---|---|---|---|---|
| 10 | **Chat falso (WhatsApp)** | La conversación aparece mensaje a mensaje, con una voz IA por contacto. Pillar a una pareja infiel, peleas familiares, venganza. | Uno de los formatos con más finalización de TikTok. En español, WhatsApp resulta más natural que iMessage. | A | Bajo | **MVP** |
| 11 | **Historia estilo Reddit + gameplay** | Narración IA arriba, Minecraft parkour o Subway Surfers abajo. | Formato de Crayo. Sigue publicándose en 2026 aunque se considere "quemado". | A | Medio: ver §3 (gameplay y Reddit). | **MVP** |
| 12 | **Quiz / "¿Qué prefieres?"** | Pregunta, cuenta atrás y respuesta. Banderas, logos, cultura general. | @quiz__pro: 150 M de visualizaciones. Genera comentarios y visionados repetidos. | A | Bajo | **MVP** |
| 13 | **Terror y leyendas** | Creepypastas y leyendas latinas (La Llorona, el Silbón) con imágenes oscuras y voz grave. | #HorrorTok: 50.000 M+ de visualizaciones. #casosdelavida: 897 M. | B | Bajo, si es ficción. | **MVP** |
| 14 | **Datos curiosos / "¿Sabías que…?"** | Ráfaga de datos con imágenes. | Formato consolidado. Canales como *Did You Know Daily*. | B | Bajo: comprobar que los datos sean ciertos. | 2 |
| 15 | **Motivación / estoicismo** | Frases y relatos cortos con imágenes épicas. | Nicho estable en YouTube. | B | Alto: YouTube desmonetiza las plantillas repetidas. Hay que variar. | 2 |
| 16 | **Historia / "¿Qué pasaría si…?"** | Hechos históricos o escenarios hipotéticos. | Historia es uno de los nichos faceless que más cobran. | B | Bajo | 2 |
| 17 | **Cuentos para dormir** | Fábulas con voz suave. | Nicho estable. | B | Medio: en YouTube, el contenido infantil tiene reglas propias. | 3 |
| 18 | **Rankings / Top 5** | "Top 5 lugares más peligrosos", con visuales IA propios. | Sustituye a las "recopilaciones" (ver §3). | B/C | Bajo | 3 |

### 2.3 Cómo se automatiza cada tipo

- **A (plantilla):** LLM escribe el guion → TTS con marcas de tiempo → motor de montaje (Remotion o FFmpeg) pinta el chat, la pregunta o el texto sobre un vídeo de fondo de nuestra biblioteca → subtítulos sacados de las marcas de tiempo del TTS.
- **B (imágenes):** LLM escribe el guion y divide en escenas → 1 imagen por escena (8–15) → zoom y paneo sobre cada imagen → TTS → subtítulos → música.
- **C (vídeo IA):** LLM escribe el guion por capítulos → ficha fija de cada personaje (imagen de referencia) → clips de 5–10 s por escena con el personaje de referencia → voces distintas por personaje con sincronía de labios → montaje → subtítulos.

---

## 3. Descartados o con condiciones

| Idea | Decisión | Motivo |
|---|---|---|
| **Recopilaciones de vídeos ajenos** | Descartado | Instagram, desde el 30/04/2026: 10+ reposts no originales en 30 días = fuera de recomendaciones. Una fuente secundaria habla de caídas de alcance del 60–80 %. YouTube lo clasifica como "contenido no auténtico". Además, infringe derechos de autor. Alternativa: rankings con clips generados por nosotros (formato 18), o con clips que suba el propio usuario. |
| **Gameplay de GTA** | Solo si el usuario sube su propia grabación | La política de Rockstar limita el uso a fines "no comerciales". Minecraft sí permite monetizar vídeos de gameplay, dentro de sus normas. Biblioteca propia: Minecraft grabado por nosotros y fondos generados (carreras de canicas, slime, circuitos). |
| **Copiar posts reales de Reddit** | Descartado | Los textos son de sus autores y el uso comercial de datos de Reddit tiene condiciones propias. Generamos historias originales "estilo Reddit". |
| **Crímenes reales con víctimas recreadas** | Descartado | Maldita.es documentó problemas legales con estos vídeos. YouTube desmonetiza desde 2026 los clips "angustiantes o manipuladores". |
| **Famosos o personas reales (deepfakes)** | Descartado | Derechos de imagen y ley europea de IA (deepfakes). |

---

## 4. Reglas de plataforma que afectan al diseño

### TikTok
- **API de publicación sin auditar:** los vídeos salen solo en privado, la cuenta tiene que ser privada y hay un máximo de 5 usuarios cada 24 h. Para publicar en público hay que pasar una auditoría con un vídeo demo del flujo completo.
- **Normas de la interfaz:** el usuario elige la privacidad a mano, sin valor por defecto. Comentarios, dúos y stitch vienen desactivados por defecto. Hay un aviso de consentimiento antes del botón de publicar. **Un "publica solo sin mirar" choca con estas normas.**
- **Etiqueta de IA:** es obligatoria en contenido realista. TikTok lo detecta por metadatos C2PA aunque no lo declares. Retiró 51.618 vídeos sintéticos en el 2.º semestre de 2025.
- **Creator Rewards (cobrar):** mayor de 18, 10.000 seguidores, 100.000 visualizaciones en 30 días, vídeos de **más de 1 minuto**. España está incluida.
- **Consecuencia:** en el MVP enviamos el vídeo a borradores de TikTok (modo "Upload" de la API; confirmar sus requisitos) y el usuario lo publica desde la app de TikTok. Tras la auditoría pasamos a publicación directa con revisión en 1 toque. Duración por defecto en TikTok: 61–90 s.

### YouTube
- **Cuota de la API:** según fuentes secundarias, subir un vídeo ya no gasta el cupo general desde el 01/06/2026 y va a un cupo propio de ~100 subidas/día por proyecto. Confirmar en Google Cloud Console.
- **Contenido no auténtico** (julio de 2025, endurecido en julio de 2026): la revisión ya es por canal, no por vídeo. Pierden la monetización los vídeos IA repetitivos, los clips angustiantes y los "presentadores sintéticos" sobre salud o finanzas.
- **Consecuencia:** variar plantilla, voz y estilo dentro de una misma serie, y no dejar que salgan dos vídeos casi iguales.

### Instagram
- Solo cuentas Business o Creator. Límite de 50 publicaciones por API cada 24 h, móviles (la documentación de Meta también cita 100).
- Penaliza el contenido no original: ver §3.

### Ley europea de IA (art. 50, en vigor desde el 02/08/2026)
- El contenido generado tiene que ser identificable como IA (marca legible por máquina).
- En obras claramente de ficción o sátira basta con avisar "de forma adecuada", sin estropear la obra.
- **Consecuencia:** incrustar metadatos C2PA en cada vídeo y activar por defecto la etiqueta de IA al publicar.

---

## 5. Coste estimado por vídeo de 60 s

> Actualizado en `plan-tecnico-y-cobro.md` §4: esa versión incluye el coste del guion con Claude y el render en servidor, y es la que manda para fijar los créditos.

Supuestos: 60 s de locución ≈ 900 caracteres. ElevenLabs: 0,10 $/1.000 caracteres (v3/Multilingual) o 0,05 $ (Flash). Imagen ≈ 0,03 $. Vídeo IA: Seedance 2.0 Fast 0,022 $/s, Kling 3.0 0,10 $/s, Veo 3.1 con audio 0,40 $/s.

| Paso | A · Plantilla | B · Imágenes | C · Vídeo IA |
|---|---|---|---|
| Guion (LLM) | 0,01–0,03 $ | 0,01–0,03 $ | 0,02–0,05 $ |
| Voz (TTS) | 0,05–0,09 $ | 0,05–0,09 $ | 0,05–0,15 $ (varias voces) |
| Imágenes | — | 0,25–0,45 $ (8–15) | 0,05–0,15 $ (fichas de personaje) |
| Vídeo IA | — | — | 1,32 $ (Seedance Fast) · 6 $ (Kling) · 24 $ (Veo 3.1) |
| Montaje en servidor | 0,01–0,05 $ | 0,01–0,05 $ | 0,01–0,05 $ |
| **Total** | **~0,07–0,17 $** | **~0,30–0,60 $** | **~1,50–6,50 $** (sin Veo) |

**Consecuencia para los precios:** con un plan de 19 $ no se pueden regalar 30 frutinovelas al mes. Un vídeo C tiene que costar al menos 10 veces más créditos que uno A.

---

## 6. Recomendación MVP

**Formatos:** chat de WhatsApp (10), historia estilo Reddit + gameplay (11), quiz (12), terror y leyendas (13) y frutinovelas (1).

- Tres son de tipo A: cuestan céntimos, dan margen y permiten un plan gratis de prueba.
- El terror es tipo B y funciona muy bien en el público hispano.
- La frutinovela es el gancho: la tendencia sigue viva y ningún competidor grande la ofrece en español.

**Publicación:**

| Red | Cómo publicamos en el MVP |
|---|---|
| YouTube | API directa |
| Instagram | API, solo con cuenta Business o Creator |
| TikTok | A borradores. Publicación directa cuando pasemos la auditoría. |

**Fase 2:** gatos, POV histórico, vlogs de criaturas y bíblicos, esqueletos, datos curiosos, motivación, historia, ASMR.
**Fase 3:** microdramas originales, brainrot propio, rankings, cuentos.

---

## 7. Límites de esta investigación

- No se pudo navegar por TikTok, Instagram ni YouTube con sesión iniciada, ni abrir las webs de la competencia: la red de este entorno las bloquea. Los datos salen de buscadores, prensa y páginas de TikTok indexadas.
- Algunas cifras vienen de blogs de empresas del sector y no están verificadas (p. ej. las caídas de alcance del 60–80 % o el 80 % de retención de los quiz). Las marcadas como "fuente secundaria" hay que confirmarlas antes de usarlas en marketing.
- Los precios de las API cambian rápido. Revisarlos antes de fijar los créditos.

---

## Fuentes

**Competencia**
- [FacelessReels Review 2026 – ShortsFast](https://shortsfast.com/vs/facelessreels/)
- [Facelessreels – Trustpilot](https://www.trustpilot.com/review/facelessreels.com)
- [FacelessReels Review – ReviewNexa](https://reviewnexa.com/facelessreels-review/)
- [FacelessReels.com Review – ToruClip](https://toruclip.com/blog/facelessreels-review)
- [FacelessReels Pricing – facelessreels.co](https://facelessreels.co/pricing/)
- [Faceless.so vs FacelessReels](https://faceless.so/compare/faceless-vs-facelessreels)
- [Faceless vs AutoShorts.ai](https://faceless.so/compare/autoshorts-vs-faceless)
- [Crayo pricing 2026 – Creatify](https://creatify.ai/blog/crayo-pricing-(2026)-plans-credits-and-what-you-ll-actually-pay)
- [Crayo Review – Prizmad](https://prizmad.com/review/crayo-ai)
- [Vuela.ai – herramientas de vídeo](https://vuela.ai/es/herramientas/video)
- [Revid.ai – vídeo faceless en español](https://www.revid.ai/es/tools/crear-video-faceless)

**Formatos**
- [Frutinovelas – Hola](https://www.hola.com/al-dia/20260416896018/frutinovelas-tiktok-que-son-frutas-infieles-viral/)
- [Frutinovelas – El Independiente](https://www.elindependiente.com/tendencias/2026/04/20/frutinovelas-fenomeno-viral-tiktok-creado-ia/)
- [Frutinovelas y Cocotelo – Grupo Marmor (25/09/2026)](https://grupomarmor.com.mx/2026/09/25/las-frutinovelas-y-el-fenomeno-de-cocotelo-el-melodrama-surrealista-hecho-con-ia-que-conquista-las-redes/)
- [Bulo de Cocardo – HRN](https://www.radiohrn.hn/cocardo-murio-hoy-2026-es-verdad-que-fallecio-el-personaje-de-frutinovelas-2026-09-25)
- [Cómo hacer frutinovelas – Infobae](https://www.infobae.com/tecno/2026/04/10/como-hacer-frutinovelas-con-ia-tutorial-paso-a-paso-para-crear-tu-propio-drama-viral/)
- [Fruit Love Island – Wikipedia](https://en.wikipedia.org/wiki/Fruit_Love_Island)
- [AI fruit slop – CBC](https://www.cbc.ca/news/entertainment/ai-fruit-slop-videos-instagram-tiktok-9.7142568)
- [AI cat soap operas – Medium](https://medium.com/@earnfromaitech/why-ai-generated-cat-soap-operas-are-the-internets-latest-obsession-a6e834742603)
- [Medieval AI POV – AutoClips](https://www.autoclips.app/medieval-ai-video)
- [AI Bible vlogs – Premier Christian News](https://premierchristian.news/us/news/article/bible-stories-reimagined-ai-vlogs-viral-tiktok)
- [Bigfoot vlogs – Know Your Meme](https://trending.knowyourmeme.com/editorials/guides/what-are-the-ai-bigfoot-and-yeti-vlogs-and-how-are-people-making-them-the-viral-ai-video-trend-on-tiktok-explained)
- [Glass fruit ASMR – Quantilus](https://quantilus.com/article/glass-fruit-rainbow-drips-inside-tiktoks-viral-ai-generated-asmr-craze/)
- [Esqueletos IA – TikTok](https://www.tiktok.com/@aprendiendoddtodo/video/7616468420057500950)
- [Italian brainrot – Wikipedia](https://en.wikipedia.org/wiki/Italian_brainrot)
- [Microdramas 2026 – Variety](https://variety.com/2026/digital/news/vertical-media-150-billion-tiktok-microdramas-owl-co-1236840519/)
- [Microdramas – StartupHub](https://www.startuphub.ai/ai-news/ai-tools/2026/microdramas-explained-the-8-billion-vertical-drama-boom-and-the-new-adult-ai-frontier)
- [Historias de terror en TikTok – Hola](https://www.hola.com/al-dia/20251031864682/tiktok-historias-terror-masacre-halloween/)
- [Vídeos de sucesos con IA – Maldita.es](https://maldita.es/malditatecnologia/20231023/videos-tiktok-sucesos-tragicos-inteligencia-artificial-derechos/)
- [Fake text stories – Clippie](https://clippie.ai/blog/how-to-create-fake-text-message-story-videos)
- [Quiz channels – Typito](https://typito.com/blog/tiktok-quiz/)
- [Reddit + Minecraft parkour – TikTok](https://www.tiktok.com/discover/reddit-minecraft-parkour-stories)
- [Faceless niches 2026 – Virlo](https://virlo.ai/blog/best-faceless-tiktok-niches)
- [YouTube drama trends 2026 – OutlierKit](https://outlierkit.com/resources/youtube-drama-trends-2026/)

**Reglas de plataforma y legales**
- [TikTok Content Sharing Guidelines](https://developers.tiktok.com/docs/en/content-sharing-guidelines)
- [TikTok Direct Post – Get Started](https://developers.tiktok.com/docs/en/content-posting-api-get-started)
- [TikTok API privada hasta auditoría – Vorp Labs](https://vorplabs.com/agent-tools/tiktok-content-posting-api)
- [TikTok AI labels – Newsroom](https://newsroom.tiktok.com/en-us/new-labels-for-disclosing-ai-generated-content)
- [TikTok AIGC policy 2026 – Cinerads](https://www.cinerads.com/blog/tiktok-ai-content-policy)
- [TikTok Creator Rewards países – SocialRails](https://socialrails.com/blog/tiktok-creator-fund-eligible-countries)
- [YouTube monetization policies](https://support.google.com/youtube/answer/1311392?hl=en)
- [YouTube AI slop rules 2026 – Android Headlines](https://www.androidheadlines.com/2026/07/youtube-monetization-rules-ai-slop-inauthentic-content.html)
- [YouTube API quota 2026 – Phyllo](https://www.getphyllo.com/post/youtube-api-limits-how-to-calculate-api-usage-cost-and-fix-exceeded-api-quota)
- [Instagram Content Publishing – Meta](https://developers.facebook.com/docs/instagram-platform/content-publishing/)
- [Instagram API rate limits – bundle.social](https://bundle.social/blog/instagram-api-rate-limits)
- [Instagram penaliza agregadores – Tubefilter](https://www.tubefilter.com/2026/04/30/instagram-removes-algorithm-recommendations-repost-content-aggregator/)
- [Minecraft Usage Guidelines](https://www.minecraft.net/en-us/usage-guidelines)
- [Rockstar – política de material con copyright](https://support.rockstargames.com/articles/7bNaeoMFTV0iUDGhStTXvz/policy-on-posting-copyrighted-rockstar-games-material)
- [AI Act art. 50 – Comisión Europea](https://digital-strategy.ec.europa.eu/en/faqs/transparency-obligations-under-article-50-ai-act)
- [AI Act art. 50 – guía práctica](https://artificialintelligenceact.eu/transparency-rules-article-50/)

**Costes**
- [AI video API pricing 2026 – BuildMVPFast](https://www.buildmvpfast.com/api-costs/ai-video)
- [AI video API pricing – Apiframe](https://apiframe.ai/blog/ai-video-api-pricing-2026)
- [ElevenLabs API pricing](https://elevenlabs.io/pricing/api)
