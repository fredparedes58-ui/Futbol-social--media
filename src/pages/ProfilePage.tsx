import { useState, useMemo, useRef } from 'react'
import { LogOut, Trophy, Target, Zap, Star, Pencil, Check, X, Sun, Moon, Sparkles, TrendingUp, AlertCircle, PlusCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import BottomNav from '../components/ui/BottomNav'
import GlassCard from '../components/ui/GlassCard'
import AIBorder from '../components/ui/AIBorder'
import CountUp from '../components/ui/CountUp'
import { generateCoachFeedback } from '../lib/aiMocks'
import AchievementsSheet from '../features/achievements/AchievementsSheet'
import { evaluateAchievements, RARITY_STYLE } from '../features/achievements/catalog'
import CoachChatSheet from '../features/coach/CoachChatSheet'
import StreakBadge from '../features/streaks/StreakBadge'
import SeasonPassSheet from '../features/seasonPass/SeasonPassSheet'
import HeatmapPitch from '../features/heatmap/HeatmapPitch'
import DuelsSheet from '../features/duels/DuelsSheet'
import MarketSheet from '../features/market/MarketSheet'
import MatchReplaySheet from '../features/replay/MatchReplaySheet'
import { shareFifaCard } from '../features/share/shareFifaCard'
import LeaderboardSheet from '../features/leaderboard/LeaderboardSheet'
import TacticsBoardSheet from '../features/tactics/TacticsBoardSheet'
import DrillsSheet from '../features/training/DrillsSheet'
import { MessageCircle, Flame, Crown, Swords, Store, Share2, Film, BarChart2, Grid3X3, Dumbbell } from 'lucide-react'

const STATS = [
  { icon: Trophy, label: 'Partidos',   value: 42, color: '#CCFF00' },
  { icon: Target, label: 'Goles',      value: 32, color: '#FFB800' },
  { icon: Zap,    label: 'Asistencias', value: 15, color: '#FF5B3A' },
  { icon: Star,   label: 'MVPs',       value: 5, color: '#CCFF00' },
]

const RATINGS = [
  ['PAC', 92], ['DRI', 87], ['SHO', 88], ['DEF', 54], ['PAS', 79], ['FÍS', 81],
] as [string, number][]

const RECENT = [
  { opponent: 'Rayo Urbano',     result: 'W 3-1', goals: 2 },
  { opponent: 'Águilas Doradas', result: 'D 1-1', goals: 1 },
  { opponent: 'Tigres Verdes',   result: 'W 4-0', goals: 1 },
]

// Forma reciente — últimos 5 resultados (más reciente a la derecha)
const FORM: Array<'W' | 'D' | 'L'> = ['W', 'L', 'W', 'D', 'W']
const FORM_COLOR: Record<'W' | 'D' | 'L', string> = { W: '#CCFF00', D: '#FFB800', L: '#FF5B3A' }

const POSITIONS = ['Portero', 'Defensa', 'Mediocampista', 'Delantero', 'Extremo']

export default function ProfilePage() {
  const { user, logout, updateUser, setToast } = useAuth()
  const { mode, toggle } = useTheme()
  const nav = useNavigate()
  const name = user?.name ?? 'Alex Rivera'
  const position = user?.position ?? 'Delantero'
  const team = user?.team ?? 'Los Pumas FC'
  const overall = Math.round(RATINGS.reduce((a, [, v]) => a + v, 0) / RATINGS.length)

  const coach = useMemo(() => generateCoachFeedback({
    name, position,
    matches: 42, goals: 32, assists: 15, mvps: 5,
  }), [name, position])

  const playerStats = useMemo(() => ({
    matches: 42, goals: 32, assists: 15, mvps: 5, wins: 28, draws: 8, losses: 6,
  }), [])
  const achievements = useMemo(() => evaluateAchievements(playerStats), [playerStats])
  const unlockedCount = achievements.filter(a => a.unlocked).length
  const latestUnlocked = achievements.filter(a => a.unlocked).slice(-3).reverse()
  const [achievementsOpen, setAchievementsOpen] = useState(false)
  const [coachOpen, setCoachOpen] = useState(false)
  const [passOpen, setPassOpen] = useState(false)
  const [duelsOpen, setDuelsOpen] = useState(false)
  const [marketOpen, setMarketOpen] = useState(false)
  const [replayOpen, setReplayOpen] = useState(false)
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  const [tacticsOpen, setTacticsOpen] = useState(false)
  const [drillsOpen, setDrillsOpen] = useState(false)
  const fifaCardRef = useRef<HTMLDivElement>(null)

  const [editing, setEditing] = useState(false)
  const [draftName, setDraftName] = useState(name)
  const [draftPos, setDraftPos] = useState(position)
  const [draftTeam, setDraftTeam] = useState(team)

  function startEdit() {
    setDraftName(name)
    setDraftPos(position)
    setDraftTeam(team)
    setEditing(true)
  }

  function saveEdit() {
    updateUser({
      name: draftName.trim() || name,
      position: draftPos,
      team: draftTeam.trim() || team,
    })
    setEditing(false)
    setToast('Perfil actualizado')
    if ('vibrate' in navigator) navigator.vibrate(25)
  }

  function cancelEdit() {
    setEditing(false)
  }

  function handleLogout() {
    logout()
    nav('/')
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-deep, #0F0D0A)', overflow: 'hidden' }}>
      <div
        className="screen-scroll"
        style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 60, paddingBottom: 90 }}
      >
        {/* Header */}
        <div style={{ padding: '0 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div
            style={{
              fontFamily: 'Archivo, sans-serif', fontWeight: 800,
              fontSize: 28, color: '#FAF5EB', letterSpacing: '-0.02em',
            }}
          >
            Perfil
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {!editing ? (
              <button
                onClick={startEdit}
                style={{
                  width: 40, height: 40, borderRadius: 10,
                  background: 'rgba(204, 255, 0, 0.12)',
                  border: '1px solid rgba(204, 255, 0, 0.3)',
                  color: '#CCFF00', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
                title="Editar"
              >
                <Pencil size={16} />
              </button>
            ) : (
              <>
                <button
                  onClick={cancelEdit}
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 220, 180, 0.12)',
                    color: 'rgba(250, 245, 235, 0.7)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <X size={16} />
                </button>
                <button
                  onClick={saveEdit}
                  style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: 'linear-gradient(135deg, #CCFF00, #FFB800)',
                    border: 'none', color: '#0F0D0A', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 14px rgba(204, 255, 0, 0.45)',
                  }}
                >
                  <Check size={16} />
                </button>
              </>
            )}
            <button
              onClick={() => { toggle(); setToast(mode === 'dark' ? 'Tema claro activado' : 'Tema oscuro activado') }}
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(255, 184, 0, 0.12)',
                border: '1px solid rgba(255, 184, 0, 0.3)',
                color: '#FFB800', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title={mode === 'dark' ? 'Cambiar a claro' : 'Cambiar a oscuro'}
            >
              {mode === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={handleLogout}
              style={{
                width: 40, height: 40, borderRadius: 10,
                background: 'rgba(255, 91, 58, 0.12)',
                border: '1px solid rgba(255, 91, 58, 0.3)',
                color: '#FF5B3A', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
              title="Cerrar sesión"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* FIFA-style card — borde cónico rotando */}
        <div style={{ padding: '0 20px 20px' }}>
          <div
            ref={fifaCardRef}
            style={{
              position: 'relative',
              borderRadius: 20,
              padding: 2,
              overflow: 'hidden',
              boxShadow: '0 0 30px rgba(204, 255, 0, 0.18), 0 0 80px rgba(179, 71, 255, 0.10)',
            }}
          >
            {/* Capa cónica rotando detrás → el 2px de padding deja ver el borde */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: '-50%',
                background: 'conic-gradient(from 0deg, #CCFF00, #FFB800, #FF5B3A, #B347FF, #00D4FF, #CCFF00)',
                animation: 'ring-sweep 5s linear infinite',
                filter: 'blur(1px) saturate(130%)',
                pointerEvents: 'none',
              }}
            />
            {/* Capa halo difuso que bombea con la rotación */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: '-30%',
                background: 'conic-gradient(from 180deg, transparent, #CCFF0044, transparent, #B347FF44, transparent)',
                animation: 'ring-sweep 8s linear infinite reverse',
                filter: 'blur(24px)',
                pointerEvents: 'none',
                opacity: 0.8,
              }}
            />
            <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden' }}>
          <GlassCard accent="#CCFF00" padding={0}>
            <div
              style={{
                background: 'linear-gradient(135deg, rgba(204, 255, 0, 0.2), rgba(255, 184, 0, 0.15))',
                padding: 20,
                display: 'flex', gap: 16, alignItems: 'center',
              }}
            >
              {/* Avatar */}
              <div
                style={{
                  width: 96, height: 96, borderRadius: '50%',
                  background: 'linear-gradient(135deg, #CCFF00, #FFB800)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 34,
                  color: '#0F0D0A',
                  boxShadow: '0 0 24px rgba(204, 255, 0, 0.4)',
                  border: '3px solid #CCFF00',
                  flexShrink: 0,
                }}
              >
                {(editing ? draftName : name).split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <CountUp
                  value={overall}
                  duration={1400}
                  whenVisible={false}
                  style={{
                    fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontStyle: 'italic',
                    fontSize: 42, color: '#CCFF00', lineHeight: 1,
                    textShadow: '0 0 16px rgba(204, 255, 0, 0.5)',
                    display: 'block',
                  }}
                />

                {editing ? (
                  <>
                    <input
                      value={draftName}
                      onChange={e => setDraftName(e.target.value)}
                      placeholder="Nombre"
                      style={{
                        marginTop: 6, width: '100%',
                        padding: '6px 10px', borderRadius: 8,
                        background: 'rgba(15, 13, 10, 0.5)',
                        border: '1px solid rgba(204, 255, 0, 0.35)',
                        outline: 'none',
                        fontFamily: 'Archivo, sans-serif', fontWeight: 800,
                        fontSize: 16, color: '#FAF5EB',
                      }}
                    />
                    <input
                      value={draftTeam}
                      onChange={e => setDraftTeam(e.target.value)}
                      placeholder="Equipo"
                      style={{
                        marginTop: 6, width: '100%',
                        padding: '5px 10px', borderRadius: 8,
                        background: 'rgba(15, 13, 10, 0.5)',
                        border: '1px solid rgba(255, 220, 180, 0.15)',
                        outline: 'none',
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: 12, color: 'rgba(250, 245, 235, 0.9)',
                      }}
                    />
                  </>
                ) : (
                  <>
                    <div
                      style={{
                        marginTop: 4,
                        fontFamily: 'Archivo, sans-serif', fontWeight: 800,
                        fontSize: 18, color: '#FAF5EB',
                      }}
                    >
                      {name}
                    </div>
                    <div
                      style={{
                        marginTop: 2,
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: 12, color: 'rgba(250, 245, 235, 0.6)',
                      }}
                    >
                      {position} · {team}
                    </div>
                  </>
                )}
              </div>
            </div>

            {editing && (
              <div style={{ padding: '14px 16px 4px' }}>
                <div
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                    fontSize: 11, color: 'rgba(250, 245, 235, 0.5)',
                    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8,
                  }}
                >
                  Posición
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {POSITIONS.map(p => {
                    const active = draftPos === p
                    return (
                      <button
                        key={p}
                        onClick={() => setDraftPos(p)}
                        style={{
                          padding: '6px 12px', borderRadius: 999,
                          background: active ? 'rgba(204, 255, 0, 0.18)' : 'rgba(255, 255, 255, 0.04)',
                          border: `1px solid ${active ? '#CCFF00' : 'rgba(255, 220, 180, 0.12)'}`,
                          color: active ? '#CCFF00' : 'rgba(250, 245, 235, 0.7)',
                          fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 12,
                          cursor: 'pointer',
                          boxShadow: active ? '0 0 10px rgba(204,255,0,0.25)' : 'none',
                        }}
                      >
                        {p}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Ratings grid */}
            <div style={{ padding: 16, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
              {RATINGS.map(([label, val]) => (
                <div
                  key={label}
                  style={{
                    padding: '8px 12px',
                    background: 'rgba(255, 255, 255, 0.04)',
                    borderRadius: 8,
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                      fontSize: 10, color: 'rgba(250, 245, 235, 0.6)',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      fontFamily: 'Archivo, sans-serif', fontWeight: 800,
                      fontSize: 15,
                      color: val >= 85 ? '#CCFF00' : val >= 70 ? '#FFB800' : '#FAF5EB',
                    }}
                  >
                    {val}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
            </div>
          </div>
        </div>

        {/* Streak + acciones */}
        <div style={{ padding: '0 20px 14px' }}>
          <StreakBadge onClick={() => setPassOpen(true)} />
        </div>

        <div style={{ padding: '0 20px 18px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
          {[
            { label: 'Coach AI',    icon: MessageCircle, color: '#B347FF', onClick: () => setCoachOpen(true) },
            { label: 'Pase',        icon: Crown,         color: '#FFB800', onClick: () => setPassOpen(true) },
            { label: 'Duelos',      icon: Swords,        color: '#FF5B3A', onClick: () => setDuelsOpen(true) },
            { label: 'Mercado',     icon: Store,         color: '#00D4FF', onClick: () => setMarketOpen(true) },
            { label: 'Replay',      icon: Film,          color: '#CCFF00', onClick: () => setReplayOpen(true) },
            { label: 'Ranking',     icon: BarChart2,     color: '#FFB800', onClick: () => setLeaderboardOpen(true) },
            { label: 'Táctica',     icon: Grid3X3,       color: '#00D4FF', onClick: () => setTacticsOpen(true) },
            { label: 'Entrenos',    icon: Dumbbell,      color: '#CCFF00', onClick: () => setDrillsOpen(true) },
            { label: 'Compartir',   icon: Share2,        color: '#FAF5EB', onClick: async () => {
              if (!fifaCardRef.current) return
              const ok = await shareFifaCard(fifaCardRef.current, `${name}-fifa-card`)
              setToast(ok ? 'Tarjeta compartida' : 'No se pudo compartir')
            } },
          ].map(b => {
            const I = b.icon
            return (
              <button key={b.label} onClick={b.onClick} style={{
                padding: '10px 6px', borderRadius: 12,
                background: `${b.color}14`, border: `1px solid ${b.color}44`,
                color: b.color, cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 700,
              }}>
                <I size={16} />
                {b.label}
              </button>
            )
          })}
        </div>

        {/* Registrar partido CTA */}
        <div style={{ padding: '0 20px 18px' }}>
          <button
            onClick={() => nav('/record')}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: 16,
              background: 'linear-gradient(135deg, rgba(204,255,0,0.14), rgba(255,184,0,0.10))',
              border: '1.5px solid rgba(204,255,0,0.35)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              boxShadow: '0 0 18px rgba(204,255,0,0.10)',
              transition: 'box-shadow 0.18s',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 10,
                background: 'linear-gradient(135deg, #CCFF00, #FFB800)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <PlusCircle size={18} color="#0F0D0A" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <div style={{
                  fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 15,
                  color: '#FAF5EB', letterSpacing: '-0.01em',
                }}>
                  Registrar partido
                </div>
                <div style={{
                  fontFamily: 'Space Grotesk, sans-serif', fontSize: 11,
                  color: 'rgba(250,245,235,0.45)', marginTop: 1,
                }}>
                  Anota el resultado · el Coach AI lo analiza
                </div>
              </div>
            </div>
            {/* Forma reciente */}
            <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
              {FORM.map((r, i) => (
                <div key={i} style={{
                  width: 22, height: 22, borderRadius: 5,
                  background: `${FORM_COLOR[r]}22`,
                  border: `1px solid ${FORM_COLOR[r]}55`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 9,
                  color: FORM_COLOR[r],
                }}>
                  {r}
                </div>
              ))}
            </div>
          </button>
        </div>

        {/* Heatmap */}
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{
            fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
            fontSize: 13, color: 'rgba(250, 245, 235, 0.6)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10,
          }}>
            <Flame size={12} style={{ verticalAlign: 'middle', marginRight: 4 }} />
            Heatmap en cancha
          </div>
          <HeatmapPitch name={name} width={320} />
        </div>

        {/* Stats strip */}
        <div style={{ padding: '0 20px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {STATS.map((s, i) => {
            const I = s.icon
            return (
              <GlassCard key={i} padding={14}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: `${s.color}22`, color: s.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <I size={16} />
                  </div>
                  <div>
                    <CountUp
                      value={s.value}
                      duration={1200 + i * 120}
                      style={{
                        fontFamily: 'Archivo, sans-serif', fontWeight: 800,
                        fontSize: 20, color: '#FAF5EB',
                        display: 'block',
                      }}
                    />
                    <div
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: 10, color: 'rgba(250, 245, 235, 0.5)',
                        textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}
                    >
                      {s.label}
                    </div>
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>

        {/* Coach AI Feedback */}
        <div style={{ padding: '0 20px 20px' }}>
          <AIBorder colors={['#B347FF', '#00D4FF', '#B347FF']} radius={16} speed={10} halo={0.4}>
          <div style={{
            padding: 16,
            background: 'linear-gradient(135deg, rgba(179, 71, 255, 0.18), rgba(0, 212, 255, 0.08))',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 30, height: 30, borderRadius: 8,
                background: 'rgba(179, 71, 255, 0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#B347FF',
              }}>
                <Sparkles size={15} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                  color: '#B347FF', letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>
                  Coach AI · análisis personal
                </div>
                <div style={{
                  fontFamily: 'Archivo, sans-serif', fontWeight: 800,
                  fontSize: 15, color: '#FAF5EB', letterSpacing: '-0.01em',
                }}>
                  Tu desempeño de temporada
                </div>
              </div>
              {/* Grade badge */}
              <div style={{
                padding: '6px 12px', borderRadius: 10,
                background: 'linear-gradient(135deg, #CCFF00, #FFB800)',
                color: '#0F0D0A',
                fontFamily: 'Archivo', fontStyle: 'italic', fontWeight: 900,
                fontSize: 18, lineHeight: 1,
                boxShadow: '0 0 14px rgba(204, 255, 0, 0.4)',
              }}>
                {coach.grade}
              </div>
            </div>

            <div style={{
              fontFamily: 'Space Grotesk', fontSize: 13, lineHeight: 1.5,
              color: 'rgba(250, 245, 235, 0.9)', marginBottom: 14,
            }}>
              {coach.verdict}
            </div>

            {/* Strengths */}
            <div style={{ marginBottom: 12 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6,
                fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                color: '#CCFF00', letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                <TrendingUp size={11} /> Fortalezas
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {coach.strengths.map((t, i) => (
                  <div key={i} style={{
                    padding: '7px 10px', borderRadius: 8,
                    background: 'rgba(204, 255, 0, 0.06)',
                    border: '1px solid rgba(204, 255, 0, 0.18)',
                    fontFamily: 'Space Grotesk', fontSize: 12,
                    color: 'rgba(250, 245, 235, 0.85)',
                  }}>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Improvements */}
            <div style={{ marginBottom: 12 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6,
                fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                color: '#FF5B3A', letterSpacing: '0.1em', textTransform: 'uppercase',
              }}>
                <AlertCircle size={11} /> A mejorar
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                {coach.improvements.map((t, i) => (
                  <div key={i} style={{
                    padding: '7px 10px', borderRadius: 8,
                    background: 'rgba(255, 91, 58, 0.06)',
                    border: '1px solid rgba(255, 91, 58, 0.18)',
                    fontFamily: 'Space Grotesk', fontSize: 12,
                    color: 'rgba(250, 245, 235, 0.85)',
                  }}>
                    {t}
                  </div>
                ))}
              </div>
            </div>

            {/* Next focus */}
            <div style={{
              padding: '10px 12px', borderRadius: 10,
              background: 'rgba(0, 212, 255, 0.08)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
            }}>
              <div style={{
                fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                color: '#00D4FF', letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: 4,
              }}>
                🎯 Próximo foco
              </div>
              <div style={{
                fontFamily: 'Space Grotesk', fontSize: 12, lineHeight: 1.4,
                color: 'rgba(250, 245, 235, 0.9)',
              }}>
                {coach.nextFocus}
              </div>
            </div>
          </div>
          </AIBorder>
        </div>

        {/* Achievements */}
        <div style={{ padding: '0 20px', marginBottom: 18 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
              fontSize: 13, color: 'rgba(250, 245, 235, 0.6)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Logros · {unlockedCount}/{achievements.length}
            </div>
            <button
              onClick={() => setAchievementsOpen(true)}
              style={{
                background: 'transparent', border: 'none',
                color: '#FFB800', cursor: 'pointer',
                fontFamily: 'Space Grotesk', fontSize: 12, fontWeight: 700,
              }}
            >
              Ver todos →
            </button>
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto' }} className="screen-scroll">
            {latestUnlocked.map(({ achievement: a }) => {
              const st = RARITY_STYLE[a.rarity]
              return (
                <button
                  key={a.id}
                  onClick={() => setAchievementsOpen(true)}
                  style={{
                    flexShrink: 0, minWidth: 110,
                    padding: 10, borderRadius: 12,
                    background: st.bg,
                    border: `1px solid ${st.color}55`,
                    boxShadow: `0 0 14px ${st.color}22`,
                    cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{ fontSize: 22, marginBottom: 4 }}>{a.emoji}</div>
                  <div style={{
                    fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 11,
                    color: '#FAF5EB',
                  }}>
                    {a.title}
                  </div>
                  <div style={{
                    fontFamily: 'Space Grotesk', fontSize: 9,
                    color: st.color, textTransform: 'uppercase', letterSpacing: '0.08em',
                    marginTop: 2,
                  }}>
                    {st.label}
                  </div>
                </button>
              )
            })}
            {latestUnlocked.length === 0 && (
              <div style={{
                fontFamily: 'Space Grotesk', fontSize: 12,
                color: 'rgba(250,245,235,0.5)', padding: 10,
              }}>
                Aún no desbloqueaste logros. Seguí jugando 💪
              </div>
            )}
          </div>
        </div>

        {/* Recent matches */}
        <div style={{ padding: '0 20px' }}>
          <div
            style={{
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
              fontSize: 13, color: 'rgba(250, 245, 235, 0.6)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
              marginBottom: 10,
            }}
          >
            Últimos partidos
          </div>
          <GlassCard padding={0}>
            {RECENT.map((r, i) => {
              const won = r.result.startsWith('W')
              const drew = r.result.startsWith('D')
              const resultColor = won ? '#CCFF00' : drew ? '#FFB800' : '#FF5B3A'
              return (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px',
                    borderBottom: i < RECENT.length - 1 ? '1px solid rgba(255, 220, 180, 0.05)' : 'none',
                  }}
                >
                  <div
                    style={{
                      width: 6, height: 36, borderRadius: 3, background: resultColor,
                      boxShadow: `0 0 8px ${resultColor}66`,
                    }}
                  />
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                        fontSize: 13, color: '#FAF5EB',
                      }}
                    >
                      vs {r.opponent}
                    </div>
                    <div
                      style={{
                        fontFamily: 'Space Grotesk, sans-serif',
                        fontSize: 11, color: resultColor,
                      }}
                    >
                      {r.result}
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'flex', alignItems: 'center', gap: 4,
                      fontFamily: 'Archivo, sans-serif', fontWeight: 800,
                      fontSize: 14, color: '#CCFF00',
                    }}
                  >
                    <Target size={14} />
                    {r.goals}
                  </div>
                </div>
              )
            })}
          </GlassCard>
        </div>
      </div>

      <AchievementsSheet
        open={achievementsOpen}
        onClose={() => setAchievementsOpen(false)}
        stats={playerStats}
      />
      <CoachChatSheet
        open={coachOpen}
        onClose={() => setCoachOpen(false)}
        name={name}
        position={position}
        stats={playerStats}
      />
      <SeasonPassSheet open={passOpen} onClose={() => setPassOpen(false)} />
      <DuelsSheet open={duelsOpen} onClose={() => setDuelsOpen(false)} me={name} />
      <MarketSheet open={marketOpen} onClose={() => setMarketOpen(false)} />
      <MatchReplaySheet open={replayOpen} onClose={() => setReplayOpen(false)} home={team} away="Rival FC" />
      <LeaderboardSheet open={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} me={name} />
      <TacticsBoardSheet open={tacticsOpen} onClose={() => setTacticsOpen(false)} />
      <DrillsSheet open={drillsOpen} onClose={() => setDrillsOpen(false)} name={name} weaknesses={['shot', 'def', 'pace']} />
      <BottomNav />
    </div>
  )
}
