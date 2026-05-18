/**
 * Página de Liga — datos oficiales FFCV con mock mientras se integra Supabase.
 * Muestra competiciones, tabla (W/D/L), fixture con estados live/postponed,
 * suscripción por equipo y badge de última sincronización.
 */
import { useState } from 'react'
import {
  Trophy, Target, Calendar, MapPin, TrendingUp, Award, Flame,
  ChevronDown, Bell, BellOff, AlertTriangle, Clock, CheckCircle2,
  Wifi, RefreshCw,
} from 'lucide-react'
import BottomNav from '../components/ui/BottomNav'
import GlassCard from '../components/ui/GlassCard'
import BottomSheet from '../components/ui/BottomSheet'
import { Skeleton } from '../components/ui/Skeleton'
import { useSimulatedLoad } from '../hooks/useSimulatedLoad'
import LeaderboardSheet from '../features/leaderboard/LeaderboardSheet'
import TeamSubscribeSheet from '../components/league/TeamSubscribeSheet'
import {
  COMPETITIONS,
  SCORERS_FFCV,
  MOCK_SUBSCRIPTIONS,
  getTeam,
  getMatchesByCompetition,
  getClassificationsByCompetition,
  formatSyncAge,
  formatMatchDate,
  type Competition,
  type TeamExternal,
  type Classification,
  type MatchExternal,
  type TeamSubscription,
} from '../lib/mock-ffcv'
import { useAuth } from '../context/AuthContext'

type Tab = 'tabla' | 'fixture' | 'goleadores'

type Drawer =
  | { kind: 'standing'; data: Classification }
  | { kind: 'fixture'; data: MatchExternal }
  | null

const STATUS_CONFIG = {
  live: {
    label: 'EN JUEGO',
    color: '#FF5B3A',
    bg: 'rgba(255, 91, 58, 0.15)',
    border: 'rgba(255, 91, 58, 0.4)',
  },
  finished: {
    label: 'FINAL',
    color: 'rgba(250, 245, 235, 0.5)',
    bg: 'rgba(255, 255, 255, 0.04)',
    border: 'rgba(255, 220, 180, 0.08)',
  },
  scheduled: {
    label: '',
    color: '#CCFF00',
    bg: 'rgba(204, 255, 0, 0.04)',
    border: 'rgba(255, 220, 180, 0.07)',
  },
  postponed: {
    label: 'APLAZADO',
    color: '#FFB800',
    bg: 'rgba(255, 184, 0, 0.12)',
    border: 'rgba(255, 184, 0, 0.35)',
  },
  cancelled: {
    label: 'CANCELADO',
    color: '#FF5B3A',
    bg: 'rgba(255, 91, 58, 0.10)',
    border: 'rgba(255, 91, 58, 0.30)',
  },
}

export default function LeaguePage() {
  const loading = useSimulatedLoad(700)
  const { setToast } = useAuth()

  const [selectedComp, setSelectedComp] = useState<Competition>(COMPETITIONS[0])
  const [compPickerOpen, setCompPickerOpen] = useState(false)
  const [tab, setTab] = useState<Tab>('tabla')
  const [drawer, setDrawer] = useState<Drawer>(null)
  const [lbOpen, setLbOpen] = useState(false)
  const [subscribeTeam, setSubscribeTeam] = useState<TeamExternal | null>(null)
  const [subs, setSubs] = useState<TeamSubscription[]>(MOCK_SUBSCRIPTIONS)

  const standings = getClassificationsByCompetition(selectedComp.id)
  const matches = getMatchesByCompetition(selectedComp.id)
  const syncAge = formatSyncAge(selectedComp.last_synced_at)

  const drawerAccent =
    drawer?.kind === 'standing' ? '#CCFF00' :
    drawer?.kind === 'fixture'  ? STATUS_CONFIG[drawer.data.status].color : '#CCFF00'

  function handleSubscribeSave(sub: TeamSubscription) {
    setSubs(prev => {
      const idx = prev.findIndex(s => s.team_external_id === sub.team_external_id)
      if (idx >= 0) {
        const next = [...prev]; next[idx] = sub; return next
      }
      return [...prev, sub]
    })
    setSubscribeTeam(null)
    setToast(`Siguiendo a ${subscribeTeam?.club_name}`)
  }

  // Agrupamos fixture por jornada
  const matchdayGroups: Record<number, MatchExternal[]> = {}
  for (const m of matches) {
    if (!matchdayGroups[m.matchday]) matchdayGroups[m.matchday] = []
    matchdayGroups[m.matchday].push(m)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-deep, #0F0D0A)', overflow: 'hidden' }}>
      <div
        className="screen-scroll"
        style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 60, paddingBottom: 90 }}
      >
        {/* ── Header ── */}
        <div style={{ padding: '0 20px 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 44, height: 44, borderRadius: 12,
              background: 'linear-gradient(135deg, #CCFF00, #FFB800)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#0F0D0A', boxShadow: '0 0 20px rgba(204, 255, 0, 0.35)',
              flexShrink: 0,
            }}
          >
            <Trophy size={22} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'Archivo, sans-serif', fontWeight: 800,
              fontSize: 22, color: '#FAF5EB', letterSpacing: '-0.02em',
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {selectedComp.name}
            </div>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 11, color: 'rgba(250, 245, 235, 0.55)',
            }}>
              Temporada {selectedComp.season} · J{selectedComp.matchday_current}
            </div>
          </div>
          <button
            onClick={() => setLbOpen(true)}
            style={{
              padding: '8px 12px', borderRadius: 10,
              background: 'rgba(255, 184, 0, 0.12)',
              border: '1px solid rgba(255, 184, 0, 0.4)',
              color: '#FFB800',
              display: 'flex', alignItems: 'center', gap: 5,
              cursor: 'pointer',
              fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
            }}
          >
            <Award size={13} /> Ranking
          </button>
        </div>

        {/* ── Competition picker + FFCV sync badge ── */}
        <div style={{ padding: '0 20px 14px', display: 'flex', gap: 8 }}>
          <button
            onClick={() => setCompPickerOpen(true)}
            style={{
              flex: 1, padding: '10px 14px', borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 220, 180, 0.12)',
              color: '#FAF5EB', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 8,
              fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 13,
              textAlign: 'left',
            }}
          >
            <Trophy size={14} color="#CCFF00" />
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {selectedComp.name}
            </span>
            <ChevronDown size={14} color="rgba(250,245,235,0.5)" />
          </button>

          {/* Sync badge */}
          <div style={{
            padding: '8px 10px', borderRadius: 12,
            background: 'rgba(0, 212, 255, 0.08)',
            border: '1px solid rgba(0, 212, 255, 0.25)',
            display: 'flex', alignItems: 'center', gap: 5,
            flexShrink: 0,
          }}>
            <Wifi size={12} color="#00D4FF" />
            <span style={{
              fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 10,
              color: '#00D4FF', letterSpacing: '0.04em',
              whiteSpace: 'nowrap',
            }}>
              {syncAge}
            </span>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8 }}>
          {([
            ['tabla', 'Tabla'],
            ['fixture', 'Fixture'],
            ['goleadores', 'Top Goles'],
          ] as [Tab, string][]).map(([id, label]) => {
            const active = tab === id
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                style={{
                  flex: 1, padding: '9px 0', borderRadius: 10,
                  background: active ? 'rgba(204, 255, 0, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  border: `1px solid ${active ? '#CCFF00' : 'rgba(255, 220, 180, 0.08)'}`,
                  color: active ? '#CCFF00' : 'rgba(250, 245, 235, 0.55)',
                  fontFamily: 'Space Grotesk', fontWeight: 700,
                  fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.05em',
                  cursor: 'pointer',
                  boxShadow: active ? '0 0 12px rgba(204, 255, 0, 0.15)' : 'none',
                }}
              >
                {label}
              </button>
            )
          })}
        </div>

        {/* ── Content ── */}
        <div style={{ padding: '0 20px' }}>

          {/* ─ Loading skeleton ─ */}
          {loading && (
            <GlassCard padding={0}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} style={{
                  display: 'grid', gridTemplateColumns: '28px 1fr 32px 32px 32px 38px',
                  gap: 8, alignItems: 'center', padding: '12px 14px',
                  borderBottom: i < 5 ? '1px solid rgba(255, 220, 180, 0.05)' : 'none',
                }}>
                  <Skeleton width={24} height={24} radius={6} />
                  <Skeleton width="65%" height={12} />
                  <Skeleton width={24} height={10} />
                  <Skeleton width={24} height={10} />
                  <Skeleton width={24} height={10} />
                  <Skeleton width={30} height={14} style={{ marginLeft: 'auto' }} />
                </div>
              ))}
            </GlassCard>
          )}

          {/* ─ TABLA ─ */}
          {!loading && tab === 'tabla' && (
            <>
              {/* Column headers */}
              <div style={{
                display: 'grid', gridTemplateColumns: '28px 1fr 28px 28px 28px 38px',
                gap: 8, padding: '4px 14px 8px',
              }}>
                {['', '', 'PJ', 'G', 'E', 'PTS'].map((h, i) => (
                  <div key={i} style={{
                    fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 9,
                    color: 'rgba(250, 245, 235, 0.35)', textAlign: i > 1 ? 'center' : 'left',
                    letterSpacing: '0.1em', textTransform: 'uppercase',
                  }}>
                    {h}
                  </div>
                ))}
              </div>

              <GlassCard padding={0}>
                {standings.map((s, i) => {
                  const team = getTeam(s.team_id)
                  const subscribed = subs.some(sub => sub.team_external_id === s.team_id)
                  const isPromotion = s.position <= 2
                  const isRelega = s.position >= standings.length - 1
                  return (
                    <div
                      key={i}
                      onClick={() => setDrawer({ kind: 'standing', data: s })}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: '28px 1fr 28px 28px 28px 38px',
                        gap: 8, alignItems: 'center',
                        padding: '11px 14px',
                        borderBottom: i < standings.length - 1 ? '1px solid rgba(255, 220, 180, 0.05)' : 'none',
                        cursor: 'pointer',
                        background: subscribed ? 'rgba(204, 255, 0, 0.03)' : 'transparent',
                        borderLeft: subscribed ? '2px solid rgba(204, 255, 0, 0.4)' : '2px solid transparent',
                        transition: 'background 0.15s',
                      }}
                    >
                      {/* Position */}
                      <div style={{
                        width: 24, height: 24, borderRadius: 6,
                        background: isPromotion ? '#CCFF00' : isRelega ? 'rgba(255, 91, 58, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                        color: isPromotion ? '#0F0D0A' : isRelega ? '#FF5B3A' : 'rgba(250, 245, 235, 0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Archivo', fontWeight: 800, fontSize: 11,
                        border: isRelega ? '1px solid rgba(255,91,58,0.3)' : 'none',
                      }}>
                        {s.position}
                      </div>

                      {/* Team */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                        {team && (
                          <div style={{
                            width: 20, height: 20, borderRadius: 5, flexShrink: 0,
                            background: `${team.color}22`,
                            border: `1.5px solid ${team.color}44`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontFamily: 'Archivo', fontWeight: 800, fontSize: 8,
                            color: team.color,
                          }}>
                            {team.initials}
                          </div>
                        )}
                        <div style={{
                          fontFamily: 'Space Grotesk', fontWeight: 600,
                          fontSize: 12, color: '#FAF5EB',
                          overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {team?.club_name ?? s.team_id}
                        </div>
                      </div>

                      {/* PJ */}
                      <div style={{
                        fontFamily: 'Space Grotesk', fontSize: 11,
                        color: 'rgba(250, 245, 235, 0.5)', textAlign: 'center',
                      }}>
                        {s.played}
                      </div>

                      {/* G */}
                      <div style={{
                        fontFamily: 'Space Grotesk', fontSize: 11,
                        color: '#CCFF00', textAlign: 'center',
                      }}>
                        {s.won}
                      </div>

                      {/* E */}
                      <div style={{
                        fontFamily: 'Space Grotesk', fontSize: 11,
                        color: 'rgba(250, 245, 235, 0.5)', textAlign: 'center',
                      }}>
                        {s.drawn}
                      </div>

                      {/* PTS */}
                      <div style={{
                        fontFamily: 'Archivo', fontWeight: 800,
                        fontSize: 14, color: '#CCFF00', textAlign: 'right',
                      }}>
                        {s.points}
                      </div>
                    </div>
                  )
                })}
              </GlassCard>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 14, padding: '12px 4px', flexWrap: 'wrap' }}>
                {[
                  { color: '#CCFF00', bg: '#CCFF00', label: 'Ascenso' },
                  { color: '#FF5B3A', bg: 'rgba(255,91,58,0.2)', label: 'Descenso' },
                ].map(l => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: 3,
                      background: l.bg,
                      border: `1px solid ${l.color}44`,
                    }} />
                    <span style={{
                      fontFamily: 'Space Grotesk', fontSize: 10,
                      color: 'rgba(250, 245, 235, 0.45)',
                    }}>
                      {l.label}
                    </span>
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: 3, background: 'rgba(204,255,0,0.08)', border: '1px solid rgba(204,255,0,0.3)' }} />
                  <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250, 245, 235, 0.45)' }}>
                    Equipo seguido
                  </span>
                </div>
              </div>
            </>
          )}

          {/* ─ FIXTURE ─ */}
          {!loading && tab === 'fixture' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {Object.entries(matchdayGroups).map(([jornada, jMatches]) => (
                <div key={jornada}>
                  {/* Matchday header */}
                  <div style={{
                    fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                    color: 'rgba(250, 245, 235, 0.45)', letterSpacing: '0.1em',
                    textTransform: 'uppercase', marginBottom: 8,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}>
                    <Calendar size={10} />
                    Jornada {jornada}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {jMatches.map((m) => {
                      const home = getTeam(m.home_team_id)
                      const away = getTeam(m.away_team_id)
                      const cfg = STATUS_CONFIG[m.status]
                      const hasRescheduled = !!m.previous_scheduled_at && m.previous_scheduled_at !== m.scheduled_at
                      const isLive = m.status === 'live'
                      const isFinished = m.status === 'finished'

                      return (
                        <div
                          key={m.id}
                          onClick={() => setDrawer({ kind: 'fixture', data: m })}
                          style={{
                            borderRadius: 14,
                            background: cfg.bg,
                            border: `1px solid ${cfg.border}`,
                            padding: '12px 14px',
                            cursor: 'pointer',
                            position: 'relative',
                            overflow: 'hidden',
                          }}
                        >
                          {/* Status bar */}
                          <div style={{
                            display: 'flex', alignItems: 'center', gap: 6,
                            marginBottom: 10,
                          }}>
                            {isLive && (
                              <div style={{
                                display: 'flex', alignItems: 'center', gap: 4,
                                padding: '2px 8px', borderRadius: 999,
                                background: 'rgba(255, 91, 58, 0.25)',
                                border: '1px solid rgba(255, 91, 58, 0.5)',
                              }}>
                                <span style={{
                                  width: 6, height: 6, borderRadius: '50%',
                                  background: '#FF5B3A',
                                  boxShadow: '0 0 6px #FF5B3A',
                                  display: 'inline-block',
                                  animation: 'pulse-glow 1.2s ease-in-out infinite',
                                }} />
                                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 9, color: '#FF5B3A', letterSpacing: '0.1em' }}>
                                  EN JUEGO
                                </span>
                              </div>
                            )}
                            {m.status === 'postponed' && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#FFB800' }}>
                                <AlertTriangle size={11} />
                                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 9, letterSpacing: '0.1em' }}>
                                  APLAZADO
                                </span>
                              </div>
                            )}
                            {hasRescheduled && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#FFB800' }}>
                                <Clock size={10} />
                                <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 9, letterSpacing: '0.08em' }}>
                                  HORA CAMBIADA
                                </span>
                              </div>
                            )}
                            <span style={{
                              fontFamily: 'Space Grotesk', fontSize: 10,
                              color: isFinished ? 'rgba(250,245,235,0.5)' : '#FAF5EB',
                              marginLeft: isLive || m.status === 'postponed' || hasRescheduled ? 0 : 0,
                            }}>
                              {m.status !== 'postponed' && formatMatchDate(m.scheduled_at)}
                            </span>
                            <span style={{
                              marginLeft: 'auto',
                              fontFamily: 'Space Grotesk', fontSize: 10,
                              color: 'rgba(250, 245, 235, 0.4)',
                              display: 'flex', alignItems: 'center', gap: 4,
                            }}>
                              <MapPin size={10} />
                              {m.venue.split(' ').slice(0, 2).join(' ')}
                            </span>
                          </div>

                          {/* Teams + score */}
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 10, alignItems: 'center' }}>
                            {/* Home */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{
                                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                                background: home ? `${home.color}22` : 'rgba(255,255,255,0.08)',
                                border: `1.5px solid ${home?.color ?? '#fff'}44`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'Archivo', fontWeight: 800, fontSize: 12,
                                color: home?.color ?? '#FAF5EB',
                              }}>
                                {home?.initials ?? 'H'}
                              </div>
                              <span style={{
                                fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 12,
                                color: '#FAF5EB',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>
                                {home?.club_name ?? 'Local'}
                              </span>
                            </div>

                            {/* Score */}
                            <div style={{
                              fontFamily: 'Archivo', fontWeight: 900,
                              fontSize: isLive || isFinished ? 22 : 13,
                              color: isLive ? '#FF5B3A' : isFinished ? '#FAF5EB' : 'rgba(250,245,235,0.4)',
                              letterSpacing: '-0.02em', textAlign: 'center',
                              textShadow: isLive ? '0 0 14px rgba(255,91,58,0.7)' : 'none',
                              minWidth: 52,
                            }}>
                              {m.home_score !== null && m.away_score !== null
                                ? `${m.home_score}–${m.away_score}`
                                : 'VS'
                              }
                            </div>

                            {/* Away */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                              <span style={{
                                fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 12,
                                color: '#FAF5EB', textAlign: 'right',
                                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                              }}>
                                {away?.club_name ?? 'Visitante'}
                              </span>
                              <div style={{
                                width: 34, height: 34, borderRadius: 9, flexShrink: 0,
                                background: away ? `${away.color}22` : 'rgba(255,255,255,0.08)',
                                border: `1.5px solid ${away?.color ?? '#fff'}44`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontFamily: 'Archivo', fontWeight: 800, fontSize: 12,
                                color: away?.color ?? '#FAF5EB',
                              }}>
                                {away?.initials ?? 'A'}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ─ GOLEADORES ─ */}
          {!loading && tab === 'goleadores' && (
            <GlassCard padding={0}>
              {SCORERS_FFCV.filter(s => s.competition_id === selectedComp.id).map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    borderBottom: i < SCORERS_FFCV.length - 1 ? '1px solid rgba(255, 220, 180, 0.05)' : 'none',
                  }}
                >
                  <div style={{
                    width: 30, height: 30, borderRadius: '50%',
                    background: i === 0 ? '#CCFF00' : 'rgba(255, 255, 255, 0.06)',
                    color: i === 0 ? '#0F0D0A' : 'rgba(250, 245, 235, 0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Archivo', fontWeight: 800, fontSize: 12,
                  }}>
                    {i + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{
                      fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: '#FAF5EB',
                    }}>
                      {s.club_name}
                    </div>
                    <div style={{
                      fontFamily: 'Space Grotesk', fontSize: 10,
                      color: 'rgba(250, 245, 235, 0.45)', letterSpacing: '0.04em',
                    }}>
                      Máximo goleador del equipo
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#CCFF00' }}>
                    <Target size={14} />
                    <span style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 17 }}>
                      {s.goals}
                    </span>
                  </div>
                </div>
              ))}
              {SCORERS_FFCV.filter(s => s.competition_id === selectedComp.id).length === 0 && (
                <div style={{ padding: '32px 20px', textAlign: 'center', color: 'rgba(250,245,235,0.4)', fontFamily: 'Space Grotesk', fontSize: 13 }}>
                  Sin datos de goleadores para esta competición
                </div>
              )}
            </GlassCard>
          )}

          {/* ─ Subscribe strip (visible en fixture) ─ */}
          {!loading && tab === 'fixture' && (
            <div style={{ marginTop: 20, padding: '0 0 4px' }}>
              <div style={{
                fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                color: 'rgba(250, 245, 235, 0.45)', letterSpacing: '0.1em',
                textTransform: 'uppercase', marginBottom: 10,
              }}>
                Seguir equipos
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {standings.slice(0, 4).map(s => {
                  const team = getTeam(s.team_id)
                  if (!team) return null
                  const subscribed = subs.some(sub => sub.team_external_id === team.id)
                  return (
                    <div
                      key={team.id}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '10px 12px', borderRadius: 12,
                        background: subscribed ? 'rgba(204,255,0,0.06)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${subscribed ? 'rgba(204,255,0,0.25)' : 'rgba(255,220,180,0.06)'}`,
                      }}
                    >
                      <div style={{
                        width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                        background: `${team.color}22`, border: `1.5px solid ${team.color}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Archivo', fontWeight: 800, fontSize: 11, color: team.color,
                      }}>
                        {team.initials}
                      </div>
                      <span style={{
                        flex: 1, fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 12,
                        color: '#FAF5EB',
                      }}>
                        {team.club_name}
                      </span>
                      <button
                        onClick={() => setSubscribeTeam(team)}
                        style={{
                          padding: '6px 12px', borderRadius: 8,
                          background: subscribed ? 'rgba(204,255,0,0.15)' : 'rgba(255,255,255,0.06)',
                          border: `1px solid ${subscribed ? 'rgba(204,255,0,0.4)' : 'rgba(255,220,180,0.12)'}`,
                          color: subscribed ? '#CCFF00' : 'rgba(250,245,235,0.6)',
                          fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center', gap: 5,
                        }}
                      >
                        {subscribed ? <><Bell size={11} /> Siguiendo</> : <><BellOff size={11} /> Seguir</>}
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Competition picker sheet ── */}
      <BottomSheet
        open={compPickerOpen}
        onClose={() => setCompPickerOpen(false)}
        title="Seleccionar competición"
        accent="#CCFF00"
        height="55%"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {COMPETITIONS.map(c => {
            const active = c.id === selectedComp.id
            return (
              <button
                key={c.id}
                onClick={() => { setSelectedComp(c); setCompPickerOpen(false) }}
                style={{
                  padding: '14px', borderRadius: 14,
                  background: active ? 'rgba(204, 255, 0, 0.12)' : 'rgba(255, 255, 255, 0.04)',
                  border: `1px solid ${active ? 'rgba(204, 255, 0, 0.45)' : 'rgba(255, 220, 180, 0.08)'}`,
                  color: '#FAF5EB', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 12, textAlign: 'left',
                }}
              >
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: active ? 'rgba(204, 255, 0, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: active ? '#CCFF00' : 'rgba(250, 245, 235, 0.5)',
                  flexShrink: 0,
                }}>
                  <Trophy size={16} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: 14, color: active ? '#CCFF00' : '#FAF5EB' }}>
                    {c.name}
                  </div>
                  <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.5)', marginTop: 2 }}>
                    {c.season} · J{c.matchday_current} · Sync {formatSyncAge(c.last_synced_at)}
                  </div>
                </div>
                {active && <CheckCircle2 size={16} color="#CCFF00" />}
              </button>
            )
          })}
        </div>
      </BottomSheet>

      {/* ── Standing drawer ── */}
      <BottomSheet
        open={drawer?.kind === 'standing'}
        onClose={() => setDrawer(null)}
        title={drawer?.kind === 'standing' ? getTeam(drawer.data.team_id)?.club_name : ''}
        accent={drawerAccent}
        height="60%"
      >
        {drawer?.kind === 'standing' && (() => {
          const s = drawer.data
          const team = getTeam(s.team_id)
          const subscribed = subs.some(sub => sub.team_external_id === s.team_id)
          return (
            <div>
              {/* Team header */}
              {team && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 18 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 12,
                    background: `${team.color}22`, border: `2px solid ${team.color}55`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Archivo', fontWeight: 800, fontSize: 18, color: team.color,
                    boxShadow: `0 0 16px ${team.color}33`,
                  }}>
                    {team.initials}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 18, color: '#FAF5EB' }}>
                      {team.club_name}
                    </div>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.5)', marginTop: 2 }}>
                      Datos oficiales FFCV
                    </div>
                  </div>
                  <button
                    onClick={() => setSubscribeTeam(team)}
                    style={{
                      padding: '8px 14px', borderRadius: 10,
                      background: subscribed ? 'rgba(204,255,0,0.15)' : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${subscribed ? 'rgba(204,255,0,0.4)' : 'rgba(255,220,180,0.12)'}`,
                      color: subscribed ? '#CCFF00' : 'rgba(250,245,235,0.6)',
                      fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 5,
                    }}
                  >
                    {subscribed ? <><Bell size={11} /> Siguiendo</> : <><BellOff size={11} /> Seguir</>}
                  </button>
                </div>
              )}

              {/* Stats grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 8, marginBottom: 16 }}>
                {[
                  ['POS', `#${s.position}`, '#CCFF00'],
                  ['PTS', s.points, '#CCFF00'],
                  ['GF', s.goals_for, '#FAF5EB'],
                  ['DIF', s.goals_for - s.goals_against, s.goals_for >= s.goals_against ? '#CCFF00' : '#FF5B3A'],
                ].map(([l, v, c]) => (
                  <div key={l as string} style={{
                    padding: '10px 6px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 10, textAlign: 'center',
                    border: '1px solid rgba(255,220,180,0.06)',
                  }}>
                    <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 18, color: c as string }}>{v}</div>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 9, color: 'rgba(250,245,235,0.5)', letterSpacing: '0.08em' }}>{l}</div>
                  </div>
                ))}
              </div>

              {/* W/D/L bar */}
              <div style={{
                fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                color: 'rgba(250,245,235,0.5)', textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: 8,
              }}>
                Rendimiento
              </div>
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}>
                {[
                  { label: `${s.won}G`, color: '#CCFF00', flex: s.won },
                  { label: `${s.drawn}E`, color: '#FFB800', flex: s.drawn },
                  { label: `${s.lost}P`, color: '#FF5B3A', flex: s.lost },
                ].map(r => (
                  <div
                    key={r.label}
                    style={{
                      flex: r.flex, height: 28, borderRadius: 8,
                      background: `${r.color}22`,
                      border: `1px solid ${r.color}44`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Archivo', fontWeight: 800, fontSize: 11, color: r.color,
                      minWidth: 36,
                    }}
                  >
                    {r.label}
                  </div>
                ))}
              </div>

              {[
                { label: 'Goles a favor', value: s.goals_for, color: '#CCFF00', icon: TrendingUp },
                { label: 'Goles en contra', value: s.goals_against, color: '#FF5B3A', icon: Flame },
                { label: 'Promedio pts/partido', value: (s.points / s.played).toFixed(2), color: '#FFB800', icon: Award },
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
          )
        })()}
      </BottomSheet>

      {/* ── Fixture detail drawer ── */}
      <BottomSheet
        open={drawer?.kind === 'fixture'}
        onClose={() => setDrawer(null)}
        title="Detalle del partido"
        accent={drawer?.kind === 'fixture' ? STATUS_CONFIG[drawer.data.status].color : '#CCFF00'}
        height="60%"
      >
        {drawer?.kind === 'fixture' && (() => {
          const m = drawer.data
          const home = getTeam(m.home_team_id)
          const away = getTeam(m.away_team_id)
          const cfg = STATUS_CONFIG[m.status]
          const isLive = m.status === 'live'
          const hasRescheduled = !!m.previous_scheduled_at && m.previous_scheduled_at !== m.scheduled_at

          return (
            <div>
              {/* Teams */}
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                gap: 10, alignItems: 'center',
                padding: '4px 0 18px',
                borderBottom: '1px solid rgba(255,220,180,0.06)',
                marginBottom: 16,
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: 14, margin: '0 auto 8px',
                    background: home ? `${home.color}22` : 'rgba(255,255,255,0.08)',
                    border: `2px solid ${home?.color ?? '#fff'}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Archivo', fontWeight: 800, fontSize: 17, color: home?.color ?? '#FAF5EB',
                    boxShadow: home ? `0 0 14px ${home.color}33` : 'none',
                  }}>
                    {home?.initials ?? 'H'}
                  </div>
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: '#FAF5EB', lineHeight: 1.2 }}>
                    {home?.club_name ?? 'Local'}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  {m.home_score !== null && m.away_score !== null ? (
                    <div style={{
                      fontFamily: 'Archivo', fontStyle: 'italic', fontWeight: 900,
                      fontSize: isLive ? 42 : 36, color: isLive ? cfg.color : '#FAF5EB',
                      letterSpacing: '-0.04em', lineHeight: 1,
                      textShadow: isLive ? `0 0 20px ${cfg.color}88` : 'none',
                    }}>
                      {m.home_score}–{m.away_score}
                    </div>
                  ) : (
                    <div style={{
                      fontFamily: 'Archivo', fontWeight: 800, fontSize: 20,
                      color: 'rgba(250,245,235,0.4)', letterSpacing: '-0.02em',
                    }}>
                      VS
                    </div>
                  )}
                  {isLive && (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: 4 }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: '50%',
                        background: '#FF5B3A', boxShadow: '0 0 6px #FF5B3A',
                        display: 'inline-block',
                        animation: 'pulse-glow 1.2s ease-in-out infinite',
                      }} />
                      <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 9, color: '#FF5B3A', letterSpacing: '0.1em' }}>
                        EN JUEGO
                      </span>
                    </div>
                  )}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <div style={{
                    width: 54, height: 54, borderRadius: 14, margin: '0 auto 8px',
                    background: away ? `${away.color}22` : 'rgba(255,255,255,0.08)',
                    border: `2px solid ${away?.color ?? '#fff'}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Archivo', fontWeight: 800, fontSize: 17, color: away?.color ?? '#FAF5EB',
                    boxShadow: away ? `0 0 14px ${away.color}33` : 'none',
                  }}>
                    {away?.initials ?? 'A'}
                  </div>
                  <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12, color: '#FAF5EB', lineHeight: 1.2 }}>
                    {away?.club_name ?? 'Visitante'}
                  </div>
                </div>
              </div>

              {/* Info rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                }}>
                  <Calendar size={16} color="#FFB800" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.5)' }}>Fecha y hora oficial</div>
                    <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: '#FAF5EB' }}>
                      {formatMatchDate(m.scheduled_at)}
                    </div>
                    {hasRescheduled && (
                      <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: '#FFB800', marginTop: 2 }}>
                        ⏰ Antes: {formatMatchDate(m.previous_scheduled_at!)}
                      </div>
                    )}
                  </div>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                }}>
                  <MapPin size={16} color="#FF5B3A" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.5)' }}>Instalación</div>
                    <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: '#FAF5EB' }}>{m.venue}</div>
                  </div>
                </div>

                <div style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: 10,
                }}>
                  <RefreshCw size={14} color="#00D4FF" />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.5)' }}>Última sync FFCV</div>
                    <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: '#FAF5EB' }}>
                      {formatSyncAge(m.last_synced_at)}
                    </div>
                  </div>
                </div>

                {m.status === 'postponed' && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px',
                    background: 'rgba(255, 184, 0, 0.10)',
                    border: '1px solid rgba(255, 184, 0, 0.35)', borderRadius: 10,
                  }}>
                    <AlertTriangle size={16} color="#FFB800" />
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 12, color: '#FFB800' }}>
                      Este partido ha sido aplazado. Pendiente de nueva fecha.
                    </div>
                  </div>
                )}
              </div>
            </div>
          )
        })()}
      </BottomSheet>

      {/* ── Leaderboard sheet ── */}
      <LeaderboardSheet open={lbOpen} onClose={() => setLbOpen(false)} />

      {/* ── Subscribe sheet ── */}
      <TeamSubscribeSheet
        open={!!subscribeTeam}
        onClose={() => setSubscribeTeam(null)}
        team={subscribeTeam}
        existing={subs.find(s => s.team_external_id === subscribeTeam?.id)}
        onSave={handleSubscribeSave}
      />

      <BottomNav />
    </div>
  )
}
