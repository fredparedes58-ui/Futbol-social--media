import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { User, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import EpicStadiumBackground from '../components/ui/EpicStadiumBackground'
import FloatingOrbs from '../components/ui/FloatingOrbs'
import NeonButton from '../components/ui/NeonButton'
import NeonInput from '../components/ui/NeonInput'

export default function RegisterPage() {
  const nav = useNavigate()
  const { login } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string }>({})

  function validate() {
    const e: typeof errors = {}
    if (name.trim().length < 2) e.name = 'Nombre muy corto'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = 'Email inválido'
    if (password.length < 6) e.password = 'Mínimo 6 caracteres'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    if (!validate()) return
    login({ name, email, position: 'Delantero', team: 'Los Pumas FC' })
    nav('/home')
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-deep, #0F0D0A)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <EpicStadiumBackground interval={6000} initial={1} />
      </div>
      <div
        style={{
          position: 'absolute', inset: 0, zIndex: 2,
          background:
            'linear-gradient(180deg, rgba(15,13,10,0.55) 0%, rgba(15,13,10,0.72) 45%, rgba(15,13,10,0.95) 100%)',
        }}
      />
      <div style={{ position: 'absolute', inset: 0, zIndex: 2 }}>
        <FloatingOrbs
          orbs={[
            { x: 20, y: 30, size: 180, color: '#CCFF00', opacity: 0.22, dur: 16 },
            { x: 80, y: 70, size: 200, color: '#FFB800', opacity: 0.18, dur: 20 },
          ]}
        />
      </div>

      <div
        className="screen-scroll"
        style={{
          position: 'absolute', inset: 0, zIndex: 5,
          display: 'flex', flexDirection: 'column',
          padding: '80px 24px 32px',
          overflowY: 'auto',
        }}
      >
        <div style={{ marginBottom: 40 }}>
          <div
            style={{
              fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontStyle: 'italic',
              fontSize: 13, color: '#CCFF00',
              letterSpacing: '0.2em', textTransform: 'uppercase',
              marginBottom: 12, textShadow: '0 0 12px rgba(204, 255, 0, 0.5)',
            }}
          >
            GRADA · Registro
          </div>
          <div
            style={{
              fontFamily: 'Archivo, sans-serif', fontWeight: 800,
              fontSize: 34, color: '#FAF5EB', letterSpacing: '-0.02em',
              lineHeight: 1.05,
            }}
          >
            Únete al juego
          </div>
          <div
            style={{
              marginTop: 8,
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 14, color: 'rgba(250, 245, 235, 0.6)',
            }}
          >
            Crea tu cuenta para empezar a jugar
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
          <NeonInput
            placeholder="Nombre completo"
            icon={<User size={18} />}
            value={name}
            onChange={setName}
            error={errors.name}
          />
          <NeonInput
            placeholder="tu@email.com"
            type="email"
            icon={<Mail size={18} />}
            value={email}
            onChange={setEmail}
            error={errors.email}
          />
          <NeonInput
            placeholder="Contraseña"
            type="password"
            icon={<Lock size={18} />}
            value={password}
            onChange={setPassword}
            error={errors.password}
          />
        </div>

        <NeonButton variant="gradient" onClick={handleSubmit}>
          Unirse a la comunidad
        </NeonButton>

        <div
          style={{
            marginTop: 24, textAlign: 'center',
            fontFamily: 'Space Grotesk, sans-serif',
            fontSize: 14, color: 'rgba(250, 245, 235, 0.6)',
          }}
        >
          ¿Ya tienes cuenta?{' '}
          <button
            onClick={() => nav('/login')}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              color: '#CCFF00', fontWeight: 700, fontFamily: 'inherit', fontSize: 14,
            }}
          >
            Inicia sesión
          </button>
        </div>
      </div>
    </div>
  )
}
