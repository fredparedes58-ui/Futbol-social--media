import { useState, useRef, useEffect, useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Send, Smile, Paperclip, Sparkles, Mic, MicOff } from 'lucide-react'
import { useSpeechRecognition } from '../hooks/useSpeechRecognition'
import { suggestReplies, type Tone } from '../lib/aiMocks'
import { assistantAgent } from '../ai/agents/assistantAgent'

interface Citation { topic: string; source?: string }

interface Message {
  id: string
  text: string
  mine: boolean
  time: string
  citations?: Citation[]
  confidence?: number
}

const INITIAL: Record<string, Message[]> = {
  default: [
    { id: 'm1', text: '¡Hola equipo! ¿Cómo va el entrenamiento?', mine: false, time: '10:12' },
    { id: 'm2', text: 'Bien, terminando con ejercicios de tiro al arco', mine: true, time: '10:14' },
    { id: 'm3', text: 'Perfecto. ¿Confirmamos el partido del sábado?', mine: false, time: '10:18' },
    { id: 'm4', text: 'Dale, todo listo. Cancha A, 10am.', mine: true, time: '10:20' },
    { id: 'm5', text: '¡Vamos por todo! 💪🔥', mine: false, time: '10:24' },
  ],
}

function nowTime() {
  const d = new Date()
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export default function ConversationPage() {
  const nav = useNavigate()
  const loc = useLocation()
  const state = (loc.state ?? {}) as { name?: string; badge?: string; color?: string; active?: boolean; bot?: boolean }
  const name   = state.name   ?? 'Chat'
  const badge  = state.badge  ?? 'CH'
  const color  = state.color  ?? '#CCFF00'
  const active = state.active ?? false
  const isBot  = state.bot    ?? false

  const [messages, setMessages] = useState<Message[]>(
    isBot
      ? [{ id: 'b0', text: '¡Hola! 👋 Soy el asistente de FútbolBase. Preguntame lo que quieras: predicciones, equipos, chats, highlights, Coach AI, Weekly Digest, perfil… lo que sea.', mine: false, time: nowTime() }]
      : INITIAL.default,
  )
  const [botSuggestions, setBotSuggestions] = useState<string[]>(
    isBot ? ['¿Cómo hago una predicción?', '¿Qué es el Coach AI?', '¿Cómo uno a un equipo?'] : [],
  )
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const [tone, setTone] = useState<Tone>(() => {
    try { return (localStorage.getItem('fb_chat_tone') as Tone) || 'casual' }
    catch { return 'casual' }
  })

  function setToneAndSave(t: Tone) {
    setTone(t)
    try { localStorage.setItem('fb_chat_tone', t) } catch { /* ignore */ }
    if ('vibrate' in navigator) navigator.vibrate(8)
  }
  const scrollRef = useRef<HTMLDivElement>(null)
  const speech = useSpeechRecognition('es-AR')

  // Sincronizar transcripción con el draft mientras escucha
  useEffect(() => {
    if (speech.listening && speech.transcript) {
      setDraft(speech.transcript)
    }
  }, [speech.listening, speech.transcript])

  function toggleMic() {
    if (!speech.supported) return
    if (speech.listening) {
      speech.stop()
      if ('vibrate' in navigator) navigator.vibrate(8)
    } else {
      speech.start()
      if ('vibrate' in navigator) navigator.vibrate([8, 30, 8])
    }
  }

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [messages, typing])

  // Smart-reply chips: se calculan sobre el último mensaje ajeno.
  // Se ocultan cuando el usuario ya está escribiendo o cuando el último mensaje es propio.
  const suggestions = useMemo(() => {
    if (isBot) return botSuggestions
    const lastOther = [...messages].reverse().find(m => !m.mine)
    if (!lastOther) return []
    return suggestReplies(lastOther.text, { teamName: name, active, tone })
  }, [messages, name, active, tone, isBot, botSuggestions])

  const showChips = suggestions.length > 0 && draft.trim().length === 0 && !typing

  function pickSuggestion(text: string) {
    if ('vibrate' in navigator) navigator.vibrate(12)
    if (isBot) {
      // En modo asistente, enviar directamente al tocar el chip.
      const msg: Message = { id: `m${Date.now()}`, text, mine: true, time: nowTime() }
      setMessages(prev => [...prev, msg])
      setBotSuggestions([])
      setTimeout(() => setTyping(true), 400)
      void (async () => {
        const r = await assistantAgent.run({ query: text })
        setTimeout(() => {
          setTyping(false)
          const d = r.data
          setMessages(prev => [...prev, {
            id: `b${Date.now() + 1}`,
            text: d?.reply ?? '...', mine: false, time: nowTime(),
            citations: d?.citations, confidence: d?.confidence,
          }])
          setBotSuggestions(d?.suggestions ?? [])
        }, 500)
      })()
      return
    }
    setDraft(text)
  }

  function send() {
    const text = draft.trim()
    if (!text) return
    const msg: Message = { id: `m${Date.now()}`, text, mine: true, time: nowTime() }
    setMessages(prev => [...prev, msg])
    setDraft('')
    if ('vibrate' in navigator) navigator.vibrate(15)

    if (isBot) {
      // Bot mode: RAG-backed assistant agent
      setTimeout(() => setTyping(true), 400)
      void (async () => {
        const r = await assistantAgent.run({ query: text })
        setTimeout(() => {
          setTyping(false)
          const d = r.data
          setMessages(prev => [...prev, {
            id: `b${Date.now() + 1}`,
            text: d?.reply ?? '...', mine: false, time: nowTime(),
            citations: d?.citations, confidence: d?.confidence,
          }])
          setBotSuggestions(d?.suggestions ?? [])
        }, 700)
      })()
      return
    }

    // Simulated auto-reply
    setTimeout(() => setTyping(true), 500)
    setTimeout(() => {
      setTyping(false)
      setMessages(prev => [...prev, {
        id: `m${Date.now() + 1}`,
        text: '¡Genial! Nos vemos en la cancha 👊',
        mine: false, time: nowTime(),
      }])
    }, 2000)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-deep, #0F0D0A)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div
        style={{
          flexShrink: 0,
          padding: '14px 16px',
          display: 'flex', alignItems: 'center', gap: 12,
          background: 'rgba(20, 16, 9, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(255, 220, 180, 0.08)',
          zIndex: 10,
        }}
      >
        <button
          onClick={() => nav(-1)}
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 220, 180, 0.08)',
            color: '#FAF5EB',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          <ArrowLeft size={18} />
        </button>
        <div style={{ position: 'relative' }}>
          <div
            style={{
              width: 40, height: 40, borderRadius: '50%',
              background: `${color}22`, color,
              border: `2px solid ${active ? color : 'rgba(255, 220, 180, 0.15)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 13,
              boxShadow: active ? `0 0 10px ${color}66` : 'none',
            }}
          >
            {badge}
          </div>
          {active && (
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 10, height: 10, borderRadius: '50%',
              background: '#CCFF00', border: '2px solid #0F0D0A',
            }} />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 16, color: '#FAF5EB' }}>
            {name}
          </div>
          <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: isBot ? '#B347FF' : (active ? '#CCFF00' : 'rgba(250,245,235,0.5)') }}>
            {isBot ? 'Asistente AI · Siempre disponible' : (active ? 'En línea' : 'Visto hace 1h')}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="screen-scroll"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 14px',
          display: 'flex', flexDirection: 'column', gap: 10,
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              alignSelf: m.mine ? 'flex-end' : 'flex-start',
              maxWidth: '78%',
              animation: 'slide-up-fade 220ms ease-out',
            }}
          >
            <div
              style={{
                padding: '10px 14px',
                borderRadius: m.mine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                background: m.mine
                  ? 'linear-gradient(135deg, #CCFF00, #b8e600)'
                  : 'rgba(255, 255, 255, 0.06)',
                color: m.mine ? '#0F0D0A' : '#FAF5EB',
                border: m.mine ? 'none' : '1px solid rgba(255, 220, 180, 0.08)',
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, lineHeight: 1.4,
                boxShadow: m.mine ? '0 4px 14px rgba(204, 255, 0, 0.25)' : 'none',
                wordWrap: 'break-word',
              }}
            >
              {m.text}
            </div>
            {!m.mine && m.citations && m.citations.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 6 }}>
                {m.citations.map((c, i) => (
                  <span key={i} style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontSize: 10,
                    padding: '2px 8px', borderRadius: 999,
                    background: 'rgba(179, 71, 255, 0.12)',
                    border: '1px solid rgba(179, 71, 255, 0.35)',
                    color: '#D4A8FF',
                  }}>
                    📚 {c.topic}
                  </span>
                ))}
                {typeof m.confidence === 'number' && (
                  <span style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontSize: 10,
                    padding: '2px 8px', borderRadius: 999,
                    background: 'rgba(204, 255, 0, 0.08)',
                    border: '1px solid rgba(204, 255, 0, 0.25)',
                    color: '#CCFF00',
                  }}>
                    conf {(m.confidence * 100).toFixed(0)}%
                  </span>
                )}
              </div>
            )}
            <div
              style={{
                marginTop: 3,
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 10,
                color: 'rgba(250, 245, 235, 0.4)',
                textAlign: m.mine ? 'right' : 'left',
                padding: '0 4px',
              }}
            >
              {m.time}
            </div>
          </div>
        ))}
        {typing && (
          <div style={{ alignSelf: 'flex-start', maxWidth: '60%' }}>
            <div
              style={{
                padding: '12px 16px',
                borderRadius: '16px 16px 16px 4px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid rgba(255, 220, 180, 0.08)',
                display: 'flex', gap: 4, alignItems: 'center',
              }}
            >
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  style={{
                    width: 6, height: 6, borderRadius: '50%',
                    background: 'rgba(250,245,235,0.6)',
                    animation: `pulse-glow 1s ease-in-out ${i * 0.15}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Smart-reply chips (AI mock) */}
      {showChips && (
        <div style={{ flexShrink: 0, padding: '8px 12px 0' }}>
          {/* Tone switcher (solo en chats reales) */}
          {!isBot && <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <Sparkles size={11} color="#CCFF00" />
            <span style={{
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 10,
              color: 'rgba(250, 245, 235, 0.5)', letterSpacing: '0.08em',
              textTransform: 'uppercase', marginRight: 4,
            }}>
              Tono
            </span>
            {(['casual', 'hype', 'formal'] as Tone[]).map(t => (
              <button
                key={t}
                onClick={() => setToneAndSave(t)}
                style={{
                  padding: '3px 9px', borderRadius: 999,
                  background: tone === t ? 'rgba(204, 255, 0, 0.18)' : 'transparent',
                  border: tone === t ? '1px solid rgba(204, 255, 0, 0.5)' : '1px solid rgba(255, 220, 180, 0.1)',
                  color: tone === t ? '#CCFF00' : 'rgba(250, 245, 235, 0.5)',
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, fontWeight: 600,
                  textTransform: 'capitalize', cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>}
          <div
            style={{
              display: 'flex', gap: 8,
              overflowX: 'auto', scrollbarWidth: 'none',
            }}
            className="screen-scroll"
          >
          {suggestions.map((s, i) => (
            <button
              key={`${s}-${i}`}
              onClick={() => pickSuggestion(s)}
              className={isBot ? 'chip-shimmer chip-shimmer--violet' : 'chip-shimmer'}
              style={{
                flexShrink: 0,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 12px',
                borderRadius: 999,
                background: isBot ? 'rgba(179, 71, 255, 0.10)' : 'rgba(204, 255, 0, 0.08)',
                border: isBot ? '1px solid rgba(179, 71, 255, 0.45)' : '1px solid rgba(204, 255, 0, 0.35)',
                color: '#FAF5EB',
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'pointer',
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                animation: 'slide-up-fade 260ms ease-out',
                animationDelay: `${i * 40}ms`,
                animationFillMode: 'backwards',
              }}
            >
              <Sparkles size={12} color={isBot ? '#B347FF' : '#CCFF00'} />
              {s}
            </button>
          ))}
          </div>
        </div>
      )}

      {/* Composer */}
      <div
        style={{
          flexShrink: 0,
          padding: '10px 12px 14px',
          background: 'rgba(20, 16, 9, 0.92)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(255, 220, 180, 0.08)',
          display: 'flex', alignItems: 'center', gap: 8,
        }}
      >
        {speech.supported ? (
          <button
            onClick={toggleMic}
            aria-label={speech.listening ? 'Detener grabación' : 'Dictar por voz'}
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: speech.listening
                ? 'linear-gradient(135deg, rgba(255,91,58,0.22), rgba(255,184,0,0.18))'
                : 'rgba(255, 255, 255, 0.05)',
              border: speech.listening
                ? '1px solid rgba(255,91,58,0.55)'
                : '1px solid rgba(255, 220, 180, 0.08)',
              color: speech.listening ? '#FF5B3A' : 'rgba(250, 245, 235, 0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
              boxShadow: speech.listening ? '0 0 14px rgba(255,91,58,0.45)' : 'none',
              animation: speech.listening ? 'pulse-glow 1.2s ease-in-out infinite' : 'none',
              transition: 'all 180ms',
            }}
          >
            {speech.listening ? <Mic size={16} /> : <MicOff size={16} />}
          </button>
        ) : (
          <button
            style={{
              width: 38, height: 38, borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 220, 180, 0.08)',
              color: 'rgba(250, 245, 235, 0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', flexShrink: 0,
            }}
          >
            <Paperclip size={16} />
          </button>
        )}
        <div
          style={{
            flex: 1,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '0 12px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 220, 180, 0.1)',
            borderRadius: 20,
          }}
        >
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send() }}
            placeholder="Escribe un mensaje..."
            style={{
              flex: 1, padding: '10px 0',
              background: 'transparent', border: 'none', outline: 'none',
              color: '#FAF5EB', fontSize: 14,
              fontFamily: 'Space Grotesk, sans-serif',
            }}
          />
          <Smile size={18} color="rgba(250, 245, 235, 0.5)" />
        </div>
        <button
          onClick={send}
          disabled={!draft.trim()}
          style={{
            width: 42, height: 42, borderRadius: '50%',
            background: draft.trim()
              ? 'linear-gradient(135deg, #CCFF00, #FFB800)'
              : 'rgba(255, 255, 255, 0.06)',
            color: draft.trim() ? '#0F0D0A' : 'rgba(250, 245, 235, 0.3)',
            border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: draft.trim() ? 'pointer' : 'default',
            boxShadow: draft.trim() ? '0 4px 14px rgba(204, 255, 0, 0.4)' : 'none',
            flexShrink: 0,
            transition: 'all 200ms',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  )
}
