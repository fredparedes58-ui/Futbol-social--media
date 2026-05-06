/**
 * DuelsSheet — reta a un amigo a un duelo de stats 1v1 (determinístico por seed).
 */
import { useMemo, useState } from 'react'
import { Swords, Trophy } from 'lucide-react'
import BottomSheet from '../../components/ui/BottomSheet'
import { mulberry32, seedFromString, type PlayerStats, deriveMetrics } from '../../ai/services/deterministic'

interface Props { open: boolean; onClose: () => void; me?: string }

const FRIENDS = [
  { name: 'Carlos Méndez',  badge: 'CM', color: '#FFB800' },
  { name: 'Martín Solís',   badge: 'MS', color: '#00D4FF' },
  { name: 'Diego Fuentes',  badge: 'DF', color: '#B347FF' },
  { name: 'Rafa Ortiz',     badge: 'RO', color: '#CCFF00' },
  { name: 'Pablo Lanza',    badge: 'PL', color: '#FF5B3A' },
]

const MY_STATS: PlayerStats = {
  matches: 42, goals: 32, assists: 15, mvps: 5, wins: 28, draws: 8, losses: 6,
}

function generateStats(seed: number): PlayerStats {
  const rng = mulberry32(seed)
  const matches = 20 + Math.floor(rng() * 30)
  const goals = Math.floor(rng() * matches * 0.9)
  const assists = Math.floor(rng() * matches * 0.5)
  const mvps = Math.floor(rng() * Math.min(8, matches * 0.3))
  const wins = Math.floor(rng() * matches * 0.75)
  const draws = Math.floor(rng() * (matches - wins) * 0.5)
  const losses = Math.max(0, matches - wins - draws)
  return { matches, goals, assists, mvps, wins, draws, losses }
}

function scoreOf(s: PlayerStats) {
  const m = deriveMetrics(s)
  return +(m.goalsPerMatch * 40 + m.assistsPerMatch * 25 + m.winRate * 0.5 + m.mvpRate * 1.2).toFixed(1)
}

export default function DuelsSheet({ open, onClose, me = 'Alex Rivera' }: Props) {
  const [rivalIdx, setRivalIdx] = useState<number | null>(null)
  const rival = rivalIdx !== null ? FRIENDS[rivalIdx] : null
  const rivalStats = useMemo(
    () => rival ? generateStats(seedFromString(`duel-${rival.name}`)) : null,
    [rival],
  )
  const myScore = scoreOf(MY_STATS)
  const rivalScore = rivalStats ? scoreOf(rivalStats) : 0
  const iWin = rival && myScore >= rivalScore

  return (
    <BottomSheet open={open} onClose={onClose} title="Duelos 1v1" height="88%" accent="#FF5B3A">
      {!rival ? (
        <>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 12, color: 'rgba(250,245,235,0.65)', marginBottom: 14 }}>
            Elegí un rival y peleá por los puntos de la semana.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FRIENDS.map((f, i) => (
              <button
                key={f.name}
                onClick={() => setRivalIdx(i)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '12px 14px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,220,180,0.1)',
                  cursor: 'pointer', textAlign: 'left',
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: `${f.color}33`, color: f.color,
                  border: `2px solid ${f.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Archivo', fontWeight: 800, fontSize: 13,
                }}>
                  {f.badge}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: 14, color: '#FAF5EB' }}>
                    {f.name}
                  </div>
                  <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.55)' }}>
                    Retar a duelo
                  </div>
                </div>
                <Swords size={18} color="#FF5B3A" />
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Resultado */}
          <div style={{
            padding: 16, borderRadius: 14, marginBottom: 16,
            background: iWin
              ? 'linear-gradient(135deg, rgba(204,255,0,0.18), rgba(0,212,255,0.08))'
              : 'linear-gradient(135deg, rgba(255,91,58,0.18), rgba(179,71,255,0.08))',
            border: `1px solid ${iWin ? 'rgba(204,255,0,0.5)' : 'rgba(255,91,58,0.5)'}`,
            textAlign: 'center',
          }}>
            <Trophy size={32} color={iWin ? '#CCFF00' : '#FF5B3A'} style={{ marginBottom: 6, filter: `drop-shadow(0 0 10px ${iWin ? '#CCFF00' : '#FF5B3A'})` }} />
            <div style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 22, color: '#FAF5EB' }}>
              {iWin ? '¡GANASTE!' : 'Derrota — próxima revancha'}
            </div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 12, color: 'rgba(250,245,235,0.65)', marginTop: 4 }}>
              Puntaje {myScore} vs {rivalScore}
            </div>
          </div>

          {/* Tabla comparativa */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 60px 1fr',
            gap: 8, alignItems: 'center',
          }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 14, color: '#CCFF00' }}>{me}</div>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.5)' }}>Vos</div>
            </div>
            <div />
            <div>
              <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 14, color: rival.color }}>{rival.name}</div>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.5)' }}>Rival</div>
            </div>

            {(['goals', 'assists', 'mvps', 'wins'] as (keyof PlayerStats)[]).map(k => {
              const mine = MY_STATS[k]
              const theirs = rivalStats![k]
              const win = mine > theirs
              return (
                <div key={k} style={{ display: 'contents' }}>
                  <div style={{
                    padding: '10px 12px', borderRadius: 10, textAlign: 'right',
                    background: win ? 'rgba(204,255,0,0.10)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${win ? 'rgba(204,255,0,0.3)' : 'rgba(255,220,180,0.07)'}`,
                    fontFamily: 'Archivo', fontWeight: 900, fontSize: 18,
                    color: win ? '#CCFF00' : 'rgba(250,245,235,0.7)',
                  }}>
                    {mine}
                  </div>
                  <div style={{
                    fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 700,
                    color: 'rgba(250,245,235,0.5)', textTransform: 'uppercase', textAlign: 'center',
                  }}>
                    {k}
                  </div>
                  <div style={{
                    padding: '10px 12px', borderRadius: 10,
                    background: !win ? `${rival.color}1a` : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${!win ? rival.color + '55' : 'rgba(255,220,180,0.07)'}`,
                    fontFamily: 'Archivo', fontWeight: 900, fontSize: 18,
                    color: !win ? rival.color : 'rgba(250,245,235,0.7)',
                  }}>
                    {theirs}
                  </div>
                </div>
              )
            })}
          </div>

          <button
            onClick={() => setRivalIdx(null)}
            style={{
              marginTop: 20, width: '100%',
              padding: '12px 14px', borderRadius: 12,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,220,180,0.15)',
              color: '#FAF5EB',
              fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Retar a otro
          </button>
        </>
      )}
    </BottomSheet>
  )
}
