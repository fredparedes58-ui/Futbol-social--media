# Auditoría Lighthouse

## Local
```bash
npm run build
npm run preview
# En otra terminal:
npx lighthouse http://localhost:4173 --view --preset=perf --only-categories=performance,accessibility,best-practices,seo,pwa --output=html --output-path=./lighthouse.html
```

## Prod
```bash
npx lighthouse https://futbolbase.vercel.app --view --preset=desktop
npx lighthouse https://futbolbase.vercel.app --view --form-factor=mobile
```

## Targets esperados (mobile)
- **Performance:** ≥ 90
- **Accessibility:** ≥ 95
- **Best Practices:** ≥ 95
- **SEO:** ≥ 90
- **PWA:** pass

## Optimizaciones aplicadas
- ✅ Lazy loading de rutas (`React.lazy`)
- ✅ PWA con `vite-plugin-pwa` (Workbox)
- ✅ Imágenes Unsplash con `?w=800&q=80`
- ✅ Prefetch de fuentes Google (Archivo, Space Grotesk)
- ✅ `skipWaiting: true` + `clientsClaim: true` en SW

## Issues frecuentes
- **LCP alto**: optimizar imagen del hero de HomePage (preload, `fetchpriority=high`)
- **CLS**: definir `width/height` en imágenes
- **A11y — contrast**: revisar texto gris sobre fondo oscuro en `rgba(250,245,235,0.4)` y más bajos

## CI con Lighthouse CI (opcional)
Agregar a `.github/workflows/ci.yml`:
```yaml
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '20' }
      - run: npm ci --legacy-peer-deps
      - run: npm run build
      - run: npx @lhci/cli@latest autorun --upload.target=temporary-public-storage
```
