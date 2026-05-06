import { useMemo } from 'react'

export interface TickerItem {
  home: string
  away: string
  score: string
  min?: string       // "78'", "FT", "HT"
  live?: boolean
}

const DEFAULT_ITEMS: TickerItem[] = [
  { home: 'Los Pumas FC', away: 'Rayo Urbano',    score: '3-1', min: 'FT', live: false },
  { home: 'Águilas',      away: 'Halcones',       score: '2-2', min: "78'", live: true },
  { home: 'Titanes',      away: 'Cóndores',       score: '1-0', min: "54'", live: true },
  { home: 'Real Barrio',  away: 'Atlético Sur',   score: '0-0', min: 'HT' },
  { home: 'Lobos',        away: 'Tigres del Este', score: '4-2', min: 'FT' },
  { home: 'Furia Roja',   away: 'Jaguares',       score: '1-1', min: "63'", live: true },
]

interface LiveTickerProps {
  items?: TickerItem[]
  speed?: number // segundos por ciclo completo
}

/**
 * Barra horizontal con resultados desplazándose estilo ticker de ESPN.
 * Duplica los items para loop infinito sin saltos.
 */
export default function LiveTicker({ items = DEFAULT_ITEMS, speed = 38 }: LiveTickerProps) {
  const doubled = useMemo(() => [...items, ...items], [items])

  return (
    <div
      style={{
        position: 'relative',
        height: 30,
        overflow: 'hidden',
        background: 'linear-gradient(90deg, rgba(15,13,10,0.95), rgba(26,22,18,0.75), rgba(15,13,10,0.95))',
        borderBottom: '1px solid rgba(204, 255, 0, 0.12)',
        borderTop: '1px solid rgba(255, 220, 180, 0.05)',
      }}
    >
      {/* Fade lateral izquierdo */}
      <div style={{
        position: 'absolute', left: 0, top: 0, bottom: 0, width: 40,
        background: 'linear-gradient(90deg, var(--bg-deep), transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />
      {/* Fade lateral derecho */}
      <div style={{
        position: 'absolute', right: 0, top: 0, bottom: 0, width: 40,
        background: 'linear-gradient(-90deg, var(--bg-deep), transparent)',
        zIndex: 2, pointerEvents: 'none',
      }} />

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: 'fit-content',
          height: '100%',
          animation: `ticker-slide ${speed}s linear infinite`,
          whiteSpace: 'nowrap',
        }}
      >
        {doubled.map((it, i) => (
          <div
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '0 18px',
              borderRight: '1px solid rgba(255, 220, 180, 0.06)',
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 11,
              color: 'rgba(250, 245, 235, 0.85)',
              fontWeight: 600,
              letterSpacing: '0.02em',
            }}
          >
            {it.live && (
              <span
                style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: '#FF5B3A',
                  boxShadow: '0 0 8px rgba(255, 91, 58, 0.8)',
                  animation: 'pulse-glow 1.2s ease-in-out infinite',
                  flexShrink: 0,
                }}
              />
            )}
            <span style={{ opacity: 0.75 }}>{it.home}</span>
            <span
              style={{
                fontFamily: 'Archivo, sans-serif',
                fontWeight: 800,
                color: '#CCFF00',
                padding: '1px 6px',
                background: 'rgba(204, 255, 0, 0.08)',
                borderRadius: 4,
                fontSize: 11,
                letterSpacing: '0.04em',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {it.score}
            </span>
            <span style={{ opacity: 0.75 }}>{it.away}</span>
            {it.min && (
              <span
                style={{
                  fontFamily: 'JetBrains Mono, monospace',
                  fontSize: 9,
                  color: it.live ? '#FF5B3A' : 'rgba(250, 245, 235, 0.45)',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {it.min}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
