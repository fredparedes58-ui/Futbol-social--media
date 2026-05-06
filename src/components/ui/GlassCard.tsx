import { type ReactNode, type CSSProperties } from 'react'

interface GlassCardProps {
  children: ReactNode
  accent?: string
  padding?: number | string
  style?: CSSProperties
  onClick?: () => void
}

export default function GlassCard({
  children, accent, padding = 16, style, onClick,
}: GlassCardProps) {
  // Double glow (ring sharp + halo medio + halo lejano) + inner highlight superior
  // + drop shadow de profundidad. Cuando hay accent el halo toma su color.
  const borderColor = accent ? `${accent}60` : 'rgba(255, 220, 180, 0.10)'
  const ringSharp   = accent ? `0 0 0 1px ${accent}40`      : '0 0 0 1px rgba(255,220,180,0.04)'
  const haloMid     = accent ? `0 0 22px ${accent}38`       : '0 0 18px rgba(0,0,0,0.25)'
  const haloFar     = accent ? `0 0 58px ${accent}1A`       : '0 0 40px rgba(0,0,0,0.18)'
  const innerTop    = 'inset 0 1px 0 rgba(255, 255, 255, 0.10)'
  const innerBot    = 'inset 0 -1px 0 rgba(0, 0, 0, 0.25)'
  const depth       = '0 10px 28px rgba(0, 0, 0, 0.38)'

  return (
    <div
      onClick={onClick}
      style={{
        position: 'relative',
        background: 'linear-gradient(180deg, rgba(36,31,24,0.62) 0%, rgba(22,18,14,0.55) 100%)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        border: `1px solid ${borderColor}`,
        borderRadius: 18,
        padding,
        boxShadow: [ringSharp, haloMid, haloFar, innerTop, innerBot, depth].join(', '),
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.15s ease, box-shadow 0.25s ease',
        ...style,
      }}
    >
      {children}
    </div>
  )
}
