# Mapa de productos y desarrollos · Pedro Paredes (`fredparedes58-ui`)

> Documento maestro: qué se está construyendo, dónde vive el código, qué hace cada
> pieza. Cubre el portfolio del holding **Krujens** y los desarrollos paralelos
> que hoy están **fuera del brand Krujens**.
>
> Última actualización: 2026-05-06.

---

## 1. Vista única del portfolio

```
                    PEDRO PAREDES (founder)
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                                           ▼
   KRUJENS (matriz)                        Fuera del brand Krujens
        │                                           │
   ┌────┼────┬─────────┬──────────┐         ┌──────┴───────┐
   ▼    ▼    ▼         ▼          ▼         ▼              ▼
GRADA Elite VITAS  Essence    [futuro]   Colegio       Brewchain
      380          Bloom                  (educación)   (café)
```

**Comparativa rápida:**

| Producto | Sector | Brand | Repo | Estado | ¿Código aquí? |
|---|---|---|---|---|---|
| **GRADA** | Fútbol amateur federado | Krujens | `fredparedes58-ui/Grada` | Lanzamiento Q2 2026, ronda seed 250k€ | **Sí — este repo** |
| **Elite 380** | Academia de fútbol | Krujens | Carpeta Windows local (no GitHub público) | MVP en producción desde Q4 2025 | No |
| **VITAS** | Análisis deportivo | Krujens | Sin repo identificado | En portfolio, sin lanzar | No |
| **Essence Bloom** | Bienestar / rituales | Krujens | `fredparedes58-ui/essence-bloom` | Repo propio, estado por contrastar | No |
| **[Futuro Krujens]** | Por definir | Krujens | — | Placeholder | — |
| **Colegio** | Educación | Fuera de Krujens | Por confirmar | Desarrollo en marcha en otra sesión Claude Code | No |
| **Brewchain** | Hospitality / café | Fuera de Krujens | `fredparedes58-ui/brewchain-app` | Desarrollo en marcha en otra sesión Claude Code | No |

**Repos GitHub adicionales del fundador**, sin mapear todavía a un producto: `futuro-club`, `my-project-hub`, `interference-tool-advance`, `dreamteam-arena`. Detalle en §10.

---

## 2. Krujens (matriz)

**Una frase:** holding español de SaaS verticales mobile-first que construye PWAs donde hoy solo hay Excel y WhatsApp.

**Tagline:** *Tecnología que entiende tu mundo.*

**Misión:** democratizar el acceso a tecnología de nivel enterprise en sectores infraestructurados (deporte base, salud, educación, comunidad local).

**Visión 2030:** referente iberoamericano en PWAs verticales — 3-5 productos activos, 150.000+ usuarios acumulados, ARR > 1,5M€, presencia España + LATAM.

**4 valores:** mobile-first real · IA útil no marketing · precio justo (5-15€/mes) · datos del usuario son del usuario.

**Stack común a todos los verticales Krujens:** React + Vite + TypeScript + Tailwind + Supabase/Firebase + PWA (`vite-plugin-pwa`).

**Playbook por vertical:** elegir sector sub-digitalizado → MVP PWA en 8-12 semanas → validar con 50-100 usuarios → monetizar a 5-15€/mes → escalar por comunidad → reinvertir cash en el siguiente.

**Sistema de marca (endorsed brand):** cada vertical Krujens tiene marca propia, pero firma "una solución Krujens" en footer / about / legal. Colegio y Brewchain **no** llevan esa firma — son desarrollos paralelos del fundador, no del holding.

**Paleta corporativa:**

| Vertical | Color secundario | Hex | Por qué |
|---|---|---|---|
| Krujens (matriz) | Krujens Green + Obsidian Navy | `#00E676` + `#0A1628` | identidad corporativa |
| GRADA | Neon Orange | `#FF6B00` | acción, deporte |
| Elite 380 | Neon Orange | `#FF6B00` | acción, deporte |
| VITAS | Electric Cyan | `#00D4FF` | tech, confianza |
| Essence Bloom | Deep Purple | `#B347FF` | bienestar, premium |

**Hitos comunicados:**

| Fecha | Hito |
|---|---|
| 2025 Q4 | Primer MVP **Elite 380** en producción. |
| 2026 Q1 | Krujens registra entidad matriz. |
| 2026 Q2 | Lanzamiento **GRADA** + ronda seed 250k€. |
| 2026 Q3 | Acuerdo piloto FFCV. |
| 2027 | Expansión GRADA a 3 CCAA + 2º vertical (probablemente VITAS). |
| 2030 | 3-5 verticales activas, 150k usuarios, ARR > 1,5M€. |

**Fuente canónica:** `docs/krujens-brand-context.md`.

---

## 3. GRADA · producto insignia 2026

Único producto cuyo código vive en este repo. PWA mobile-first para el ecosistema del fútbol amateur federado.

**Una frase:** Red social + IA + carrera gamificada para el jugador amateur federado.

**Posicionamiento:** ningún competidor combina simultáneamente red social del jugador, IA determinista útil, gamificación FIFA-style, B2C direct-to-player y mobile-first PWA (gap recogido en `docs/market-study.md` §5.1).

**Modelo:** Free + Pro 4,99€/mes (o 39€/año) + Club 29€/mes/equipo. ARPU mezclado proyectado ~2€/mes.

**Mercado (CV):** TAM 126k jugadores federados → SAM 84k → SOM Y5 21k usuarios activos → ARR Y5 504k€ (escenario base). Techo teórico 1-pago-por-federado @ 4,99€ = 7,58M€/año.

**Stack:** React 19.2 · Vite 8 · TypeScript 5.9 · Tailwind 3.4 · Framer Motion 12 · React Router 7 · Vitest 2 · Playwright 1.59 · vite-plugin-pwa 1.2.

### 3.1 Rutas (`src/App.tsx`)

| Ruta | Página | Eager / Lazy | Protegida |
|---|---|---|---|
| `/` | OnboardingPage | eager | no |
| `/login` | LoginPage | eager | no |
| `/register` | RegisterPage | eager | no |
| `/setup` | SetupPage | eager | sí |
| `/home` | HomePage | lazy | sí |
| `/chat` | ChatPage | lazy | sí |
| `/chat/conversation` | ConversationPage | lazy | sí |
| `/community` | CommunityPage | lazy | sí |
| `/league` | LeaguePage | lazy | sí |
| `/profile` | ProfilePage | lazy | sí |
| `/landing` | LandingPage | lazy | no |

Viewport fijo a 430px (formato móvil enmarcado). Animaciones por ruta vía `PageTransition` (`slide` / `fade` / `scale`).

**Providers** (`src/context/`): `ThemeContext`, `AuthContext` (user + toast global), `NotificationsContext` (campana del header), `PredictionsContext` (picks persistidos).

### 3.2 Páginas (`src/pages/`)

| Archivo | LOC | Qué hace |
|---|---:|---|
| `OnboardingPage.tsx` | 262 | Slides de bienvenida pre-login. |
| `LoginPage.tsx` | 136 | Login. |
| `RegisterPage.tsx` | 145 | Registro. |
| `SetupPage.tsx` | 249 | Setup post-registro (perfil, posición, club). |
| `LandingPage.tsx` | 170 | Landing pública. |
| `HomePage.tsx` | **1.381** | Hub: stories, partidos, predicciones, weekly digest, eventos, polls, replay. |
| `ChatPage.tsx` | 143 | Lista de conversaciones. |
| `ConversationPage.tsx` | 490 | Chat con smart replies, tono casual/hype/formal por chat. |
| `CommunityPage.tsx` | 892 | Buscador semántico de equipos + Team Matcher (3 preguntas → top-2). |
| `LeaguePage.tsx` | 512 | Tabla, fixtures, leaderboard regional. |
| `ProfilePage.tsx` | 761 | Tarjeta FIFA, stats, últimos partidos, Coach AI. |

**Total páginas: ~5.400 LOC.**

### 3.3 Features modulares (`src/features/`)

Cada carpeta es una unidad funcional autocontenida. Todas se gatean con feature flags (`src/lib/featureFlags.ts`, override vía localStorage `fb_feature_flags_v1`, hook `useFlag(key)`).

| Feature | Archivo principal | Qué hace |
|---|---|---|
| **achievements** | `AchievementsSheet.tsx` + `catalog.ts` | Logros con rareza (common/rare/epic/legendary). |
| **coach** | `CoachChatSheet.tsx` | Chat con Coach AI (drills + feedback). |
| **duels** | `DuelsSheet.tsx` | Retos 1v1. |
| **events** | `EventsSheet.tsx` | Eventos del equipo / liga. |
| **heatmap** | `HeatmapPitch.tsx` | Mapa de calor sobre cancha. |
| **leaderboard** | `LeaderboardSheet.tsx` | Ranking regional / nacional / amigos. |
| **market** | `MarketSheet.tsx` | "Mercado" gamificado. |
| **polls** | `PollCard.tsx` | Encuestas. |
| **replay** | `MatchReplaySheet.tsx` | Replay narrado (328 LOC, el más grande). |
| **seasonPass** | `SeasonPassSheet.tsx` | Pase de temporada. |
| **share** | `shareFifaCard.ts` | Exporta tarjeta FIFA a imagen (html-to-image). |
| **stories** | `StoriesStrip.tsx` + `storiesData.ts` | Stories tipo Instagram con persistencia de "vistas". |
| **streaks** | `StreakBadge.tsx` + `streaksStore.ts` | Racha de días activos. |
| **tactics** | `TacticsBoardSheet.tsx` | Pizarra táctica. |

### 3.4 Capa de "AI"

Filosofía **deterministic-first**: mocks deterministas con contrato estable, listos para enchufar LLM real sin tocar vistas.

`src/lib/aiMocks.ts` (1.202 LOC) expone 13 servicios:

| Función | Uso |
|---|---|
| `suggestReplies` | Smart replies del chat (16 reglas regex × tono). |
| `suggestScore` | Quiniela Copilot (balanced/optimistic/analytic). |
| `generateMatchRecap` | Recap auto-narrado (ES/EN, 3 tonos). |
| `generateMatchPreview` | Preview pre-partido. |
| `generateCoachFeedback` | Coach AI: nota A+ a C + plan. |
| `matchTeams` | Team Matcher de Comunidad (top-2 con score 0-99). |
| `generateWeeklyDigest` | Resumen semanal en Home. |
| `parseSearchIntent` | Buscador semántico de equipos. |
| `suggestMediaTags` | Auto-tagging al postear. |
| `suggestVideoClips` | Highlights auto-cut. |
| `answerAppQuestion` | FAQ bot. |
| `generateLineup` | Auto-alineación (4-3-3/4-4-2/3-5-2/4-2-3-1/5-3-2). |
| `generateRivalReport` | Scouting report del rival. |

`src/ai/agents/`:

| Agente | Hace |
|---|---|
| `assistantAgent` | Asistente conversacional in-app. |
| `coachAgent` (+ test) | Análisis del jugador y plan. |
| `predictionAgent` (+ test) | Predicción de resultado con confianza. |
| `matchCommentatorAgent` | Comentarios en vivo a partir de eventos. |
| `orchestrator` | `runParallel` / `runSequential` / `runPipeline`. |

`src/ai/rag/`: `knowledgeBase.ts` + `retriever.ts` (`retrieve`, `ragAnswer`).

`src/ai/services/`: `deterministic.ts` (`mulberry32`, `seedFromString`, `winProbability`, `gradeFromStats`), `drills.ts`, `highlights.ts`, `leaderboard.ts`. Todos con tests Vitest.

### 3.5 Librería UI (`src/components/ui/`, 26 componentes)

- **Layout / nav:** `BottomNav`, `BottomSheet`, `PageTransition`, `RouteFallback`, `ErrorBoundary`.
- **Efectos:** `EpicStadiumBackground`, `FloatingOrbs`, `FloatingEmojis`, `FloatingChip`, `ParticleBackground`, `PulseRings`, `LikeBurst`, `AIBorder`, `Skeleton`.
- **Inputs / botones:** `NeonButton`, `NeonInput`, `RippleButton`, `useRipple`, `GlassCard`.
- **Sheets de partido:** `LineupSheet`, `LiveMatchSheet`, `LiveTicker`, `MatchPredictionSheet`, `RivalScoutSheet`.
- **Misc:** `CountUp`, `Toast`, `NotificationsPanel`.

### 3.6 Hooks, i18n, backend mínimo

- `src/hooks/useSimulatedLoad.ts`, `src/hooks/useSpeechRecognition.ts` (Web Speech API).
- `src/i18n/translations.ts` (ES/EN), `src/i18n/useT.ts`.
- `api/og.ts` — endpoint serverless Vercel para OG images dinámicas.
- `scripts/gen-icons.ts` — genera iconos PWA desde SVG.
- `vercel.json`, `vite.config.ts` (PWA), `playwright.config.ts` + `e2e/screenshots.spec.ts`.

### 3.7 Documentación comercial (`docs/`, solo material de GRADA salvo `krujens-brand-context.md`)

**Showcase:** `GRADA-App-Walkthrough.html`, `GRADA-App-Showcase.html` / `-v2.html`.

**Pitch / inversión / proyección:** `GRADA-Pitch-Inversor.html`, `GRADA-Pitch-Clubes.html`, `GRADA-Proyeccion-5Anos.html` / `-v2-Realista.html` / `-Unificada.html`, `projection-premium.html` (+ Conservador 333k€ / Realista 554k€ / Optimista 988k€ / Comparacion), `projection-visual.html`, `financial-projection.html`.

**Análisis competitivo / mercado:** `GRADA-Analisis-Competitivo.html`, `GRADA-vs-Federaciones.html` / `-v2.html`, `market-study.html` + `market-study.md`, `grada-prospecting-list.html`.

**Por audiencia:** `proyecto-clubes.html`, `proyecto-jugadores.html` + `grada-dossier-comercial.pdf`, `proyecto-padres.html` + `grada-guia-familias.pdf`, `proyecto-ffcv.html`, `proyecto-master.html`.

**Branding / GTM:** `grada-brand-book.html`, `grada-brand-context.html`, `grada-brand-guidelines.pdf`, `grada-gtm-master.html`, **`krujens-brand-context.md` (corporativo, transversal)**.

**Scripts Python:** `build_brand_guidelines.py`, `build_client_dossier.py`, `build_family_guide.py`.

**Notas técnicas:** `custom-domain.md`, `lighthouse.md`, `og-images.md`, `sentry.md`.

### 3.8 Assets (`public/`)

Iconos PWA (`favicon.svg`, `icon-192.png`, `icon-512.png`, `icons.svg`, `ball.png`). `screenshots/` (5 pantallas generadas por Playwright). `pruebas/` (sandbox separado, no entra al bundle).

---

## 4. Elite 380

Academia de fútbol. **Primer MVP del portfolio en entrar en producción** (Q4 2025), antes que GRADA.

- **Audiencia:** academia + alumnos + familias.
- **Color:** Neon Orange `#FF6B00`.
- **Repo:** carpeta local en Windows del fundador (`Presentaciones Elite 380/`). No publicado en GitHub al menos en el listado de top repos.
- **Relación con GRADA:** sectores hermanos (ambos fútbol base). Elite 380 es B2B academia (gestión interna). GRADA es B2C jugador + B2B2C club. No comparten código.

**Regla operativa heredada del briefing original de este repo:** nada fuera del repo Grada se toca desde aquí. Si hay que trabajar Elite 380, abrir sesión en su repo.

---

## 5. VITAS

Análisis deportivo. **En portfolio, sin lanzar.** Sin repo identificado en GitHub público del fundador.

- **Color:** Electric Cyan `#00D4FF`.
- **Encaje:** capa analítica natural sobre los productos deportivos del portfolio (GRADA + Elite 380).
- **Cuándo:** candidato a 2º lanzamiento Krujens en 2027 una vez GRADA genere caja.

---

## 6. Essence Bloom

Bienestar / rituales (B2C wellness). Primer vertical Krujens fuera del eje deportivo.

- **Color:** Deep Purple `#B347FF`.
- **Repo:** `fredparedes58-ui/essence-bloom`.
- **Estado:** el brand context decía "no lanzado", pero existe repo propio → hay desarrollo en marcha. Estado real por contrastar abriendo el repo en otra sesión.

---

## 7. [Futuro Krujens]

Placeholder de la arquitectura: 3-5 verticales activas en 2030. Sectores candidatos según la misión: salud familiar, educación extraescolar, comunidad local, autónomos / pymes. Decisión de entrada tras validar GRADA + un segundo vertical.

---

## 8. Colegio · fuera del brand Krujens

Desarrollo educativo paralelo del fundador, **no es vertical Krujens** y **no aparece firmado por Krujens**.

- **Sector:** educación (centro educativo).
- **Repo:** sin identificar todavía. El repo más sospechoso del listado público es `fredparedes58-ui/futuro-club` (encajaría: "club del futuro" como comunidad educativa). Por confirmar.
- **Estado:** en construcción en otra sesión / repo de Claude Code. No accesible desde esta sesión (alcance GitHub MCP limitado a `fredparedes58-ui/Grada`).
- **Pendiente:** nombre del repo, audiencia (¿profesores / dirección / alumnos / familias?), modelo de negocio, stack, estado de avance, decisión sobre si en algún momento entra en Krujens.

---

## 9. Brewchain · fuera del brand Krujens

Desarrollo de hospitality / café paralelo del fundador, **no es vertical Krujens**.

- **Sector:** hospitality / café.
- **Repo:** `fredparedes58-ui/brewchain-app` (confirmado).
- **Estado:** en construcción en otra sesión / repo de Claude Code. No accesible desde esta sesión.
- **Lectura del nombre (a confirmar):** "brew + chain" sugiere trazabilidad / cadena del café (especialidad, origen) más que "cadena de cafeterías", aunque ambas lecturas son posibles.
- **Pendiente:** sub-segmento real, audiencia, modelo, stack, estado de avance.

---

## 10. Repos GitHub sin clasificar

Aparecen en el listado de top repos del fundador (`fredparedes58-ui`) y todavía no están mapeados a un producto:

| Repo | Hipótesis (a validar) |
|---|---|
| `futuro-club` | Posible repo de **Colegio** ("club del futuro" = comunidad educativa). |
| `my-project-hub` | Probable meta-hub / portfolio que enlaza a los demás productos. |
| `interference-tool-advance` | Sin pista clara — sonaría a herramienta técnica / utilidad interna. |
| `dreamteam-arena` | Por nombre, deportivo / fantasy. ¿Spin-off de GRADA o experimento previo? |

**Para resolver:** una línea por repo del fundador y se reorganizan §3–§9.

---

## 11. Cómo navegar este documento

- **Solo me importa GRADA** → §3.
- **Comparativa producto a producto** → §1.
- **Tesis del holding, valores, paleta, hitos** → §2 (y `docs/krujens-brand-context.md`).
- **Mercado y números de GRADA** → `docs/market-study.md`.
- **Productos fuera del brand** → §8 (Colegio) y §9 (Brewchain).
- **Repos sueltos por mapear** → §10.

---

## Apéndice · qué falta por confirmar para cerrar este doc

1. **Colegio:** confirmar repo (¿es `futuro-club`?). Si es otro, decir cuál.
2. **Brewchain:** confirmar lectura del nombre y sub-segmento real.
3. **Repos sin clasificar (§10):** una línea por repo (`futuro-club`, `my-project-hub`, `interference-tool-advance`, `dreamteam-arena`).
4. **Essence Bloom:** estado real del repo `essence-bloom` (el brand context dice "no lanzado", el repo existe).
5. **Elite 380 y VITAS:** confirmar si tienen repos en GitHub que no están en la vista de "top repos" o siguen solo en local / sin código.

> Si en el futuro Colegio o Brewchain se absorben en Krujens, hay que actualizar §2, §4 (paleta) y §8 (hitos) de `docs/krujens-brand-context.md` para que el brand context quede consistente con este doc.
