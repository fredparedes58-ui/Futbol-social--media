/**
 * SeasonPassSheet — pass de temporada con XP, niveles y recompensas semanales.
 */
import { useMemo } from 'react'
import { Lock, Check, Gift } from 'lucide-react'
import BottomSheet from '../../components/ui/BottomSheet'

interface Reward {
  level: number
  title: string
  icon: string
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
}

const REWARDS: Reward[] = [
  { level: 1,  title: 'Skin neon verde',     icon: '🎨', rarity: 'common' },
  { level: 3,  title: '500 créditos',         icon: '🪙', rarity: 'common' },
  { level: 5,  title: 'Marco animado',        icon: '🖼️', rarity: 'rare' },
  { level: 7,  title: 'Emoji pack exclusivo', icon: '💬', rarity: 'rare' },
  { level: 10, title: 'Avatar dorado',        icon: '👑', rarity: 'epic' },
  { level: 12, title: '2000 créditos',        icon: '💰', rarity: 'epic' },
  { level: 15, title: 'Tarjeta FIFA holográfica', icon: '✨', rarity: 'legendary' },
  { level: 20, title: 'Pass pro · Temp 2027', icon: '🎟️', rarity: 'legendary' },
]

const RARITY_COLOR: Record<Reward['rarity'], string> = {
  common: '#94A3B8', rare: '#00D4FF', epic: '#B347FF', legendary: '#FFB800',
}

interface Props {
  open: boolean
  onClose: () => void
  xp?: number
  xpPerLevel?: number
}

export default function SeasonPassSheet({ open, onClose, xp = 680, xpPerLevel = 100 }: Props) {
  const level = Math.floor(xp / xpPerLevel)
  const xpInLevel = xp % xpPerLevel
  const progress = xpInLevel / xpPerLevel
  const weeks = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])

  return (
    <BottomSheet open={open} onClose={onClose} title="Season Pass · T2026" height="92%" accent="#B347FF">
      {/* Header nivel */}
      <div style={{
        padding: '14px 16px', borderRadius: 14, marginBottom: 16,
        background: 'linear-gradient(135deg, rgba(179,71,255,0.18), rgba(0,212,255,0.10))',
        border: '1px solid rgba(179,71,255,0.45)',
        boxShadow: '0 0 20px rgba(179,71,255,0.2)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(250,245,235,0.5)' }}>
              Nivel actual
            </div>
            <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 30, color: '#FAF5EB' }}>
              {level}
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 16, color: '#B347FF' }}>
              {xp.toLocaleString()} XP
            </div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.55)' }}>
              {xpInLevel} / {xpPerLevel} al siguiente
            </div>
          </div>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
          <div style={{
            width: `${progress * 100}%`, height: '100%',
            background: 'linear-gradient(90deg, #B347FF, #00D4FF)',
            boxShadow: '0 0 10px #B347FF88',
            transition: 'width 500ms ease-out',
          }} />
        </div>
      </div>

      {/* Recompensas */}
      <div style={{
        fontFamily: 'Space Grotesk', fontSize: 11, textTransform: 'uppercase',
        letterSpacing: '0.1em', color: 'rgba(250,245,235,0.5)', marginBottom: 10,
      }}>
        Recompensas
      </div>
      <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 8 }} className="screen-scroll">
        {REWARDS.map(r => {
          const unlocked = level >= r.level
          const c = RARITY_COLOR[r.rarity]
          return (
            <div key={r.level} style={{
              flexShrink: 0, width: 120,
              padding: 12, borderRadius: 14,
              background: unlocked ? `${c}18` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${unlocked ? c + '77' : 'rgba(255,220,180,0.07)'}`,
              opacity: unlocked ? 1 : 0.7,
              boxShadow: unlocked ? `0 0 14px ${c}33` : 'none',
              textAlign: 'center',
              position: 'relative',
            }}>
              <div style={{
                fontFamily: 'Archivo', fontWeight: 900, fontSize: 10,
                color: c, marginBottom: 6, letterSpacing: '0.1em',
              }}>
                NVL {r.level}
              </div>
              <div style={{ fontSize: 30, marginBottom: 6, filter: unlocked ? 'none' : 'grayscale(1) opacity(0.5)' }}>
                {r.icon}
              </div>
              <div style={{
                fontFamily: 'Space Grotesk', fontSize: 11, fontWeight: 600,
                color: '#FAF5EB', lineHeight: 1.25,
              }}>
                {r.title}
              </div>
              <div style={{
                position: 'absolute', top: 8, right: 8,
                width: 22, height: 22, borderRadius: '50%',
                background: unlocked ? `${c}33` : 'rgba(0,0,0,0.25)',
                border: `1px solid ${unlocked ? c : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {unlocked ? <Check size={12} color={c} /> : <Lock size={11} color="rgba(255,255,255,0.4)" />}
              </div>
            </div>
          )
        })}
      </div>

      {/* Calendario semanal */}
      <div style={{ marginTop: 20 }}>
        <div style={{
          fontFamily: 'Space Grotesk', fontSize: 11, textTransform: 'uppercase',
          letterSpacing: '0.1em', color: 'rgba(250,245,235,0.5)', marginBottom: 10,
        }}>
          Calendario · 12 semanas
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 6 }}>
          {weeks.map(w => {
            const done = w <= Math.min(12, Math.floor(level / 2))
            return (
              <div key={w} style={{
                padding: '10px 0', borderRadius: 10, textAlign: 'center',
                background: done
                  ? 'linear-gradient(135deg, rgba(179,71,255,0.24), rgba(0,212,255,0.12))'
                  : 'rgba(255,255,255,0.03)',
                border: `1px solid ${done ? 'rgba(179,71,255,0.55)' : 'rgba(255,220,180,0.07)'}`,
              }}>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 9, color: 'rgba(250,245,235,0.5)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                  Sem
                </div>
                <div style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 15, color: done ? '#B347FF' : '#FAF5EB' }}>
                  {w}
                </div>
                {done && <Gift size={10} color="#B347FF" />}
              </div>
            )
          })}
        </div>
      </div>
    </BottomSheet>
  )
}
