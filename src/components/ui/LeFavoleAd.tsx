/**
 * LeFavoleAd — Publicidad flotante horizontal tipo pill de Le Favole.
 */
import { useEffect, useState } from 'react'

const GOLD  = '#C9A76A'
const GOLD2 = '#E8C97A'
const URL   = 'https://lefavole.es/es/'

export default function LeFavoleAd() {
  const [visible, setVisible]     = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [sparkle, setSparkle]     = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!visible) return
    const id = setInterval(() => {
      setSparkle(true)
      setTimeout(() => setSparkle(false), 700)
    }, 6000)
    return () => clearInterval(id)
  }, [visible])

  if (dismissed) return null

  return (
    <>
      <style>{`
        @keyframes lf-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-3px); }
        }
        @keyframes lf-enter {
          from { opacity: 0; transform: translateY(8px) scale(0.94); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lf-glow {
          0%,100% { box-shadow: 0 0 6px ${GOLD}33, 0 1px 6px rgba(0,0,0,0.5); }
          50%      { box-shadow: 0 0 12px ${GOLD}55, 0 1px 8px rgba(0,0,0,0.6); }
        }
        @keyframes lf-shimmer {
          0%   { left: -40px; opacity: 0; }
          40%  { opacity: 0.7; }
          70%  { opacity: 0.7; }
          100% { left: 160px; opacity: 0; }
        }
        @keyframes lf-spark {
          0%   { opacity: 0; transform: scale(0) rotate(0deg); }
          50%  { opacity: 1; transform: scale(1.2) rotate(180deg); }
          100% { opacity: 0; transform: scale(0) rotate(360deg); }
        }
      `}</style>

      {/* Wrapper posicionado */}
      <div style={{
        position: 'absolute',
        bottom: 78,
        right: 12,
        zIndex: 50,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        animation: visible
          ? 'lf-enter 0.45s cubic-bezier(.2,.8,.2,1) both, lf-float 5s ease-in-out 0.5s infinite'
          : 'none',
      }}>

        {/* Borde dorado */}
        <div style={{
          position: 'absolute', inset: -1, borderRadius: 20,
          background: `linear-gradient(135deg, ${GOLD}77, #6B4F1E33, ${GOLD2}66)`,
          filter: 'blur(0.4px)',
        }} />

        {/* Pill horizontal */}
        <div
          onClick={() => window.open(URL, '_blank', 'noopener,noreferrer')}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            background: 'linear-gradient(100deg, #110F09, #1C1508)',
            borderRadius: 20,
            padding: '5px 8px 5px 6px',
            cursor: 'pointer',
            overflow: 'hidden',
            animation: 'lf-glow 3.5s ease-in-out infinite',
            whiteSpace: 'nowrap',
          }}
        >
          {/* Shimmer */}
          {sparkle && (
            <div style={{
              position: 'absolute', top: 0, bottom: 0, width: 24,
              background: `linear-gradient(90deg, transparent, ${GOLD}25, transparent)`,
              animation: 'lf-shimmer 0.7s ease-in-out',
              pointerEvents: 'none',
            }} />
          )}

          {/* Destello */}
          {sparkle && (
            <div style={{ position: 'absolute', top: 3, right: 18, animation: 'lf-spark 0.7s ease-out', pointerEvents: 'none' }}>
              <Spark size={4} color={GOLD2} />
            </div>
          )}

          {/* Logo SVG mini */}
          <LeFavoleLogo size={18} />

          {/* Separador */}
          <div style={{ width: 0.5, height: 14, background: `${GOLD}44`, flexShrink: 0 }} />

          {/* Texto */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{
              fontFamily: 'Georgia, serif', fontSize: 7.5, fontWeight: 400,
              color: GOLD, letterSpacing: '0.14em', textTransform: 'uppercase',
              textShadow: `0 0 5px ${GOLD}44`, lineHeight: 1,
            }}>
              Le Favole
            </span>
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 5.5, fontWeight: 400,
              color: `${GOLD}77`, letterSpacing: '0.08em', textTransform: 'uppercase',
              lineHeight: 1,
            }}>
              Reservar mesa →
            </span>
          </div>

          {/* Cerrar */}
          <button
            onClick={e => { e.stopPropagation(); setDismissed(true) }}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: `${GOLD}55`, fontSize: 10, lineHeight: 1,
              padding: '0 0 0 2px', marginLeft: 1,
            }}
            aria-label="Cerrar"
          >×</button>
        </div>
      </div>
    </>
  )
}

function LeFavoleLogo({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" style={{ flexShrink: 0 }}>
      <rect width="30" height="30" rx="5" fill="rgba(201,167,106,0.07)" />
      <line x1="6"  y1="6"  x2="6"  y2="21" stroke={GOLD}  strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8.5" y1="6" x2="8.5" y2="21" stroke={GOLD2} strokeWidth="0.8" strokeLinecap="round" />
      <line x1="6"  y1="21" x2="14" y2="21" stroke={GOLD}  strokeWidth="1.4" strokeLinecap="round" />
      <line x1="6"  y1="18.5" x2="14" y2="18.5" stroke={GOLD2} strokeWidth="0.8" strokeLinecap="round" />
      <line x1="16" y1="6"  x2="16" y2="21" stroke={GOLD}  strokeWidth="1.4" strokeLinecap="round" />
      <line x1="18.5" y1="6" x2="18.5" y2="21" stroke={GOLD2} strokeWidth="0.8" strokeLinecap="round" />
      <line x1="16" y1="6"  x2="24" y2="6"  stroke={GOLD}  strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="13" x2="22" y2="13" stroke={GOLD}  strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="21" x2="24" y2="21" stroke={GOLD}  strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function Spark({ size = 4, color = GOLD2 }: { size?: number; color?: string }) {
  const h = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <path
        d={`M${h} 0 L${h*1.25} ${h*0.75} L${size} ${h} L${h*1.25} ${h*1.25} L${h} ${size} L${h*0.75} ${h*1.25} L0 ${h} L${h*0.75} ${h*0.75} Z`}
        fill={color}
      />
    </svg>
  )
}
