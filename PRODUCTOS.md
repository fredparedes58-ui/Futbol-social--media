# GRADA · Mapa completo de productos y desarrollos

> Documento de contexto generado automáticamente recorriendo `src/`, `docs/`, `api/` y `public/`.
> Sirve como índice maestro: qué hay construido en este repo, qué hace cada pieza y dónde mirar.
> Última actualización: 2026-05-06.

---

## 0. Resumen ejecutivo

**GRADA** es una PWA mobile-first (React 19 + Vite 8 + TypeScript + Tailwind + Framer Motion) para el ecosistema del fútbol amateur federado. Es el **producto insignia 2026** del holding **Krujens**, que también opera otras verticales (Vitas, Elite 380, Essence Bloom).

Lo que hay en este repo se agrupa en cuatro grandes capas:

1. **Aplicación GRADA** — 11 páginas, ~14 features modulares, capa de "AI" determinista con agentes/RAG mock, librería de componentes UI con efectos (glassmorphism, neón, partículas).
2. **Documentación comercial / marketing** — 30+ entregables HTML, 3 PDFs, scripts Python para regenerarlos, brand book, GTM playbook, dossier para clubes/familias/jugadores/federación.
3. **Estudio de mercado y proyecciones financieras** — TAM/SAM/SOM CV, tres escenarios (conservador / realista / optimista), comparativa competitiva, plan de prospección de clubes.
4. **Infra de desarrollo** — Playwright para e2e + screenshots, Vitest, ESLint, PWA config (`vite-plugin-pwa`), Vercel deploy, OG image API serverless, generador de iconos.

Stack: React 19.2, Vite 8, TypeScript 5.9, Tailwind 3.4, Framer Motion 12, React Router 7, Vitest 2, Playwright 1.59, vite-plugin-pwa 1.2.

---

## 1. Producto: GRADA (PWA)

**Una frase:** Red social + IA + carrera gamificada para el jugador amateur federado.

**Posicionamiento:** ningún competidor combina simultáneamente red social del jugador, IA determinista útil, gamificación FIFA-style, B2C direct-to-player y mobile-first PWA. Gap recogido en `docs/market-study.md` (sección 5.1).

**Modelo de negocio (mix):** Free (ads + límites IA) · Pro 4,99€/mes ó 39€/año · Club 29€/mes por equipo. ARPU mezclado proyectado ~2€/mes.

**Estructura de ruteo** (`src/App.tsx`):

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

Ancho fijo del viewport a 430px (formato móvil enmarcado). Animaciones de transición por ruta (`PageTransition` con variantes `slide` / `fade` / `scale`).

**Providers de contexto** (`src/context/`):
- `ThemeContext.tsx` — tema visual.
- `AuthContext.tsx` — usuario, toast global.
- `NotificationsContext.tsx` — bandeja en la campana del header.
- `PredictionsContext.tsx` — picks de quiniela persistidos.

---

## 2. Páginas (`src/pages/`)

| Archivo | LOC | Qué hace |
|---|---:|---|
| `OnboardingPage.tsx` | 262 | Slides de bienvenida pre-login. |
| `LoginPage.tsx` | 136 | Login. |
| `RegisterPage.tsx` | 145 | Registro. |
| `SetupPage.tsx` | 249 | Setup post-registro (perfil, posición, club). |
| `LandingPage.tsx` | 170 | Landing pública (no protegida). |
| `HomePage.tsx` | **1.381** | Hub principal: stories, partidos, predicciones, weekly digest, eventos, polls, replay, etc. |
| `ChatPage.tsx` | 143 | Lista de conversaciones. |
| `ConversationPage.tsx` | 490 | Chat con smart replies, tono casual/hype/formal por chat. |
| `CommunityPage.tsx` | 892 | Buscador semántico de equipos, Team Matcher (3 preguntas → top-2). |
| `LeaguePage.tsx` | 512 | Tabla de liga, fixtures, leaderboard regional. |
| `ProfilePage.tsx` | 761 | Tarjeta FIFA del jugador, stats, últimos partidos, Coach AI. |

**Total páginas: ~5.400 LOC.**

---

## 3. Features modulares (`src/features/`)

Cada carpeta es una unidad funcional autocontenida (componente "sheet" + datos/store si lo necesita). Todas se gatean con feature flags.

| Feature | Archivo principal | Qué hace |
|---|---|---|
| **achievements** | `AchievementsSheet.tsx` + `catalog.ts` | Logros con rareza (common/rare/epic/legendary). `evaluateAchievements(stats)` desbloquea. |
| **coach** | `CoachChatSheet.tsx` | Chat con Coach AI (drills personalizados, feedback de stats). |
| **duels** | `DuelsSheet.tsx` | Retos 1v1 entre jugadores. |
| **events** | `EventsSheet.tsx` | Eventos del equipo / liga. |
| **heatmap** | `HeatmapPitch.tsx` | Mapa de calor sobre cancha de un jugador. |
| **leaderboard** | `LeaderboardSheet.tsx` | Ranking regional / nacional / amigos. |
| **market** | `MarketSheet.tsx` | "Mercado" gamificado de jugadores. |
| **polls** | `PollCard.tsx` | Encuestas de la comunidad. |
| **replay** | `MatchReplaySheet.tsx` | Replay narrado de un partido (328 LOC, el feature más grande). |
| **seasonPass** | `SeasonPassSheet.tsx` | Pase de temporada con recompensas. |
| **share** | `shareFifaCard.ts` | Exporta la tarjeta FIFA del jugador a imagen (html-to-image). |
| **stories** | `StoriesStrip.tsx` + `storiesData.ts` | Stories tipo Instagram de la comunidad. Persistencia de "vistas" en localStorage. |
| **streaks** | `StreakBadge.tsx` + `streaksStore.ts` | Racha de días activos (`pingStreak()`, `getStreak()`, `resetStreak()`). |
| **tactics** | `TacticsBoardSheet.tsx` | Pizarra táctica interactiva. |

**Feature flags** (`src/lib/featureFlags.ts`): `coach-chat`, `match-replay`, `duels`, `market`, `season-pass`, `stories`, `polls`, `events`, `leaderboard`. Todos `true` por defecto, override con localStorage `fb_feature_flags_v1`. Hook `useFlag(key)` reacciona vía evento custom `fb-flags-changed`.

---

## 4. Capa de "AI" (`src/ai/` + `src/lib/aiMocks.ts`)

Filosofía: **deterministic-first**. Las funciones de IA son mocks deterministas con contrato estable, listos para enchufar un LLM real sin tocar las vistas.

### 4.1 `src/lib/aiMocks.ts` (1.202 LOC) — el cerebro mock

Servicios expuestos:

| Función | Entrada | Salida | Uso |
|---|---|---|---|
| `suggestReplies(lastMsg, ctx)` | mensaje + tono casual/hype/formal | hasta 3 chips | Smart replies de chat. 16 reglas regex (confirmar, cancha, hora, gol, derrota, lesión, clima, etc.) + genéricas. |
| `suggestScore(home, away, mood)` | mood balanced/optimistic/analytic | `{home, away, reason, confidence}` | Quiniela Copilot (predicción de marcador con razonamiento). |
| `generateMatchRecap(facts, opts)` | resultado, goleador, momento clave | headline + tagline + body + highlights | Recap auto-narrado del partido (ES/EN, 3 tonos). |
| `generateMatchPreview(input)` | local + visitante + fecha | keyMatchup, fortalezas, xFactor, hype | Preview pre-partido. |
| `generateCoachFeedback(stats)` | stats jugador | nota A+ a C, fortalezas, mejoras, foco | Coach AI del perfil. |
| `matchTeams(candidates, answers)` | preferencias usuario | top-2 con score 0-99 + razón | Team Matcher de la Comunidad. |
| `generateWeeklyDigest(weekStats)` | stats semana | título + highlight + secciones + outlook | Resumen semanal en Home. |
| `parseSearchIntent(query)` | NL query | intent + filters (día, estilo, nivel, zona, tamaño) | Buscador semántico de Comunidad. |
| `suggestMediaTags(input)` | caption + meta | hasta 5 tags con confianza | Auto-tagging al postear foto/video. |
| `suggestVideoClips(meta)` | duración + score + topScorer | clips ordenados por confianza | Highlights auto-cut. |
| `answerAppQuestion(query)` | NL query | respuesta + follow-ups | FAQ bot del onboarding. |
| `generateLineup(opp, formation, style)` | rival + 4-3-3/4-4-2/3-5-2/4-2-3-1/5-3-2 | XI con ratings, posiciones x/y, key player | Auto-alineación. |
| `generateRivalReport(opponent)` | rival | overall, forma últimos 5, fortalezas, debilidades, danger player, threat level | Scouting report del rival. |

### 4.2 `src/ai/agents/`

Estructura tipo Claude Agent SDK pero local y determinista. Tipos en `types.ts` (`Agent<I,O>`, `AgentContext`, `AgentResult<T>` con `ok / data / error`). Helper `defineAgent(...)`.

| Agente | Hace |
|---|---|
| `assistantAgent.ts` | Asistente conversacional in-app (FAQ + capacidades). |
| `coachAgent.ts` (+ test) | Análisis de rendimiento del jugador y plan de mejora. |
| `predictionAgent.ts` (+ test) | Predicción de resultado con confianza. |
| `matchCommentatorAgent.ts` | Comentarios en vivo del partido a partir de eventos (`MatchEvent`, `EventType`). |
| `orchestrator.ts` | Ejecuta agentes en `runParallel`, `runSequential` o `runPipeline` (output → input). |

### 4.3 `src/ai/rag/`

| Archivo | Hace |
|---|---|
| `knowledgeBase.ts` | `KNOWLEDGE_BASE: KbDoc[]` + índice por topic. Datos del producto y reglas de negocio que el assistant puede citar. |
| `retriever.ts` (+ test) | `retrieve(query, k=3)` recupera top-k docs; `ragAnswer(query, k=2)` devuelve respuesta + fuentes. |

### 4.4 `src/ai/services/`

| Archivo | Funciones clave |
|---|---|
| `deterministic.ts` | `mulberry32`, `seedFromString`, `pickDeterministic`, `clamp`, `gradeFromStats`, `winProbability(homeRating, awayRating)`, `deriveMetrics(stats)`. Núcleo de aleatoriedad reproducible. |
| `drills.ts` | `generateDrills(input)` genera ejercicios para una `Weakness` (`shot`, `pass`, `def`, `phy`, `pace`, `dribble`, `mental`). |
| `highlights.ts` | `detectHighlights(events, topK=3)` extrae los momentos clave del partido. |
| `leaderboard.ts` | `simulateLeaderboard(input)` con scope `regional`/`national`/`friends`. |

Todos los servicios tienen tests Vitest (`*.test.ts`).

---

## 5. Librería UI (`src/components/ui/`)

26 componentes. Categorías:

**Layout & navegación:** `BottomNav`, `BottomSheet`, `PageTransition`, `RouteFallback`, `ErrorBoundary`.

**Efectos visuales:** `EpicStadiumBackground`, `FloatingOrbs`, `FloatingEmojis`, `FloatingChip`, `ParticleBackground`, `PulseRings`, `LikeBurst`, `AIBorder`, `Skeleton`.

**Inputs / botones:** `NeonButton`, `NeonInput`, `RippleButton`, `useRipple`, `GlassCard`.

**Sheets de partido:** `LineupSheet`, `LiveMatchSheet`, `LiveTicker`, `MatchPredictionSheet`, `RivalScoutSheet`.

**Misc:** `CountUp` (contadores animados), `Toast`, `NotificationsPanel`.

---

## 6. Hooks e i18n

| Archivo | Hace |
|---|---|
| `src/hooks/useSimulatedLoad.ts` | Simula latencia para skeletons. |
| `src/hooks/useSpeechRecognition.ts` | Wrapper Web Speech API (input por voz en el chat). |
| `src/i18n/translations.ts` | Diccionario ES/EN. |
| `src/i18n/useT.ts` | Hook `useT()` para traducir. |

---

## 7. Backend mínimo y scripts

- `api/og.ts` (5.7 KB) — endpoint serverless (Vercel) que genera Open Graph images dinámicas.
- `scripts/gen-icons.ts` — genera iconos PWA desde SVG fuente (`public/favicon.svg` → `icon-192.png`, `icon-512.png`).
- `vercel.json` — config de despliegue.
- `vite.config.ts` — Vite + plugin React + plugin PWA con manifest.
- `playwright.config.ts` + `e2e/` — tests E2E y `screenshots.spec.ts` para generar `public/screenshots/{1-landing,2-home,3-profile,4-league,5-community}.png`.
- `vitest.config.ts` — tests unitarios.

---

## 8. Documentos comerciales y marketing (`docs/`)

### 8.1 Producto / showcase

| Archivo | Tipo | Qué es |
|---|---|---|
| `GRADA-App-Walkthrough.html` | HTML | "GRADA · La app por dentro" — recorrido pantalla a pantalla. |
| `GRADA-App-Showcase.html` / `-v2.html` | HTML | Showcase del producto, v1 y v2. |

### 8.2 Pitch / inversión / proyección

| Archivo | Qué es |
|---|---|
| `GRADA-Pitch-Inversor.html` | Pitch para inversor + proyección 5 años. |
| `GRADA-Pitch-Clubes.html` | Pitch para clubes ("el upgrade que tus padres están esperando"). |
| `GRADA-Proyeccion-5Anos.html` | Proyección a 5 años (2027-2031). |
| `GRADA-Proyeccion-5Anos-v2-Realista.html` | Versión realista de la proyección. |
| `GRADA-Proyeccion-Unificada.html` | Proyección unificada. |
| `projection-premium.html` | Financial Deck Premium. |
| `projection-premium-conservador.html` | Escenario CONSERVADOR · 333k€ ARR Y5. |
| `projection-premium-realista.html` | Escenario REALISTA · 554k€ ARR Y5. |
| `projection-premium-optimista.html` | Escenario OPTIMISTA · 988k€ ARR Y5. |
| `projection-premium-comparacion.html` | Comparación 3 escenarios + 6 estrategias. |
| `projection-visual.html` | Versión visual de la proyección. |
| `financial-projection.html` | Proyección financiera e inversión. |

### 8.3 Análisis competitivo y mercado

| Archivo | Qué es |
|---|---|
| `GRADA-Analisis-Competitivo.html` | Análisis competitivo 2026. |
| `GRADA-vs-Federaciones.html` / `-v2.html` | Comparativa frente a federaciones (FFCV, RFEF). |
| `market-study.html` / `market-study.md` | Estudio de mercado CV: TAM 126k jugadores, SAM 84k, SOM Y5 21k usuarios, mix planes, OPEX, break-even Y5. |
| `grada-prospecting-list.html` | Plan de prospección de clubes España + Europa. |

### 8.4 Por audiencia

| Archivo | Audiencia |
|---|---|
| `proyecto-clubes.html` | Clubes. |
| `proyecto-jugadores.html` / `grada-dossier-comercial.pdf` | Jugadores y comercial. |
| `proyecto-padres.html` / `grada-guia-familias.pdf` | Padres / familias. |
| `proyecto-ffcv.html` | Federación de fútbol de la Comunidad Valenciana. |
| `proyecto-master.html` | Vista índice de todas las presentaciones. |

### 8.5 Branding y GTM

| Archivo | Qué es |
|---|---|
| `grada-brand-book.html` | Brand Book interactivo. |
| `grada-brand-context.html` | Brand & Marketing Context — solución Krujens. |
| `grada-brand-guidelines.pdf` | Guidelines de marca. |
| `krujens-brand-context.md` | Contexto de marca de la matriz Krujens (portfolio, voz, valores). |
| `grada-gtm-master.html` | GTM Master Playbook. |

### 8.6 Scripts de generación (Python)

- `build_brand_guidelines.py` — regenera el PDF de guidelines.
- `build_client_dossier.py` — regenera el dossier comercial.
- `build_family_guide.py` — regenera la guía para familias.

### 8.7 Notas técnicas

- `custom-domain.md` — pasos para configurar dominio.
- `lighthouse.md` — notas de auditoría Lighthouse.
- `og-images.md` — diseño de las OG images (consumidas por `api/og.ts`).
- `sentry.md` — integración de errores.

---

## 9. Assets (`public/`)

- `favicon.svg`, `icon-192.png`, `icon-512.png`, `icons.svg`, `ball.png` — iconos PWA y assets visuales.
- `screenshots/` — `1-landing.png`, `2-home.png`, `3-profile.png`, `4-league.png`, `5-community.png` (generadas por Playwright, usadas en manifest y docs).
- `pruebas/` — sandbox/prototipo independiente con `index.html`, `app.jsx`, screens y uploads. Es un patio de pruebas, no entra en el bundle.

---

## 10. Contexto del holding: Krujens

GRADA es la primera vertical en ir a mercado del portfolio Krujens. Resto del portfolio (no en este repo, **no tocar**):

```
              KRUJENS (matriz)
                    │
   ┌─────────┬──────┼──────┬──────────────┐
   ▼         ▼      ▼      ▼              ▼
GRADA     VITAS  Elite 380  Essence Bloom  [futuro]
(fútbol   (análisis (academia (bienestar /  (próximo
 base)    deportivo) fútbol)   rituales)    vertical)
```

Tagline matriz: *Tecnología que entiende tu mundo.* Stack común: React + Vite + Supabase/Firebase + PWA. Filosofía: mobile-first real, IA útil no marketing, precio justo, datos del usuario son del usuario.

> Regla operativa heredada del briefing: nada fuera de este repo se toca. Elite 380 vive en otra carpeta y es un proyecto distinto.

---

## 11. Estado del repo y siguientes pasos sugeridos

- Rama actual: `claude/document-products-developments-UsLid` (este doc).
- Rebrand FutbolBase → GRADA ya consolidado en código y docs (cero referencias a `futbolbase` esperadas).
- Pendientes mencionados en el briefing original:
  - Despliegue Vercel (`vercel.json` + `.vercel/` ya configurado).
  - Configurar dominio custom (`docs/custom-domain.md`).
  - Decidir qué de `src/ai/`, `src/features/`, `src/i18n/` queda fijo y qué iterar.
  - Validar cohortes Y1 contra los supuestos de `docs/market-study.md`.

---

## 12. Cómo navegar este documento

- Si buscas **una pantalla**: §2.
- Si buscas **una funcionalidad gamificada o social**: §3 (features).
- Si buscas **dónde está la "IA"**: §4. Empieza por `src/lib/aiMocks.ts`.
- Si buscas **un componente visual**: §5.
- Si necesitas **un deck o PDF para mandar fuera**: §8.
- Si te preguntan por **mercado, números, competencia**: `docs/market-study.md` y §8.3.
- Si te preguntan por **identidad corporativa**: `docs/krujens-brand-context.md` y §10.
