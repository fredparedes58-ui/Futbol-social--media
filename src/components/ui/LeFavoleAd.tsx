/**
 * LeFavoleAd — Publicidad flotante compacta de Le Favole.
 * Tamaño reducido, integrada con el design system de GRADA.
 */
import { useEffect, useState } from 'react'

const GOLD  = '#C9A76A'
const GOLD2 = '#E8C97A'
const URL   = 'https://lefavole.es/es/'

export default function LeFavoleAd() {
  const [visible, setVisible]   = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [sparkle, setSparkle]   = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1800)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    if (!visible) return
    const id = setInterval(() => {
      setSparkle(true)
      setTimeout(() => setSparkle(false), 800)
    }, 5000)
    return () => clearInterval(id)
  }, [visible])

  if (dismissed) return null

  return (
    <>
      <style>{`
        @keyframes lf-float {
          0%,100% { transform: translateY(0px); }
          50%      { transform: translateY(-5px); }
        }
        @keyframes lf-enter {
          from { opacity: 0; transform: translateY(12px) scale(0.92); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes lf-glow {
          0%,100% { box-shadow: 0 0 10px ${GOLD}44, 0 2px 12px rgba(0,0,0,0.5); }
          50%      { box-shadow: 0 0 18px ${GOLD}77, 0 2px 16px rgba(0,0,0,0.6); }
        }
        @keyframes lf-shimmer {
          0%   { left: -50px; opacity: 0; }
          30%  { opacity: 0.9; }
          70%  { opacity: 0.9; }
          100% { left: 110px; opacity: 0; }
        }
        @keyframes lf-spark {
          0%   { opacity: 0; transform: scale(0) rotate(0deg); }
          50%  { opacity: 1; transform: scale(1.2) rotate(180deg); }
          100% { opacity: 0; transform: scale(0) rotate(360deg); }
        }
      `}</style>

      <div style={{
        position: 'absolute',
        bottom: 72,
        right: 14,
        zIndex: 50,
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
        animation: visible
          ? 'lf-enter 0.5s cubic-bezier(.2,.8,.2,1) both, lf-float 4.5s ease-in-out 0.5s infinite'
          : 'none',
      }}>

        {/* Borde dorado fino */}
        <div style={{
          position: 'absolute', inset: -1.5, borderRadius: 13,
          background: `linear-gradient(135deg, ${GOLD}99, #6B4F1E55, ${GOLD2}88, #6B4F1E44)`,
          filter: 'blur(0.5px)',
        }} />

        {/* Card */}
        <div
          onClick={() => window.open(URL, '_blank', 'noopener,noreferrer')}
          style={{
            position: 'relative',
            width: 118,
            background: 'linear-gradient(160deg, #110F09, #1C1508)',
            borderRadius: 12,
            padding: '9px 10px 8px',
            cursor: 'pointer',
            overflow: 'hidden',
            animation: 'lf-glow 3.5s ease-in-out infinite',
          }}
        >
          {/* Shimmer sweep */}
          {sparkle && (
            <div style={{
              position: 'absolute', top: 0, bottom: 0, width: 40,
              background: `linear-gradient(90deg, transparent, ${GOLD}30, transparent)`,
              animation: 'lf-shimmer 0.8s ease-in-out',
              pointerEvents: 'none',
            }} />
          )}

          {/* Destellos */}
          {sparkle && <>
            <div style={{ position: 'absolute', top: 5, right: 14, animation: 'lf-spark 0.8s ease-out', pointerEvents: 'none' }}>
              <Spark size={6} color={GOLD2} />
            </div>
            <div style={{ position: 'absolute', bottom: 8, left: 8, animation: 'lf-spark 0.8s ease-out 0.1s both', pointerEvents: 'none' }}>
              <Spark size={4.5} color={GOLD} />
            </div>
          </>}

          {/* Fila superior: label + cerrar */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 6,
          }}>
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 7, fontWeight: 600,
              color: `${GOLD}88`, letterSpacing: '0.14em', textTransform: 'uppercase',
            }}>
              Patrocinado
            </span>
            <button
              onClick={e => { e.stopPropagation(); setDismissed(true) }}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: `${GOLD}66`, fontSize: 11, lineHeight: 1, padding: '0 0 0 4px',
              }}
              aria-label="Cerrar"
            >×</button>
          </div>

          {/* Logo + nombre en fila */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 7 }}>
            <LeFavoleLogo size={30} />
            <div>
              <div style={{
                fontFamily: 'Georgia, serif', fontSize: 9, fontWeight: 400,
                color: GOLD, letterSpacing: '0.18em', textTransform: 'uppercase',
                textShadow: `0 0 8px ${GOLD}66`,
                lineHeight: 1.2,
              }}>
                Le Favole
              </div>
              {/* Líneas decorativas */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 2, margin: '2px 0' }}>
                <div style={{ flex: 1, height: 0.5, background: `${GOLD}66` }} />
              </div>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 6.5, fontWeight: 400,
                color: `${GOLD}88`, letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                Restaurante
              </div>
            </div>
          </div>

          {/* CTA */}
          <div style={{
            padding: '4px 6px', borderRadius: 6,
            background: `linear-gradient(90deg, ${GOLD}25, ${GOLD}40, ${GOLD}25)`,
            border: `0.5px solid ${GOLD}55`,
            textAlign: 'center',
          }}>
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 7, fontWeight: 700,
              color: GOLD2, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              Reservar mesa →
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

function LeFavoleLogo({ size = 30 }: { size?: number }) {
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
      {/* línea deco inferior */}
      <line x1="2" y1="26" x2="28" y2="26" stroke={`${GOLD}55`} strokeWidth="0.4" />
      <line x1="2" y1="27.5" x2="28" y2="27.5" stroke={`${GOLD}33`} strokeWidth="0.3" />
    </svg>
  )
}

function Spark({ size = 6, color = GOLD2 }: { size?: number; color?: string }) {
  const h = size / 2
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <path
        d={`M${h} 0 L${h * 1.25} ${h * 0.75} L${size} ${h} L${h * 1.25} ${h * 1.25} L${h} ${size} L${h * 0.75} ${h * 1.25} L0 ${h} L${h * 0.75} ${h * 0.75} Z`}
        fill={color}
      />
    </svg>
  )
}
