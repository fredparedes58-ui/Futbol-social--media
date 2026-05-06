/**
 * LiveMatchSheet — tracker de partido en vivo.
 * Usa matchCommentatorAgent para generar eventos deterministas minuto a minuto.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import BottomSheet from './BottomSheet'
import { matchCommentatorAgent, type MatchEvent } from '../../ai/agents/matchCommentatorAgent'

interface Props {
  open: boolean
  onClose: () => void
  home: string
  away: string
}

const EVENT_STYLE: Record<string, { color: string; icon: string }> = {
  goal:       { color: '#CCFF00', icon: '⚽' },
  chance:     { color: '#FFB800', icon: '🎯' },
  save:       { color: '#00D4FF', icon: '🧤' },
  yellow:     { color: '#FFB800', icon: '🟨' },
  red:        { color: '#FF5B3A', icon: '🟥' },
  sub:        { color: '#B347FF', icon: '🔁' },
  foul:       { color: 'rgba(250,245,235,0.5)', icon: '⚠️' },
  corner:     { color: 'rgba(250,245,235,0.5)', icon: '🚩' },
  kickoff:    { color: '#CCFF00', icon: '🏁' },
  halftime:   { color: '#FFB800', icon: '⏸️' },
  fulltime:   { color: '#FF5B3A', icon: '🏆' },
  commentary: { color: 'rgba(250,245,235,0.4)', icon: '💬' },
}

export default function LiveMatchSheet({ open, onClose, home, away }: Props) {
  const seed = useMemo(() => Math.floor(Math.random() * 999999), [open])
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [visibleCount, setVisibleCount] = useState(0)
  const timerRef = useRef<number | null>(null)

  // Generar lote completo al abrir
  useEffect(() => {
    if (!open) return
    setEvents([])
    setVisibleCount(0)
    void (async () => {
      const r = await matchCommentatorAgent.run({
        home, away, count: 22, seed,
      })
      if (r.ok) setEvents(r.data.events)
    })()
  }, [open, home, away, seed])

  // Tick: revelar eventos progresivamente
  useEffect(() => {
    if (!open || events.length === 0) return
    timerRef.current = window.setInterval(() => {
      setVisibleCount(c => {
        if (c >= events.length) {
          if (timerRef.current) window.clearInterval(timerRef.current)
          return c
        }
        return c + 1
      })
    }, 900)
    return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
  }, [open, events.length])

  const shown = events.slice(0, visibleCount)
  const homeGoals = shown.filter(e => e.type === 'goal' && e.team === 'home').length
  const awayGoals = shown.filter(e => e.type === 'goal' && e.team === 'away').length
  const lastMinute = shown.length > 0 ? shown[shown.length - 1].minute : 0

  return (
    <BottomSheet open={open} onClose={onClose} title="Partido en vivo · simulado" height="88%" accent="#FF5B3A">
      {/* Scoreboard */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center', gap: 12,
        padding: '16px 14px',
        borderRadius: 16,
        background: 'linear-gradient(135deg, rgba(255,91,58,0.12), rgba(204,255,0,0.08))',
        border: '1px solid rgba(255,91,58,0.35)',
        marginBottom: 14,
      }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 14, color: '#FAF5EB' }}>{home}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 32, color: '#CCFF00' }}>{homeGoals}</span>
          <span style={{ fontSize: 18, color: 'rgba(250,245,235,0.4)' }}>-</span>
          <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 32, color: '#FFB800' }}>{awayGoals}</span>
        </div>
        <div>
          <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 14, color: '#FAF5EB' }}>{away}</div>
        </div>
      </div>

      {/* Minute + live indicator */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-block', width: 8, height: 8, borderRadius: '50%',
            background: '#FF5B3A', boxShadow: '0 0 8px #FF5B3A',
            animation: 'pulse-glow 1.2s ease-in-out infinite',
          }} />
          <span style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: '#FF5B3A', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            EN VIVO · {lastMinute}&apos;
          </span>
        </div>
        <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: 'rgba(250,245,235,0.5)' }}>
          {shown.length} / {events.length} eventos
        </div>
      </div>

      {/* Timeline */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {[...shown].reverse().map(ev => {
          const st = EVENT_STYLE[ev.type] ?? EVENT_STYLE.commentary
          const isHigh = ev.impact >= 3
          return (
            <div
              key={ev.id}
              style={{
                display: 'grid', gridTemplateColumns: '44px 28px 1fr', gap: 10,
                alignItems: 'center',
                padding: '10px 12px',
                borderRadius: 12,
                background: isHigh ? `${st.color}14` : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isHigh ? st.color + '44' : 'rgba(255,220,180,0.07)'}`,
                animation: 'slide-up-fade 280ms ease-out',
              }}
            >
              <div style={{
                fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 13,
                color: st.color, textAlign: 'center',
              }}>
                {ev.minute}&apos;
              </div>
              <div style={{ fontSize: 18, textAlign: 'center' }}>{st.icon}</div>
              <div style={{
                fontFamily: 'Space Grotesk, sans-serif', fontSize: 13,
                color: isHigh ? '#FAF5EB' : 'rgba(250,245,235,0.75)',
                fontWeight: isHigh ? 600 : 400,
                lineHeight: 1.35,
              }}>
                {ev.text}
              </div>
            </div>
          )
        })}
      </div>

      {shown.length === 0 && (
        <div style={{
          padding: 30, textAlign: 'center',
          fontFamily: 'Space Grotesk, sans-serif', fontSize: 13,
          color: 'rgba(250,245,235,0.5)',
        }}>
          Preparando el partido...
        </div>
      )}
    </BottomSheet>
  )
}
