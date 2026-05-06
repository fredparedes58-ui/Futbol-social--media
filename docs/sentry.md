# Integrar Sentry (monitoreo de errores)

El `ErrorBoundary` de `src/components/ui/ErrorBoundary.tsx` ya loguea a consola. Para enviar errores a Sentry:

## 1. Crear cuenta + project
1. https://sentry.io/signup/
2. Create project → **React** → anotar el **DSN** (formato `https://xxx@xxx.ingest.sentry.io/yyy`)

## 2. Instalar SDK
```bash
npm install @sentry/react --legacy-peer-deps
```

## 3. Inicializar
Editar `src/main.tsx`, antes de `ReactDOM.createRoot`:

```ts
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,          // 10% de transacciones
  replaysSessionSampleRate: 0.05, // 5% session replays
  replaysOnErrorSampleRate: 1.0,  // 100% si hubo error
  integrations: [
    Sentry.browserTracingIntegration(),
    Sentry.replayIntegration({ maskAllText: false, blockAllMedia: false }),
  ],
})
```

## 4. Reportar desde ErrorBoundary
En `src/components/ui/ErrorBoundary.tsx`, en `componentDidCatch`:

```ts
componentDidCatch(error: Error, info: ErrorInfo) {
  console.error('[ErrorBoundary]', error, info.componentStack)
  if (typeof window !== 'undefined' && 'Sentry' in window) {
    // @ts-expect-error optional
    window.Sentry?.captureException(error, { contexts: { react: { componentStack: info.componentStack } } })
  }
}
```

## 5. Variables de entorno
Agregar en Vercel → **Settings → Environment Variables**:
- `VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/yyy`

Y en `.env.local` para desarrollo local.

## 6. Source maps (opcional)
```bash
npm install -D @sentry/vite-plugin
```
Agregar plugin a `vite.config.ts` con `SENTRY_AUTH_TOKEN`.
