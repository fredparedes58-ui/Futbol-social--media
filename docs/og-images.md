# OG Images dinámicas

Endpoint: `api/og.tsx` — corre en **Edge Runtime** de Vercel con `@vercel/og`.

## Uso

### Player card
```
/api/og?type=player&name=Alex+Rivera&rating=84&team=Los+Pumas
```

### Team card
```
/api/og?type=team&name=Los+Pumas&wins=12&draws=3&losses=2
```

Tamaño: **1200×630** (estándar OG).

## Integrar en meta tags

En `index.html`:
```html
<meta property="og:image" content="https://grada.vercel.app/api/og?type=team&name=GRADA&wins=0&draws=0&losses=0" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:image" content="https://grada.vercel.app/api/og?..." />
```

## Compartir dinámicamente desde la app
```ts
const url = `https://grada.vercel.app/api/og?type=player&name=${encodeURIComponent(name)}&rating=${rating}&team=${encodeURIComponent(team)}`
navigator.share({ url, title: `${name} · ${rating} OVR` })
```

## Caché
Vercel Edge cachea automáticamente por query string. Para forzar no-cache, agregar header en el handler:
```ts
return new ImageResponse(..., {
  width: 1200, height: 630,
  headers: { 'Cache-Control': 'public, max-age=3600, s-maxage=86400' },
})
```
