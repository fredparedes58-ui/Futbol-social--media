/**
 * EventsSheet — eventos públicos con RSVP (Voy / Tal vez / No puedo).
 */
import { useEffect, useState } from 'react'
import { Calendar, MapPin, Users, Check, HelpCircle, X } from 'lucide-react'
import BottomSheet from '../../components/ui/BottomSheet'

type RSVP = 'going' | 'maybe' | 'no' | null

interface EventItem {
  id: string
  title: string
  date: string
  venue: string
  city: string
  attendees: number
  host: string
  emoji: string
  color: string
}

const EVENTS: EventItem[] = [
  { id: 'e1', title: 'Clásico Amateur · Pumas vs Rayo', date: 'Dom 28 · 10:00', venue: 'Cancha A',    city: 'La Plata',   attendees: 47, host: 'Los Pumas FC',    emoji: '⚽', color: '#CCFF00' },
  { id: 'e2', title: 'Torneo relámpago 5 vs 5',         date: 'Sáb 3 · 16:00',   venue: 'Club Norte',  city: 'CABA',       attendees: 32, host: 'Liga Regional',    emoji: '🏆', color: '#FFB800' },
  { id: 'e3', title: 'Open tryout portero juvenil',     date: 'Mié 7 · 19:00',   venue: 'Cancha B',    city: 'Lomas',      attendees: 18, host: 'Águilas Doradas',  emoji: '🧤', color: '#00D4FF' },
  { id: 'e4', title: 'Clínica técnica Coach AI',        date: 'Vie 9 · 18:30',   venue: 'Complejo Sur', city: 'Quilmes',    attendees: 24, host: 'FútbolBase',       emoji: '🎓', color: '#B347FF' },
]

const KEY = 'fb_events_rsvp'

function loadRsvps(): Record<string, RSVP> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  catch { return {} }
}

interface Props { open: boolean; onClose: () => void }

export default function EventsSheet({ open, onClose }: Props) {
  const [rsvps, setRsvps] = useState<Record<string, RSVP>>(() => loadRsvps())

  useEffect(() => { localStorage.setItem(KEY, JSON.stringify(rsvps)) }, [rsvps])

  function choose(id: string, v: RSVP) {
    if ('vibrate' in navigator) navigator.vibrate(6)
    setRsvps(r => ({ ...r, [id]: v }))
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Eventos" height="88%" accent="#00D4FF">
      <div style={{ fontFamily: 'Space Grotesk', fontSize: 12, color: 'rgba(250,245,235,0.6)', marginBottom: 14 }}>
        Eventos públicos cerca tuyo. Reservá tu lugar con un tap.
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {EVENTS.map(ev => {
          const mine = rsvps[ev.id]
          const extra = mine === 'going' ? 1 : 0
          return (
            <div key={ev.id} style={{
              padding: 14, borderRadius: 14,
              background: `linear-gradient(135deg, ${ev.color}14, rgba(255,255,255,0.03))`,
              border: `1px solid ${ev.color}55`,
              boxShadow: `0 0 14px ${ev.color}18`,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 10 }}>
                <div style={{
                  width: 48, height: 48, borderRadius: 12,
                  background: `${ev.color}22`, color: ev.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 24, border: `1px solid ${ev.color}55`,
                }}>
                  {ev.emoji}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 14, color: '#FAF5EB' }}>
                    {ev.title}
                  </div>
                  <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.55)', marginTop: 2 }}>
                    por {ev.host}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 10, fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.65)' }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Calendar size={12} /> {ev.date}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><MapPin size={12} /> {ev.venue} · {ev.city}</span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}><Users size={12} /> {ev.attendees + extra} asistentes</span>
              </div>

              <div style={{ display: 'flex', gap: 6 }}>
                {([
                  ['going',  'Voy',      Check,      '#CCFF00'],
                  ['maybe',  'Tal vez',  HelpCircle, '#FFB800'],
                  ['no',     'No puedo', X,          '#FF5B3A'],
                ] as const).map(([k, label, Icon, c]) => {
                  const active = mine === k
                  return (
                    <button
                      key={k}
                      onClick={() => choose(ev.id, k)}
                      style={{
                        flex: 1, padding: '8px 10px', borderRadius: 10,
                        background: active ? `${c}22` : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${active ? c : 'rgba(255,220,180,0.1)'}`,
                        color: active ? c : 'rgba(250,245,235,0.65)',
                        cursor: 'pointer',
                        fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                      }}
                    >
                      <Icon size={12} /> {label}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </BottomSheet>
  )
}
