import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EpicStadiumBackground from '../components/ui/EpicStadiumBackground'
import FloatingOrbs from '../components/ui/FloatingOrbs'
import FloatingEmojis from '../components/ui/FloatingEmojis'
import FloatingChip from '../components/ui/FloatingChip'
import PulseRings from '../components/ui/PulseRings'

export default function OnboardingPage() {
  const nav = useNavigate()
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const CHIPS = [
    { label: 'jugadores',    value: '12K+', color: '#CCFF00', delay: 0.2 },
    { label: 'online ahora', value: '847',  color: '#FFB800', delay: 0.35 },
    { label: 'goles hoy',    value: '2.3K', color: '#FFB800', delay: 0.5 },
  ]

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-deep, #0F0D0A)', overflow: 'hidden' }}>
      {/* Stadium backgrounds */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <EpicStadiumBackground interval={5500} initial={0} showDots />
      </div>

      {/* Dark gradient overlay */}
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background:
            'linear-gradient(180deg, rgba(15,13,10,0.3) 0%, rgba(15,13,10,0.5) 40%, rgba(15,13,10,0.92) 75%, rgba(15,13,10,0.98) 100%)',
        }}
      />

      {/* Floating orbs */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        <FloatingOrbs
          orbs={[
            { x: 15, y: 25, size: 200, color: '#CCFF00', opacity: 0.25, dur: 14 },
            { x: 85, y: 30, size: 160, color: '#FFB800', opacity: 0.22, dur: 18 },
            { x: 70, y: 85, size: 240, color: '#CCFF00', opacity: 0.18, dur: 22 },
          ]}
        />
      </div>

      {/* Floating emojis */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        <FloatingEmojis emojis={['⚽', '🔥', '⭐', '🏆', '⚡', '🥅']} count={10} duration={12} />
      </div>

      {/* Brand lockup */}
      <div
        style={{
          position: 'absolute', top: 60, left: 0, right: 0, zIndex: 5,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          opacity: mounted ? 1 : 0,
          transform: mounted ? 'translateY(0)' : 'translateY(-10px)',
          transition: 'all 0.6s cubic-bezier(.2,.8,.2,1)',
        }}
      >
        <div
          style={{
            width: 32, height: 32, borderRadius: 8, background: '#CCFF00',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(204, 255, 0, 0.5)',
            animation: 'pulse-glow 3s ease-in-out infinite',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="#0F0D0A">
            <circle cx="12" cy="12" r="9" fill="none" stroke="#0F0D0A" strokeWidth="1.8" />
            <path d="M12 4l2.5 3.5L12 10l-2.5-2.5zM4 12l3.5 2.5L10 12l-2.5-2.5zM20 12l-3.5 2.5L14 12l2.5-2.5zM12 20l-2.5-3.5L12 14l2.5 2.5z" />
          </svg>
        </div>
        <div
          style={{
            fontFamily: 'Archivo, sans-serif', fontWeight: 800,
            fontSize: 17, color: '#FAF5EB', letterSpacing: '0.02em',
          }}
        >
          GRADA
        </div>
      </div>

      {/* Stat chips */}
      <div
        style={{
          position: 'absolute', top: 112, left: 0, right: 0, zIndex: 5,
          display: 'flex', justifyContent: 'center', gap: 8, padding: '0 16px',
          flexWrap: 'wrap',
        }}
      >
        {CHIPS.map((c, i) => (
          <div
            key={i}
            style={{
              opacity: mounted ? 1 : 0,
              transform: mounted ? 'translateY(0) scale(1)' : 'translateY(10px) scale(0.9)',
              transition: `all 0.5s cubic-bezier(.2,.8,.2,1) ${c.delay}s`,
            }}
          >
            <FloatingChip
              label={c.label}
              value={c.value}
              color={c.color}
              icon={
                <div
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: c.color, boxShadow: `0 0 6px ${c.color}`,
                  }}
                />
              }
            />
          </div>
        ))}
      </div>

      {/* Main content block */}
      <div style={{ position: 'absolute', bottom: 130, left: 24, right: 24, zIndex: 5 }}>
        {/* Tag chip "En vivo" */}
        <div
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '6px 12px 6px 6px', borderRadius: 999,
            background: 'rgba(204, 255, 0, 0.15)',
            border: '1px solid rgba(204, 255, 0, 0.4)',
            fontSize: 11, fontWeight: 700, color: '#CCFF00',
            fontFamily: 'Space Grotesk, sans-serif',
            letterSpacing: '0.05em', textTransform: 'uppercase',
            marginBottom: 18, whiteSpace: 'nowrap',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(12px)',
            transition: 'all 0.5s cubic-bezier(.2,.8,.2,1) 0.6s',
          }}
        >
          <div style={{ position: 'relative', width: 14, height: 14 }}>
            <div
              style={{
                position: 'absolute', inset: 0, width: 6, height: 6, borderRadius: '50%',
                background: '#CCFF00', boxShadow: '0 0 6px #CCFF00', top: 4, left: 4,
              }}
            />
            <div style={{ position: 'absolute', inset: 0 }}>
              <PulseRings size={14} color="#CCFF00" count={2} />
            </div>
          </div>
          En vivo · Para el fútbol base
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: 'Archivo, sans-serif', fontWeight: 800,
            fontSize: 42, lineHeight: 1.02, color: '#FAF5EB',
            letterSpacing: '-0.02em', marginBottom: 14,
          }}
        >
          {['Tu equipo.', 'Tu comunidad.', 'Tu cancha.'].map((line, i) => (
            <div
              key={i}
              style={{
                overflow: 'hidden',
                opacity: mounted ? 1 : 0,
                transform: mounted ? 'translateY(0)' : 'translateY(24px)',
                transition: `all 0.7s cubic-bezier(.2,.8,.2,1) ${0.7 + i * 0.1}s`,
                color: i === 2 ? '#CCFF00' : '#FAF5EB',
                textShadow: i === 2 ? '0 0 24px rgba(204, 255, 0, 0.6)' : 'none',
              }}
            >
              {line}
            </div>
          ))}
        </div>

        {/* Subhead */}
        <div
          style={{
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 15, color: 'rgba(250, 245, 235, 0.78)',
            lineHeight: 1.45, marginBottom: 24, maxWidth: 320,
            opacity: mounted ? 1 : 0,
            transition: 'opacity 0.7s 1.1s',
          }}
        >
          Conecta con clubes, entrenadores y jugadores. Mejora tu juego, comparte tu progreso.
        </div>

        {/* CTA */}
        <button
          onClick={() => nav('/register')}
          style={{
            position: 'relative',
            height: 56, width: '100%', borderRadius: 14,
            background: 'linear-gradient(90deg, #CCFF00, #FFB800, #CCFF00)',
            backgroundSize: '200% 100%',
            border: 'none', cursor: 'pointer',
            fontFamily: 'Space Grotesk, sans-serif',
            fontWeight: 700, fontSize: 15, color: '#0F0D0A',
            boxShadow:
              '0 8px 24px rgba(204, 255, 0, 0.35), 0 0 40px rgba(204, 255, 0, 0.2), 0 2px 6px rgba(0,0,0,0.3)',
            transition: 'transform 0.15s',
            overflow: 'hidden',
            animation: 'gradient-shift 3s ease-in-out infinite',
            opacity: mounted ? 1 : 0,
            transform: mounted ? 'translateY(0)' : 'translateY(14px)',
          }}
        >
          <div
            style={{
              position: 'absolute', top: 0, bottom: 0, width: 60,
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
              animation: 'shimmer 2.5s linear infinite', pointerEvents: 'none',
            }}
          />
          Crear cuenta
        </button>
      </div>

      {/* Footer */}
      <div
        style={{
          position: 'absolute', bottom: 40, left: 0, right: 0, zIndex: 5,
          textAlign: 'center',
          color: 'rgba(250, 245, 235, 0.7)', fontSize: 14,
          fontFamily: 'Space Grotesk, sans-serif',
          opacity: mounted ? 1 : 0,
          transition: 'opacity 0.6s 1.3s',
        }}
      >
        ¿Ya tienes cuenta?{' '}
        <button
          onClick={() => nav('/login')}
          style={{
            background: 'transparent', border: 'none', cursor: 'pointer',
            color: '#CCFF00', fontWeight: 700,
            fontFamily: 'inherit', fontSize: 14,
          }}
        >
          Inicia sesión
        </button>
      </div>

      {/* Local keyframes used in this page */}
      <style>{`
        @keyframes pulse-glow {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.08); }
        }
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(200%); }
        }
      `}</style>
    </div>
  )
}
