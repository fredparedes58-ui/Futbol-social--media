/**
 * LeFavoleAd — Publicidad flotante mini de Le Favole.
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
          50%      { transform: translateY(-4px); }
        }
        @keyframes lf-enter {
          from { opacity: 0; transform: translateY(10px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lf-glow {
          0%,100% { box-shadow: 0 0 7px ${GOLD}33, 0 2px 8px rgba(0,0,0,0.5); }
          50%      { box-shadow: 0 0 13px ${GOLD}66, 0 2px 10px rgba(0,0,0,0.6); }
        }
        @keyframes lf-shimmer {
          0%   { left: -30px; opacity: 0; }
          30%  { opacity: 0.8; }
          70%  { opacity: 0.8; }
          100% { left: 90px; opacity: 0; }
        }
        @keyframes lf-spark {
          0%   { opacity: 0; transform: scale(0) rotate(0deg); }
          50%  { opacity: 1; transform: scale(1.2) rotate(180deg); }
          100% { opacity: 0; transform: scale(0) rotate(360deg); }
        }
      `}</style>

      <div style={{
        position: 'absolute',
        bottom: 76,
        right: 12,
        zIndex: 50,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        animation: visible
          ? 'lf-enter 0.5s cubic-bezier(.2,.8,.2,1) both, lf-float 5s ease-in-out 0.5s infinite'
          : 'none',
      }}>

        {/* Borde dorado */}
        <div style={{
          position: 'absolute', inset: -1, borderRadius: 10,
          background: `linear-gradient(135deg, ${GOLD}88, #6B4F1E44, ${GOLD2}77)`,
          filter: 'blur(0.4px)',
        }} />

        {/* Card */}
        <div
          onClick={() => window.open(URL, '_blank', 'noopener,noreferrer')}
          style={{
            position: 'relative',
            width: 90,
            background: 'linear-gradient(160deg, #110F09, #1C1508)',
            borderRadius: 9,
            padding: '6px 7px 6px',
            cursor: 'pointer',
            overflow: 'hidden',
            animation: 'lf-glow 3.5s ease-in-out infinite',
          }}
        >
          {/* Shimmer */}
          {sparkle && (
            <div style={{
              position: 'absolute', top: 0, bottom: 0, width: 28,
              background: `linear-gradient(90deg, transparent, ${GOLD}28, transparent)`,
              animation: 'lf-shimmer 0.7s ease-in-out',
              pointerEvents: 'none',
            }} />
          )}

          {/* Destello */}
          {sparkle && (
            <div style={{ position: 'absolute', top: 4, right: 10, animation: 'lf-spark 0.7s ease-out', pointerEvents: 'none' }}>
              <Spark size={5} color={GOLD2} />
            </div>
          )}

          {/* Fila: "Pub" + cerrar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 6, fontWeight: 600,
              color: `${GOLD}77`, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Pub
            </span>
            <button
              onClick={e => { e.stopPropagation(); setDismissed(true) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: `${GOLD}55`, fontSize: 10, lineHeight: 1, padding: '0 0 0 3px',
              }}
              aria-label="Cerrar"
            >×</button>
          </div>

          {/* Logo + nombre */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <LeFavoleLogo size={22} />
            <div>
              <div style={{
                fontFamily: 'Georgia, serif', fontSize: 7.5, fontWeight: 400,
                color: GOLD, letterSpacing: '0.16em', textTransform: 'uppercase',
                textShadow: `0 0 6px ${GOLD}55`, lineHeight: 1.2,
              }}>
                Le Favole
              </div>
              <div style={{ height: 0.5, background: `${GOLD}55`, margin: '2px 0' }} />
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 5.5, fontWeight: 400,
                color: `${GOLD}77`, letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                Reservar →
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

function LeFavoleLogo({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 30 30" fill="none" style={{ flexShrink: 0 }}>
      <rect width="30" height="30" rx="5" fill="rgba(201,167,106,0.07)" />
      {/* L */}
      <line x1="6"  y1="6"  x2="6"  y2="21" stroke={GOLD}  strokeWidth="1.4" strokeLinecap="round" />
      <line x1="8.5" y1="6" x2="8.5" y2="21" stroke={GOLD2} strokeWidth="0.8" strokeLinecap="round" />
      <line x1="6"  y1="21" x2="14" y2="21" stroke={GOLD}  strokeWidth="1.4" strokeLinecap="round" />
      <line x1="6"  y1="18.5" x2="14" y2="18.5" stroke={GOLD2} strokeWidth="0.8" strokeLinecap="round" />
      {/* E */}
      <line x1="16" y1="6"  x2="16" y2="21" stroke={GOLD}  strokeWidth="1.4" strokeLinecap="round" />
      <line x1="18.5" y1="6" x2="18.5" y2="21" stroke={GOLD2} strokeWidth="0.8" strokeLinecap="round" />
      <line x1="16" y1="6"  x2="24" y2="6"  stroke={GOLD}  strokeWidth="1.4" strokeLinecap="round" />
      <line x1="16" y1="13" x2="22" y2="13" stroke={GOLD}  strokeWidth="1.2" strokeLinecap="round" />
      <line x1="16" y1="21" x2="24" y2="21" stroke={GOLD}  strokeWidth="1.4" strokeLinecap="round" />
      {/* línea deco */}
      <line x1="2" y1="26" x2="28" y2="26" stroke={`${GOLD}44`} strokeWidth="0.4" />
    </svg>
  )
}

function Spark({ size = 5, color = GOLD2 }: { size?: number; color?: string }) {
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
