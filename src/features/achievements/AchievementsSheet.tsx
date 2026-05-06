/**
 * AchievementsSheet — muestra los 12 logros con estado, progreso y rareza.
 */
import BottomSheet from '../../components/ui/BottomSheet'
import { evaluateAchievements, RARITY_STYLE } from './catalog'
import type { PlayerStats } from '../../ai/services/deterministic'

interface Props {
  open: boolean
  onClose: () => void
  stats: PlayerStats
}

export default function AchievementsSheet({ open, onClose, stats }: Props) {
  const items = evaluateAchievements(stats)
  const unlockedCount = items.filter(i => i.unlocked).length

  return (
    <BottomSheet open={open} onClose={onClose} title="Logros" height="85%" accent="#FFB800">
      {/* Header resumen */}
      <div style={{
        padding: 14, borderRadius: 14, marginBottom: 14,
        background: 'linear-gradient(135deg, rgba(255,184,0,0.14), rgba(204,255,0,0.06))',
        border: '1px solid rgba(255,184,0,0.35)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(250,245,235,0.5)' }}>
            Progreso total
          </div>
          <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 22, color: '#FAF5EB' }}>
            {unlockedCount} / {items.length}
          </div>
        </div>
        <div style={{ fontSize: 32 }}>🏆</div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {items.map(({ achievement: a, unlocked, progress }) => {
          const st = RARITY_STYLE[a.rarity]
          return (
            <div
              key={a.id}
              style={{
                padding: 12, borderRadius: 14,
                background: unlocked ? st.bg : 'rgba(255,255,255,0.03)',
                border: `1px solid ${unlocked ? st.color + '66' : 'rgba(255,220,180,0.07)'}`,
                opacity: unlocked ? 1 : 0.7,
                position: 'relative', overflow: 'hidden',
                boxShadow: unlocked ? `0 0 18px ${st.color}22` : 'none',
                animation: unlocked ? 'slide-up-fade 320ms ease-out' : undefined,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                <div style={{
                  fontSize: 26,
                  filter: unlocked ? 'none' : 'grayscale(1) opacity(0.6)',
                }}>
                  {a.emoji}
                </div>
                <span style={{
                  fontFamily: 'Space Grotesk', fontSize: 9, fontWeight: 700,
                  padding: '2px 7px', borderRadius: 999,
                  background: st.bg, color: st.color,
                  border: `1px solid ${st.color}55`,
                  textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>
                  {st.label}
                </span>
              </div>
              <div style={{
                fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 13,
                color: '#FAF5EB', marginBottom: 3,
              }}>
                {a.title}
              </div>
              <div style={{
                fontFamily: 'Space Grotesk', fontSize: 11,
                color: 'rgba(250,245,235,0.55)', lineHeight: 1.35, minHeight: 28,
              }}>
                {a.description}
              </div>
              {/* Progress bar */}
              <div style={{
                marginTop: 8, height: 4, borderRadius: 999,
                background: 'rgba(255,255,255,0.06)', overflow: 'hidden',
              }}>
                <div style={{
                  height: '100%', width: `${Math.round(progress * 100)}%`,
                  background: unlocked
                    ? `linear-gradient(90deg, ${st.color}, #FAF5EB)`
                    : `linear-gradient(90deg, ${st.color}66, ${st.color}33)`,
                  transition: 'width 600ms ease-out',
                }} />
              </div>
            </div>
          )
        })}
      </div>
    </BottomSheet>
  )
}
