/**
 * MatchReplaySheet — replay scrubable con pizarra de anotaciones por frame.
 * Usa matchCommentatorAgent (agente) + detectHighlights (servicio) para contenido.
 */
import { useEffect, useMemo, useRef, useState } from 'react'
import { Pause, Play, Pencil, Eraser, Circle as CircleIcon, ArrowRight, Trash2 } from 'lucide-react'
import BottomSheet from '../../components/ui/BottomSheet'
import { matchCommentatorAgent, type MatchEvent } from '../../ai/agents/matchCommentatorAgent'
import { detectHighlights, type Highlight } from '../../ai/services/highlights'

interface Stroke {
  id: string
  tool: 'pen' | 'circle' | 'arrow'
  color: string
  points: { x: number; y: number }[]
}

interface Props {
  open: boolean
  onClose: () => void
  home: string
  away: string
}

const COLORS = ['#CCFF00', '#FF5B3A', '#00D4FF', '#FFB800']

export default function MatchReplaySheet({ open, onClose, home, away }: Props) {
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [highlights, setHighlights] = useState<Highlight[]>([])
  const [playing, setPlaying] = useState(false)
  const [idx, setIdx] = useState(0)
  const [tool, setTool] = useState<Stroke['tool']>('pen')
  const [color, setColor] = useState(COLORS[0])
  // Anotaciones por índice de frame
  const [strokesByFrame, setStrokesByFrame] = useState<Record<number, Stroke[]>>({})
  const drawingRef = useRef<Stroke | null>(null)
  const canvasRef = useRef<SVGSVGElement>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    if (!open) return
    setIdx(0)
    setStrokesByFrame({})
    setPlaying(false)
    void (async () => {
      const r = await matchCommentatorAgent.run({ home, away, count: 18 })
      if (!r.ok) return
      setEvents(r.data.events)
      const h = detectHighlights(r.data.events, 3)
      setHighlights(h.highlights)
    })()
  }, [open, home, away])

  useEffect(() => {
    if (!playing || events.length === 0) return
    timerRef.current = window.setInterval(() => {
      setIdx(i => {
        if (i + 1 >= events.length) { setPlaying(false); return i }
        return i + 1
      })
    }, 1400)
    return () => { if (timerRef.current) window.clearInterval(timerRef.current) }
  }, [playing, events.length])

  const current = events[idx]
  const strokes = strokesByFrame[idx] ?? []

  function pointFromEvent(e: React.PointerEvent): { x: number; y: number } {
    const rect = canvasRef.current!.getBoundingClientRect()
    return {
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    }
  }

  function onPointerDown(e: React.PointerEvent) {
    if (!canvasRef.current) return
    ;(e.target as Element).setPointerCapture(e.pointerId)
    const p = pointFromEvent(e)
    drawingRef.current = {
      id: `s-${Date.now()}`,
      tool, color,
      points: [p],
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drawingRef.current) return
    const p = pointFromEvent(e)
    const s = drawingRef.current
    if (s.tool === 'pen') s.points.push(p)
    else s.points = [s.points[0], p]
    // force re-render via state
    setStrokesByFrame(prev => ({ ...prev, [idx]: [...(prev[idx] ?? []).filter(x => x.id !== s.id), s] }))
  }

  function onPointerUp() {
    drawingRef.current = null
  }

  function clearFrame() {
    setStrokesByFrame(prev => ({ ...prev, [idx]: [] }))
    if ('vibrate' in navigator) navigator.vibrate(8)
  }

  const progress = events.length ? ((idx + 1) / events.length) * 100 : 0
  const homeGoals = events.slice(0, idx + 1).filter(e => e.type === 'goal' && e.team === 'home').length
  const awayGoals = events.slice(0, idx + 1).filter(e => e.type === 'goal' && e.team === 'away').length

  const highlightFrames = useMemo(() => {
    const set = new Set(highlights.map(h => events.indexOf(h.event)))
    set.delete(-1)
    return set
  }, [highlights, events])

  return (
    <BottomSheet open={open} onClose={onClose} title="Replay con pizarra" height="95%" accent="#00D4FF">
      {/* Scoreboard + minuto */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 10,
        padding: 12, borderRadius: 12, marginBottom: 10,
        background: 'rgba(0,212,255,0.08)',
        border: '1px solid rgba(0,212,255,0.3)',
      }}>
        <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 13, color: '#FAF5EB', textAlign: 'right' }}>{home}</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 22, color: '#CCFF00' }}>{homeGoals}</span>
          <span style={{ color: 'rgba(250,245,235,0.4)' }}>-</span>
          <span style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 22, color: '#FFB800' }}>{awayGoals}</span>
        </div>
        <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 13, color: '#FAF5EB' }}>{away}</div>
      </div>

      {/* Canvas (pizarra sobre cancha) */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '3 / 2', marginBottom: 10 }}>
        <svg
          ref={canvasRef}
          viewBox="0 0 150 100" preserveAspectRatio="none"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          style={{
            width: '100%', height: '100%',
            borderRadius: 12,
            background: 'linear-gradient(135deg, #0B2E1A, #0E3822)',
            border: '2px solid rgba(0,212,255,0.35)',
            touchAction: 'none', cursor: 'crosshair',
          }}
        >
          {/* Cancha horizontal */}
          <g style={{ opacity: 0.5 }}>
            <rect x="1" y="1" width="148" height="98" fill="none" stroke="#CCFF00" strokeWidth="0.3" />
            <line x1="75" y1="0" x2="75" y2="100" stroke="#CCFF00" strokeWidth="0.3" />
            <circle cx="75" cy="50" r="10" fill="none" stroke="#CCFF00" strokeWidth="0.3" />
          </g>
          {/* Strokes */}
          {strokes.map(s => {
            if (s.tool === 'pen') {
              const d = s.points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
              return <path key={s.id} d={d} stroke={s.color} strokeWidth="0.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            }
            if (s.tool === 'circle' && s.points.length === 2) {
              const [a, b] = s.points
              const cx = (a.x + b.x) / 2
              const cy = (a.y + b.y) / 2
              const r = Math.hypot(b.x - a.x, b.y - a.y) / 2
              return <circle key={s.id} cx={cx} cy={cy} r={r} stroke={s.color} strokeWidth="0.8" fill="none" />
            }
            if (s.tool === 'arrow' && s.points.length === 2) {
              const [a, b] = s.points
              const angle = Math.atan2(b.y - a.y, b.x - a.x)
              const al = 2.5
              const x1 = b.x - al * Math.cos(angle - Math.PI / 7)
              const y1 = b.y - al * Math.sin(angle - Math.PI / 7)
              const x2 = b.x - al * Math.cos(angle + Math.PI / 7)
              const y2 = b.y - al * Math.sin(angle + Math.PI / 7)
              return (
                <g key={s.id}>
                  <line x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={s.color} strokeWidth="0.8" strokeLinecap="round" />
                  <polygon points={`${b.x},${b.y} ${x1},${y1} ${x2},${y2}`} fill={s.color} />
                </g>
              )
            }
            return null
          })}
        </svg>
      </div>

      {/* Tool palette */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        {([
          ['pen',    Pencil,     'Lápiz'],
          ['circle', CircleIcon, 'Círculo'],
          ['arrow',  ArrowRight, 'Flecha'],
        ] as const).map(([k, Icon, label]) => (
          <button key={k} onClick={() => setTool(k)} aria-label={label} style={{
            padding: '8px 10px', borderRadius: 10,
            background: tool === k ? 'rgba(0,212,255,0.18)' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${tool === k ? 'rgba(0,212,255,0.5)' : 'rgba(255,220,180,0.1)'}`,
            color: tool === k ? '#00D4FF' : 'rgba(250,245,235,0.7)',
            cursor: 'pointer',
          }}>
            <Icon size={14} />
          </button>
        ))}
        <div style={{ width: 1, height: 20, background: 'rgba(255,220,180,0.15)', margin: '0 4px' }} />
        {COLORS.map(c => (
          <button key={c} onClick={() => setColor(c)} aria-label={`color ${c}`} style={{
            width: 26, height: 26, borderRadius: '50%',
            background: c,
            border: color === c ? '2px solid #FAF5EB' : '2px solid transparent',
            boxShadow: color === c ? `0 0 10px ${c}` : 'none',
            cursor: 'pointer',
          }} />
        ))}
        <button onClick={clearFrame} aria-label="Borrar frame" style={{
          marginLeft: 'auto',
          padding: '8px 10px', borderRadius: 10,
          background: 'rgba(255,91,58,0.1)',
          border: '1px solid rgba(255,91,58,0.4)',
          color: '#FF5B3A', cursor: 'pointer',
          display: 'inline-flex', alignItems: 'center', gap: 4,
        }}>
          <Eraser size={13} />
        </button>
      </div>

      {/* Timeline scrub */}
      <div style={{ marginBottom: 10 }}>
        <div style={{ position: 'relative', height: 22 }}>
          <input
            type="range"
            min={0} max={Math.max(0, events.length - 1)}
            value={idx}
            onChange={e => setIdx(Number(e.target.value))}
            style={{ position: 'absolute', inset: 0, width: '100%', accentColor: '#00D4FF' }}
          />
          {/* Highlight markers */}
          {events.length > 0 && [...highlightFrames].map(f => (
            <div key={f} style={{
              position: 'absolute', top: 4,
              left: `${(f / (events.length - 1)) * 100}%`,
              transform: 'translateX(-50%)',
              width: 4, height: 14, borderRadius: 2,
              background: '#FFB800', boxShadow: '0 0 6px #FFB800',
              pointerEvents: 'none',
            }} />
          ))}
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.5)',
        }}>
          <span>0&apos;</span>
          <span>{current ? `${current.minute}'` : '—'}</span>
          <span>90&apos;</span>
        </div>
      </div>

      {/* Controles */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <button
          onClick={() => setPlaying(p => !p)}
          style={{
            padding: '10px 14px', borderRadius: 10,
            background: 'linear-gradient(135deg, rgba(0,212,255,0.22), rgba(204,255,0,0.1))',
            border: '1px solid rgba(0,212,255,0.55)',
            color: '#00D4FF', cursor: 'pointer',
            fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12,
            display: 'inline-flex', alignItems: 'center', gap: 6,
          }}
        >
          {playing ? <Pause size={14} /> : <Play size={14} />}
          {playing ? 'Pausar' : 'Reproducir'}
        </button>
        <div style={{ flex: 1, height: 4, borderRadius: 999, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
          <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #00D4FF, #CCFF00)' }} />
        </div>
      </div>

      {/* Frame caption */}
      {current && (
        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,220,180,0.08)',
          fontFamily: 'Space Grotesk', fontSize: 12, color: '#FAF5EB', lineHeight: 1.4,
        }}>
          <strong style={{ color: '#00D4FF' }}>{current.minute}&apos;</strong> &middot; {current.text}
          {highlightFrames.has(idx) && (
            <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 999, background: 'rgba(255,184,0,0.2)', border: '1px solid rgba(255,184,0,0.5)', color: '#FFB800', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              HIGHLIGHT
            </span>
          )}
        </div>
      )}

      {/* Highlights directos */}
      {highlights.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(250,245,235,0.5)', marginBottom: 6 }}>
            Saltar a highlights
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {highlights.map((h, i) => {
              const frameIdx = events.indexOf(h.event)
              return (
                <button key={i} onClick={() => { if (frameIdx >= 0) setIdx(frameIdx) }} style={{
                  padding: '6px 10px', borderRadius: 999,
                  background: 'rgba(255,184,0,0.14)',
                  border: '1px solid rgba(255,184,0,0.45)',
                  color: '#FFB800', cursor: 'pointer',
                  fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
                }}>
                  {h.event.minute}&apos; · {h.event.type}
                </button>
              )
            })}
            <span style={{ marginLeft: 'auto', fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.45)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Trash2 size={10} /> Anotaciones por frame
            </span>
          </div>
        </div>
      )}
    </BottomSheet>
  )
}
