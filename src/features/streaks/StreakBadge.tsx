/**
 * StreakBadge — ícono compacto con fuego animado mostrando racha actual.
 */
import { useEffect, useState } from 'react'
import { Flame } from 'lucide-react'
import { getStreak, pingStreak } from './streaksStore'

interface Props {
  /** Si true, registra actividad del día actual al montar (ping automático). */
  autoPing?: boolean
  compact?: boolean
  onClick?: () => void
}

export default function StreakBadge({ autoPing = true, compact = false, onClick }: Props) {
  const [state, setState] = useState(() => (autoPing ? pingStreak() : getStreak()))

  useEffect(() => {
    if (autoPing) setState(pingStreak())
  }, [autoPing])

  const { current, best } = state
  const hot = current >= 3
  const color = current >= 7 ? '#FFB800' : current >= 3 ? '#FF5B3A' : 'rgba(250,245,235,0.5)'

  if (compact) {
    return (
      <button
        onClick={onClick}
        aria-label={`Racha ${current} días`}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '4px 8px', borderRadius: 999,
          background: hot ? 'rgba(255,91,58,0.12)' : 'rgba(255,255,255,0.04)',
          border: `1px solid ${hot ? 'rgba(255,91,58,0.45)' : 'rgba(255,220,180,0.1)'}`,
          cursor: onClick ? 'pointer' : 'default',
          animation: hot ? 'pulse-glow 2s ease-in-out infinite' : 'none',
        }}
      >
        <Flame size={12} color={color} style={{ filter: hot ? `drop-shadow(0 0 4px ${color})` : 'none' }} />
        <span style={{ fontFamily: 'Archivo', fontSize: 11, fontWeight: 800, color }}>
          {current}
        </span>
      </button>
    )
  }

  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 14px', borderRadius: 12,
        background: hot
          ? 'linear-gradient(135deg, rgba(255,91,58,0.18), rgba(255,184,0,0.10))'
          : 'rgba(255,255,255,0.04)',
        border: `1px solid ${hot ? 'rgba(255,91,58,0.45)' : 'rgba(255,220,180,0.1)'}`,
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: hot ? `0 0 14px ${color}33` : 'none',
      }}
    >
      <div style={{ position: 'relative', width: 34, height: 34, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Flame size={26} color={color} style={{ filter: hot ? `drop-shadow(0 0 8px ${color})` : 'none', animation: hot ? 'pulse-glow 1.5s ease-in-out infinite' : 'none' }} />
      </div>
      <div style={{ textAlign: 'left' }}>
        <div style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 16, color, lineHeight: 1 }}>
          {current} {current === 1 ? 'día' : 'días'}
        </div>
        <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.55)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Racha · Mejor {best}
        </div>
      </div>
    </button>
  )
}
