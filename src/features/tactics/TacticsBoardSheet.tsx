/**
 * TacticsBoardSheet — pizarra táctica con drag-drop pointer-based.
 * Jugadores (x,y) en [0..1] sobre la cancha, persiste en localStorage por formación.
 */
import { useEffect, useRef, useState } from 'react'
import { RotateCcw, Save } from 'lucide-react'
import BottomSheet from '../../components/ui/BottomSheet'

type Formation = '4-3-3' | '4-4-2' | '4-2-3-1' | '3-5-2'

interface Slot { id: string; label: string; x: number; y: number }

const PRESETS: Record<Formation, Slot[]> = {
  '4-3-3': [
    { id: 'gk',  label: 'GK',  x: 0.5,  y: 0.93 },
    { id: 'd1',  label: 'LB',  x: 0.15, y: 0.75 },
    { id: 'd2',  label: 'CB',  x: 0.37, y: 0.78 },
    { id: 'd3',  label: 'CB',  x: 0.63, y: 0.78 },
    { id: 'd4',  label: 'RB',  x: 0.85, y: 0.75 },
    { id: 'm1',  label: 'CM',  x: 0.28, y: 0.52 },
    { id: 'm2',  label: 'CM',  x: 0.50, y: 0.55 },
    { id: 'm3',  label: 'CM',  x: 0.72, y: 0.52 },
    { id: 'f1',  label: 'LW',  x: 0.18, y: 0.22 },
    { id: 'f2',  label: 'ST',  x: 0.50, y: 0.15 },
    { id: 'f3',  label: 'RW',  x: 0.82, y: 0.22 },
  ],
  '4-4-2': [
    { id: 'gk',  label: 'GK',  x: 0.5,  y: 0.93 },
    { id: 'd1',  label: 'LB',  x: 0.15, y: 0.75 },
    { id: 'd2',  label: 'CB',  x: 0.37, y: 0.78 },
    { id: 'd3',  label: 'CB',  x: 0.63, y: 0.78 },
    { id: 'd4',  label: 'RB',  x: 0.85, y: 0.75 },
    { id: 'm1',  label: 'LM',  x: 0.15, y: 0.50 },
    { id: 'm2',  label: 'CM',  x: 0.38, y: 0.52 },
    { id: 'm3',  label: 'CM',  x: 0.62, y: 0.52 },
    { id: 'm4',  label: 'RM',  x: 0.85, y: 0.50 },
    { id: 'f1',  label: 'ST',  x: 0.38, y: 0.18 },
    { id: 'f2',  label: 'ST',  x: 0.62, y: 0.18 },
  ],
  '4-2-3-1': [
    { id: 'gk',  label: 'GK',  x: 0.5,  y: 0.93 },
    { id: 'd1',  label: 'LB',  x: 0.15, y: 0.75 },
    { id: 'd2',  label: 'CB',  x: 0.37, y: 0.78 },
    { id: 'd3',  label: 'CB',  x: 0.63, y: 0.78 },
    { id: 'd4',  label: 'RB',  x: 0.85, y: 0.75 },
    { id: 'dm1', label: 'CDM', x: 0.38, y: 0.58 },
    { id: 'dm2', label: 'CDM', x: 0.62, y: 0.58 },
    { id: 'am1', label: 'LAM', x: 0.20, y: 0.36 },
    { id: 'am2', label: 'CAM', x: 0.50, y: 0.32 },
    { id: 'am3', label: 'RAM', x: 0.80, y: 0.36 },
    { id: 'f1',  label: 'ST',  x: 0.50, y: 0.15 },
  ],
  '3-5-2': [
    { id: 'gk',  label: 'GK',  x: 0.5,  y: 0.93 },
    { id: 'd1',  label: 'CB',  x: 0.25, y: 0.78 },
    { id: 'd2',  label: 'CB',  x: 0.50, y: 0.80 },
    { id: 'd3',  label: 'CB',  x: 0.75, y: 0.78 },
    { id: 'wb1', label: 'LWB', x: 0.12, y: 0.55 },
    { id: 'wb2', label: 'RWB', x: 0.88, y: 0.55 },
    { id: 'm1',  label: 'CM',  x: 0.33, y: 0.50 },
    { id: 'm2',  label: 'CM',  x: 0.50, y: 0.55 },
    { id: 'm3',  label: 'CM',  x: 0.67, y: 0.50 },
    { id: 'f1',  label: 'ST',  x: 0.38, y: 0.18 },
    { id: 'f2',  label: 'ST',  x: 0.62, y: 0.18 },
  ],
}

const STORAGE_KEY = 'fb_tactics_layout'

function loadLayout(formation: Formation): Slot[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY}:${formation}`)
    if (raw) return JSON.parse(raw) as Slot[]
  } catch { /* ignore */ }
  return PRESETS[formation].map(s => ({ ...s }))
}

function saveLayout(formation: Formation, slots: Slot[]) {
  try { localStorage.setItem(`${STORAGE_KEY}:${formation}`, JSON.stringify(slots)) }
  catch { /* ignore */ }
}

interface Props { open: boolean; onClose: () => void }

export default function TacticsBoardSheet({ open, onClose }: Props) {
  const [formation, setFormation] = useState<Formation>('4-3-3')
  const [slots, setSlots] = useState<Slot[]>(() => loadLayout('4-3-3'))
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const pitchRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setSlots(loadLayout(formation)) }, [formation])

  function changeFormation(f: Formation) {
    if ('vibrate' in navigator) navigator.vibrate(8)
    setFormation(f)
  }

  function reset() {
    if ('vibrate' in navigator) navigator.vibrate(12)
    const fresh = PRESETS[formation].map(s => ({ ...s }))
    setSlots(fresh)
    saveLayout(formation, fresh)
  }

  function persist() {
    saveLayout(formation, slots)
    if ('vibrate' in navigator) navigator.vibrate([8, 40, 8])
  }

  function onPointerDown(id: string) {
    return (e: React.PointerEvent) => {
      e.preventDefault()
      setDraggingId(id)
      if ('vibrate' in navigator) navigator.vibrate(5)
      ;(e.target as Element).setPointerCapture(e.pointerId)
    }
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!draggingId || !pitchRef.current) return
    const rect = pitchRef.current.getBoundingClientRect()
    const x = Math.max(0.04, Math.min(0.96, (e.clientX - rect.left) / rect.width))
    const y = Math.max(0.04, Math.min(0.96, (e.clientY - rect.top) / rect.height))
    setSlots(prev => prev.map(s => s.id === draggingId ? { ...s, x, y } : s))
  }

  function onPointerUp(e: React.PointerEvent) {
    if (!draggingId) return
    setDraggingId(null)
    saveLayout(formation, slots)
    try { (e.target as Element).releasePointerCapture(e.pointerId) } catch { /* ignore */ }
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Pizarra táctica" height="92%" accent="#00D4FF">
      {/* Formation switcher */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {(Object.keys(PRESETS) as Formation[]).map(f => (
          <button
            key={f}
            onClick={() => changeFormation(f)}
            style={{
              padding: '7px 12px', borderRadius: 999,
              background: formation === f ? 'rgba(0,212,255,0.18)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${formation === f ? 'rgba(0,212,255,0.55)' : 'rgba(255,220,180,0.1)'}`,
              color: formation === f ? '#00D4FF' : 'rgba(250,245,235,0.7)',
              fontFamily: 'Space Grotesk', fontSize: 12, fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            {f}
          </button>
        ))}
        <button
          onClick={reset}
          style={{
            marginLeft: 'auto',
            padding: '7px 12px', borderRadius: 999,
            background: 'rgba(255,91,58,0.12)',
            border: '1px solid rgba(255,91,58,0.45)',
            color: '#FF5B3A',
            fontFamily: 'Space Grotesk', fontSize: 12, fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
        >
          <RotateCcw size={12} /> Reset
        </button>
        <button
          onClick={persist}
          style={{
            padding: '7px 12px', borderRadius: 999,
            background: 'rgba(204,255,0,0.15)',
            border: '1px solid rgba(204,255,0,0.5)',
            color: '#CCFF00',
            fontFamily: 'Space Grotesk', fontSize: 12, fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex', alignItems: 'center', gap: 4,
          }}
        >
          <Save size={12} /> Guardar
        </button>
      </div>

      {/* Pitch */}
      <div
        ref={pitchRef}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '2 / 3',
          borderRadius: 16,
          background:
            'linear-gradient(180deg, #0B2E1A 0%, #0E3822 50%, #0B2E1A 100%)',
          border: '2px solid rgba(204,255,0,0.35)',
          boxShadow: '0 0 28px rgba(204,255,0,0.18), inset 0 0 40px rgba(0,0,0,0.4)',
          overflow: 'hidden',
          touchAction: 'none',
        }}
      >
        {/* Pitch lines */}
        <svg viewBox="0 0 100 150" preserveAspectRatio="none" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.55 }}>
          <rect x="1" y="1" width="98" height="148" fill="none" stroke="#CCFF00" strokeWidth="0.3" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="#CCFF00" strokeWidth="0.3" />
          <circle cx="50" cy="75" r="10" fill="none" stroke="#CCFF00" strokeWidth="0.3" />
          <circle cx="50" cy="75" r="0.8" fill="#CCFF00" />
          {/* Áreas */}
          <rect x="25" y="1"   width="50" height="18" fill="none" stroke="#CCFF00" strokeWidth="0.3" />
          <rect x="37" y="1"   width="26" height="7"  fill="none" stroke="#CCFF00" strokeWidth="0.3" />
          <rect x="25" y="131" width="50" height="18" fill="none" stroke="#CCFF00" strokeWidth="0.3" />
          <rect x="37" y="142" width="26" height="7"  fill="none" stroke="#CCFF00" strokeWidth="0.3" />
        </svg>

        {/* Players */}
        {slots.map(s => {
          const dragging = draggingId === s.id
          return (
            <div
              key={s.id}
              onPointerDown={onPointerDown(s.id)}
              style={{
                position: 'absolute',
                left: `${s.x * 100}%`,
                top: `${s.y * 100}%`,
                transform: `translate(-50%, -50%) scale(${dragging ? 1.18 : 1})`,
                width: 44, height: 44, borderRadius: '50%',
                background: dragging
                  ? 'linear-gradient(135deg, #00D4FF, #CCFF00)'
                  : 'linear-gradient(135deg, #CCFF00, #FFB800)',
                color: '#0F0D0A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Archivo', fontWeight: 900, fontSize: 10,
                boxShadow: dragging
                  ? '0 0 22px rgba(0,212,255,0.7), 0 6px 16px rgba(0,0,0,0.5)'
                  : '0 0 14px rgba(204,255,0,0.45), 0 4px 10px rgba(0,0,0,0.4)',
                cursor: dragging ? 'grabbing' : 'grab',
                transition: dragging ? 'none' : 'transform 140ms ease-out, box-shadow 140ms',
                userSelect: 'none', touchAction: 'none',
                border: '2px solid rgba(255,255,255,0.25)',
              }}
            >
              {s.label}
            </div>
          )
        })}
      </div>

      <div style={{
        marginTop: 10,
        fontFamily: 'Space Grotesk', fontSize: 11,
        color: 'rgba(250,245,235,0.5)', textAlign: 'center',
      }}>
        Arrastrá a cada jugador para ajustar la táctica. Se guarda automáticamente.
      </div>
    </BottomSheet>
  )
}
