/**
 * PollCard — encuesta con animación de llenado de barra al votar.
 * Persiste voto por pollId en localStorage.
 */
import { useMemo, useState } from 'react'
import { Check, BarChart3 } from 'lucide-react'

interface PollOption {
  id: string
  label: string
  votes: number
  color?: string
}

interface Props {
  id: string
  question: string
  options: PollOption[]
  totalVoters?: number
}

const KEY = (id: string) => `fb_poll_${id}`

export default function PollCard({ id, question, options, totalVoters }: Props) {
  const [voted, setVoted] = useState<string | null>(() => {
    try { return localStorage.getItem(KEY(id)) } catch { return null }
  })

  const enriched = useMemo(() => {
    if (!voted) return options
    return options.map(o => o.id === voted ? { ...o, votes: o.votes + 1 } : o)
  }, [voted, options])

  const total = enriched.reduce((a, o) => a + o.votes, 0)

  function vote(optId: string) {
    if (voted) return
    setVoted(optId)
    try { localStorage.setItem(KEY(id), optId) } catch { /* ignore */ }
    if ('vibrate' in navigator) navigator.vibrate(12)
  }

  return (
    <div style={{
      padding: 14, borderRadius: 14,
      background: 'linear-gradient(135deg, rgba(0,212,255,0.10), rgba(179,71,255,0.06))',
      border: '1px solid rgba(0,212,255,0.30)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <BarChart3 size={14} color="#00D4FF" />
        <span style={{
          fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 700,
          color: '#00D4FF', textTransform: 'uppercase', letterSpacing: '0.12em',
        }}>
          Encuesta
        </span>
      </div>
      <div style={{
        fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 15,
        color: '#FAF5EB', marginBottom: 12, lineHeight: 1.3,
      }}>
        {question}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {enriched.map(opt => {
          const pct = total > 0 ? (opt.votes / total) * 100 : 0
          const isMine = voted === opt.id
          const c = opt.color ?? '#CCFF00'
          return (
            <button
              key={opt.id}
              onClick={() => vote(opt.id)}
              disabled={!!voted}
              style={{
                position: 'relative',
                padding: '10px 12px', borderRadius: 10,
                background: voted ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isMine ? c : 'rgba(255,220,180,0.1)'}`,
                color: '#FAF5EB',
                textAlign: 'left', cursor: voted ? 'default' : 'pointer',
                overflow: 'hidden',
                transition: 'background 200ms',
              }}
            >
              {/* Fill bar */}
              {voted && (
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: `${pct}%`,
                  background: `linear-gradient(90deg, ${c}33, ${c}11)`,
                  transition: 'width 700ms ease-out',
                }} />
              )}
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ flex: 1, fontFamily: 'Space Grotesk', fontSize: 13, fontWeight: 600 }}>
                  {opt.label}
                </span>
                {isMine && <Check size={14} color={c} />}
                {voted && (
                  <span style={{
                    fontFamily: 'Archivo', fontWeight: 800, fontSize: 12,
                    color: isMine ? c : 'rgba(250,245,235,0.6)',
                  }}>
                    {pct.toFixed(0)}%
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {totalVoters !== undefined && (
        <div style={{
          marginTop: 10, fontFamily: 'Space Grotesk', fontSize: 10,
          color: 'rgba(250,245,235,0.45)', textAlign: 'right',
        }}>
          {total + (totalVoters - options.reduce((a, o) => a + o.votes, 0))} votos
        </div>
      )}
    </div>
  )
}
