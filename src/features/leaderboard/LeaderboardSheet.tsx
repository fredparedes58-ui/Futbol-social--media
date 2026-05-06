/**
 * LeaderboardSheet — podium + lista completa. Selector de scope.
 */
import { useEffect, useMemo, useState } from 'react'
import { Crown, ChevronUp, ChevronDown, Minus } from 'lucide-react'
import BottomSheet from '../../components/ui/BottomSheet'
import { simulateLeaderboard, type LeaderboardEntry, type LeaderboardScope } from '../../ai/services/leaderboard'

interface Props {
  open: boolean
  onClose: () => void
  me?: string
}

const SCOPE_LABEL: Record<LeaderboardScope, string> = {
  regional: 'Regional',
  national: 'Nacional',
  friends: 'Amigos',
}

const PODIUM_COLORS = ['#FFB800', '#94A3B8', '#FF5B3A']  // oro / plata / bronce

export default function LeaderboardSheet({ open, onClose, me = 'Alex Rivera' }: Props) {
  const [scope, setScope] = useState<LeaderboardScope>('regional')
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    if (!open) return
    const r = simulateLeaderboard({ scope, me })
    setEntries(r.entries)
  }, [open, scope, me])

  const top3 = useMemo(() => entries.slice(0, 3), [entries])
  const rest = useMemo(() => entries.slice(3), [entries])
  const myEntry = useMemo(() => entries.find(e => e.name === me), [entries, me])

  return (
    <BottomSheet open={open} onClose={onClose} title="Leaderboard" height="90%" accent="#FFB800">
      {/* Scope switcher */}
      <div style={{
        display: 'flex', gap: 6, padding: 4,
        background: 'rgba(255,255,255,0.04)',
        borderRadius: 12, marginBottom: 16,
        border: '1px solid rgba(255,220,180,0.07)',
      }}>
        {(Object.keys(SCOPE_LABEL) as LeaderboardScope[]).map(s => (
          <button
            key={s}
            onClick={() => setScope(s)}
            style={{
              flex: 1, padding: '8px 10px', borderRadius: 8,
              background: scope === s ? 'linear-gradient(135deg, rgba(255,184,0,0.2), rgba(204,255,0,0.1))' : 'transparent',
              border: scope === s ? '1px solid rgba(255,184,0,0.45)' : '1px solid transparent',
              color: scope === s ? '#FFB800' : 'rgba(250,245,235,0.55)',
              fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12,
              cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em',
            }}
          >
            {SCOPE_LABEL[s]}
          </button>
        ))}
      </div>

      {/* Podium */}
      {top3.length === 3 && (
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr',
          alignItems: 'end', gap: 8, marginBottom: 18,
          padding: '14px 8px 10px',
          borderRadius: 14,
          background: 'radial-gradient(circle at 50% 0%, rgba(255,184,0,0.14), transparent 60%)',
        }}>
          {[top3[1], top3[0], top3[2]].map((e, i) => {
            // visual order: 2nd / 1st / 3rd
            const place = i === 0 ? 2 : i === 1 ? 1 : 3
            const color = PODIUM_COLORS[place - 1]
            const height = place === 1 ? 92 : place === 2 ? 72 : 60
            return (
              <div key={e.name} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  position: 'relative',
                  width: place === 1 ? 56 : 46, height: place === 1 ? 56 : 46,
                  borderRadius: '50%',
                  background: `${e.color}33`, color: e.color,
                  border: `3px solid ${color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Archivo', fontWeight: 800, fontSize: 14,
                  boxShadow: `0 0 14px ${color}66`,
                }}>
                  {e.badge}
                  {place === 1 && (
                    <Crown size={14} color={color} style={{
                      position: 'absolute', top: -12, left: '50%', transform: 'translateX(-50%)',
                      filter: `drop-shadow(0 0 6px ${color})`,
                    }} />
                  )}
                </div>
                <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 11, color: '#FAF5EB', textAlign: 'center' }}>
                  {e.name.split(' ')[0]}
                </div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 9, color: 'rgba(250,245,235,0.55)' }}>
                  {e.score} pts
                </div>
                <div style={{
                  width: '100%', height, borderRadius: '10px 10px 4px 4px',
                  background: `linear-gradient(180deg, ${color}55, ${color}22)`,
                  border: `1px solid ${color}77`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Archivo', fontWeight: 900, fontSize: 22,
                  color,
                }}>
                  {place}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Lista resto */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {rest.map(e => <Row key={e.name} entry={e} isMe={e.name === me} />)}
      </div>

      {/* Tu posición destacada al final si no estás en top */}
      {myEntry && myEntry.rank > 3 && (
        <div style={{ marginTop: 14 }}>
          <div style={{
            fontFamily: 'Space Grotesk', fontSize: 10,
            color: 'rgba(250,245,235,0.5)', textTransform: 'uppercase',
            letterSpacing: '0.1em', marginBottom: 6,
          }}>
            Tu posición
          </div>
          <Row entry={myEntry} isMe highlight />
        </div>
      )}
    </BottomSheet>
  )
}

function Row({ entry, isMe, highlight }: { entry: LeaderboardEntry; isMe?: boolean; highlight?: boolean }) {
  const DeltaIcon = entry.delta > 0 ? ChevronUp : entry.delta < 0 ? ChevronDown : Minus
  const deltaColor = entry.delta > 0 ? '#CCFF00' : entry.delta < 0 ? '#FF5B3A' : 'rgba(250,245,235,0.4)'
  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '30px 34px 1fr auto auto', alignItems: 'center', gap: 10,
      padding: '10px 12px', borderRadius: 12,
      background: isMe
        ? (highlight ? 'linear-gradient(135deg, rgba(204,255,0,0.14), rgba(0,212,255,0.08))' : 'rgba(204,255,0,0.06)')
        : 'rgba(255,255,255,0.03)',
      border: `1px solid ${isMe ? 'rgba(204,255,0,0.4)' : 'rgba(255,220,180,0.07)'}`,
      boxShadow: isMe && highlight ? '0 0 16px rgba(204,255,0,0.25)' : 'none',
    }}>
      <div style={{
        fontFamily: 'Archivo', fontWeight: 900, fontSize: 14,
        color: isMe ? '#CCFF00' : 'rgba(250,245,235,0.7)',
        textAlign: 'center',
      }}>
        {entry.rank}
      </div>
      <div style={{
        width: 30, height: 30, borderRadius: '50%',
        background: `${entry.color}33`, color: entry.color,
        border: `1.5px solid ${entry.color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Archivo', fontWeight: 800, fontSize: 10,
      }}>
        {entry.badge}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontFamily: 'Archivo', fontWeight: 700, fontSize: 13, color: '#FAF5EB',
          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
        }}>
          {entry.name}
        </div>
        <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.5)' }}>
          {entry.team} · {entry.grade}
        </div>
      </div>
      <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 13, color: '#FFB800' }}>
        {entry.score}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 30 }}>
        <DeltaIcon size={14} color={deltaColor} />
        {entry.delta !== 0 && (
          <span style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: deltaColor, fontWeight: 700 }}>
            {Math.abs(entry.delta)}
          </span>
        )}
      </div>
    </div>
  )
}
