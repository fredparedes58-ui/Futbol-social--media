import { useState, useMemo } from 'react'
import { Flame, Trophy, Zap, Heart, MessageCircle, Share2, Copy, Link as LinkIcon, Send, Bell, Sparkles, RefreshCw, Newspaper, Film, Play, Scissors } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import BottomNav from '../components/ui/BottomNav'
import GlassCard from '../components/ui/GlassCard'
import FloatingOrbs from '../components/ui/FloatingOrbs'
import BottomSheet from '../components/ui/BottomSheet'
import LikeBurst from '../components/ui/LikeBurst'
import { Skeleton, SkeletonCircle } from '../components/ui/Skeleton'
import NotificationsPanel from '../components/ui/NotificationsPanel'
import { useSimulatedLoad } from '../hooks/useSimulatedLoad'
import { useNotifications } from '../context/NotificationsContext'
import { generateMatchRecap, suggestMediaTags, generateWeeklyDigest, suggestVideoClips, clipEmoji, formatClipTime, type MatchFact, type MatchRecap, type Tone, type Lang, type VideoClip } from '../lib/aiMocks'
import LiveTicker from '../components/ui/LiveTicker'
import AIBorder from '../components/ui/AIBorder'
import LineupSheet from '../components/ui/LineupSheet'
import RivalScoutSheet from '../components/ui/RivalScoutSheet'
import RippleButton from '../components/ui/RippleButton'
import LiveMatchSheet from '../components/ui/LiveMatchSheet'
import StoriesStrip from '../features/stories/StoriesStrip'
import TacticsBoardSheet from '../features/tactics/TacticsBoardSheet'
import EventsSheet from '../features/events/EventsSheet'
import PollCard from '../features/polls/PollCard'
import { Calendar as CalendarIcon } from 'lucide-react'

interface Post {
  id: number
  team: string
  action: string
  time: string
  likes: number
  comments: number
  badge: string
  color: string
  image: string
}

// Hechos reales del partido — en producción vendrían del backend.
const RECAP_FACTS: MatchFact = {
  home: 'Los Pumas FC',
  away: 'Rayo Urbano',
  homeScore: 3,
  awayScore: 1,
  topScorer: { name: 'Carlos Méndez', goals: 2, team: 'home' },
  keyMoment: { minute: 62, description: 'Rayo Urbano falló un penal clave' },
  attendance: 240,
}

const INITIAL_POSTS: Post[] = [
  {
    id: 1, team: 'Los Pumas FC', action: 'ganaron 3-1 vs Rayo Urbano',
    time: 'hace 2 h', likes: 47, comments: 12, badge: 'PF', color: '#CCFF00',
    image: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80',
  },
  {
    id: 2, team: 'Carlos Méndez', action: 'marcó un hat-trick 🔥',
    time: 'hace 4 h', likes: 128, comments: 34, badge: 'CM', color: '#FFB800',
    image: 'https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80',
  },
  {
    id: 3, team: 'Torneo Regional', action: 'cuartos de final este domingo',
    time: 'hace 6 h', likes: 89, comments: 21, badge: 'TR', color: '#FF5B3A',
    image: 'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=800&q=80',
  },
]

const MOCK_COMMENTS: Record<number, { user: string; text: string; time: string; badge: string; color: string }[]> = {
  1: [
    { user: 'Carlos M.',    text: '¡Qué partidazo! 🔥',           time: '1 h',   badge: 'CM', color: '#FFB800' },
    { user: 'Ana Torres',   text: 'El gol del minuto 80 fue épico', time: '45 m', badge: 'AT', color: '#CCFF00' },
    { user: 'Diego S.',     text: 'Vamos Pumas! 💪',                time: '30 m', badge: 'DS', color: '#FF5B3A' },
  ],
  2: [
    { user: 'Los Pumas FC', text: 'Crack total',                    time: '2 h',  badge: 'LP', color: '#CCFF00' },
    { user: 'Entrenador R.', text: 'Entrenamiento bien invertido',  time: '1 h',  badge: 'ER', color: '#FFB800' },
  ],
  3: [
    { user: 'Liga Regional', text: 'Nos vemos en las canchas',      time: '3 h',  badge: 'LR', color: '#CCFF00' },
  ],
}

export default function HomePage() {
  const { user, setToast } = useAuth()
  const [posts, setPosts] = useState(INITIAL_POSTS)
  const [liked, setLiked] = useState<Record<number, boolean>>({})
  const [burstId, setBurstId] = useState<number | null>(null)

  const loading = useSimulatedLoad(800)
  const { unread } = useNotifications()
  const [notifOpen, setNotifOpen] = useState(false)

  const [commentsOpen, setCommentsOpen] = useState<Post | null>(null)
  const [shareOpen, setShareOpen] = useState<Post | null>(null)
  const [newComment, setNewComment] = useState('')

  // AI Recap (feature 3 del tier 1)
  const [recapTone, setRecapTone] = useState<Tone>('casual')
  const [recapLang, setRecapLang] = useState<Lang>('es')
  const [recap, setRecap] = useState<MatchRecap>(() =>
    generateMatchRecap(RECAP_FACTS, { tone: 'casual', lang: 'es' })
  )
  const [recapOpen, setRecapOpen] = useState(false)
  const [recapRegen, setRecapRegen] = useState(false)
  const [clips, setClips] = useState<VideoClip[] | null>(null)
  const [clipsLoading, setClipsLoading] = useState(false)

  function generateClips() {
    if (clipsLoading) return
    setClipsLoading(true)
    if ('vibrate' in navigator) navigator.vibrate(12)
    setTimeout(() => {
      setClips(suggestVideoClips({
        duration: 5400,
        title: `${RECAP_FACTS.home} vs ${RECAP_FACTS.away}`,
        homeScore: RECAP_FACTS.homeScore,
        awayScore: RECAP_FACTS.awayScore,
        topScorer: RECAP_FACTS.topScorer?.name,
      }))
      setClipsLoading(false)
      setToast('Clips generados')
    }, 900)
  }

  function regenerateRecap(overrideTone?: Tone, overrideLang?: Lang) {
    const t = overrideTone ?? recapTone
    const l = overrideLang ?? recapLang
    setRecapRegen(true)
    if ('vibrate' in navigator) navigator.vibrate(10)
    setTimeout(() => {
      // Rotamos el minuto del momento clave para introducir variación
      const rotated: MatchFact = {
        ...RECAP_FACTS,
        keyMoment: {
          ...RECAP_FACTS.keyMoment!,
          minute: Math.floor(20 + Math.random() * 70),
        },
      }
      setRecap(generateMatchRecap(rotated, { tone: t, lang: l }))
      setRecapRegen(false)
      setToast(l === 'en' ? 'Recap regenerated' : 'Recap regenerado')
    }, 700)
  }

  function changeRecapTone(t: Tone) {
    setRecapTone(t)
    setRecap(generateMatchRecap(RECAP_FACTS, { tone: t, lang: recapLang }))
    if ('vibrate' in navigator) navigator.vibrate(8)
  }

  // Weekly Digest (Tier 3)
  const [digestOpen, setDigestOpen] = useState(false)

  // Tier 5 — auto-alineación + rival scouting
  const [lineupOpen, setLineupOpen] = useState(false)
  const [scoutOpen, setScoutOpen] = useState(false)
  const [liveOpen, setLiveOpen] = useState(false)
  const [tacticsOpen, setTacticsOpen] = useState(false)
  const [eventsOpen, setEventsOpen] = useState(false)
  const NEXT_OPPONENT = 'Águilas Doradas'
  const digest = useMemo(() => generateWeeklyDigest({
    userName: user?.name ?? 'Alex Rivera',
    matchesPlayed: 3,
    goals: 4,
    assists: 2,
    wins: 2, losses: 1, draws: 0,
    topPostLikes: 47,
    nextMatch: { opponent: 'Águilas Doradas', when: 'Dom 10:00 · Cancha B' },
  }), [user?.name])

  function changeRecapLang(l: Lang) {
    setRecapLang(l)
    setRecap(generateMatchRecap(RECAP_FACTS, { tone: recapTone, lang: l }))
    if ('vibrate' in navigator) navigator.vibrate(8)
  }

  function toggleLike(p: Post) {
    const isLiked = liked[p.id]
    setLiked(s => ({ ...s, [p.id]: !isLiked }))
    setPosts(s =>
      s.map(x => (x.id === p.id ? { ...x, likes: x.likes + (isLiked ? -1 : 1) } : x))
    )
    if (!isLiked) {
      setBurstId(p.id)
      setTimeout(() => setBurstId(null), 700)
      try { navigator.vibrate?.(30) } catch { /* ignore */ }
    }
  }

  function sendComment() {
    if (!newComment.trim() || !commentsOpen) return
    // Mock push — adds locally only
    const list = MOCK_COMMENTS[commentsOpen.id] ?? []
    list.unshift({
      user: user?.name ?? 'Tú',
      text: newComment,
      time: 'ahora',
      badge: (user?.name ?? 'T').split(' ').map(n => n[0]).join('').slice(0, 2),
      color: '#CCFF00',
    })
    MOCK_COMMENTS[commentsOpen.id] = list
    setPosts(s => s.map(x => (x.id === commentsOpen.id ? { ...x, comments: x.comments + 1 } : x)))
    setNewComment('')
    setToast('Comentario enviado')
  }

  function copyLink() {
    if (!shareOpen) return
    navigator.clipboard?.writeText(`futbolbase.app/post/${shareOpen.id}`).catch(() => {})
    setToast('Enlace copiado al portapapeles')
    setShareOpen(null)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-deep, #0F0D0A)', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <FloatingOrbs
          orbs={[
            { x: 85, y: 6,  size: 260, color: '#CCFF00', opacity: 0.22, dur: 16 },
            { x: 8,  y: 58, size: 300, color: '#FFB800', opacity: 0.18, dur: 20 },
            { x: 55, y: 92, size: 380, color: '#B347FF', opacity: 0.20, dur: 26 },
            { x: 90, y: 75, size: 220, color: '#FF5B3A', opacity: 0.14, dur: 22 },
          ]}
        />
      </div>

      <div
        className="screen-scroll"
        style={{ position: 'absolute', inset: 0, zIndex: 2, overflowY: 'auto', paddingBottom: 90 }}
      >
        {/* Header */}
        <div style={{ padding: '60px 20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: 'rgba(250, 245, 235, 0.6)' }}>
              Hola, {user?.name.split(' ')[0] ?? 'jugador'}
            </div>
            <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 28, color: '#FAF5EB', letterSpacing: '-0.02em' }}>
              Tu feed
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setDigestOpen(true)}
            aria-label="Digest semanal"
            style={{
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(179, 71, 255, 0.15)',
              border: '1px solid rgba(179, 71, 255, 0.35)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#B347FF', cursor: 'pointer',
            }}
          >
            <Newspaper size={18} />
          </button>
          <button
            onClick={() => setNotifOpen(true)}
            style={{
              position: 'relative',
              width: 42, height: 42, borderRadius: 12,
              background: 'rgba(204, 255, 0, 0.15)',
              border: '1px solid rgba(204, 255, 0, 0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#CCFF00', cursor: 'pointer',
            }}
          >
            <Bell size={20} />
            {unread > 0 && (
              <div
                style={{
                  position: 'absolute', top: -4, right: -4,
                  minWidth: 20, height: 20, padding: '0 5px', borderRadius: 999,
                  background: '#FF5B3A', color: '#0F0D0A',
                  fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 11,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 0 10px rgba(255, 91, 58, 0.65)',
                  border: '2px solid #0F0D0A',
                }}
              >
                {unread}
              </div>
            )}
          </button>
          </div>
        </div>

        {/* Live ticker */}
        <div style={{ marginBottom: 10 }}>
          <LiveTicker />
        </div>

        {/* Stories */}
        <div style={{ marginBottom: 14 }}>
          <StoriesStrip />
        </div>

        {/* Encuesta de la comunidad */}
        <div style={{ padding: '0 20px 14px' }}>
          <PollCard
            id="mvp-jornada-42"
            question="¿Quién fue el MVP de la jornada?"
            options={[
              { id: 'o1', label: 'Carlos Méndez',  votes: 48, color: '#CCFF00' },
              { id: 'o2', label: 'Leo Vargas',     votes: 31, color: '#FFB800' },
              { id: 'o3', label: 'Diego Pérez',    votes: 22, color: '#00D4FF' },
              { id: 'o4', label: 'Martín Ríos',    votes: 14, color: '#B347FF' },
            ]}
            totalVoters={140}
          />
        </div>

        {/* Eventos CTA */}
        <div style={{ padding: '0 20px 14px' }}>
          <button
            onClick={() => setEventsOpen(true)}
            style={{
              width: '100%', padding: '14px 16px', borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(0,212,255,0.16), rgba(179,71,255,0.08))',
              border: '1px solid rgba(0,212,255,0.45)',
              color: '#FAF5EB', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: 12,
              boxShadow: '0 0 18px rgba(0,212,255,0.14)',
            }}
          >
            <div style={{
              width: 40, height: 40, borderRadius: 10,
              background: 'rgba(0,212,255,0.18)', color: '#00D4FF',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CalendarIcon size={18} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 14 }}>
                Eventos cerca tuyo
              </div>
              <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.55)' }}>
                4 partidos abiertos · RSVP en 1 tap
              </div>
            </div>
            <span style={{ color: '#00D4FF', fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12 }}>Ver →</span>
          </button>
        </div>

        {/* CTAs Tier 5: alineación + scouting */}
        <div style={{ padding: '0 20px 16px', display: 'flex', gap: 10 }}>
          <button
            onClick={() => setLineupOpen(true)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(204,255,0,0.15), rgba(255,184,0,0.10))',
              border: '1px solid rgba(204, 255, 0, 0.4)',
              color: '#FAF5EB',
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer',
              fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12,
              textAlign: 'left',
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'rgba(204,255,0,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#CCFF00',
              fontFamily: 'Archivo', fontWeight: 900, fontSize: 10,
              flexShrink: 0, letterSpacing: '0.04em',
            }}>
              11
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'Space Grotesk', fontSize: 9,
                color: 'rgba(250,245,235,0.5)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                Alineación AI
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#FAF5EB' }}>
                Ver formación
              </div>
            </div>
          </button>

          <button
            onClick={() => setScoutOpen(true)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(255,91,58,0.12), rgba(179,71,255,0.10))',
              border: '1px solid rgba(255, 91, 58, 0.4)',
              color: '#FAF5EB',
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer',
              fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12,
              textAlign: 'left',
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'rgba(255,91,58,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#FF5B3A',
              flexShrink: 0,
            }}>
              <Sparkles size={14} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'Space Grotesk', fontSize: 9,
                color: 'rgba(250,245,235,0.5)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                Scouting
              </div>
              <div style={{
                fontSize: 12, fontWeight: 700, color: '#FAF5EB',
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {NEXT_OPPONENT}
              </div>
            </div>
          </button>

          <button
            onClick={() => setLiveOpen(true)}
            style={{
              flex: 1, padding: '10px 12px', borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(0,212,255,0.14), rgba(179,71,255,0.10))',
              border: '1px solid rgba(0, 212, 255, 0.4)',
              color: '#FAF5EB',
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer',
              fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12,
              textAlign: 'left',
            }}
          >
            <div style={{
              width: 30, height: 30, borderRadius: 8,
              background: 'rgba(0,212,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#00D4FF',
              flexShrink: 0,
              position: 'relative',
            }}>
              <span style={{
                position: 'absolute', top: 3, right: 3,
                width: 6, height: 6, borderRadius: '50%',
                background: '#FF5B3A', boxShadow: '0 0 6px #FF5B3A',
                animation: 'pulse-glow 1.2s ease-in-out infinite',
              }} />
              <Play size={14} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'Space Grotesk', fontSize: 9,
                color: 'rgba(250,245,235,0.5)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                Live · AI
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#FAF5EB' }}>
                Partido en vivo
              </div>
            </div>
          </button>
        </div>

        {/* 4° CTA — pizarra táctica (fila separada) */}
        <div style={{ padding: '0 20px 16px' }}>
          <button
            onClick={() => setTacticsOpen(true)}
            style={{
              width: '100%',
              padding: '10px 14px', borderRadius: 12,
              background: 'linear-gradient(135deg, rgba(0,212,255,0.12), rgba(204,255,0,0.08))',
              border: '1px solid rgba(0, 212, 255, 0.35)',
              color: '#FAF5EB',
              display: 'flex', alignItems: 'center', gap: 10,
              cursor: 'pointer',
              fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13,
              textAlign: 'left',
              boxShadow: '0 0 12px rgba(0,212,255,0.12)',
            }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'rgba(0,212,255,0.18)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#00D4FF',
              fontFamily: 'Archivo', fontWeight: 900, fontSize: 12,
              flexShrink: 0, letterSpacing: '0.04em',
            }}>
              TAC
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontFamily: 'Space Grotesk', fontSize: 9,
                color: 'rgba(250,245,235,0.5)',
                letterSpacing: '0.12em', textTransform: 'uppercase',
              }}>
                Pizarra táctica
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: '#FAF5EB' }}>
                Arrastrá tus 11 — drag-drop
              </div>
            </div>
            <span style={{ color: '#00D4FF', fontSize: 18 }}>→</span>
          </button>
        </div>

        {/* Stats strip */}
        <div style={{ padding: '0 20px 20px', display: 'flex', gap: 10 }}>
          {[
            { icon: Trophy, label: 'Goles',       value: '32', color: '#CCFF00' },
            { icon: Zap,    label: 'Asistencias', value: '15', color: '#FFB800' },
            { icon: Flame,  label: 'MVPs',        value: '5',  color: '#FF5B3A' },
          ].map((s, i) => {
            const I = s.icon
            return (
              <GlassCard key={i} accent={s.color} padding={14} style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      background: `${s.color}22`, color: s.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    <I size={16} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 18, color: '#FAF5EB' }}>
                      {s.value}
                    </div>
                    <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 10, color: 'rgba(250, 245, 235, 0.5)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {s.label}
                    </div>
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>

        {/* Feed */}
        <div style={{ padding: '0 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          {loading && Array.from({ length: 2 }).map((_, i) => (
            <div
              key={`sk-${i}`}
              style={{
                padding: 0,
                borderRadius: 16,
                overflow: 'hidden',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,220,180,0.06)',
              }}
            >
              <Skeleton width="100%" height={180} radius={0} />
              <div style={{ padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <SkeletonCircle size={36} />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <Skeleton width="60%" height={12} />
                    <Skeleton width="35%" height={10} />
                  </div>
                </div>
                <Skeleton width="90%" height={12} style={{ marginBottom: 8 }} />
                <Skeleton width="70%" height={12} style={{ marginBottom: 14 }} />
                <div style={{ display: 'flex', gap: 18 }}>
                  <Skeleton width={60} height={14} />
                  <Skeleton width={60} height={14} />
                  <Skeleton width={60} height={14} />
                </div>
              </div>
            </div>
          ))}
          {/* AI Recap card — generated post */}
          {!loading && (
          <AIBorder colors={['#B347FF', '#00D4FF', '#CCFF00', '#B347FF']} radius={16} speed={9} halo={0.45}>
            <div
              onClick={() => setRecapOpen(true)}
              style={{
                padding: 16,
                background: 'linear-gradient(135deg, rgba(179, 71, 255, 0.18), rgba(204, 255, 0, 0.08))',
                cursor: 'pointer',
                position: 'relative',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <div
                  style={{
                    width: 26, height: 26, borderRadius: 8,
                    background: 'rgba(179, 71, 255, 0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#B347FF',
                  }}
                >
                  <Sparkles size={14} />
                </div>
                <div style={{
                  fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                  color: '#B347FF', letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>
                  Recap generado por AI
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); regenerateRecap() }}
                  aria-label="Regenerar recap"
                  disabled={recapRegen}
                  style={{
                    marginLeft: 'auto',
                    width: 28, height: 28, borderRadius: 8,
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(179, 71, 255, 0.3)',
                    color: '#B347FF', cursor: recapRegen ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    opacity: recapRegen ? 0.5 : 1,
                  }}
                >
                  <RefreshCw size={13} style={{ animation: recapRegen ? 'spin 700ms linear infinite' : 'none' }} />
                </button>
              </div>
              <div style={{
                fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 17,
                color: '#FAF5EB', lineHeight: 1.25, marginBottom: 6, letterSpacing: '-0.01em',
              }}>
                {recap.headline}
              </div>
              <div style={{
                fontFamily: 'Space Grotesk', fontSize: 12, lineHeight: 1.4,
                color: 'rgba(250, 245, 235, 0.7)', marginBottom: 12,
              }}>
                {recap.tagline}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {recap.highlights.slice(0, 3).map((h, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '4px 10px', borderRadius: 999,
                      background: 'rgba(255, 255, 255, 0.06)',
                      border: '1px solid rgba(255, 220, 180, 0.08)',
                      fontFamily: 'Space Grotesk', fontSize: 11,
                      color: 'rgba(250, 245, 235, 0.8)',
                    }}
                  >
                    {h}
                  </div>
                ))}
              </div>
              <div style={{
                marginTop: 10, fontFamily: 'Space Grotesk', fontSize: 11,
                color: '#CCFF00', fontWeight: 600,
              }}>
                Leer recap completo →
              </div>
            </div>
          </AIBorder>
          )}

          {!loading && posts.map(p => {
            const isLiked = !!liked[p.id]
            return (
              <GlassCard key={p.id} accent={p.color} padding={0}>
                {/* Image */}
                <div
                  style={{
                    height: 180,
                    backgroundImage: `url(${p.image})`,
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    position: 'relative',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute', inset: 0,
                      background: 'linear-gradient(180deg, transparent 40%, rgba(15,13,10,0.8) 100%)',
                    }}
                  />
                  <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: 10,
                        background: p.color, color: '#0F0D0A',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 14,
                        boxShadow: `0 0 12px ${p.color}66`,
                      }}
                    >
                      {p.badge}
                    </div>
                    <div>
                      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14, color: '#FAF5EB' }}>
                        {p.team}
                      </div>
                      <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: 'rgba(250, 245, 235, 0.6)' }}>
                        {p.time}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding: 14 }}>
                  <div
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 14, color: '#FAF5EB', lineHeight: 1.4,
                      marginBottom: 10,
                    }}
                  >
                    {p.action}
                  </div>

                  {/* AI tags */}
                  <div style={{
                    display: 'flex', gap: 5, flexWrap: 'wrap',
                    alignItems: 'center', marginBottom: 12,
                  }}>
                    <Sparkles size={11} color="#B347FF" style={{ opacity: 0.7 }} />
                    {suggestMediaTags({ caption: p.action, team: p.team }).slice(0, 4).map((t, i) => (
                      <div
                        key={`${p.id}-tag-${i}`}
                        style={{
                          padding: '2px 8px', borderRadius: 999,
                          background: 'rgba(179, 71, 255, 0.08)',
                          border: '1px solid rgba(179, 71, 255, 0.25)',
                          fontFamily: 'Space Grotesk, sans-serif', fontSize: 10,
                          color: 'rgba(250, 245, 235, 0.75)', fontWeight: 600,
                        }}
                      >
                        {t.label}
                      </div>
                    ))}
                  </div>

                  {/* Actions bar */}
                  <div style={{ display: 'flex', gap: 18, color: 'rgba(250, 245, 235, 0.6)', alignItems: 'center' }}>
                    {/* Like */}
                    <button
                      onClick={() => toggleLike(p)}
                      style={{
                        position: 'relative',
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: isLiked ? '#FF5B3A' : 'rgba(250, 245, 235, 0.6)',
                        fontFamily: 'Space Grotesk, sans-serif', fontSize: 12,
                        transition: 'color 0.15s',
                        padding: 0,
                      }}
                    >
                      <div style={{ position: 'relative', width: 15, height: 15 }}>
                        <Heart
                          size={15}
                          fill={isLiked ? '#FF5B3A' : 'none'}
                          style={{
                            transition: 'transform 0.2s',
                            transform: isLiked ? 'scale(1.15)' : 'scale(1)',
                            filter: isLiked ? 'drop-shadow(0 0 6px rgba(255,91,58,0.6))' : 'none',
                          }}
                        />
                        <LikeBurst show={burstId === p.id} />
                      </div>
                      <span
                        key={`${p.id}-${p.likes}`}
                        style={{
                          fontVariantNumeric: 'tabular-nums',
                          display: 'inline-block',
                          animation: burstId === p.id ? 'count-pop 420ms ease-out' : 'none',
                        }}
                      >
                        {p.likes}
                      </span>
                    </button>

                    {/* Comments */}
                    <button
                      onClick={() => setCommentsOpen(p)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 6,
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'rgba(250, 245, 235, 0.6)',
                        fontFamily: 'Space Grotesk, sans-serif', fontSize: 12,
                        padding: 0,
                      }}
                    >
                      <MessageCircle size={15} /> {p.comments}
                    </button>

                    {/* Share */}
                    <button
                      onClick={() => setShareOpen(p)}
                      style={{
                        marginLeft: 'auto',
                        display: 'flex', alignItems: 'center', gap: 5,
                        background: 'transparent', border: 'none', cursor: 'pointer',
                        color: 'rgba(250, 245, 235, 0.6)',
                        padding: 0,
                      }}
                    >
                      <Share2 size={15} />
                    </button>
                  </div>
                </div>
              </GlassCard>
            )
          })}
        </div>
      </div>

      <BottomNav />

      {/* Comments sheet */}
      <BottomSheet
        open={!!commentsOpen}
        onClose={() => setCommentsOpen(null)}
        title={commentsOpen ? `${commentsOpen.comments} comentarios` : ''}
        accent="#CCFF00"
        height="72%"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, paddingBottom: 16 }}>
          {commentsOpen && (MOCK_COMMENTS[commentsOpen.id] ?? []).map((c, i) => (
            <div key={i} style={{ display: 'flex', gap: 12 }}>
              <div
                style={{
                  width: 36, height: 36, borderRadius: '50%',
                  background: `${c.color}22`, color: c.color,
                  border: `1.5px solid ${c.color}66`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12,
                  flexShrink: 0,
                }}
              >
                {c.badge}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 13, color: '#FAF5EB' }}>
                    {c.user}
                  </div>
                  <div style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 11, color: 'rgba(250, 245, 235, 0.4)' }}>
                    {c.time}
                  </div>
                </div>
                <div style={{ marginTop: 3, fontFamily: 'Space Grotesk, sans-serif', fontSize: 13, color: 'rgba(250, 245, 235, 0.85)', lineHeight: 1.4 }}>
                  {c.text}
                </div>
              </div>
            </div>
          ))}
          {commentsOpen && !MOCK_COMMENTS[commentsOpen.id]?.length && (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(250, 245, 235, 0.4)', fontFamily: 'Space Grotesk, sans-serif', fontSize: 13 }}>
              Sé el primero en comentar 💬
            </div>
          )}
        </div>

        {/* Composer */}
        <div
          style={{
            position: 'sticky', bottom: 0, marginTop: 8,
            padding: '12px 0',
            background: 'linear-gradient(180deg, transparent, #141009 30%)',
            display: 'flex', gap: 8, alignItems: 'center',
          }}
        >
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendComment() }}
            placeholder="Escribe un comentario..."
            style={{
              flex: 1, height: 42, padding: '0 14px', borderRadius: 999,
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 220, 180, 0.12)',
              color: '#FAF5EB',
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 14,
              outline: 'none',
            }}
          />
          <button
            onClick={sendComment}
            disabled={!newComment.trim()}
            style={{
              width: 42, height: 42, borderRadius: '50%',
              background: newComment.trim() ? '#CCFF00' : 'rgba(255, 255, 255, 0.08)',
              color: newComment.trim() ? '#0F0D0A' : 'rgba(250, 245, 235, 0.3)',
              border: 'none',
              cursor: newComment.trim() ? 'pointer' : 'not-allowed',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: newComment.trim() ? '0 0 14px rgba(204, 255, 0, 0.5)' : 'none',
              transition: 'all 0.15s',
            }}
          >
            <Send size={16} />
          </button>
        </div>
      </BottomSheet>

      {/* Share sheet */}
      <BottomSheet
        open={!!shareOpen}
        onClose={() => setShareOpen(null)}
        title="Compartir"
        accent="#FFB800"
        height="45%"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={copyLink}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: 14, borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 220, 180, 0.08)',
              color: '#FAF5EB', cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 600,
              textAlign: 'left',
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(204, 255, 0, 0.15)', color: '#CCFF00', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LinkIcon size={18} />
            </div>
            Copiar enlace
          </button>
          <button
            onClick={() => { setToast('Compartido en tu historia'); setShareOpen(null) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: 14, borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 220, 180, 0.08)',
              color: '#FAF5EB', cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 600,
              textAlign: 'left',
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255, 184, 0, 0.15)', color: '#FFB800', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={18} />
            </div>
            Agregar a tu historia
          </button>
          <button
            onClick={() => { setToast('Mensaje enviado al chat'); setShareOpen(null) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: 14, borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 220, 180, 0.08)',
              color: '#FAF5EB', cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 600,
              textAlign: 'left',
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(255, 91, 58, 0.15)', color: '#FF5B3A', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Send size={18} />
            </div>
            Enviar por chat
          </button>
          <button
            onClick={() => { navigator.clipboard?.writeText(shareOpen?.action ?? ''); setToast('Texto copiado'); setShareOpen(null) }}
            style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: 14, borderRadius: 14,
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid rgba(255, 220, 180, 0.08)',
              color: '#FAF5EB', cursor: 'pointer',
              fontFamily: 'Space Grotesk, sans-serif', fontSize: 14, fontWeight: 600,
              textAlign: 'left',
            }}
          >
            <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(250, 245, 235, 0.1)', color: 'rgba(250, 245, 235, 0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Copy size={18} />
            </div>
            Copiar texto
          </button>
        </div>
      </BottomSheet>

      <NotificationsPanel open={notifOpen} onClose={() => setNotifOpen(false)} />

      {/* Weekly Digest (Tier 3) */}
      <BottomSheet
        open={digestOpen}
        onClose={() => setDigestOpen(false)}
        title="Tu semana en FútbolBase"
        accent="#B347FF"
        height="80%"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Sparkles size={13} color="#B347FF" />
          <div style={{
            fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
            color: '#B347FF', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            Digest AI · últimos 7 días
          </div>
        </div>

        <div style={{
          fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 22,
          color: '#FAF5EB', lineHeight: 1.2, letterSpacing: '-0.02em',
          marginBottom: 10,
        }}>
          {digest.title}
        </div>

        <div style={{
          padding: '12px 14px', borderRadius: 12,
          background: 'linear-gradient(135deg, rgba(204, 255, 0, 0.08), rgba(179, 71, 255, 0.05))',
          border: '1px solid rgba(204, 255, 0, 0.25)',
          fontFamily: 'Space Grotesk', fontSize: 13, lineHeight: 1.5,
          color: '#FAF5EB', fontStyle: 'italic',
          marginBottom: 18,
        }}>
          {digest.highlight}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
          {digest.sections.map((s, i) => (
            <div key={i} style={{
              padding: '12px 14px', borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${s.color}33`,
              borderLeft: `3px solid ${s.color}`,
            }}>
              <div style={{
                fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                color: s.color, letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: 4,
              }}>
                {s.label}
              </div>
              <div style={{
                fontFamily: 'Space Grotesk', fontSize: 13, lineHeight: 1.45,
                color: 'rgba(250, 245, 235, 0.88)',
              }}>
                {s.text}
              </div>
            </div>
          ))}
        </div>

        <div style={{
          padding: '14px 16px', borderRadius: 14,
          background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.12), rgba(179, 71, 255, 0.06))',
          border: '1px solid rgba(0, 212, 255, 0.35)',
          fontFamily: 'Space Grotesk', fontSize: 13, lineHeight: 1.5,
          color: '#FAF5EB', fontWeight: 500,
        }}>
          {digest.outlook}
        </div>

        <button
          onClick={() => {
            navigator.clipboard?.writeText(
              `${digest.title}\n\n${digest.highlight}\n\n${digest.sections.map(s => `${s.label}: ${s.text}`).join('\n')}\n\n${digest.outlook}`
            ).catch(() => {})
            setToast('Digest copiado')
          }}
          style={{
            marginTop: 16, width: '100%',
            padding: '12px 14px', borderRadius: 12,
            background: 'linear-gradient(135deg, #CCFF00, #FFB800)',
            border: 'none', color: '#0F0D0A',
            fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 6px 20px rgba(204, 255, 0, 0.35)',
          }}
        >
          <Copy size={13} /> Copiar digest
        </button>
      </BottomSheet>

      {/* AI Recap sheet */}
      <BottomSheet
        open={recapOpen}
        onClose={() => setRecapOpen(false)}
        title="Recap del partido"
        accent="#B347FF"
        height="80%"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Sparkles size={13} color="#B347FF" />
          <div style={{
            fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
            color: '#B347FF', letterSpacing: '0.12em', textTransform: 'uppercase',
          }}>
            Generado por AI · basado en datos del partido
          </div>
        </div>

        <div style={{
          fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 22,
          color: '#FAF5EB', lineHeight: 1.2, letterSpacing: '-0.02em',
          marginBottom: 10,
        }}>
          {recap.headline}
        </div>

        {/* Scoreboard */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center',
          gap: 10, padding: '14px 10px', borderRadius: 14,
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid rgba(255, 220, 180, 0.08)',
          marginBottom: 18,
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.5)', marginBottom: 4 }}>
              {RECAP_FACTS.home}
            </div>
            <div style={{ fontFamily: 'Archivo', fontStyle: 'italic', fontWeight: 900, fontSize: 40, color: '#CCFF00', lineHeight: 1 }}>
              {RECAP_FACTS.homeScore}
            </div>
          </div>
          <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 16, color: '#FF5B3A' }}>VS</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.5)', marginBottom: 4 }}>
              {RECAP_FACTS.away}
            </div>
            <div style={{ fontFamily: 'Archivo', fontStyle: 'italic', fontWeight: 900, fontSize: 40, color: '#FAF5EB', lineHeight: 1 }}>
              {RECAP_FACTS.awayScore}
            </div>
          </div>
        </div>

        <div style={{
          fontFamily: 'Space Grotesk', fontSize: 14, lineHeight: 1.6,
          color: 'rgba(250, 245, 235, 0.9)', marginBottom: 18,
        }}>
          {recap.body}
        </div>

        <div style={{
          fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
          color: 'rgba(250, 245, 235, 0.5)', letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: 10,
        }}>
          Highlights
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
          {recap.highlights.map((h, i) => (
            <div
              key={i}
              style={{
                padding: '10px 12px', borderRadius: 10,
                background: 'rgba(204, 255, 0, 0.05)',
                border: '1px solid rgba(204, 255, 0, 0.18)',
                fontFamily: 'Space Grotesk', fontSize: 13,
                color: '#FAF5EB',
              }}
            >
              {h}
            </div>
          ))}
        </div>

        {/* Video highlights auto-cut */}
        <div style={{ marginBottom: 18 }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            marginBottom: 10,
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 6,
              fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
              color: 'rgba(250, 245, 235, 0.5)', letterSpacing: '0.1em',
              textTransform: 'uppercase',
            }}>
              <Film size={12} color="#00D4FF" />
              Clips auto-cut
            </div>
            {!clips && (
              <button
                onClick={generateClips}
                disabled={clipsLoading}
                style={{
                  padding: '6px 12px', borderRadius: 999,
                  background: 'rgba(0, 212, 255, 0.12)',
                  border: '1px solid rgba(0, 212, 255, 0.45)',
                  color: '#00D4FF',
                  fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
                  letterSpacing: '0.06em', textTransform: 'uppercase',
                  cursor: clipsLoading ? 'default' : 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  opacity: clipsLoading ? 0.6 : 1,
                }}
              >
                <Scissors size={11} style={{ animation: clipsLoading ? 'spin 700ms linear infinite' : 'none' }} />
                {clipsLoading ? 'Analizando…' : 'Generar'}
              </button>
            )}
            {clips && (
              <button
                onClick={generateClips}
                disabled={clipsLoading}
                style={{
                  padding: '6px 10px', borderRadius: 8,
                  background: 'transparent',
                  border: '1px solid rgba(0, 212, 255, 0.3)',
                  color: '#00D4FF',
                  fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 10,
                  cursor: 'pointer',
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                }}
              >
                <RefreshCw size={10} style={{ animation: clipsLoading ? 'spin 700ms linear infinite' : 'none' }} />
                Re-analizar
              </button>
            )}
          </div>

          {!clips && !clipsLoading && (
            <div style={{
              padding: '14px 12px', borderRadius: 10,
              background: 'rgba(0, 212, 255, 0.04)',
              border: '1px dashed rgba(0, 212, 255, 0.25)',
              fontFamily: 'Space Grotesk', fontSize: 12,
              color: 'rgba(250, 245, 235, 0.55)',
              textAlign: 'center',
            }}>
              La AI detecta goles, atajadas y jugadas destacadas del video completo.
            </div>
          )}

          {clips && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {clips.map((c, i) => (
                <div
                  key={c.id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 12px', borderRadius: 10,
                    background: 'rgba(0, 212, 255, 0.05)',
                    border: '1px solid rgba(0, 212, 255, 0.18)',
                    animation: 'slide-up-fade 260ms ease-out backwards',
                    animationDelay: `${i * 50}ms`,
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'rgba(0, 212, 255, 0.15)',
                    border: '1px solid rgba(0, 212, 255, 0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                    fontSize: 16,
                  }}>
                    {clipEmoji(c.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13,
                      color: '#FAF5EB',
                    }}>
                      {c.label}
                    </div>
                    <div style={{
                      fontFamily: 'Space Grotesk', fontSize: 10,
                      color: 'rgba(250, 245, 235, 0.5)',
                      marginTop: 2,
                    }}>
                      {formatClipTime(c.start)} – {formatClipTime(c.end)} · {Math.round(c.confidence * 100)}% match
                    </div>
                  </div>
                  <button
                    onClick={() => setToast(`▶ ${c.label}`)}
                    style={{
                      width: 32, height: 32, borderRadius: '50%',
                      background: 'linear-gradient(135deg, #00D4FF, #B347FF)',
                      border: 'none',
                      color: '#0F0D0A',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      cursor: 'pointer', flexShrink: 0,
                      boxShadow: '0 4px 12px rgba(0, 212, 255, 0.3)',
                    }}
                  >
                    <Play size={13} fill="#0F0D0A" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tone + Language switchers */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
            <span style={{
              fontFamily: 'Space Grotesk', fontSize: 10,
              color: 'rgba(250,245,235,0.5)', letterSpacing: '0.08em',
              textTransform: 'uppercase', marginRight: 4,
            }}>
              Tono
            </span>
            {(['casual', 'hype', 'formal'] as Tone[]).map(t => (
              <button
                key={t}
                onClick={() => changeRecapTone(t)}
                style={{
                  padding: '4px 10px', borderRadius: 999,
                  background: recapTone === t ? 'rgba(179, 71, 255, 0.22)' : 'transparent',
                  border: recapTone === t ? '1px solid rgba(179, 71, 255, 0.5)' : '1px solid rgba(255, 220, 180, 0.1)',
                  color: recapTone === t ? '#B347FF' : 'rgba(250, 245, 235, 0.5)',
                  fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 600,
                  textTransform: 'capitalize', cursor: 'pointer',
                }}
              >
                {t}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginLeft: 'auto' }}>
            {(['es', 'en'] as Lang[]).map(l => (
              <button
                key={l}
                onClick={() => changeRecapLang(l)}
                style={{
                  padding: '4px 10px', borderRadius: 999,
                  background: recapLang === l ? 'rgba(204, 255, 0, 0.15)' : 'transparent',
                  border: recapLang === l ? '1px solid rgba(204, 255, 0, 0.45)' : '1px solid rgba(255, 220, 180, 0.1)',
                  color: recapLang === l ? '#CCFF00' : 'rgba(250, 245, 235, 0.5)',
                  fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 700,
                  textTransform: 'uppercase', cursor: 'pointer',
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => regenerateRecap()}
            disabled={recapRegen}
            style={{
              flex: 1, padding: '12px 14px', borderRadius: 12,
              background: 'rgba(179, 71, 255, 0.15)',
              border: '1px solid rgba(179, 71, 255, 0.4)',
              color: '#B347FF',
              fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: recapRegen ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              opacity: recapRegen ? 0.6 : 1,
            }}
          >
            <RefreshCw size={13} style={{ animation: recapRegen ? 'spin 700ms linear infinite' : 'none' }} />
            {recapRegen ? 'Regenerando…' : 'Regenerar'}
          </button>
          <RippleButton
            onClick={() => {
              navigator.clipboard?.writeText(`${recap.headline}\n\n${recap.body}`).catch(() => {})
              setToast('Recap copiado')
            }}
            rippleColor="rgba(15, 13, 10, 0.35)"
            style={{
              flex: 1, padding: '12px 14px', borderRadius: 12,
              background: 'linear-gradient(135deg, #CCFF00, #FFB800)',
              border: 'none',
              color: '#0F0D0A',
              fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 12,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxShadow: '0 6px 20px rgba(204, 255, 0, 0.35)',
            }}
          >
            <Copy size={13} /> Copiar recap
          </RippleButton>
        </div>
      </BottomSheet>

      {/* Tier 5 sheets */}
      <LineupSheet open={lineupOpen} onClose={() => setLineupOpen(false)} opponent={NEXT_OPPONENT} />
      <RivalScoutSheet open={scoutOpen} onClose={() => setScoutOpen(false)} opponent={NEXT_OPPONENT} />
      <LiveMatchSheet open={liveOpen} onClose={() => setLiveOpen(false)} home="Los Pumas FC" away={NEXT_OPPONENT} />
      <TacticsBoardSheet open={tacticsOpen} onClose={() => setTacticsOpen(false)} />
      <EventsSheet open={eventsOpen} onClose={() => setEventsOpen(false)} />
    </div>
  )
}
