import { useState, useMemo } from 'react'
import { Search, Users, Trophy, MapPin, Calendar, Check, Sparkles, ChevronRight, Wand2, X } from 'lucide-react'
import TournamentsTab from '../features/tournaments/TournamentsTab'
import PollCard from '../features/polls/PollCard'
import EventsSheet from '../features/events/EventsSheet'
import BottomNav from '../components/ui/BottomNav'
import GlassCard from '../components/ui/GlassCard'
import BottomSheet from '../components/ui/BottomSheet'
import MatchPredictionSheet from '../components/ui/MatchPredictionSheet'
import { Skeleton, SkeletonCircle } from '../components/ui/Skeleton'
import { useSimulatedLoad } from '../hooks/useSimulatedLoad'
import { useAuth } from '../context/AuthContext'
import { usePredictions, type PredictionMatch } from '../context/PredictionsContext'
import {
  parseSearchIntent, matchTeams,
  type PlayStyle, type PlayDay, type PlayLevel,
  type TeamCandidate, type MatcherAnswers,
} from '../lib/aiMocks'

interface Team {
  name: string
  members: number
  badge: string
  level: string
  color: string
  city: string
  founded: number
  wins: number
  draws: number
  losses: number
  roster: { name: string; position: string; number: number }[]
}

const TEAMS: Team[] = [
  {
    name: 'Los Pumas FC', members: 342, badge: 'LP', level: 'Sub-18', color: '#CCFF00',
    city: 'Buenos Aires', founded: 2014, wins: 28, draws: 6, losses: 4,
    roster: [
      { name: 'Alex Rivera', position: 'DEL', number: 9 },
      { name: 'Tomás López', position: 'MED', number: 8 },
      { name: 'Diego Sosa', position: 'DEF', number: 4 },
      { name: 'Nico Vega', position: 'POR', number: 1 },
    ],
  },
  {
    name: 'Águilas Doradas', members: 188, badge: 'AD', level: 'Sub-17', color: '#FFB800',
    city: 'Córdoba', founded: 2016, wins: 19, draws: 8, losses: 7,
    roster: [
      { name: 'Lautaro Paz', position: 'DEL', number: 10 },
      { name: 'Matías Cruz', position: 'MED', number: 6 },
      { name: 'Julián Mora', position: 'DEF', number: 3 },
    ],
  },
  {
    name: 'Rayo Urbano', members: 211, badge: 'RU', level: 'Sub-21', color: '#FF5B3A',
    city: 'Rosario', founded: 2012, wins: 22, draws: 5, losses: 9,
    roster: [
      { name: 'Santi Ruiz', position: 'DEL', number: 7 },
      { name: 'Iván Peña', position: 'MED', number: 11 },
    ],
  },
  {
    name: 'Phantom FC', members: 76, badge: 'PF', level: 'Sub-15', color: '#CCFF00',
    city: 'La Plata', founded: 2020, wins: 12, draws: 3, losses: 5,
    roster: [
      { name: 'Bruno Díaz', position: 'DEL', number: 9 },
      { name: 'Emi Quiroga', position: 'DEF', number: 2 },
    ],
  },
  {
    name: 'Tigres Verdes', members: 154, badge: 'TV', level: 'Sub-19', color: '#FFB800',
    city: 'Mendoza', founded: 2015, wins: 17, draws: 9, losses: 6,
    roster: [
      { name: 'Gabi Torres', position: 'MED', number: 8 },
      { name: 'Leo Arce', position: 'DEF', number: 5 },
    ],
  },
  {
    name: 'Cometa SC', members: 98, badge: 'CS', level: 'Sub-16', color: '#FF5B3A',
    city: 'Salta', founded: 2018, wins: 14, draws: 6, losses: 8,
    roster: [
      { name: 'Dante Vera', position: 'DEL', number: 10 },
    ],
  },
]

// Metadata sintética para el Team Matcher (estilo/día/nivel por nombre)
const TEAM_META: Record<string, { style: PlayStyle; day: PlayDay; level: PlayLevel }> = {
  'Los Pumas FC':    { style: 'ofensivo',  day: 'domingo', level: 'competitivo' },
  'Águilas Doradas': { style: 'tocar',     day: 'sabado',  level: 'competitivo' },
  'Rayo Urbano':     { style: 'intenso',   day: 'domingo', level: 'profesional' },
  'Phantom FC':      { style: 'ofensivo',  day: 'sabado',  level: 'casual' },
  'Tigres Verdes':   { style: 'defensivo', day: 'semana',  level: 'competitivo' },
  'Cometa SC':       { style: 'tocar',     day: 'domingo', level: 'casual' },
}

export default function CommunityPage() {
  const { user, setToast } = useAuth()
  const loading = useSimulatedLoad(650)
  const { matches, totalParticipants, hasJoined } = usePredictions()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Team | null>(null)
  const [joined, setJoined] = useState<Record<string, boolean>>({})
  const [predictionMatch, setPredictionMatch] = useState<PredictionMatch | null>(null)
  const userName = user?.name ?? 'Tú'

  // Semantic search intent
  const intent = useMemo(() => query.trim() ? parseSearchIntent(query) : null, [query])
  const hasSemanticFilters = intent && Object.keys(intent.filters).length > 0

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    return TEAMS.filter(t => {
      // Name contains (siempre tiene prioridad si matchea)
      const matchesName = q === '' || t.name.toLowerCase().includes(q)
      if (!intent || !hasSemanticFilters) return matchesName

      const meta = TEAM_META[t.name]
      const f = intent.filters
      // Si el filtro semántico no se cumple, ocultar
      if (f.style && meta?.style !== f.style) return false
      if (f.day && f.day !== 'flexible' && meta?.day !== f.day) return false
      if (f.level && meta?.level !== f.level) return false
      if (f.zone && !t.city.toLowerCase().includes(f.zone.replace(/^zona\s+/, '').toLowerCase())) return false
      if (f.member === 'pocos' && t.members >= 150) return false
      if (f.member === 'muchos' && t.members < 150) return false
      return matchesName
    })
  }, [query, intent, hasSemanticFilters])

  const [eventsOpen, setEventsOpen] = useState(false)

  // Matcher
  const [communityTab, setCommunityTab] = useState<'equipos' | 'torneos'>('equipos')
  const [matcherOpen, setMatcherOpen] = useState(false)
  const [mStep, setMStep] = useState(0)
  const [mAns, setMAns] = useState<Partial<MatcherAnswers>>({})
  const matcherDone = mAns.style && mAns.day && mAns.level
  const candidates: TeamCandidate[] = TEAMS.map(t => ({
    id: t.badge,
    name: t.name, color: t.color, badge: t.badge,
    style: TEAM_META[t.name]?.style ?? 'ofensivo',
    day: TEAM_META[t.name]?.day ?? 'domingo',
    level: TEAM_META[t.name]?.level ?? 'casual',
    members: t.members,
  }))
  const matcherResults = matcherDone
    ? matchTeams(candidates, mAns as MatcherAnswers)
    : []

  function restartMatcher() {
    setMStep(0)
    setMAns({})
  }
  function answer<K extends keyof MatcherAnswers>(k: K, v: MatcherAnswers[K]) {
    setMAns(prev => ({ ...prev, [k]: v }))
    if ('vibrate' in navigator) navigator.vibrate(12)
    setTimeout(() => setMStep(s => s + 1), 200)
  }

  function handleJoin(team: Team) {
    setJoined(prev => ({ ...prev, [team.name]: true }))
    setToast(`Te uniste a ${team.name}`)
    if ('vibrate' in navigator) navigator.vibrate(40)
    setTimeout(() => setSelected(null), 600)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-deep, #0F0D0A)', overflow: 'hidden' }}>
      <div
        className="screen-scroll"
        style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 60, paddingBottom: 90 }}
      >
        <div style={{ padding: '0 20px 16px' }}>
          <div
            style={{
              fontFamily: 'Archivo, sans-serif', fontWeight: 800,
              fontSize: 32, color: '#FAF5EB', letterSpacing: '-0.02em',
            }}
          >
            Comunidad
          </div>
          <div
            style={{
              marginTop: 4,
              fontFamily: 'Space Grotesk, sans-serif',
              fontSize: 14, color: 'rgba(250, 245, 235, 0.6)',
            }}
          >
            Descubre clubes, equipos y torneos
          </div>
        </div>

        {/* Tabs: Equipos / Torneos */}
        <div style={{ padding: '0 20px 16px', display: 'flex', gap: 8 }}>
          {(['equipos', 'torneos'] as const).map(t => (
            <button
              key={t}
              onClick={() => setCommunityTab(t)}
              style={{
                flex: 1, padding: '9px', borderRadius: 10,
                background: communityTab === t ? 'rgba(204,255,0,0.15)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${communityTab === t ? '#CCFF00' : 'rgba(255,220,180,0.08)'}`,
                color: communityTab === t ? '#CCFF00' : 'rgba(250,245,235,0.55)',
                fontFamily: 'Space Grotesk', fontWeight: 700,
                fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.05em',
                cursor: 'pointer',
                boxShadow: communityTab === t ? '0 0 12px rgba(204,255,0,0.15)' : 'none',
              }}
            >
              {t === 'equipos' ? '👥 Equipos' : '🏆 Torneos'}
            </button>
          ))}
        </div>

        {communityTab === 'torneos' && (
          <div style={{ padding: '0 20px' }}>
            <TournamentsTab />
          </div>
        )}

        {communityTab === 'equipos' && (<><div style={{ padding: '0 20px 20px' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              padding: '12px 16px', borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 220, 180, 0.12)',
            }}
          >
            <Search size={18} color="rgba(250, 245, 235, 0.5)" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Prueba: 'equipos ofensivos los domingos'"
              style={{
                flex: 1, background: 'transparent', border: 'none', outline: 'none',
                color: '#FAF5EB', fontSize: 14,
                fontFamily: 'Space Grotesk, sans-serif',
              }}
            />
            {query && (
              <button
                onClick={() => setQuery('')}
                aria-label="Limpiar búsqueda"
                style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: 'transparent', border: 'none',
                  color: 'rgba(250,245,235,0.5)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Semantic intent chip */}
          {intent && hasSemanticFilters && (
            <div style={{
              marginTop: 8, padding: '7px 10px', borderRadius: 10,
              background: 'rgba(0, 212, 255, 0.08)',
              border: '1px solid rgba(0, 212, 255, 0.3)',
              display: 'flex', alignItems: 'center', gap: 8,
              animation: 'slide-up-fade 200ms ease-out',
            }}>
              <Sparkles size={12} color="#00D4FF" />
              <div style={{
                flex: 1, fontFamily: 'Space Grotesk', fontSize: 11,
                color: 'rgba(250, 245, 235, 0.85)',
              }}>
                <span style={{ color: '#00D4FF', fontWeight: 700 }}>AI: </span>
                {intent.interpretation} · <b>{filtered.length}</b> resultado{filtered.length === 1 ? '' : 's'}
              </div>
            </div>
          )}

          {/* Team Matcher CTA */}
          <button
            onClick={() => { setMatcherOpen(true); restartMatcher() }}
            style={{
              marginTop: 10, width: '100%',
              padding: '11px 14px', borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(179, 71, 255, 0.14), rgba(204, 255, 0, 0.08))',
              border: '1px solid rgba(179, 71, 255, 0.4)',
              color: '#FAF5EB', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              textAlign: 'left',
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'rgba(179, 71, 255, 0.25)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#B347FF', flexShrink: 0,
            }}>
              <Wand2 size={14} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                color: '#B347FF', letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                Match AI
              </div>
              <div style={{
                fontFamily: 'Space Grotesk', fontSize: 13, color: '#FAF5EB', fontWeight: 600,
              }}>
                Encuentra tu equipo ideal
              </div>
            </div>
            <ChevronRight size={16} color="#B347FF" />
          </button>

          {/* Eventos CTA */}
          <button
            onClick={() => setEventsOpen(true)}
            style={{
              marginTop: 10, width: '100%',
              padding: '11px 14px', borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(204,255,0,0.07))',
              border: '1px solid rgba(0,212,255,0.35)',
              color: '#FAF5EB', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 10,
              textAlign: 'left',
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'rgba(0,212,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#00D4FF', flexShrink: 0,
            }}>
              <Calendar size={14} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10, color: '#00D4FF', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                Eventos
              </div>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 13, color: '#FAF5EB', fontWeight: 600 }}>
                Partidos abiertos · RSVP en 1 tap
              </div>
            </div>
            <ChevronRight size={16} color="#00D4FF" />
          </button>
        </div>

        {/* ═══ Encuestas comunidad ═══ */}
        <div style={{ padding: '0 20px 14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <Trophy size={14} color="#FFB800" />
            <div style={{
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 13,
              color: 'rgba(250, 245, 235, 0.75)', textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              Encuestas de la semana
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <PollCard
              id="community-poll-mvp"
              question="¿Quién es el mejor jugador amateur de tu liga?"
              options={[
                { id: 'p1', label: 'El delantero explosivo', votes: 54, color: '#CCFF00' },
                { id: 'p2', label: 'El mediocampista creativo', votes: 38, color: '#FFB800' },
                { id: 'p3', label: 'El portero infranqueable', votes: 29, color: '#00D4FF' },
              ]}
              totalVoters={130}
            />
            <PollCard
              id="community-poll-formation"
              question="¿Qué formación prefiere tu equipo?"
              options={[
                { id: 'f1', label: '4-3-3',   votes: 61, color: '#CCFF00' },
                { id: 'f2', label: '4-4-2',   votes: 44, color: '#FFB800' },
                { id: 'f3', label: '4-2-3-1', votes: 33, color: '#B347FF' },
                { id: 'f4', label: '3-5-2',   votes: 18, color: '#FF5B3A' },
              ]}
              totalVoters={165}
            />
          </div>
        </div>

        {/* ═══ Quinielas / Predicciones de partidos ═══ */}
        <div style={{ padding: '0 20px 10px' }}>
          <div
            style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10,
            }}
          >
            <Sparkles size={16} color="#CCFF00" />
            <div
              style={{
                fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 13,
                color: 'rgba(250, 245, 235, 0.75)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
              }}
            >
              Quinielas de la jornada
            </div>
          </div>
          <div
            style={{
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 12,
              color: 'rgba(250, 245, 235, 0.5)', marginBottom: 12,
            }}
          >
            Adivina el resultado — opcional, entra solo si te animás.
          </div>

          <div
            className="screen-scroll"
            style={{
              display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 4,
              scrollSnapType: 'x mandatory',
            }}
          >
            {matches.map(m => {
              const joinedMatch = hasJoined(m.id, userName)
              const count = totalParticipants(m.id)
              return (
                <div
                  key={m.id}
                  onClick={() => setPredictionMatch(m)}
                  style={{
                    flex: '0 0 240px', scrollSnapAlign: 'start',
                    padding: 14, borderRadius: 14, cursor: 'pointer',
                    background: 'rgba(255, 255, 255, 0.04)',
                    border: joinedMatch
                      ? '1px solid rgba(204, 255, 0, 0.45)'
                      : '1px solid rgba(255, 220, 180, 0.08)',
                    boxShadow: joinedMatch ? '0 0 18px rgba(204, 255, 0, 0.18)' : 'none',
                    position: 'relative',
                    transition: 'all 200ms',
                  }}
                >
                  {joinedMatch && (
                    <div
                      style={{
                        position: 'absolute', top: 10, right: 10,
                        display: 'flex', alignItems: 'center', gap: 4,
                        padding: '3px 8px', borderRadius: 999,
                        background: 'rgba(204, 255, 0, 0.18)',
                        border: '1px solid rgba(204, 255, 0, 0.45)',
                        color: '#CCFF00',
                        fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 10,
                      }}
                    >
                      <Check size={10} /> participas
                    </div>
                  )}
                  <div
                    style={{
                      fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                      color: '#FFB800', letterSpacing: '0.08em',
                      textTransform: 'uppercase', marginBottom: 10,
                    }}
                  >
                    {m.date}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <MiniBadge color={m.homeColor} label={m.homeBadge} />
                    <div
                      style={{
                        fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                        color: 'rgba(250, 245, 235, 0.4)',
                      }}
                    >
                      VS
                    </div>
                    <MiniBadge color={m.awayColor} label={m.awayBadge} />
                  </div>
                  <div
                    style={{
                      fontFamily: 'Space Grotesk', fontSize: 12,
                      color: '#FAF5EB', lineHeight: 1.3, marginBottom: 12,
                      overflow: 'hidden', textOverflow: 'ellipsis',
                      display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical',
                    }}
                  >
                    {m.home} <span style={{ color: 'rgba(250,245,235,0.4)' }}>vs</span> {m.away}
                  </div>
                  <div
                    style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      paddingTop: 10,
                      borderTop: '1px solid rgba(255, 220, 180, 0.05)',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        fontFamily: 'Space Grotesk', fontSize: 11,
                        color: 'rgba(250, 245, 235, 0.65)', fontWeight: 600,
                      }}
                    >
                      <Users size={11} />
                      {count} {count === 1 ? 'pronóstico' : 'pronósticos'}
                    </div>
                    <ChevronRight size={14} color="#CCFF00" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Separator */}
        <div style={{ padding: '12px 20px 8px' }}>
          <div
            style={{
              fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 13,
              color: 'rgba(250, 245, 235, 0.6)',
              textTransform: 'uppercase', letterSpacing: '0.08em',
            }}
          >
            Equipos
          </div>
        </div>

        <div style={{ padding: '0 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {loading && Array.from({ length: 6 }).map((_, i) => (
            <div
              key={`sk-${i}`}
              style={{
                padding: 14, borderRadius: 14,
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid rgba(255, 220, 180, 0.06)',
              }}
            >
              <SkeletonCircle size={46} style={{ marginBottom: 10 }} />
              <Skeleton width="80%" height={12} style={{ marginBottom: 6 }} />
              <Skeleton width="50%" height={10} style={{ marginBottom: 12 }} />
              <Skeleton width="65%" height={10} />
            </div>
          ))}
          {!loading && filtered.map((t, i) => (
            <div key={i} onClick={() => setSelected(t)} style={{ cursor: 'pointer' }}>
              <GlassCard accent={t.color} padding={14}>
                <div
                  style={{
                    width: 46, height: 46, borderRadius: 12,
                    background: `${t.color}22`, color: t.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 16,
                    marginBottom: 10,
                    boxShadow: `0 0 14px ${t.color}44`,
                  }}
                >
                  {t.badge}
                </div>
                <div
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                    fontSize: 14, color: '#FAF5EB', marginBottom: 2,
                  }}
                >
                  {t.name}
                </div>
                <div
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontSize: 11, color: 'rgba(250, 245, 235, 0.5)', marginBottom: 10,
                  }}
                >
                  {t.level}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Users size={12} color="rgba(250, 245, 235, 0.5)" />
                  <span
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 11, color: 'rgba(250, 245, 235, 0.6)',
                    }}
                  >
                    {t.members} miembros
                  </span>
                </div>
              </GlassCard>
            </div>
          ))}
        </div>
      </>)}
      </div>

      <BottomSheet
        open={!!selected}
        onClose={() => setSelected(null)}
        title={selected?.name}
        accent={selected?.color ?? '#CCFF00'}
        height="78%"
      >
        {selected && (
          <>
            {/* Hero */}
            <div
              style={{
                display: 'flex', gap: 14, alignItems: 'center',
                padding: '4px 0 16px',
                borderBottom: '1px solid rgba(255, 220, 180, 0.06)',
              }}
            >
              <div
                style={{
                  width: 64, height: 64, borderRadius: 16,
                  background: `${selected.color}22`, color: selected.color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 22,
                  boxShadow: `0 0 20px ${selected.color}55`,
                  border: `2px solid ${selected.color}66`,
                }}
              >
                {selected.badge}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: 'Space Grotesk, sans-serif', fontSize: 11,
                    color: selected.color, fontWeight: 700, letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  {selected.level}
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 6, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={11} color="rgba(250,245,235,0.5)" />
                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.6)' }}>
                      {selected.city}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Calendar size={11} color="rgba(250,245,235,0.5)" />
                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.6)' }}>
                      Desde {selected.founded}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Users size={11} color="rgba(250,245,235,0.5)" />
                    <span style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.6)' }}>
                      {selected.members}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats strip */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, padding: '16px 0' }}>
              {[
                ['PG', selected.wins, '#CCFF00'],
                ['PE', selected.draws, '#FFB800'],
                ['PP', selected.losses, '#FF5B3A'],
              ].map(([label, val, color]) => (
                <div
                  key={label as string}
                  style={{
                    padding: '12px 8px',
                    background: 'rgba(255,255,255,0.04)',
                    borderRadius: 10,
                    textAlign: 'center',
                    border: `1px solid ${color}33`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: 'Archivo', fontWeight: 800, fontSize: 22,
                      color: color as string,
                    }}
                  >
                    {val}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Space Grotesk', fontSize: 10,
                      color: 'rgba(250,245,235,0.5)', letterSpacing: '0.08em',
                    }}
                  >
                    {label}
                  </div>
                </div>
              ))}
            </div>

            {/* Roster */}
            <div
              style={{
                fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12,
                color: 'rgba(250,245,235,0.6)', textTransform: 'uppercase',
                letterSpacing: '0.08em', marginBottom: 10,
              }}
            >
              Plantel destacado
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {selected.roster.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px',
                    background: 'rgba(255,255,255,0.03)',
                    borderRadius: 10,
                    border: '1px solid rgba(255,220,180,0.05)',
                  }}
                >
                  <div
                    style={{
                      width: 34, height: 34, borderRadius: 10,
                      background: `${selected.color}1a`, color: selected.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'Archivo', fontWeight: 800, fontSize: 13,
                    }}
                  >
                    {p.number}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13, color: '#FAF5EB' }}>
                      {p.name}
                    </div>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.5)' }}>
                      {p.position}
                    </div>
                  </div>
                  <Trophy size={14} color={selected.color} />
                </div>
              ))}
            </div>

            {/* Join button */}
            <button
              onClick={() => handleJoin(selected)}
              disabled={joined[selected.name]}
              style={{
                marginTop: 18, width: '100%',
                padding: '14px 20px', borderRadius: 14,
                background: joined[selected.name]
                  ? 'rgba(204, 255, 0, 0.15)'
                  : `linear-gradient(135deg, ${selected.color}, ${selected.color}cc)`,
                color: joined[selected.name] ? selected.color : '#0F0D0A',
                border: joined[selected.name] ? `1px solid ${selected.color}66` : 'none',
                fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 14,
                letterSpacing: '0.06em', textTransform: 'uppercase',
                cursor: joined[selected.name] ? 'default' : 'pointer',
                boxShadow: joined[selected.name] ? 'none' : `0 8px 24px ${selected.color}55`,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 200ms',
              }}
            >
              {joined[selected.name] ? (
                <>
                  <Check size={16} /> Ya eres miembro
                </>
              ) : (
                'Unirse al equipo'
              )}
            </button>
          </>
        )}
      </BottomSheet>

      <MatchPredictionSheet
        match={predictionMatch}
        onClose={() => setPredictionMatch(null)}
      />

      {/* Team Matcher AI */}
      <BottomSheet
        open={matcherOpen}
        onClose={() => setMatcherOpen(false)}
        title="Match AI · Tu equipo ideal"
        accent="#B347FF"
        height="82%"
      >
        {!matcherDone ? (
          <div>
            {/* Progress */}
            <div style={{ display: 'flex', gap: 6, marginBottom: 18 }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  flex: 1, height: 4, borderRadius: 2,
                  background: i <= mStep ? '#B347FF' : 'rgba(255,220,180,0.1)',
                  transition: 'background 200ms',
                }} />
              ))}
            </div>

            {mStep === 0 && (
              <QuizStep
                question="¿Qué estilo de juego te gusta?"
                options={[
                  { value: 'ofensivo', label: 'Ofensivo', emoji: '⚽' },
                  { value: 'defensivo', label: 'Defensivo', emoji: '🛡' },
                  { value: 'tocar', label: 'De toque', emoji: '🎯' },
                  { value: 'intenso', label: 'Intenso', emoji: '🔥' },
                ] as { value: PlayStyle; label: string; emoji: string }[]}
                onSelect={v => answer('style', v)}
              />
            )}
            {mStep === 1 && (
              <QuizStep
                question="¿Cuándo podés jugar?"
                options={[
                  { value: 'sabado',   label: 'Sábados',   emoji: '📅' },
                  { value: 'domingo',  label: 'Domingos',  emoji: '☀️' },
                  { value: 'semana',   label: 'Entre semana', emoji: '💼' },
                  { value: 'flexible', label: 'Flexible',  emoji: '🔄' },
                ] as { value: PlayDay; label: string; emoji: string }[]}
                onSelect={v => answer('day', v)}
              />
            )}
            {mStep === 2 && (
              <QuizStep
                question="¿Qué nivel buscás?"
                options={[
                  { value: 'casual',       label: 'Casual',       emoji: '😎' },
                  { value: 'competitivo',  label: 'Competitivo',  emoji: '💪' },
                  { value: 'profesional',  label: 'Profesional',  emoji: '🏆' },
                ] as { value: PlayLevel; label: string; emoji: string }[]}
                onSelect={v => answer('level', v)}
              />
            )}
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <Sparkles size={13} color="#B347FF" />
              <div style={{
                fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
                color: '#B347FF', letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                Encontré {matcherResults.length} match{matcherResults.length === 1 ? '' : 'es'}
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {matcherResults.map((m, i) => {
                const team = TEAMS.find(t => t.name === m.team.name)!
                return (
                  <div
                    key={m.team.id}
                    onClick={() => { setMatcherOpen(false); setSelected(team) }}
                    style={{
                      padding: 14, borderRadius: 14,
                      background: i === 0
                        ? 'linear-gradient(135deg, rgba(204, 255, 0, 0.12), rgba(179, 71, 255, 0.08))'
                        : 'rgba(255, 255, 255, 0.04)',
                      border: i === 0
                        ? '1px solid rgba(204, 255, 0, 0.4)'
                        : '1px solid rgba(255, 220, 180, 0.08)',
                      cursor: 'pointer', position: 'relative',
                    }}
                  >
                    {i === 0 && (
                      <div style={{
                        position: 'absolute', top: -8, left: 12,
                        padding: '3px 10px', borderRadius: 999,
                        background: 'linear-gradient(135deg, #CCFF00, #FFB800)',
                        color: '#0F0D0A',
                        fontFamily: 'Archivo', fontWeight: 800, fontSize: 10,
                        letterSpacing: '0.1em', textTransform: 'uppercase',
                        boxShadow: '0 4px 12px rgba(204, 255, 0, 0.4)',
                      }}>
                        🏆 Top match
                      </div>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 48, height: 48, borderRadius: 12,
                        background: `${m.team.color}22`, color: m.team.color,
                        border: `2px solid ${m.team.color}66`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Archivo', fontWeight: 800, fontSize: 16,
                        boxShadow: `0 0 14px ${m.team.color}44`,
                        flexShrink: 0,
                      }}>
                        {m.team.badge}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{
                          fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 15,
                          color: '#FAF5EB', marginBottom: 2,
                        }}>
                          {m.team.name}
                        </div>
                        <div style={{
                          fontFamily: 'Space Grotesk', fontSize: 11,
                          color: 'rgba(250, 245, 235, 0.7)', lineHeight: 1.35,
                        }}>
                          {m.reason}
                        </div>
                      </div>
                      <div style={{
                        fontFamily: 'Archivo', fontStyle: 'italic', fontWeight: 900,
                        fontSize: 22, color: i === 0 ? '#CCFF00' : '#FAF5EB',
                        textShadow: i === 0 ? '0 0 12px rgba(204,255,0,0.5)' : 'none',
                        flexShrink: 0,
                      }}>
                        {m.score}%
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            <button
              onClick={restartMatcher}
              style={{
                marginTop: 16, width: '100%',
                padding: '12px 14px', borderRadius: 12,
                background: 'rgba(179, 71, 255, 0.12)',
                border: '1px solid rgba(179, 71, 255, 0.35)',
                color: '#B347FF',
                fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12,
                letterSpacing: '0.08em', textTransform: 'uppercase',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <Wand2 size={13} /> Rehacer quiz
            </button>
          </div>
        )}
      </BottomSheet>

      <EventsSheet open={eventsOpen} onClose={() => setEventsOpen(false)} />
      <BottomNav />
    </div>
  )
}

function QuizStep<T extends string>({
  question, options, onSelect,
}: {
  question: string
  options: { value: T; label: string; emoji: string }[]
  onSelect: (v: T) => void
}) {
  return (
    <div>
      <div style={{
        fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 20,
        color: '#FAF5EB', lineHeight: 1.2, marginBottom: 18,
        letterSpacing: '-0.01em',
      }}>
        {question}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {options.map(o => (
          <button
            key={o.value}
            onClick={() => onSelect(o.value)}
            style={{
              padding: '14px 16px', borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 220, 180, 0.1)',
              color: '#FAF5EB', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 14,
              textAlign: 'left',
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 600,
              transition: 'all 160ms',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(179, 71, 255, 0.5)'
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255, 220, 180, 0.1)'
            }}
          >
            <span style={{ fontSize: 20 }}>{o.emoji}</span>
            <span style={{ flex: 1 }}>{o.label}</span>
            <ChevronRight size={16} color="rgba(250,245,235,0.4)" />
          </button>
        ))}
      </div>
    </div>
  )
}

function MiniBadge({ color, label }: { color: string; label: string }) {
  return (
    <div
      style={{
        width: 32, height: 32, borderRadius: 8,
        background: `${color}22`, color,
        border: `1.5px solid ${color}66`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 11,
        flexShrink: 0,
      }}
    >
      {label}
    </div>
  )
}
