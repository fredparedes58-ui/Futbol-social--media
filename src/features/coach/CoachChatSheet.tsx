/**
 * CoachChatSheet — conversación 1:1 con el Coach AI.
 * Memoriza las stats del usuario y responde con feedback + plan semanal determinístico.
 */
import { useEffect, useRef, useState } from 'react'
import { Sparkles, Send, Mic, MicOff } from 'lucide-react'
import BottomSheet from '../../components/ui/BottomSheet'
import { coachAgent, type CoachOutput } from '../../ai/agents/coachAgent'
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition'
import type { PlayerStats } from '../../ai/services/deterministic'

interface Msg {
  id: string
  mine: boolean
  text: string
  plan?: CoachOutput['plan']
  grade?: string
}

interface Props {
  open: boolean
  onClose: () => void
  name: string
  position: string
  stats: PlayerStats
}

const SUGGESTIONS = [
  '¿Cómo mejoro mi definición?',
  'Armame un plan de entreno',
  'Tips para más asistencias',
  '¿Qué necesito para ser MVP?',
]

function now() {
  const d = new Date()
  return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

export default function CoachChatSheet({ open, onClose, name, position, stats }: Props) {
  const [messages, setMessages] = useState<Msg[]>([])
  const [draft, setDraft] = useState('')
  const [typing, setTyping] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const speech = useSpeechRecognition('es-AR')

  useEffect(() => {
    if (!open) return
    let cancel = false
    void (async () => {
      const r = await coachAgent.run({ name, position, stats })
      if (cancel || !r.ok) return
      setMessages([{ id: 'c0', mine: false, text: r.data.reply, plan: r.data.plan, grade: r.data.grade }])
    })()
    return () => { cancel = true }
  }, [open, name, position, stats])

  useEffect(() => {
    if (speech.listening && speech.transcript) setDraft(speech.transcript)
  }, [speech.listening, speech.transcript])

  useEffect(() => {
    if (!scrollRef.current) return
    scrollRef.current.scrollTop = scrollRef.current.scrollHeight
  }, [messages.length, typing])

  function send(text?: string) {
    const t = (text ?? draft).trim()
    if (!t) return
    const mine: Msg = { id: `u${Date.now()}`, mine: true, text: t }
    setMessages(m => [...m, mine])
    setDraft('')
    setTyping(true)
    void (async () => {
      await new Promise(res => setTimeout(res, 500 + Math.random() * 400))
      const r = await coachAgent.run({ name, position, stats, query: t })
      if (!r.ok) { setTyping(false); return }
      const reply: Msg = {
        id: `c${Date.now()}`,
        mine: false,
        text: r.data.reply,
        plan: /plan|entren|rutina|ejercicio/i.test(t) ? r.data.plan : undefined,
      }
      setMessages(m => [...m, reply])
      setTyping(false)
      if ('vibrate' in navigator) navigator.vibrate(8)
    })()
  }

  function toggleMic() {
    if (!speech.supported) return
    if (speech.listening) speech.stop()
    else { setDraft(''); speech.start() }
    if ('vibrate' in navigator) navigator.vibrate(8)
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Coach AI" height="92%" accent="#B347FF">
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
        {/* Header chip */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '4px 4px 12px',
          borderBottom: '1px solid rgba(179,71,255,0.18)', marginBottom: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(179,71,255,0.3), rgba(0,212,255,0.2))',
            color: '#B347FF', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Sparkles size={17} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 14, color: '#FAF5EB' }}>
              Conversación 1:1
            </div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.55)' }}>
              Determinístico · recuerda tus stats
            </div>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="screen-scroll" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10, paddingBottom: 8 }}>
          {messages.map(m => (
            <div key={m.id} style={{ display: 'flex', justifyContent: m.mine ? 'flex-end' : 'flex-start' }}>
              <div style={{
                maxWidth: '85%',
                padding: '10px 13px', borderRadius: 14,
                background: m.mine
                  ? 'linear-gradient(135deg, #CCFF00, #FFB800)'
                  : 'linear-gradient(135deg, rgba(179,71,255,0.18), rgba(0,212,255,0.08))',
                color: m.mine ? '#0F0D0A' : '#FAF5EB',
                border: m.mine ? 'none' : '1px solid rgba(179,71,255,0.3)',
                fontFamily: 'Space Grotesk', fontSize: 13, lineHeight: 1.45,
                boxShadow: m.mine ? '0 0 14px rgba(204,255,0,0.25)' : 'none',
              }}>
                {m.grade && (
                  <div style={{
                    display: 'inline-block', padding: '2px 8px', borderRadius: 8,
                    background: 'rgba(204,255,0,0.2)', color: '#CCFF00',
                    fontFamily: 'Archivo', fontStyle: 'italic', fontWeight: 900, fontSize: 11,
                    marginBottom: 6,
                  }}>{m.grade}</div>
                )}
                <div>{m.text}</div>
                {m.plan && (
                  <div style={{ marginTop: 10, display: 'flex', flexDirection: 'column', gap: 4 }}>
                    {m.plan.map((d, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: 8, padding: '6px 8px', borderRadius: 8,
                        background: 'rgba(0,0,0,0.25)', fontSize: 11,
                      }}>
                        <span style={{ color: '#CCFF00', fontWeight: 800, minWidth: 28 }}>{d.day}</span>
                        <span style={{ color: '#FFB800', fontWeight: 700, minWidth: 72 }}>{d.focus}</span>
                        <span style={{ color: 'rgba(250,245,235,0.85)', flex: 1 }}>{d.drill}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div style={{
              padding: '8px 12px', borderRadius: 12, alignSelf: 'flex-start',
              background: 'rgba(179,71,255,0.14)', color: 'rgba(250,245,235,0.6)',
              fontFamily: 'Space Grotesk', fontSize: 12,
            }}>
              Coach está escribiendo…
            </div>
          )}
        </div>

        {/* Suggestions */}
        {messages.length <= 1 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', padding: '8px 0' }}>
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => send(s)} style={{
                padding: '6px 10px', borderRadius: 999,
                background: 'rgba(179,71,255,0.1)', border: '1px solid rgba(179,71,255,0.4)',
                color: '#B347FF', fontFamily: 'Space Grotesk', fontSize: 11, fontWeight: 700,
                cursor: 'pointer',
              }}>{s}</button>
            ))}
          </div>
        )}

        {/* Composer */}
        <div style={{
          display: 'flex', gap: 8, alignItems: 'center',
          padding: '10px 4px 4px', borderTop: '1px solid rgba(179,71,255,0.15)',
        }}>
          <input
            value={draft}
            onChange={e => setDraft(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') send() }}
            placeholder="Preguntale al Coach…"
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 12,
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(179,71,255,0.3)',
              outline: 'none', color: '#FAF5EB',
              fontFamily: 'Space Grotesk', fontSize: 13,
            }}
          />
          {speech.supported && (
            <button onClick={toggleMic} style={{
              width: 40, height: 40, borderRadius: 10, cursor: 'pointer',
              background: speech.listening ? 'rgba(255,91,58,0.2)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${speech.listening ? '#FF5B3A' : 'rgba(179,71,255,0.3)'}`,
              color: speech.listening ? '#FF5B3A' : 'rgba(250,245,235,0.7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {speech.listening ? <MicOff size={15} /> : <Mic size={15} />}
            </button>
          )}
          <button onClick={() => send()} disabled={!draft.trim()} style={{
            width: 40, height: 40, borderRadius: 10,
            background: draft.trim() ? 'linear-gradient(135deg, #B347FF, #00D4FF)' : 'rgba(255,255,255,0.06)',
            border: 'none', color: draft.trim() ? '#fff' : 'rgba(250,245,235,0.4)',
            cursor: draft.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: draft.trim() ? '0 0 14px rgba(179,71,255,0.4)' : 'none',
          }}>
            <Send size={15} />
          </button>
        </div>

        {now() && null}
      </div>
    </BottomSheet>
  )
}
