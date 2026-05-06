import type { CSSProperties, ReactNode } from 'react'

interface AIBorderProps {
  children: ReactNode
  /** Conjunto de colores del conic-gradient. */
  colors?: string[]
  /** Grosor del borde en px. */
  thickness?: number
  /** Radio exterior (el interior se calcula como radius - thickness). */
  radius?: number
  /** Duración de la rotación en segundos. */
  speed?: number
  /** Opacidad del halo difuso detrás. */
  halo?: number
  style?: CSSProperties
}

/**
 * Wrapper con borde cónico rotatorio — más sutil que el de la tarjeta FIFA.
 * Pensado para cards de AI (Recap, Coach, Digest, Preview).
 */
export default function AIBorder({
  children,
  colors = ['#B347FF', '#00D4FF', '#CCFF00', '#B347FF'],
  thickness = 1,
  radius = 16,
  speed = 7,
  halo = 0.35,
  style,
}: AIBorderProps) {
  const innerRadius = Math.max(0, radius - thickness)
  return (
    <div
      style={{
        position: 'relative',
        borderRadius: radius,
        padding: thickness,
        overflow: 'hidden',
        ...style,
      }}
    >
      {/* Borde cónico rotando */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '-50%',
          background: `conic-gradient(from 0deg, ${colors.join(', ')})`,
          animation: `ring-sweep ${speed}s linear infinite`,
          filter: 'blur(0.5px) saturate(130%)',
          pointerEvents: 'none',
        }}
      />
      {/* Halo difuso sutil */}
      <div
        aria-hidden
        style={{
          position: 'absolute',
          inset: '-20%',
          background: `conic-gradient(from 180deg, transparent, ${colors[0]}55, transparent, ${colors[1] ?? colors[0]}55, transparent)`,
          animation: `ring-sweep ${speed * 1.6}s linear infinite reverse`,
          filter: 'blur(18px)',
          opacity: halo,
          pointerEvents: 'none',
        }}
      />
      <div style={{ position: 'relative', borderRadius: innerRadius, overflow: 'hidden' }}>
        {children}
      </div>
    </div>
  )
}
