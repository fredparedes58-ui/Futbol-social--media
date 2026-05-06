import { useState } from 'react'
import { Trophy, Target, Calendar, MapPin, TrendingUp, Award, Flame } from 'lucide-react'
import BottomNav from '../components/ui/BottomNav'
import GlassCard from '../components/ui/GlassCard'
import BottomSheet from '../components/ui/BottomSheet'
import { Skeleton } from '../components/ui/Skeleton'
import { useSimulatedLoad } from '../hooks/useSimulatedLoad'
import LeaderboardSheet from '../features/leaderboard/LeaderboardSheet'

interface Standing { pos: number; team: string; pts: number; pj: number; gf: number; gc: number }
interface Scorer   { player: string; team: string; goals: number }
interface Fixture  { home: string; away: string; date: string; venue: string }

const STANDINGS: Standing[] = [
  { pos: 1, team: 'Los Pumas FC',    pts: 42, pj: 16, gf: 38, gc: 12 },
  { pos: 2, team: 'Águilas Doradas', pts: 38, pj: 16, gf: 32, gc: 15 },
  { pos: 3, team: 'Rayo Urbano',     pts: 34, pj: 16, gf: 28, gc: 18 },
  { pos: 4, team: 'Tigres Verdes',   pts: 30, pj: 16, gf: 26, gc: 22 },
  { pos: 5, team: 'Phantom FC',      pts: 24, pj: 16, gf: 20, gc: 24 },
  { pos: 6, team: 'Cometa SC',       pts: 18, pj: 16, gf: 14, gc: 28 },
]

const SCORERS: Scorer[] = [
  { player: 'Carlos Méndez',  team: 'Los Pumas FC',    goals: 18 },
  { player: 'Alex Rivera',    team: 'Águilas Doradas', goals: 14 },
  { player: 'Diego Santos',   team: 'Rayo Urbano',     goals: 12 },
  { player: 'Luis Garrido',   team: 'Tigres Verdes',   goals: 10 },
]

const FIXTURES: Fixture[] = [
  { home: 'Los Pumas FC',   away: 'Rayo Urbano',     date: 'Dom · 10:00', venue: 'Cancha A' },
  { home: 'Águilas Doradas', away: 'Tigres Verdes',  date: 'Dom · 12:00', venue: 'Cancha B' },
  { home: 'Phantom FC',     away: 'Cometa SC',        date: 'Sáb · 16:00', venue: 'Cancha C' },
]

type Tab = 'tabla' | 'goleadores' | 'partidos'
type Drawer =
  | { kind: 'standing'; data: Standing }
  | { kind: 'scorer'; data: Scorer; rank: number }
  | { kind: 'fixture'; data: Fixture }
  | null

export default function LeaguePage() {
  const loading = useSimulatedLoad(700)
  const [tab, setTab] = useState<Tab>('tabla')
  const [drawer, setDrawer] = useState<Drawer>(null)
  const [lbOpen, setLbOpen] = useState(false)

  const drawerTitle =
    drawer?.kind === 'standing' ? drawer.data.team :
    drawer?.kind === 'scorer'   ? drawer.data.player :
    drawer?.kind === 'fixture'  ? 'Detalle del partido' : undefined

  const drawerAccent =
    drawer?.kind === 'standing' ? '#CCFF00' :
    drawer?.kind === 'scorer'   ? '#FFB800' :
    drawer?.kind === 'fixture'  ? '#FF5B3A' : '#CCFF00'

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-deep, #0F0D0A)', overflow: 'hidden' }}>
      <div
        className="screen-scroll"
        style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 60, paddingBottom: 90 }}
      >
        {/* Header */}
        <div style={{ padding: '0 20px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #CCFF00, #FFB800)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0F0D0A', boxShadow: '0 0 20px rgba(204, 255, 0, 0.35)',
            }}
          >
            <Trophy size={22} />
          </div>
          <div>
            <div
              style={{
                fontFamily: 'Archivo, sans-serif', fontWeight: 800,
                fontSize: 24, color: '#FAF5EB', letterSpacing: '-0.02em',
              }}
            >
              Liga Regional
            </div>
            <div
              style={{
                fontFamily: 'Space Grotesk, sans-serif',
                fontSize: 12, color: 'rgba(250, 245, 235, 0.6)',
              }}
            >
              Temporada 2026 · Jornada 16
            </div>
          </div>
          <button
            onClick={() => setLbOpen(true)}
            style={{
              marginLeft: 'auto',
              padding: '10px 14px', borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(255,184,0,0.2), rgba(204,255,0,0.12))',
              border: '1px solid rgba(255,184,0,0.5)',
              color: '#FFB800',
              display: 'flex', alignItems: 'center', gap: 6,
              cursor: 'pointer',
              fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12,
              boxShadow: '0 0 14px rgba(255,184,0,0.25)',
            }}
          >
            <Award size={14} /> Ranking
          </button>
        </div>

        {/* Tabs */}
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 8 }}>
          {([
            ['tabla', 'Tabla'],
            ['goleadores', 'Goleadores'],
            ['partidos', 'Partidos'],
          ] as [Tab, string][]).map(([id, label]) => {
            const active = tab === id
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  flex: 1, padding: '10px 0', borderRadius: 10,
                  background: active ? 'rgba(204, 255, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${active ? '#CCFF00' : 'rgba(255, 220, 180, 0.1)'}`,
                  color: active ? '#CCFF00' : 'rgba(250, 245, 235, 0.6)',
                  fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                  fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em',
                  cursor: 'pointer',
                  boxShadow: active ? '0 0 12px rgba(204, 255, 0, 0.2)' : 'none',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* Content */}
        <div style={{ padding: '0 20px' }}>
          {loading && (
            <GlassCard padding={0}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    display: 'grid', gridTemplateColumns: '28px 1fr 48px 48px',
                    gap: 10, alignItems: 'center', padding: '14px 14px',
                    borderBottom: i < 5 ? '1px solid rgba(255, 220, 180, 0.05)' : 'none',
                  }}
                >
                  <Skeleton width={24} height={24} radius={6} />
                  <Skeleton width="70%" height={12} />
                  <Skeleton width={36} height={10} />
                  <Skeleton width={24} height={14} style={{ marginLeft: 'auto' }} />
                </div>
              ))}
            </GlassCard>
          )}
          {!loading && tab === 'tabla' && (
            <GlassCard padding={0}>
              {STANDINGS.map((s, i) => (
                <div
                  key={i}
                  onClick={() => setDrawer({ kind: 'standing', data: s })}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '28px 1fr 48px 48px',
                    gap: 10, alignItems: 'center',
                    padding: '12px 14px',
                    borderBottom: i < STANDINGS.length - 1 ? '1px solid rgba(255, 220, 180, 0.05)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 24, height: 24, borderRadius: 6,
                      background: s.pos <= 3 ? '#CCFF00' : 'rgba(255, 255, 255, 0.06)',
                      color: s.pos <= 3 ? '#0F0D0A' : 'rgba(250, 245, 235, 0.7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 11,
                    }}
                  >
                    {s.pos}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif', fontWeight: 600,
                      fontSize: 13, color: '#FAF5EB',
                    }}
                  >
                    {s.team}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 11, color: 'rgba(250, 245, 235, 0.5)', textAlign: 'center',
                    }}
                  >
                    {s.gf}:{s.gc}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Archivo, sans-serif', fontWeight: 800,
                      fontSize: 14, color: '#CCFF00', textAlign: 'right',
                    }}
                  >
                    {s.pts}
                  </div>
                </div>
              ))}
            </GlassCard>
          )}

          {!loading && tab === 'goleadores' && (
            <GlassCard padding={0}>
              {SCORERS.map((s, i) => (
                <div
                  key={i}
                  onClick={() => setDrawer({ kind: 'scorer', data: s, rank: i + 1 })}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    borderBottom: i < SCORERS.length - 1 ? '1px solid rgba(255, 220, 180, 0.05)' : 'none',
                    cursor: 'pointer',
                  }}
                >
                  <div
                    style={{
                      width: 28, height: 28, borderRadius: '50%',
                      background: i === 0 ? '#CCFF00' : 'rgba(255, 255, 255, 0.06)',
                      color: i === 0 ? '#0F0D0A' : 'rgba(250, 245, 235, 0.7)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12,
                    }}
                  >
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                        fontSize: 13, color: '#FAF5EB',
                      }}
                    >
                      {s.player}
                    </div>
                    <div
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: 11, color: 'rgba(250, 245, 235, 0.5)',
                      }}
                    >
                      {s.team}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#CCFF00' }}>
                    <Target size={14} />
                    <span style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 16 }}>
                      {s.goals}
                    </span>
                  </div>
                </div>
              ))}
            </GlassCard>
          )}

          {!loading && tab === 'partidos' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {FIXTURES.map((f, i) => (
                <div key={i} onClick={() => setDrawer({ kind: 'fixture', data: f })} style={{ cursor: 'pointer' }}>
                  <GlassCard padding={14}>
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        marginBottom: 10, color: '#FFB800',
                      }}
                    >
                      <Calendar size={13} />
                      <span
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                          fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em',
                        }}
                      >
                        {f.date}
                      </span>
                      <span
                        style={{
                          marginLeft: 'auto',
                          fontFamily: 'Space Grotesk, sans-serif',
                          fontSize: 11, color: 'rgba(250, 245, 235, 0.5)',
                        }}
                      >
                        {f.venue}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
                      <div
                        style={{
                          flex: 1,
                          fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 16,
                          color: '#FAF5EB', textAlign: 'right',
                        }}
                      >
                        {f.home}
                      </div>
                      <div
                        style={{
                          fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                          fontSize: 12, color: 'rgba(250, 245, 235, 0.5)',
                        }}
                      >
                        VS
                      </div>
                      <div
                        style={{
                          flex: 1,
                          fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 16,
                          color: '#FAF5EB',
                        }}
                      >
                        {f.away}
                      </div>
                    </div>
                  </GlassCard>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomSheet
        open={!!drawer}
        onClose={() => setDrawer(null)}
        title={drawerTitle}
        accent={drawerAccent}
        height="60%"
      >
        {drawer?.kind === 'standing' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 18 }}>
              {[
                ['POS', `#${drawer.data.pos}`, '#CCFF00'],
                ['PTS', drawer.data.pts, '#CCFF00'],
                ['PJ',  drawer.data.pj, '#FAF5EB'],
                ['DIF', drawer.data.gf - drawer.data.gc, drawer.data.gf >= drawer.data.gc ? '#CCFF00' : '#FF5B3A'],
              ].map(([l, v, c]) => (
                <div
                  key={l as string}
                  style={{
                    padding: '12px 6px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 10, textAlign: 'center',
                    border: '1px solid rgba(255,220,180,0.06)',
                  }}
                >
                  <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 20, color: c as string }}>{v}</div>
                  <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.5)', letterSpacing: '0.08em' }}>{l}</div>
                </div>
              ))}
            </div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: 'rgba(250,245,235,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Rendimiento
            </div>
            {[
              { label: 'Goles a favor', value: drawer.data.gf, color: '#CCFF00', icon: TrendingUp },
              { label: 'Goles en contra', value: drawer.data.gc, color: '#FF5B3A', icon: Flame },
              { label: 'Promedio por partido', value: (drawer.data.pts / drawer.data.pj).toFixed(2), color: '#FFB800', icon: Award },
            ].map((r, i) => {
              const I = r.icon
              return (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 12,
                  padding: '10px 12px', marginBottom: 8,
                  background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                  border: '1px solid rgba(255,220,180,0.05)',
                }}>
                  <div style={{
                    width: 30, height: 30, borderRadius: 8,
                    background: `${r.color}22`, color: r.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <I size={14} />
                  </div>
                  <div style={{ flex: 1, fontFamily: 'Space Grotesk', fontSize: 13, color: '#FAF5EB' }}>{r.label}</div>
                  <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 15, color: r.color }}>{r.value}</div>
                </div>
              )
            })}
          </div>
        )}

        {drawer?.kind === 'scorer' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '4px 0 18px', borderBottom: '1px solid rgba(255,220,180,0.06)' }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: 'linear-gradient(135deg, #FFB800, #FF5B3A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Archivo', fontWeight: 800, fontSize: 22, color: '#0F0D0A',
                boxShadow: '0 0 20px rgba(255,184,0,0.4)',
              }}>
                #{drawer.rank}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 20, color: '#FAF5EB' }}>{drawer.data.player}</div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 12, color: 'rgba(250,245,235,0.6)' }}>{drawer.data.team}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 28, color: '#CCFF00', textShadow: '0 0 14px rgba(204,255,0,0.5)' }}>{drawer.data.goals}</div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.5)', letterSpacing: '0.08em' }}>GOLES</div>
              </div>
            </div>
            <div style={{ padding: '16px 0' }}>
              {[
                { label: 'Prom. goles/partido', value: (drawer.data.goals / 16).toFixed(2) },
                { label: 'Minutos jugados', value: `${1200 + drawer.rank * 40}′` },
                { label: 'Tarjetas amarillas', value: 3 + drawer.rank },
                { label: 'Hat-tricks', value: Math.max(0, 3 - drawer.rank) },
              ].map((r, i) => (
                <div key={i} style={{
                  display: 'flex', justifyContent: 'space-between',
                  padding: '10px 12px', marginBottom: 6,
                  background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                }}>
                  <span style={{ fontFamily: 'Space Grotesk', fontSize: 13, color: 'rgba(250,245,235,0.7)' }}>{r.label}</span>
                  <span style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 14, color: '#FAF5EB' }}>{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {drawer?.kind === 'fixture' && (
          <div>
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 18, padding: '8px 0 20px',
              borderBottom: '1px solid rgba(255,220,180,0.06)',
            }}>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14, margin: '0 auto 8px',
                  background: 'rgba(204,255,0,0.15)', color: '#CCFF00',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Archivo', fontWeight: 800, fontSize: 18,
                  border: '2px solid rgba(204,255,0,0.4)',
                }}>
                  {drawer.data.home.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: '#FAF5EB' }}>
                  {drawer.data.home}
                </div>
              </div>
              <div style={{
                fontFamily: 'Archivo', fontWeight: 800, fontSize: 24,
                color: '#FF5B3A', letterSpacing: '-0.02em',
              }}>
                VS
              </div>
              <div style={{ flex: 1, textAlign: 'center' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14, margin: '0 auto 8px',
                  background: 'rgba(255,184,0,0.15)', color: '#FFB800',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Archivo', fontWeight: 800, fontSize: 18,
                  border: '2px solid rgba(255,184,0,0.4)',
                }}>
                  {drawer.data.away.split(' ').map(w => w[0]).slice(0, 2).join('')}
                </div>
                <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: '#FAF5EB' }}>
                  {drawer.data.away}
                </div>
              </div>
            </div>
            <div style={{ padding: '16px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10,
              }}>
                <Calendar size={16} color="#FFB800" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.5)' }}>Fecha y hora</div>
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: '#FAF5EB' }}>{drawer.data.date}</div>
                </div>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10,
              }}>
                <MapPin size={16} color="#FF5B3A" />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.5)' }}>Cancha</div>
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: '#FAF5EB' }}>{drawer.data.venue}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </BottomSheet>

      <LeaderboardSheet open={lbOpen} onClose={() => setLbOpen(false)} />

      <BottomNav />
    </div>
  )
}
