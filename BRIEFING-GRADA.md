# Briefing para Claude Code — Retomar proyecto y renombrarlo a GRADA

## Por qué existe este documento

La sesión anterior de Cowork quedó rota porque su working directory apuntaba a un worktree que ya no existe (`...\Presentaciones Elite 380\Nueva carpeta (2)\.claude\worktrees\vibrant-yonath`). Entras a una sesión nueva, en este repo (`C:\Users\pparedes\Downloads\FutbolBase\`), para continuar el trabajo. Léete este documento entero antes de hacer cualquier cambio.

## El proyecto en una frase

PWA de fútbol amateur (React + Vite + TypeScript + Tailwind, con Capacitor para móvil y Supabase como backend). Hasta ahora se llamaba "FutbolBase". **A partir de ahora se llama GRADA.**

## Lo primero que tienes que hacer (sin tocar nada)

1. `git status` y `git log --oneline -5` para ver el estado.
2. `cat package.json` para ver dependencias y scripts.
3. `ls docs/` para ver los entregables generados.
4. Devuélveme un resumen breve antes de proponer cambios.

## Estado del repo al recibir este brief

- **Rama**: `main`
- **Commit base**: `aeecbb4 — FutbolBase: PWA de fútbol amateur con diseño Electric Citrus + 9 features de AI mock`
- **Sin commitear (16 modificados)**: `.gitignore`, `package.json`, `package-lock.json`, `vite.config.ts`, `src/App.tsx`, `src/main.tsx`, `src/index.css`, `src/lib/aiMocks.ts`, `src/components/ui/{FloatingOrbs,GlassCard,NeonButton}.tsx`, `src/pages/{Chat,Conversation,Home,League,Profile}Page.tsx`.
- **Sin trackear (carpetas nuevas)**: `docs/`, `api/`, `e2e/`, `src/ai/`, `src/features/`, `src/i18n/`, `public/screenshots/`.
- **Sin trackear (archivos sueltos)**: `playwright.config.ts`, `vitest.config.ts`, `vercel.json`, varios componentes en `src/components/ui/` (`AIBorder`, `CountUp`, `ErrorBoundary`, `LineupSheet`, `LiveMatchSheet`, `LiveTicker`, `RippleButton`, `RivalScoutSheet`, `useRipple`), `src/hooks/useSpeechRecognition.ts`, `src/lib/featureFlags.ts`, `src/pages/LandingPage.tsx`.

## Entregables que NO debes perder ni romper

En `docs/` hay HTMLs y PDFs ya finalizados de la era "FutbolBase". Los dos definitivos que el usuario está usando son:

- `docs/FutbolBase-App-Walkthrough.html` (showcase de la app)
- `docs/FutbolBase-vs-Federaciones-v2.html` (análisis competitivo)

Hay otros muchos en `docs/` (pitch clubes, pitch inversor, brand book, dossier, proyecciones financieras, etc.). Trátalos como artefactos históricos: los puedes renombrar al rebrand, pero no los borres ni los reescribas sin permiso explícito.

## Tarea principal: rebrand FutbolBase → GRADA

Hay 463 referencias a "FutbolBase" / "futbolbase" / "FUTBOLBASE" en 50 archivos. Hay que sustituirlas por "GRADA" / "grada" / "GRADA" respetando el casing.

**Antes de empezar, confirma conmigo cuatro decisiones:**

1. **Nombre técnico (`package.json` `"name"`):** ¿`grada`, `grada-app`, `grada-pwa`?
2. **Carpeta del repo:** ¿lo dejamos en `Downloads\FutbolBase\` o lo renombramos a `Downloads\GRADA\`? (Si lo renombramos hace falta cerrar la sesión Cowork, mover, y reabrir.)
3. **Archivos de `docs/` que llevan "FutbolBase" en el nombre:** ¿los renombramos en sitio (`GRADA-App-Walkthrough.html` etc.) o conservamos los antiguos como histórico y generamos versiones nuevas?
4. **Slogan/tagline:** ¿hay uno nuevo asociado a GRADA o reutilizamos el actual? (Si me das uno, lo aplico al rebrand del UI y los docs.)

Cuando tenga esas 4 respuestas, ejecuta el rebrand en el siguiente orden:

### Fase 1 — Rebrand técnico (commit aparte)
- `package.json` `"name"`, `package-lock.json`, `index.html` (title + meta), `vite.config.ts` (PWA name si aplica), `vercel.json` si tiene `name`.
- Verifica que `npm install` y `npm run build` siguen funcionando antes de continuar.

### Fase 2 — Rebrand del producto (UI + textos visibles, commit aparte)
- `src/pages/{Register,Login,Home,Onboarding}Page.tsx`
- `src/context/{Theme,Auth,Predictions}Context.tsx`
- Cualquier string visible al usuario (`"FutbolBase"` → `"GRADA"`).
- Manifest PWA (`public/manifest.json` o donde esté), iconos, splash si llevan el nombre.

### Fase 3 — Rebrand de los docs/ (commit aparte)
- Renombrar archivos `FutbolBase-*.html` → `GRADA-*.html` (y `futbolbase-*.html` → `grada-*.html`).
- Reemplazar contenido interno de cada HTML/MD/PDF generado por scripts. Para los PDFs, regenera con los `.py` (`build_brand_guidelines.py`, `build_client_dossier.py`, `build_family_guide.py`) tras actualizar las constantes de marca dentro de los scripts.
- Actualiza cualquier link cruzado entre docs.

### Fase 4 — Limpieza
- `git status` debe mostrar 0 referencias a FutbolBase. Verifícalo con: `grep -rni "futbolbase" --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist .`
- Sugiere al usuario commits temáticos limpios para el trabajo huérfano que ya había sin commitear (no lo mezcles con el rebrand).

## Reglas innegociables

1. **No tocar nada fuera de este repo.** Específicamente: `C:\Users\pparedes\Downloads\Presentaciones Elite 380\` es un proyecto distinto (academia Elite 380), no debes leer ni escribir nada ahí. Son productos diferentes.
2. **Pregunta antes de cambios masivos.** Las 4 decisiones de arriba son obligatorias antes de tocar archivos.
3. **Cada fase = un commit (o varios pequeños).** No mezcles rebrand técnico con rebrand de UI con docs.
4. **Si encuentras secretos** (claves Supabase, tokens Vercel, etc. en `.env` o similares), no los pegues en chat ni en commits.
5. **El historial git existe** (commit `aeecbb4`). No fuerces push, no rebases, no resetees sin avisar.

## Estado de configuración para Cowork

Ya está hecho: `.gitignore` excluye `.claude/` y `.claire/`, así que cualquier worktree que crees no contaminará el repo. Existe `.claude/worktrees/` vacío como placeholder.

## Después del rebrand

Cuando GRADA esté limpio, próximas cosas que probablemente quiera el usuario (no hagas ninguna sin pedirlo):
- Desplegar a Vercel (ya hay `vercel.json` y `.vercel/`).
- Generar las screenshots para `public/screenshots/` y manifest PWA.
- Configurar dominio custom (hay un `docs/custom-domain.md`).
- Decidir qué de `src/ai/`, `src/features/`, `src/i18n/` se mantiene y qué se commitea.

---

**Resumen de un párrafo para arrancar:** Estás retomando un proyecto que se llamaba FutbolBase y se renombra a GRADA. El repo está en `C:\Users\pparedes\Downloads\FutbolBase\`, rama `main`, con 1 commit base y bastante trabajo huérfano sin commitear. Tu primera tarea es leer el estado, hacerme 4 preguntas (nombre técnico, carpeta, docs, tagline), y entonces ejecutar el rebrand en 4 fases con commits separados. Nada fuera de este repo se toca.
