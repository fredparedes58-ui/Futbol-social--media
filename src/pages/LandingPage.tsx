/**
 * LandingPage — marketing / onboarding para visitantes web.
 * Ruta pública `/landing`.
 */
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Sparkles, Trophy, Users, Brain, Zap, Play, Download } from 'lucide-react'
import NeonButton from '../components/ui/NeonButton'
import ParticleBackground from '../components/ui/ParticleBackground'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const FEATURES = [
  { icon: Brain,   color: '#B347FF', title: 'IA deportiva',          text: 'Agentes + RAG para coach, scouting, predicciones y más.' },
  { icon: Trophy,  color: '#FFB800', title: 'Liga + logros',         text: '12 badges desbloqueables y ranking regional semanal.' },
  { icon: Users,   color: '#00D4FF', title: 'Comunidad real',        text: 'Chats, stories 24h, eventos con RSVP y duelos 1v1.' },
  { icon: Zap,     color: '#CCFF00', title: 'Tiempo real',           text: 'Partidos en vivo, ticker global, voz y haptic feedback.' },
]

export default function LandingPage() {
  const nav = useNavigate()
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)

  useEffect(() => {
    const onBip = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', onBip)
    return () => window.removeEventListener('beforeinstallprompt', onBip)
  }, [])

  async function tryInstall() {
    if (!installPrompt) {
      // Fallback: ir a onboarding
      nav('/')
      return
    }
    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    if (outcome === 'accepted') setInstallPrompt(null)
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'radial-gradient(circle at 50% 0%, #1a1510 0%, #0F0D0A 60%)',
      overflow: 'hidden', overflowY: 'auto',
    }} className="screen-scroll">
      <ParticleBackground />

      {/* Hero */}
      <div style={{
        padding: '70px 22px 40px', textAlign: 'center', position: 'relative',
      }}>
        <div style={{
          display: 'inline-block',
          padding: '6px 14px', borderRadius: 999,
          background: 'rgba(204,255,0,0.12)',
          border: '1px solid rgba(204,255,0,0.4)',
          color: '#CCFF00',
          fontFamily: 'Space Grotesk', fontSize: 11, fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.14em',
          marginBottom: 18,
        }}>
          <Sparkles size={10} style={{ verticalAlign: 'middle', marginRight: 4 }} />
          Powered by AI Agents · RAG
        </div>

        <h1 style={{
          fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 48,
          color: '#FAF5EB', letterSpacing: '-0.03em', lineHeight: 1.05,
          margin: '0 0 14px', textShadow: '0 4px 30px rgba(204,255,0,0.25)',
        }}>
          El fútbol amateur<br />
          <span style={{
            background: 'linear-gradient(135deg, #CCFF00 0%, #FFB800 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            con cerebro propio.
          </span>
        </h1>

        <p style={{
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 15,
          color: 'rgba(250,245,235,0.75)', maxWidth: 360, margin: '0 auto 30px',
          lineHeight: 1.5,
        }}>
          Agentes deterministas, predicciones, coach AI y comunidad en una PWA instalable.
        </p>

        <div style={{ display: 'flex', gap: 10, flexDirection: 'column', maxWidth: 300, margin: '0 auto' }}>
          <NeonButton variant="lime" onClick={() => nav('/register')} fullWidth>
            <Play size={16} /> &nbsp; Empezar ahora
          </NeonButton>
          <button
            onClick={tryInstall}
            style={{
              padding: '12px 18px', borderRadius: 12,
              background: 'rgba(179,71,255,0.10)',
              border: '1px solid rgba(179,71,255,0.45)',
              color: '#B347FF', cursor: 'pointer',
              fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            <Download size={14} /> Instalar como app
          </button>
        </div>
      </div>

      {/* Features */}
      <div style={{ padding: '20px 20px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {FEATURES.map((f, i) => {
            const I = f.icon
            return (
              <div key={i} style={{
                padding: 14, borderRadius: 14,
                background: `linear-gradient(135deg, ${f.color}14, rgba(255,255,255,0.03))`,
                border: `1px solid ${f.color}44`,
                boxShadow: `0 0 18px ${f.color}18`,
              }}>
                <div style={{
                  width: 34, height: 34, borderRadius: 10,
                  background: `${f.color}22`, color: f.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: 10,
                }}>
                  <I size={18} />
                </div>
                <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 14, color: '#FAF5EB', marginBottom: 4 }}>
                  {f.title}
                </div>
                <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: 'rgba(250,245,235,0.6)', lineHeight: 1.4 }}>
                  {f.text}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ padding: '0 20px 40px' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10,
          padding: 16, borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(204,255,0,0.08), rgba(0,212,255,0.05))',
          border: '1px solid rgba(204,255,0,0.25)',
        }}>
          {[['9', 'Agentes AI'], ['15', 'KB docs RAG'], ['12', 'Logros']].map(([n, l], i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 22, color: '#CCFF00' }}>{n}</div>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '0 20px 60px', textAlign: 'center', fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.4)' }}>
        © 2026 FútbolBase · PWA · Hecha con React 19 + Vite 8
      </div>
    </div>
  )
}
