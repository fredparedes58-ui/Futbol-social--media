/**
 * LeFavoleAd — Publicidad flotante interactiva del restaurante Le Favole.
 * Aparece con delay, flota con animación, brilla con destellos dorados.
 * Al pulsarla abre https://lefavole.es/es/ en nueva pestaña.
 */
import { useEffect, useState } from 'react'

const GOLD  = '#C9A76A'
const GOLD2 = '#E8C97A'
const URL   = 'https://lefavole.es/es/'

export default function LeFavoleAd() {
  const [visible, setVisible] = useState(false)
  const [dismissed, setDismissed] = useState(false)
  const [sparkle, setSparkle] = useState(false)

  // Aparece con 1.8 s de delay para no interrumpir el primer render
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1800)
    return () => clearTimeout(t)
  }, [])

  // Sparkle cada 4 s
  useEffect(() => {
    if (!visible) return
    const interval = setInterval(() => {
      setSparkle(true)
      setTimeout(() => setSparkle(false), 900)
    }, 4000)
    return () => clearInterval(interval)
  }, [visible])

  if (dismissed) return null

  return (
    <>
      <style>{`
        @keyframes lf-float {
          0%,100% { transform: translateY(0px) rotate(-1deg); }
          50%      { transform: translateY(-7px) rotate(0.5deg); }
        }
        @keyframes lf-glow-pulse {
          0%,100% { box-shadow: 0 0 18px ${GOLD}55, 0 0 40px ${GOLD}22, inset 0 0 12px rgba(201,167,106,0.08); }
          50%      { box-shadow: 0 0 28px ${GOLD}99, 0 0 60px ${GOLD}44, inset 0 0 18px rgba(201,167,106,0.15); }
        }
        @keyframes lf-shimmer {
          0%   { left: -80px; opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 1; }
          100% { left: 160px; opacity: 0; }
        }
        @keyframes lf-sparkle-in {
          0%   { opacity: 0; transform: scale(0) rotate(0deg); }
          50%  { opacity: 1; transform: scale(1.3) rotate(180deg); }
          100% { opacity: 0; transform: scale(0) rotate(360deg); }
        }
        @keyframes lf-enter {
          0%   { opacity: 0; transform: translateY(20px) scale(0.88); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes lf-border-rotate {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      {/* Contenedor principal */}
      <div
        style={{
          position: 'fixed',
          bottom: 90,
          right: 16,
          zIndex: 50,
          opacity: visible ? 1 : 0,
          pointerEvents: visible ? 'auto' : 'none',
          animation: visible ? 'lf-enter 0.6s cubic-bezier(.2,.8,.2,1) both, lf-float 5s ease-in-out 0.6s infinite' : 'none',
        }}
      >
        {/* Capa de borde con gradiente animado */}
        <div style={{
          position: 'absolute', inset: -2, borderRadius: 18,
          background: `linear-gradient(135deg, ${GOLD}, #8B6A2E, ${GOLD2}, #6B4F1E, ${GOLD})`,
          backgroundSize: '300% 300%',
          animation: 'lf-border-rotate 4s ease infinite',
          filter: 'blur(1px)',
        }} />

        {/* Card principal */}
        <div
          onClick={() => window.open(URL, '_blank', 'noopener,noreferrer')}
          style={{
            position: 'relative',
            width: 162,
            background: 'linear-gradient(145deg, #0D0B08, #1A1508, #0D0B08)',
            borderRadius: 16,
            padding: '12px 14px 11px',
            cursor: 'pointer',
            overflow: 'hidden',
            animation: 'lf-glow-pulse 3s ease-in-out infinite',
            border: '1px solid rgba(201,167,106,0.3)',
          }}
        >
          {/* Shimmer sweep */}
          <div style={{
            position: 'absolute', top: 0, bottom: 0, width: 60,
            background: 'linear-gradient(90deg, transparent, rgba(201,167,106,0.25), transparent)',
            animation: sparkle ? 'lf-shimmer 0.9s ease-in-out' : 'none',
            pointerEvents: 'none',
          }} />

          {/* Estrellas de destello */}
          {sparkle && (
            <>
              <div style={{ position: 'absolute', top: 6, right: 18, animation: 'lf-sparkle-in 0.9s ease-out', pointerEvents: 'none' }}>
                <StarGlyph size={10} color={GOLD2} />
              </div>
              <div style={{ position: 'absolute', bottom: 10, left: 10, animation: 'lf-sparkle-in 0.9s ease-out 0.12s both', pointerEvents: 'none' }}>
                <StarGlyph size={7} color={GOLD} />
              </div>
              <div style={{ position: 'absolute', top: 22, right: 8, animation: 'lf-sparkle-in 0.9s ease-out 0.22s both', pointerEvents: 'none' }}>
                <StarGlyph size={5} color={GOLD2} />
              </div>
            </>
          )}

          {/* Badge "Patrocinado" */}
          <div style={{
            position: 'absolute', top: 7, left: 8,
            fontFamily: 'Space Grotesk, sans-serif', fontSize: 7.5, fontWeight: 700,
            color: `${GOLD}99`, letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            Patrocinado
          </div>

          {/* Botón cerrar */}
          <button
            onClick={e => { e.stopPropagation(); setDismissed(true) }}
            style={{
              position: 'absolute', top: 5, right: 6,
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: `${GOLD}66`, fontSize: 13, lineHeight: 1,
              padding: 2,
            }}
            aria-label="Cerrar"
          >
            ×
          </button>

          {/* Logo SVG — Art Deco "LE" monogram */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 14, marginBottom: 8 }}>
            <LeFavoleLogo size={56} />
          </div>

          {/* Texto Le Favole */}
          <div style={{ textAlign: 'center' }}>
            <div style={{
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontSize: 10.5, fontWeight: 400, letterSpacing: '0.28em',
              color: GOLD, textTransform: 'uppercase',
              textShadow: `0 0 10px ${GOLD}88`,
            }}>
              Le Favole
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, margin: '4px 0 2px' }}>
              <div style={{ flex: 1, height: 0.5, background: `linear-gradient(90deg, transparent, ${GOLD}88)` }} />
              <div style={{ flex: 1, height: 0.5, background: `linear-gradient(270deg, transparent, ${GOLD}88)` }} />
            </div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 8.5, fontWeight: 400,
              color: `${GOLD}99`, letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}>
              Restaurante
            </div>
          </div>

          {/* CTA strip */}
          <div style={{
            marginTop: 9, padding: '6px 0', borderRadius: 8,
            background: `linear-gradient(90deg, ${GOLD}22, ${GOLD}44, ${GOLD}22)`,
            border: `1px solid ${GOLD}44`,
            textAlign: 'center',
          }}>
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 8.5, fontWeight: 700,
              color: GOLD, letterSpacing: '0.12em', textTransform: 'uppercase',
            }}>
              Reservar mesa →
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

/** Monograma Art Deco "LE" inspirado en el logo de Le Favole */
function LeFavoleLogo({ size = 56 }: { size?: number }) {
  const g = GOLD
  const g2 = GOLD2
  return (
    <svg width={size} height={size} viewBox="0 0 56 56" fill="none">
      {/* Fondo circular sutil */}
      <circle cx="28" cy="28" r="27" fill="rgba(201,167,106,0.06)" stroke={`${g}44`} strokeWidth="0.5" />

      {/* ─── Letra L (izquierda) ─── */}
      {/* Vertical lines del L */}
      <line x1="12" y1="12" x2="12" y2="38" stroke={g}  strokeWidth="1.6" strokeLinecap="round" />
      <line x1="15" y1="12" x2="15" y2="38" stroke={g2} strokeWidth="1.1" strokeLinecap="round" />
      <line x1="18" y1="14" x2="18" y2="38" stroke={g}  strokeWidth="0.7" strokeLinecap="round" />
      {/* Horizontal foot del L */}
      <line x1="12" y1="38" x2="26" y2="38" stroke={g}  strokeWidth="1.6" strokeLinecap="round" />
      <line x1="12" y1="35" x2="26" y2="35" stroke={g2} strokeWidth="1.1" strokeLinecap="round" />

      {/* ─── Letra E (derecha) ─── */}
      {/* Vertical spine del E */}
      <line x1="28" y1="12" x2="28" y2="38" stroke={g}  strokeWidth="1.6" strokeLinecap="round" />
      <line x1="31" y1="12" x2="31" y2="38" stroke={g2} strokeWidth="1.1" strokeLinecap="round" />
      {/* Top bar */}
      <line x1="28" y1="12" x2="42" y2="12" stroke={g}  strokeWidth="1.6" strokeLinecap="round" />
      <line x1="28" y1="15" x2="42" y2="15" stroke={g2} strokeWidth="1.1" strokeLinecap="round" />
      {/* Middle bar */}
      <line x1="28" y1="24" x2="39" y2="24" stroke={g}  strokeWidth="1.5" strokeLinecap="round" />
      <line x1="28" y1="27" x2="37" y2="27" stroke={g2} strokeWidth="0.9" strokeLinecap="round" />
      {/* Bottom bar */}
      <line x1="28" y1="38" x2="44" y2="38" stroke={g}  strokeWidth="1.6" strokeLinecap="round" />
      <line x1="28" y1="35" x2="44" y2="35" stroke={g2} strokeWidth="1.1" strokeLinecap="round" />

      {/* Destello central */}
      <circle cx="28" cy="25" r="1.2" fill={g2} opacity="0.7" />

      {/* Líneas decorativas esquinas */}
      <line x1="4"  y1="50" x2="52" y2="50" stroke={`${g}55`} strokeWidth="0.5" />
      <line x1="4"  y1="52" x2="52" y2="52" stroke={`${g}33`} strokeWidth="0.4" />
    </svg>
  )
}

/** Estrella de 4 puntas para los destellos */
function StarGlyph({ size = 8, color = GOLD2 }: { size?: number; color?: string }) {
  const h = size / 2
  const q = size / 4
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} fill="none">
      <path
        d={`M${h} 0 L${h + q * 0.3} ${h - q * 0.3} L${size} ${h} L${h + q * 0.3} ${h + q * 0.3} L${h} ${size} L${h - q * 0.3} ${h + q * 0.3} L0 ${h} L${h - q * 0.3} ${h - q * 0.3} Z`}
        fill={color}
        filter={`drop-shadow(0 0 ${q}px ${color})`}
      />
    </svg>
  )
}
