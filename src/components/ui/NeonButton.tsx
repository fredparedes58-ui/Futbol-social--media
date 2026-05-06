import { type ReactNode, type CSSProperties, type MouseEvent } from 'react'
import { useRipple, RippleLayer } from './useRipple'

type Variant = 'lime' | 'amber' | 'coral' | 'gradient'

interface NeonButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: Variant
  fullWidth?: boolean
  disabled?: boolean
  style?: CSSProperties
  type?: 'button' | 'submit'
}

const COLORS: Record<Variant, { bg: string; glow: string; text: string }> = {
  lime:     { bg: '#CCFF00', glow: 'rgba(204, 255, 0, 0.5)', text: '#0F0D0A' },
  amber:    { bg: '#FFB800', glow: 'rgba(255, 184, 0, 0.5)', text: '#0F0D0A' },
  coral:    { bg: '#FF5B3A', glow: 'rgba(255, 91, 58, 0.5)', text: '#FFFFFF' },
  gradient: { bg: 'linear-gradient(90deg, #CCFF00, #FFB800, #CCFF00)', glow: 'rgba(204, 255, 0, 0.35)', text: '#0F0D0A' },
}

export default function NeonButton({
  children, onClick, variant = 'lime', fullWidth = true, disabled, style, type = 'button',
}: NeonButtonProps) {
  const c = COLORS[variant]
  const { ripples, spawn } = useRipple()
  const press = (e: MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.transform = 'scale(0.98)'
    spawn(e)
  }
  const release = (e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = 'scale(1)' }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      onMouseDown={press}
      onMouseUp={release}
      onMouseLeave={release}
      style={{
        position: 'relative',
        height: 56,
        width: fullWidth ? '100%' : 'auto',
        padding: fullWidth ? undefined : '0 28px',
        borderRadius: 14,
        background: c.bg,
        backgroundSize: variant === 'gradient' ? '200% 100%' : undefined,
        border: 'none',
        cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'Space Grotesk, sans-serif',
        fontWeight: 700,
        fontSize: 15,
        color: c.text,
        boxShadow: `0 8px 24px ${c.glow}, 0 0 40px ${c.glow}, 0 2px 6px rgba(0,0,0,0.3)`,
        transition: 'transform 0.15s',
        overflow: 'hidden',
        opacity: disabled ? 0.5 : 1,
        animation: variant === 'gradient' ? 'gradient-shift 3s ease-in-out infinite' : undefined,
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0, bottom: 0, width: 60,
          background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)',
          animation: 'shimmer 2.5s linear infinite',
          pointerEvents: 'none',
        }}
      />
      <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
      <RippleLayer ripples={ripples} color={c.text === '#0F0D0A' ? 'rgba(15,13,10,0.3)' : 'rgba(255,255,255,0.4)'} />
    </button>
  )
}
