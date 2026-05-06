# Krujens · Mapa completo de productos y desarrollos

> Documento maestro del portfolio Krujens. Cubre los cinco productos del holding,
> con detalle técnico de **GRADA** (única vertical cuyo código vive en este repo) y
> contexto de marca/negocio del resto, extraído de `docs/krujens-brand-context.md`.
> Última actualización: 2026-05-06.

---

## 0. Krujens (matriz)

**Una frase:** holding español de SaaS verticales mobile-first que construye PWAs donde hoy solo hay Excel y WhatsApp.

**Tagline corto:** *Tecnología que entiende tu mundo.*
**Tagline largo:** *Krujens construye herramientas digitales donde hoy sólo hay hojas de Excel, WhatsApp y papel.*

**Misión:** democratizar el acceso a tecnología de nivel enterprise en sectores infraestructurados (deporte base, salud, educación, comunidad local).

**Visión 2030:** referente iberoamericano en PWAs verticales para sectores sub-digitalizados — 3-5 productos activos, 150.000+ usuarios acumulados, ARR > 1,5M€, presencia España + LATAM.

**Valores (4 pilares):**
1. Mobile-first real (no adaptamos webs).
2. IA útil, no IA marketing.
3. Precio justo (5-15€/mes, accesible al usuario final).
4. Datos del usuario son del usuario (RGPD máximo, cero reventa).

**Stack común a todos los verticales:** React + Vite + TypeScript + Tailwind + Supabase/Firebase + PWA (vite-plugin-pwa).

**Playbook por vertical:**
1. Elegir sector sub-digitalizado con dolor real.
2. MVP PWA en 8-12 semanas con stack reutilizable.
3. Validar con 50-100 usuarios antes de invertir en ads.
4. Monetizar a 5-15€/mes (precio que se paga sin pensarlo).
5. Escalar por comunidad, no por ads.
6. Reinvertir cash en el siguiente vertical.

**Fundador:** Pedro Paredes (Valencia, España).

---

## 1. Arquitectura del portfolio

```
                       KRUJENS (matriz)
                             │
   ┌─────────────┬───────────┼───────────┬──────────────┐
   ▼             ▼           ▼           ▼              ▼
GRADA         VITAS      Elite 380   Essence Bloom   [futuro]
fútbol base   análisis    academia    bienestar /    próximo
              deportivo   fútbol      rituales       vertical

         Fuera del brand Krujens (por ahora)
   ┌─────────────────────┬─────────────────────┐
   ▼                     ▼
Colegio              Brewchain
(desarrollo           (desarrollo de
educativo)            café / hospitality)
```

Sistema **endorsed brand** dentro de Krujens: cada vertical tiene marca propia, pero firma "una solución Krujens" en footer / about / legal. **Colegio y Brewchain NO entran en este sistema por ahora** — son desarrollos paralelos sin paraguas Krujens.

**Color asignado a cada vertical** (paleta corporativa Krujens):

| Vertical | Color secundario | Hex | Por qué |
|---|---|---|---|
| GRADA | Neon Orange | `#FF6B00` | acción, deporte |
| Elite 380 | Neon Orange | `#FF6B00` | acción, deporte (mismo sector) |
| VITAS | Electric Cyan | `#00D4FF` | tech, confianza |
| Essence Bloom | Deep Purple | `#B347FF` | bienestar, premium |
| Krujens (matriz) | Krujens Green `#00E676` + Obsidian Navy `#0A1628` | — | identidad corporativa |
| **Colegio** *(fuera de Krujens)* | n/a | n/a | identidad propia, sin paraguas Krujens |
| **Brewchain** *(fuera de Krujens)* | n/a | n/a | identidad propia, sin paraguas Krujens |

---

## 2. Comparativa rápida del portfolio

### Dentro del brand Krujens

| Producto | Sector | Audiencia | Modelo | Estado | Código |
|---|---|---|---|---|---|
| **GRADA** | Fútbol amateur federado | Jugador + club + familia + federación | Free + Pro 4,99€/mes + Club 29€/mes/equipo | Lanzamiento 2026 Q2, ronda seed 250k€ | **Este repo** |
| **Elite 380** | Academia de fútbol | Academia + alumnos + familias | A definir | Primer MVP en producción 2025 Q4 | Repo aparte (no tocar) |
| **VITAS** | Análisis deportivo | A definir (deportistas / clubes) | A definir | En portfolio, no lanzado | No en este repo |
| **Essence Bloom** | Bienestar / rituales | Usuario final B2C | A definir | Repo propio, estado de desarrollo por confirmar | `fredparedes58-ui/essence-bloom` |
| **[Futuro]** | Próximo vertical | A definir | A definir | A definir tras ARR Y2 GRADA | — |

### Fuera del brand Krujens (por ahora)

Desarrollos paralelos del fundador que no se consideran verticales Krujens hoy. Pueden incorporarse en el futuro o quedarse como marcas independientes.

| Producto | Sector | Estado | Código |
|---|---|---|---|
| **Colegio** | Educación (centro educativo) | Desarrollo en marcha en otra sesión / repo de Claude Code | Repo no identificado todavía — sospechoso: `futuro-club`, por confirmar |
| **Brewchain** | Hospitality / café | Desarrollo en marcha en otra sesión / repo de Claude Code | `fredparedes58-ui/brewchain-app` |
| **Otros repos sin clasificar** | Por confirmar | Detectados en listado GitHub del fundador, ver §6b.3 | `futuro-club`, `my-project-hub`, `interference-tool-advance`, `dreamteam-arena` |

---

## 3. GRADA (producto insignia 2026 — único cuyo código vive aquí)

**Una frase:** Red social + IA + carrera gamificada para el jugador amateur federado.

**Producto insignia 2026** del portfolio Krujens. Primera vertical en ir a mercado con go-to-market, ronda seed y modelo SaaS recurrente.

**Posicionamiento:** ningún competidor combina simultáneamente red social del jugador, IA determinista útil, gamificación FIFA-style, B2C direct-to-player y mobile-first PWA (gap recogido en `docs/market-study.md` §5.1).

**Modelo:** Free (ads + límites IA) · Pro 4,99€/mes ó 39€/año · Club 29€/mes/equipo. ARPU mezclado proyectado ~2€/mes.

**Mercado (CV):** TAM 126k jugadores federados → SAM 84k → SOM Y5 21k usuarios activos → ARR Y5 504k€ (escenario base). Techo teórico 1-pago-por-federado @ 4,99€ = 7,58M€/año.

**Hitos comunicados:**
- 2026 Q2 — lanzamiento + ronda seed 250k€.
- 2026 Q3 — acuerdo piloto FFCV.
- 2027 — expansión a 3 CCAA.
- 2030 — break-even Y5 escenario base.

**Stack del repo:** React 19.2 + Vite 8 + TypeScript 5.9 + Tailwind 3.4 + Framer Motion 12 + React Router 7 + Vitest 2 + Playwright 1.59 + vite-plugin-pwa 1.2.

### 3.1 Estructura de ruteo (`src/App.tsx`)

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

**Providers** (`src/context/`): `ThemeContext`, `AuthContext` (user + toast), `NotificationsContext`, `PredictionsContext`.

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

Cada carpeta es una unidad funcional autocontenida (sheet + datos/store si lo necesita). Todas se gatean con feature flags.

| Feature | Archivo principal | Qué hace |
|---|---|---|
| **achievements** | `AchievementsSheet.tsx` + `catalog.ts` | Logros con rareza (common/rare/epic/legendary). |
| **coach** | `CoachChatSheet.tsx` | Chat con Coach AI (drills + feedback de stats). |
| **duels** | `DuelsSheet.tsx` | Retos 1v1 entre jugadores. |
| **events** | `EventsSheet.tsx` | Eventos del equipo / liga. |
| **heatmap** | `HeatmapPitch.tsx` | Mapa de calor sobre cancha. |
| **leaderboard** | `LeaderboardSheet.tsx` | Ranking regional / nacional / amigos. |
| **market** | `MarketSheet.tsx` | "Mercado" gamificado de jugadores. |
| **polls** | `PollCard.tsx` | Encuestas de la comunidad. |
| **replay** | `MatchReplaySheet.tsx` | Replay narrado de partido (328 LOC, el más grande). |
| **seasonPass** | `SeasonPassSheet.tsx` | Pase de temporada con recompensas. |
| **share** | `shareFifaCard.ts` | Exporta tarjeta FIFA a imagen (html-to-image). |
| **stories** | `StoriesStrip.tsx` + `storiesData.ts` | Stories tipo Instagram con persistencia de "vistas". |
| **streaks** | `StreakBadge.tsx` + `streaksStore.ts` | Racha de días activos. |
| **tactics** | `TacticsBoardSheet.tsx` | Pizarra táctica interactiva. |

**Feature flags** (`src/lib/featureFlags.ts`): `coach-chat`, `match-replay`, `duels`, `market`, `season-pass`, `stories`, `polls`, `events`, `leaderboard`. Override vía localStorage `fb_feature_flags_v1`. Hook `useFlag(key)`.

### 3.4 Capa de "AI" (`src/ai/` + `src/lib/aiMocks.ts`)

Filosofía **deterministic-first**: mocks deterministas con contrato estable, listos para enchufar LLM real sin tocar vistas.

`src/lib/aiMocks.ts` (1.202 LOC):

| Función | Salida | Uso |
|---|---|---|
| `suggestReplies` | hasta 3 chips | Smart replies de chat (16 reglas regex + tono). |
| `suggestScore` | marcador + razonamiento | Quiniela Copilot (balanced/optimistic/analytic). |
| `generateMatchRecap` | headline + body + highlights | Recap auto-narrado (ES/EN, 3 tonos). |
| `generateMatchPreview` | matchup + fortalezas + xFactor | Preview pre-partido. |
| `generateCoachFeedback` | nota A+ a C + plan | Coach AI del perfil. |
| `matchTeams` | top-2 con score 0-99 | Team Matcher de Comunidad. |
| `generateWeeklyDigest` | título + secciones + outlook | Resumen semanal en Home. |
| `parseSearchIntent` | filtros NL → estructurados | Buscador semántico de Comunidad. |
| `suggestMediaTags` | hasta 5 tags | Auto-tagging al postear. |
| `suggestVideoClips` | clips ordenados | Highlights auto-cut. |
| `answerAppQuestion` | respuesta + follow-ups | FAQ bot. |
| `generateLineup` | XI con ratings y x/y | Auto-alineación (4-3-3/4-4-2/3-5-2/4-2-3-1/5-3-2). |
| `generateRivalReport` | overall + forma + danger player | Scouting report. |

`src/ai/agents/`:

| Agente | Hace |
|---|---|
| `assistantAgent` | Asistente conversacional in-app. |
| `coachAgent` (+ test) | Análisis del jugador y plan. |
| `predictionAgent` (+ test) | Predicción de resultado con confianza. |
| `matchCommentatorAgent` | Comentarios en vivo a partir de eventos. |
| `orchestrator` | `runParallel` / `runSequential` / `runPipeline`. |

`src/ai/rag/`: `knowledgeBase.ts` + `retriever.ts` (`retrieve(query,k)`, `ragAnswer(query,k)`).

`src/ai/services/`: `deterministic.ts` (`mulberry32`, `seedFromString`, `winProbability`, `gradeFromStats`), `drills.ts`, `highlights.ts`, `leaderboard.ts`. Todos con tests Vitest.

### 3.5 Librería UI (`src/components/ui/` — 26 componentes)

- **Layout/nav:** `BottomNav`, `BottomSheet`, `PageTransition`, `RouteFallback`, `ErrorBoundary`.
- **Efectos:** `EpicStadiumBackground`, `FloatingOrbs`, `FloatingEmojis`, `FloatingChip`, `ParticleBackground`, `PulseRings`, `LikeBurst`, `AIBorder`, `Skeleton`.
- **Inputs/botones:** `NeonButton`, `NeonInput`, `RippleButton`, `useRipple`, `GlassCard`.
- **Sheets de partido:** `LineupSheet`, `LiveMatchSheet`, `LiveTicker`, `MatchPredictionSheet`, `RivalScoutSheet`.
- **Misc:** `CountUp`, `Toast`, `NotificationsPanel`.

### 3.6 Hooks e i18n

`src/hooks/useSimulatedLoad.ts`, `src/hooks/useSpeechRecognition.ts` (Web Speech API), `src/i18n/translations.ts` (ES/EN), `src/i18n/useT.ts`.

### 3.7 Backend mínimo y scripts

- `api/og.ts` — endpoint serverless Vercel para OG images dinámicas.
- `scripts/gen-icons.ts` — genera iconos PWA desde SVG.
- `vercel.json`, `vite.config.ts` (PWA), `playwright.config.ts` (+ `e2e/screenshots.spec.ts` que rellena `public/screenshots/`).

### 3.8 Documentos comerciales (`docs/` — solo material de GRADA)

**Producto / showcase:** `GRADA-App-Walkthrough.html`, `GRADA-App-Showcase.html` / `-v2.html`.

**Pitch / inversión / proyección:** `GRADA-Pitch-Inversor.html`, `GRADA-Pitch-Clubes.html`, `GRADA-Proyeccion-5Anos.html` / `-v2-Realista.html` / `-Unificada.html`, `projection-premium.html` (+ variantes Conservador 333k€ / Realista 554k€ / Optimista 988k€ / Comparacion), `projection-visual.html`, `financial-projection.html`.

**Análisis competitivo / mercado:** `GRADA-Analisis-Competitivo.html`, `GRADA-vs-Federaciones.html` / `-v2.html`, `market-study.html` + `market-study.md`, `grada-prospecting-list.html`.

**Por audiencia:** `proyecto-clubes.html`, `proyecto-jugadores.html` + `grada-dossier-comercial.pdf`, `proyecto-padres.html` + `grada-guia-familias.pdf`, `proyecto-ffcv.html`, `proyecto-master.html`.

**Branding / GTM:** `grada-brand-book.html`, `grada-brand-context.html`, `grada-brand-guidelines.pdf`, `grada-gtm-master.html`, `krujens-brand-context.md` (corporativo, transversal a todo el portfolio).

**Scripts Python (regeneran PDFs):** `build_brand_guidelines.py`, `build_client_dossier.py`, `build_family_guide.py`.

**Notas técnicas:** `custom-domain.md`, `lighthouse.md`, `og-images.md`, `sentry.md`.

### 3.9 Assets (`public/`)

`favicon.svg`, `icon-192.png`, `icon-512.png`, `icons.svg`, `ball.png`. `screenshots/` (5 pantallas generadas por Playwright). `pruebas/` (sandbox, no entra al bundle).

---

## 4. Elite 380 (academia de fútbol)

**Sector:** academia de fútbol (formación deportiva).

**Estado:** primer MVP en producción 2025 Q4 — fue la primera vertical Krujens en entrar en producción, antes de GRADA.

**Audiencia:** academia + alumnos + familias.

**Color secundario asignado:** Neon Orange `#FF6B00` (mismo bucket "deporte" que GRADA).

**Relación con GRADA:** sectores hermanos (ambos fútbol base), pero foco distinto — Elite 380 es B2B academia (gestión interna de la academia), GRADA es B2C jugador + B2B2C club. No comparten código.

**Repo:** vive en otra carpeta (`Presentaciones Elite 380/`). **Regla operativa innegociable** del briefing original: nada fuera de este repo se toca. Si te piden trabajar sobre Elite 380, abrir sesión en su repo.

---

## 5. VITAS (análisis deportivo)

**Sector:** análisis deportivo (data + visualización + IA aplicada).

**Estado:** en portfolio, **no lanzado**. Sin código en este repo.

**Color secundario asignado:** Electric Cyan `#00D4FF` (bucket "tech, confianza").

**Posicionamiento previsible:** la "capa analítica" del portfolio — encaja como complemento natural a GRADA y Elite 380 (datos del deporte amateur), aunque el scope final está por definir.

**Próximos pasos previstos en el plan Krujens:** lanzamiento de un 2º vertical en 2027 una vez GRADA genere caja. VITAS es el candidato más alineado por sector.

---

## 6. Essence Bloom (bienestar / rituales)

**Sector:** bienestar / rituales (B2C wellness).

**Repositorio:** `github.com/fredparedes58-ui/essence-bloom` (confirmado desde el listado de top repos del fundador).

**Estado:** tiene repo propio, **estado de desarrollo por confirmar** (`docs/krujens-brand-context.md` dice "no lanzado", pero al existir el repo es probable que haya código en marcha — pendiente revisar al abrir el repo).

**Color secundario asignado:** Deep Purple `#B347FF` (bucket "bienestar, premium").

**Diferenciador respecto al resto del portfolio:** primer vertical que sale del eje deportivo. Encaja con la misión Krujens de cubrir "salud, comunidad local" además de deporte.

**Cuándo se lanza:** sin fecha pública. Probablemente después de validar el playbook con GRADA y un segundo vertical.

**Pendiente:** abrir el repo en otra sesión para contrastar avance real vs. lo que dice el brand context.

---

## 6b. Desarrollos fuera del brand Krujens

Aclaración del fundador: hay dos desarrollos en marcha que **hoy no forman parte del paraguas Krujens** y se trabajan en sesiones / repos separados de Claude Code (no accesibles desde esta sesión, que está restringida al repo `fredparedes58-ui/Grada`).

### 6b.1 Colegio

- **Sector:** educación (centro educativo).
- **Tipo:** desarrollo paralelo, fuera del brand Krujens por ahora.
- **Estado:** en construcción en otra sesión / repo. Sin acceso desde aquí.
- **Pendiente de aportar (cuando el fundador comparta el repo o los datos):**
  - Nombre comercial definitivo.
  - Audiencia exacta (¿profesores, dirección, alumnos, familias, todos?).
  - Modelo de negocio (¿SaaS al colegio?, ¿gratis para familias?, ¿licencia por aula?).
  - Stack y repositorio.
  - Estado de avance (idea / MVP / producción).
  - Decisión sobre si en algún momento se incorpora al brand Krujens o se mantiene independiente.

### 6b.2 Brewchain (café)

- **Sector:** hospitality / café.
- **Repositorio:** `github.com/fredparedes58-ui/brewchain-app` (confirmado desde el listado de top repos del fundador).
- **Tipo:** desarrollo paralelo, fuera del brand Krujens por ahora.
- **Estado:** en construcción en otra sesión / repo de Claude Code. No accesible desde esta sesión (alcance GitHub MCP limitado a `fredparedes58-ui/Grada`).
- **Hipótesis sobre el nombre:** "Brewchain" sugiere algo en torno a la **trazabilidad / cadena del café** (brew + chain), aunque "chain" también puede leerse como cadena de cafeterías. Confirmar.
- **Pendiente de aportar (al abrir el repo en otra sesión o al pasarme su README):**
  - Sub-segmento real (¿trazabilidad blockchain del café?, ¿gestión interna de la cafetería?, ¿fidelización de clientes?, ¿marketplace de café de especialidad?, ¿formación a baristas?).
  - Audiencia, modelo, stack.
  - Estado de avance.
  - Decisión sobre si entra en Krujens o se mantiene independiente.

---

### 6b.3 Otros repos detectados (sin clasificar)

En el listado de top repos del fundador (`fredparedes58-ui`) aparecen estos cuatro proyectos adicionales que **no están mapeados** ni en el brand Krujens ni en la lista de "fuera del brand". Pueden ser experimentos, MVPs descartados, herramientas internas, alias de un producto ya listado o el repo de "Colegio" bajo otro nombre — **hace falta confirmación del fundador**:

| Repo | Hipótesis (a validar) |
|---|---|
| `fredparedes58-ui/futuro-club` | ¿"Club del futuro"? Por nombre podría sonar a club deportivo / comunidad → ¿se solapa con GRADA o con Elite 380? ¿O es un proyecto educativo con lógica de "club"? Posible candidato a ser el repo de **Colegio**. |
| `fredparedes58-ui/my-project-hub` | Por nombre, parece un *meta-hub* (portfolio / landing que enlaza a los demás productos). |
| `fredparedes58-ui/interference-tool-advance` | Sin pista clara desde el nombre — sonaría a herramienta técnica / utilidad interna. |
| `fredparedes58-ui/dreamteam-arena` | Por nombre, deportivo / fantasy. ¿Posible spin-off de GRADA o experimento previo? |

> **Acción concreta para cerrar este apartado:** dictarme una línea por repo ("X es Y, está en estado Z, encaja en/fuera de Krujens") o pasarme el README de cada uno. Con eso reorganizo §3–§6b correctamente.

> **Nota sobre "Colegio":** en la pantalla compartida hoy no aparece un repo llamado `colegio` o `escuela`. Puede que esté bajo "Show more" del listado, o que se llame de otra forma (sospechoso: `futuro-club`). Confirmar el repo correcto.

---

## 7. [Futuro] (próximo vertical sin definir)

**Estado:** placeholder en la arquitectura. Sectores candidatos según la misión Krujens: salud familiar, educación extraescolar, comunidad local, autónomos / pymes locales.

**Criterio de entrada:** se decide tras validar unit economics de GRADA + una segunda vertical (probablemente Elite 380 maduro o VITAS lanzado).

**Objetivo 2030:** que el portfolio activo sea de 3-5 verticales (hoy hay 2 con código en producción: GRADA + Elite 380).

---

## 8. Hitos cronológicos del holding

| Fecha | Hito |
|---|---|
| 2025 Q4 | Primer MVP **Elite 380** en producción. |
| 2026 Q1 | Krujens se registra legalmente como entidad matriz. |
| 2026 Q2 | Lanzamiento **GRADA** + ronda seed 250k€. |
| 2026 Q3 | Acuerdo piloto con FFCV (Federación Fútbol Com. Valenciana). |
| 2027 | Expansión GRADA a 3 CCAA + lanzamiento 2º vertical (probablemente VITAS). |
| 2030 | 3-5 verticales activas, 150k usuarios, ARR > 1,5M€. |

---

## 9. Audiencias cruzadas a todo el portfolio

| # | Audiencia | Mensaje clave Krujens |
|---|---|---|
| 1 | **Usuarios finales B2C** (familias, jugadores, pacientes) | *"Por fin una herramienta que entiende tu día a día."* |
| 2 | **Organizaciones B2B / B2B2C** (clubes, academias, federaciones, clínicas) | *"Software que tus usuarios usan de verdad, no solo tu equipo admin."* |
| 3 | **Inversores / partners** (BAs, fondos seed, family offices, federaciones) | *"Portfolio de SaaS verticales con unit economics reales y founder que envía producto cada semana."* |
| 4 | **Talento técnico** (devs, diseñadores, growth) | *"Aquí envías producto en días, no en sprints de 3 meses. Tu código toca a miles de usuarios."* |

---

## 10. Estado de cada vertical en 1 línea

**Dentro del brand Krujens:**

- **GRADA** — código completo en este repo, lanzamiento Q2 2026, ronda seed activa.
- **Elite 380** — MVP en producción desde Q4 2025, repo aparte, no se toca desde aquí.
- **VITAS** — en portfolio, sin código aquí, candidata a 2º lanzamiento 2027.
- **Essence Bloom** — repo propio (`essence-bloom`), estado de desarrollo por contrastar.
- **[Futuro]** — placeholder, sin definir, decisión post-validación de los primeros lanzamientos.

**Fuera del brand Krujens (por ahora):**

- **Colegio** — desarrollo educativo paralelo. Repo aún sin identificar (sospechoso: `fredparedes58-ui/futuro-club`, por confirmar).
- **Brewchain** — desarrollo de hospitality / café. Repo: `fredparedes58-ui/brewchain-app`. No accesible desde esta sesión.

**Otros repos detectados sin clasificar todavía** (`fredparedes58-ui/...`): `futuro-club`, `my-project-hub`, `interference-tool-advance`, `dreamteam-arena`. Naturaleza por confirmar — ver §6b.3.

> **Nota de consistencia del brand context:** `docs/krujens-brand-context.md` lista 4 verticales Krujens + placeholder y está alineado con §0–§5 de este documento. Colegio y Brewchain no entran ahí porque hoy están **fuera** del brand Krujens; si en el futuro se decide absorberlos, habría que actualizar §2 ("El portfolio de soluciones"), §4 (paleta) y §8 (hitos) de ese brand context. Lo mismo aplica a los repos sin clasificar de §6b.3 si alguno resulta ser un vertical Krujens en encubierto.

---

## 11. Cómo navegar este documento

- ¿Solo te importa **GRADA**? → §3 (todo el detalle del repo).
- ¿Quieres comparar **producto a producto** del portfolio? → §2.
- ¿Necesitas **identidad visual / paleta** de un vertical? → §1 (color asignado).
- ¿Te preguntan por **el holding y su tesis**? → §0.
- ¿Necesitas **un timeline de hitos**? → §8.
- ¿Te preguntan por **los números de mercado de GRADA**? → `docs/market-study.md`.
- ¿Te preguntan por **branding o tono Krujens**? → `docs/krujens-brand-context.md`.
