/**
 * HeatmapPitch — cancha SVG con zonas de calor según efectividad.
 * Determinístico por seed (nombre del jugador).
 */
import { useMemo } from 'react'
import { mulberry32, seedFromString } from '../../ai/services/deterministic'

interface Props {
  name: string
  width?: number
}

function color(v: number): string {
  // v en [0,1]. Escala verde → amarillo → naranja → rojo.
  if (v < 0.25) return `rgba(0, 212, 255, ${0.2 + v})`
  if (v < 0.5)  return `rgba(204, 255, 0, ${0.3 + v * 0.5})`
  if (v < 0.75) return `rgba(255, 184, 0, ${0.4 + v * 0.4})`
  return `rgba(255, 91, 58, ${0.5 + v * 0.4})`
}

export default function HeatmapPitch({ name, width = 280 }: Props) {
  const rng = useMemo(() => mulberry32(seedFromString(`heatmap-${name}`)), [name])
  const zones = useMemo(() => {
    const ROWS = 6, COLS = 4
    const out: { row: number; col: number; v: number }[] = []
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        // Concentrar zonas calientes en el tercio ofensivo
        const ofensBias = r < 2 ? 0.4 : r > 3 ? -0.1 : 0.15
        const v = Math.max(0, Math.min(1, rng() * 0.8 + ofensBias))
        out.push({ row: r, col: c, v })
      }
    }
    return out
  }, [rng])

  const height = width * 1.5
  return (
    <div style={{ position: 'relative', width, height, margin: '0 auto' }}>
      {/* Cancha base */}
      <svg viewBox="0 0 100 150" preserveAspectRatio="none" width={width} height={height} style={{
        position: 'absolute', inset: 0,
        borderRadius: 14,
        background: 'linear-gradient(180deg, #0B2E1A 0%, #0E3822 50%, #0B2E1A 100%)',
        border: '2px solid rgba(204,255,0,0.35)',
        boxShadow: '0 0 20px rgba(204,255,0,0.15), inset 0 0 30px rgba(0,0,0,0.4)',
      }}>
        {/* Heat cells */}
        {zones.map((z, i) => {
          const cellW = 100 / 4
          const cellH = 150 / 6
          return (
            <rect
              key={i}
              x={z.col * cellW} y={z.row * cellH}
              width={cellW} height={cellH}
              fill={color(z.v)}
              style={{ mixBlendMode: 'screen' }}
            />
          )
        })}
        {/* Lines overlay */}
        <g style={{ opacity: 0.6 }}>
          <rect x="1" y="1" width="98" height="148" fill="none" stroke="#CCFF00" strokeWidth="0.3" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="#CCFF00" strokeWidth="0.3" />
          <circle cx="50" cy="75" r="10" fill="none" stroke="#CCFF00" strokeWidth="0.3" />
          <rect x="25" y="1"   width="50" height="18" fill="none" stroke="#CCFF00" strokeWidth="0.3" />
          <rect x="25" y="131" width="50" height="18" fill="none" stroke="#CCFF00" strokeWidth="0.3" />
        </g>
      </svg>
      {/* Leyenda */}
      <div style={{
        position: 'absolute', bottom: -26, left: 0, right: 0,
        display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Space Grotesk', fontSize: 9, color: 'rgba(250,245,235,0.55)',
      }}>
        <span>Frío</span>
        <div style={{
          width: 80, height: 6, borderRadius: 999,
          background: 'linear-gradient(90deg, rgba(0,212,255,0.8), rgba(204,255,0,0.8), rgba(255,184,0,0.8), rgba(255,91,58,0.9))',
        }} />
        <span>Caliente</span>
      </div>
    </div>
  )
}
