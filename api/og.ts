/**
 * /api/og — tarjeta OG SVG dinámica (sin @vercel/og, sin deps).
 * Runtime: Edge.
 *
 * Ejemplos:
 *   /api/og?type=player&name=Alex+Rivera&rating=84&team=Los+Pumas
 *   /api/og?type=team&name=Los+Pumas&wins=12&draws=3&losses=2
 */

export const config = { runtime: 'edge' }

function esc(s: string): string {
  return s.replace(/[<>&"']/g, ch => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[ch]!))
}

function teamSVG({ name, wins, draws, losses }: { name: string; wins: number; draws: number; losses: number }): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g1" cx="20%" cy="20%" r="60%"><stop offset="0" stop-color="#CCFF00" stop-opacity="0.18"/><stop offset="1" stop-color="#CCFF00" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="80%" cy="80%" r="60%"><stop offset="0" stop-color="#B347FF" stop-opacity="0.18"/><stop offset="1" stop-color="#B347FF" stop-opacity="0"/></radialGradient>
    <linearGradient id="badge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#CCFF00"/><stop offset="1" stop-color="#FFB800"/></linearGradient>
  </defs>
  <rect width="1200" height="630" fill="#0F0D0A"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>
  <g transform="translate(72,72)">
    <rect width="64" height="64" rx="14" fill="url(#badge)"/>
    <text x="32" y="48" text-anchor="middle" font-family="sans-serif" font-size="36" font-weight="900" fill="#0F0D0A">⚽</text>
    <text x="84" y="44" font-family="sans-serif" font-size="28" font-weight="800" fill="#CCFF00">FútbolBase</text>
  </g>
  <text x="72" y="260" font-family="sans-serif" font-size="84" font-weight="900" fill="#FAF5EB" letter-spacing="-3">${esc(name)}</text>
  <text x="72" y="310" font-family="sans-serif" font-size="24" fill="rgba(250,245,235,0.6)">Temporada en curso</text>
  <g transform="translate(72,380)">
    ${[
      { n: wins, l: 'W', c: '#CCFF00', x: 0 },
      { n: draws, l: 'D', c: '#FFB800', x: 356 },
      { n: losses, l: 'L', c: '#FF5B3A', x: 712 },
    ].map(s => `
      <g transform="translate(${s.x},0)">
        <rect width="336" height="180" rx="20" fill="${s.c}" fill-opacity="0.12" stroke="${s.c}" stroke-opacity="0.5" stroke-width="2"/>
        <text x="32" y="112" font-family="sans-serif" font-size="96" font-weight="900" fill="${s.c}">${s.n}</text>
        <text x="32" y="148" font-family="sans-serif" font-size="22" font-weight="700" fill="#FAF5EB" letter-spacing="3">${s.l}</text>
      </g>`).join('')}
  </g>
</svg>`
}

function playerSVG({ name, rating, team }: { name: string; rating: number; team: string }): string {
  const ratingColor = rating >= 85 ? '#CCFF00' : rating >= 70 ? '#FFB800' : '#FAF5EB'
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="g1" cx="30%" cy="30%" r="60%"><stop offset="0" stop-color="#CCFF00" stop-opacity="0.20"/><stop offset="1" stop-color="#CCFF00" stop-opacity="0"/></radialGradient>
    <radialGradient id="g2" cx="80%" cy="70%" r="60%"><stop offset="0" stop-color="#B347FF" stop-opacity="0.18"/><stop offset="1" stop-color="#B347FF" stop-opacity="0"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="#0F0D0A"/>
  <rect width="1200" height="630" fill="url(#g1)"/>
  <rect width="1200" height="630" fill="url(#g2)"/>
  <g transform="translate(80,0)">
    <text x="180" y="360" text-anchor="middle" font-family="sans-serif" font-style="italic" font-size="240" font-weight="900" fill="${ratingColor}" letter-spacing="-10">${rating}</text>
    <rect x="70" y="400" width="220" height="48" rx="24" fill="${ratingColor}" fill-opacity="0.12" stroke="${ratingColor}" stroke-opacity="0.5" stroke-width="2"/>
    <text x="180" y="432" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="800" fill="${ratingColor}" letter-spacing="4">OVERALL</text>
  </g>
  <g transform="translate(460,0)">
    <text x="0" y="140" font-family="sans-serif" font-size="20" font-weight="800" fill="#CCFF00" letter-spacing="4">FÚTBOLBASE · TARJETA OFICIAL</text>
    <text x="0" y="250" font-family="sans-serif" font-size="84" font-weight="900" fill="#FAF5EB" letter-spacing="-2">${esc(name)}</text>
    <text x="0" y="310" font-family="sans-serif" font-size="30" fill="rgba(250,245,235,0.6)">${esc(team)}</text>
    ${['PAC', 'DRI', 'SHO', 'PAS'].map((k, i) => `
      <g transform="translate(${i * 130},360)">
        <rect width="116" height="56" rx="12" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.15)"/>
        <text x="58" y="36" text-anchor="middle" font-family="sans-serif" font-size="22" font-weight="800" fill="#FAF5EB" letter-spacing="3">${k}</text>
      </g>`).join('')}
  </g>
</svg>`
}

export default function handler(req: Request): Response {
  const url = new URL(req.url)
  const type = url.searchParams.get('type') ?? 'player'
  const name = url.searchParams.get('name') ?? 'FútbolBase'

  let svg: string
  if (type === 'team') {
    svg = teamSVG({
      name,
      wins: Number(url.searchParams.get('wins')) || 0,
      draws: Number(url.searchParams.get('draws')) || 0,
      losses: Number(url.searchParams.get('losses')) || 0,
    })
  } else {
    svg = playerSVG({
      name,
      rating: Number(url.searchParams.get('rating')) || 78,
      team: url.searchParams.get('team') ?? 'FútbolBase',
    })
  }

  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=86400',
    },
  })
}
