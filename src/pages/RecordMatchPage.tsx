/**
 * Sprint D — Registro de partido
 * Flujo 4 pasos: rival → marcador → goleadores → recap AI
 */
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, Plus, Minus, Target, Sparkles, Check, RefreshCw, Share2, Zap, Star } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import NeonInput from '../components/ui/NeonInput'
import NeonButton from '../components/ui/NeonButton'
import FloatingOrbs from '../components/ui/FloatingOrbs'
import { matchCommentatorAgent } from '../ai/agents/matchCommentatorAgent'
import { detectHighlights, type Highlight } from '../ai/services/highlights'

// Mock scorers pool (jugadores del equipo)
const SQUAD = [
  'Alex Rivera', 'Carlos Méndez', 'Diego Santos', 'Tomás López',
  'Nico Vega', 'Matías Cruz', 'Leo Vargas', 'Martín Ríos',
]

const RESULTS_COLOR = {
  W: '#CCFF00',
  D: '#FFB800',
  L: '#FF5B3A',
}

// Mini AI recap generator (mock — igual que aiMocks pero ad-hoc para partidos)
function generateRecap(data: {
  myTeam: string; opponent: string
  myGoals: number; oppGoals: number
  scorers: string[]; date: string
}): string {
  const result = data.myGoals > data.oppGoals ? 'W' : data.myGoals < data.oppGoals ? 'L' : 'D'
  const margin = Math.abs(data.myGoals - data.oppGoals)
  const adjectives = {
    W: margin >= 3 ? ['aplastante', 'dominante', 'histórica'] : ['merecida', 'trabajada', 'sufrida'],
    L: margin >= 3 ? ['dolorosa', 'dura', 'para olvidar'] : ['ajustada', 'luchada', 'discutida'],
    D: ['justa', 'con sabor a poco', 'disputada'],
  }
  const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)]

  const adj = result === 'D' ? pick(adjectives.D) : pick(adjectives[result])
  const topScorer = data.scorers[0] ?? 'el equipo'
  const multipleScorers = data.scorers.length > 1

  if (result === 'W') {
    return `Victoria ${adj} ${data.myGoals}–${data.oppGoals} ante ${data.opponent}. ${topScorer} lideró el ataque${multipleScorers ? ` junto a ${data.scorers.slice(1).join(', ')}` : ''}. El equipo demostró solidez y carácter en cada minuto.`
  }
  if (result === 'L') {
    return `Derrota ${adj} ${data.myGoals}–${data.oppGoals} frente a ${data.opponent}. Pese a los esfuerzos${data.scorers.length > 0 ? ` y el tanto de ${topScorer}` : ''}, los rivales se impusieron. Toca analizar, levantarse y seguir.`
  }
  return `Empate ${adj} ${data.myGoals}–${data.oppGoals} ante ${data.opponent}. ${data.scorers.length > 0 ? `${topScorer} anotó para mantener vivas las esperanzas.` : 'Ninguno pudo romper la igualdad.'} Un punto que suma en la larga carrera de la temporada.`
}

const STEPS = [
  { title: '¿Contra quién jugaste?', sub: 'Nombre del rival y fecha del partido.' },
  { title: '¿Cómo acabó?',           sub: 'Introduce el marcador final.' },
  { title: '¿Quién marcó?',          sub: 'Añade los goleadores de tu equipo.' },
  { title: 'Recap del partido',       sub: 'Generado por AI a partir de tus datos.' },
]

export default function RecordMatchPage() {
  const nav = useNavigate()
  const { user, setToast } = useAuth()

  const [step, setStep] = useState(0)
  const [dir, setDir] = useState(1)

  // Step 0
  const [opponent, setOpponent] = useState('')
  const [matchDate, setMatchDate] = useState(new Date().toISOString().split('T')[0])

  // Step 1
  const [myGoals, setMyGoals] = useState(0)
  const [oppGoals, setOppGoals] = useState(0)

  // Step 2
  const [scorers, setScorers] = useState<string[]>([])

  // Step 3
  const [recap, setRecap] = useState('')
  const [recapLoading, setRecapLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [highlights, setHighlights] = useState<Highlight[]>([])

  const myTeam = user?.team ?? 'Mi equipo'
  const result: 'W' | 'D' | 'L' = myGoals > oppGoals ? 'W' : myGoals < oppGoals ? 'L' : 'D'

  const canAdvance = [
    opponent.trim().length >= 2,
    true,
    true,
    true,
  ][step]

  function advance() {
    if (step === 2) {
      // Generar recap + highlights
      setDir(1)
      setStep(3)
      setRecapLoading(true)
      const delay = new Promise<void>(r => setTimeout(r, 1100))
      Promise.all([
        matchCommentatorAgent.run({ home: myTeam, away: opponent, count: 18 }),
        delay,
      ]).then(([result]) => {
        const { highlights: hl } = detectHighlights(result.data.events, 3)
        setHighlights(hl)
        setRecap(generateRecap({
          myTeam, opponent,
          myGoals, oppGoals,
          scorers, date: matchDate,
        }))
        setRecapLoading(false)
      })
      return
    }
    if (step === 3) {
      setSaved(true)
      setToast('¡Partido guardado en tu historial!')
      setTimeout(() => nav(-1), 1200)
      return
    }
    setDir(1)
    setStep(s => s + 1)
  }

  function back() {
    if (step === 0) { nav(-1); return }
    setDir(-1)
    setStep(s => s - 1)
  }

  function toggleScorer(name: string) {
    setScorers(prev =>
      prev.includes(name) ? prev.filter(s => s !== name) : [...prev, name]
    )
    if ('vibrate' in navigator) navigator.vibrate(10)
  }

  return (
    <div style={{ position: 'absolute', inset: 0, background: '#0F0D0A', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
        <FloatingOrbs orbs={[
          { x: 85, y: 10, size: 200, color: result === 'W' ? '#CCFF00' : result === 'L' ? '#FF5B3A' : '#FFB800', opacity: 0.15, dur: 18 },
          { x: 10, y: 70, size: 240, color: '#B347FF', opacity: 0.10, dur: 24 },
        ]} />
      </div>

      {/* Header */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '52px 20px 0',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <button
            onClick={back}
            style={{
              width: 38, height: 38, borderRadius: 10,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,220,180,0.1)',
              color: 'rgba(250,245,235,0.8)', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ChevronLeft size={18} />
          </button>
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'Archivo', fontWeight: 800, fontSize: 18,
              color: '#FAF5EB', letterSpacing: '-0.01em',
            }}>
              Registrar partido
            </div>
          </div>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', gap: 5, marginBottom: 6 }}>
          {[0, 1, 2, 3].map(i => (
            <div key={i} style={{
              height: 3, borderRadius: 2, flex: i === step ? 3 : 1,
              background: i <= step
                ? (result === 'W' ? '#CCFF00' : result === 'L' ? '#FF5B3A' : '#FFB800')
                : 'rgba(250,245,235,0.10)',
              transition: 'all 0.45s cubic-bezier(.2,.8,.2,1)',
              boxShadow: i === step ? '0 0 8px rgba(204,255,0,0.4)' : 'none',
            }} />
          ))}
        </div>
        <div style={{
          fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 600,
          color: 'rgba(250,245,235,0.35)', letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Paso {step + 1} de 4
        </div>
      </div>

      {/* Content */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 5,
        display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
        padding: '0 20px 160px',
      }}>
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            initial={{ opacity: 0, x: dir * 44 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir * -44 }}
            transition={{ duration: 0.26, ease: [0.2, 0.8, 0.2, 1] }}
          >
            {/* Step label */}
            <div style={{ marginBottom: 22 }}>
              <div style={{
                fontFamily: 'Archivo', fontWeight: 800, fontSize: 28,
                color: '#FAF5EB', letterSpacing: '-0.02em', lineHeight: 1.1,
                marginBottom: 6,
              }}>
                {STEPS[step].title}
              </div>
              <div style={{
                fontFamily: 'Space Grotesk', fontSize: 13,
                color: 'rgba(250,245,235,0.5)',
              }}>
                {STEPS[step].sub}
              </div>
            </div>

            {/* ─ Step 0: Rival + fecha ─ */}
            {step === 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <NeonInput
                  placeholder="Nombre del rival (ej: Águilas Doradas)"
                  value={opponent}
                  onChange={setOpponent}
                />
                <div>
                  <div style={{
                    fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
                    color: 'rgba(250,245,235,0.5)', letterSpacing: '0.08em',
                    textTransform: 'uppercase', marginBottom: 8,
                  }}>
                    Fecha del partido
                  </div>
                  <input
                    type="date"
                    value={matchDate}
                    onChange={e => setMatchDate(e.target.value)}
                    style={{
                      width: '100%', height: 46, padding: '0 14px', borderRadius: 12,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,220,180,0.12)',
                      color: '#FAF5EB',
                      fontFamily: 'Space Grotesk', fontSize: 14,
                      outline: 'none', colorScheme: 'dark',
                    }}
                  />
                </div>
              </div>
            )}

            {/* ─ Step 1: Marcador ─ */}
            {step === 1 && (
              <div>
                {/* Scoreboard */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr 36px 1fr',
                  gap: 12, alignItems: 'center', marginBottom: 28,
                }}>
                  {/* My team */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: 'Space Grotesk', fontSize: 11,
                      color: 'rgba(250,245,235,0.5)', marginBottom: 8,
                    }}>
                      {myTeam}
                    </div>
                    <div style={{
                      fontFamily: 'Archivo', fontStyle: 'italic', fontWeight: 900,
                      fontSize: 64, color: RESULTS_COLOR[result],
                      lineHeight: 1,
                      textShadow: `0 0 24px ${RESULTS_COLOR[result]}66`,
                      transition: 'color 0.3s',
                    }}>
                      {myGoals}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'Archivo', fontWeight: 800, fontSize: 20,
                    color: 'rgba(250,245,235,0.3)', textAlign: 'center',
                  }}>–</div>
                  {/* Opponent */}
                  <div style={{ textAlign: 'center' }}>
                    <div style={{
                      fontFamily: 'Space Grotesk', fontSize: 11,
                      color: 'rgba(250,245,235,0.5)', marginBottom: 8,
                    }}>
                      {opponent}
                    </div>
                    <div style={{
                      fontFamily: 'Archivo', fontStyle: 'italic', fontWeight: 900,
                      fontSize: 64, color: '#FAF5EB', lineHeight: 1,
                    }}>
                      {oppGoals}
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                  {/* My goals controls */}
                  <div>
                    <div style={{
                      fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                      color: 'rgba(250,245,235,0.4)', textTransform: 'uppercase',
                      letterSpacing: '0.08em', marginBottom: 8, textAlign: 'center',
                    }}>
                      Tus goles
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                      <button onClick={() => setMyGoals(g => Math.max(0, g - 1))} style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,220,180,0.12)',
                        color: '#FAF5EB', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Minus size={18} />
                      </button>
                      <div style={{
                        fontFamily: 'Archivo', fontWeight: 800, fontSize: 22,
                        color: RESULTS_COLOR[result], minWidth: 32, textAlign: 'center',
                        transition: 'color 0.3s',
                      }}>
                        {myGoals}
                      </div>
                      <button onClick={() => setMyGoals(g => g + 1)} style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'rgba(204,255,0,0.12)',
                        border: '1px solid rgba(204,255,0,0.35)',
                        color: '#CCFF00', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>

                  {/* Opponent goals controls */}
                  <div>
                    <div style={{
                      fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                      color: 'rgba(250,245,235,0.4)', textTransform: 'uppercase',
                      letterSpacing: '0.08em', marginBottom: 8, textAlign: 'center',
                    }}>
                      Sus goles
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                      <button onClick={() => setOppGoals(g => Math.max(0, g - 1))} style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,220,180,0.12)',
                        color: '#FAF5EB', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Minus size={18} />
                      </button>
                      <div style={{
                        fontFamily: 'Archivo', fontWeight: 800, fontSize: 22,
                        color: '#FAF5EB', minWidth: 32, textAlign: 'center',
                      }}>
                        {oppGoals}
                      </div>
                      <button onClick={() => setOppGoals(g => g + 1)} style={{
                        width: 44, height: 44, borderRadius: 12,
                        background: 'rgba(255,91,58,0.12)',
                        border: '1px solid rgba(255,91,58,0.35)',
                        color: '#FF5B3A', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <Plus size={18} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Result chip */}
                <div style={{ textAlign: 'center', marginTop: 20 }}>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '6px 18px', borderRadius: 999,
                    background: `${RESULTS_COLOR[result]}22`,
                    border: `1px solid ${RESULTS_COLOR[result]}55`,
                    transition: 'all 0.3s',
                  }}>
                    <span style={{
                      fontFamily: 'Archivo', fontWeight: 800, fontSize: 13,
                      color: RESULTS_COLOR[result],
                    }}>
                      {result === 'W' ? '🏆 Victoria' : result === 'L' ? '💪 Derrota' : '🤝 Empate'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* ─ Step 2: Goleadores ─ */}
            {step === 2 && (
              <div>
                {myGoals === 0 ? (
                  <div style={{
                    padding: '24px 0', textAlign: 'center',
                    color: 'rgba(250,245,235,0.45)', fontFamily: 'Space Grotesk', fontSize: 13,
                  }}>
                    Sin goles en este partido.<br />
                    <span style={{ fontSize: 11, opacity: 0.7 }}>Toca continuar para generar el recap.</span>
                  </div>
                ) : (
                  <>
                    <div style={{
                      fontFamily: 'Space Grotesk', fontSize: 12,
                      color: 'rgba(250,245,235,0.45)', marginBottom: 14,
                    }}>
                      Selecciona los jugadores que marcaron ({scorers.length}/{myGoals} goles asignados)
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {SQUAD.map(p => {
                        const selected = scorers.includes(p)
                        const count = scorers.filter(s => s === p).length
                        return (
                          <button
                            key={p}
                            onClick={() => toggleScorer(p)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12,
                              padding: '11px 14px', borderRadius: 12,
                              background: selected ? 'rgba(204,255,0,0.10)' : 'rgba(255,255,255,0.03)',
                              border: `1px solid ${selected ? 'rgba(204,255,0,0.4)' : 'rgba(255,220,180,0.07)'}`,
                              cursor: 'pointer', transition: 'all 0.15s',
                            }}
                          >
                            <div style={{
                              width: 32, height: 32, borderRadius: 8,
                              background: selected ? 'rgba(204,255,0,0.2)' : 'rgba(255,255,255,0.06)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: selected ? '#CCFF00' : 'rgba(250,245,235,0.4)',
                            }}>
                              <Target size={14} />
                            </div>
                            <span style={{
                              flex: 1, fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 13,
                              color: selected ? '#FAF5EB' : 'rgba(250,245,235,0.65)',
                            }}>
                              {p}
                            </span>
                            {selected && (
                              <div style={{
                                padding: '2px 10px', borderRadius: 999,
                                background: 'rgba(204,255,0,0.25)',
                                fontFamily: 'Archivo', fontWeight: 800, fontSize: 11,
                                color: '#CCFF00',
                              }}>
                                ⚽ ×{count}
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* ─ Step 3: Recap ─ */}
            {step === 3 && (
              <div>
                {/* Result badge */}
                <div style={{
                  display: 'grid', gridTemplateColumns: '1fr auto 1fr',
                  gap: 8, alignItems: 'center',
                  padding: '16px', borderRadius: 16,
                  background: `${RESULTS_COLOR[result]}0e`,
                  border: `1px solid ${RESULTS_COLOR[result]}33`,
                  marginBottom: 16,
                }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.5)', marginBottom: 4 }}>
                      {myTeam}
                    </div>
                    <div style={{
                      fontFamily: 'Archivo', fontStyle: 'italic', fontWeight: 900,
                      fontSize: 42, color: RESULTS_COLOR[result], lineHeight: 1,
                    }}>
                      {myGoals}
                    </div>
                  </div>
                  <div style={{
                    fontFamily: 'Archivo', fontWeight: 800, fontSize: 18,
                    color: 'rgba(250,245,235,0.3)',
                  }}>–</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.5)', marginBottom: 4 }}>
                      {opponent}
                    </div>
                    <div style={{
                      fontFamily: 'Archivo', fontStyle: 'italic', fontWeight: 900,
                      fontSize: 42, color: '#FAF5EB', lineHeight: 1,
                    }}>
                      {oppGoals}
                    </div>
                  </div>
                </div>

                {/* Scorers */}
                {scorers.length > 0 && (
                  <div style={{
                    display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14,
                  }}>
                    {[...new Set(scorers)].map(s => (
                      <div key={s} style={{
                        padding: '4px 10px', borderRadius: 999,
                        background: 'rgba(204,255,0,0.10)',
                        border: '1px solid rgba(204,255,0,0.3)',
                        fontFamily: 'Space Grotesk', fontSize: 11, color: '#CCFF00',
                      }}>
                        ⚽ {s}
                      </div>
                    ))}
                  </div>
                )}

                {/* AI Recap */}
                <div style={{
                  padding: '14px', borderRadius: 14,
                  background: 'linear-gradient(135deg, rgba(179,71,255,0.14), rgba(204,255,0,0.06))',
                  border: '1px solid rgba(179,71,255,0.35)',
                  marginBottom: 14,
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                    <Sparkles size={13} color="#B347FF" />
                    <span style={{
                      fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                      color: '#B347FF', letterSpacing: '0.1em', textTransform: 'uppercase',
                    }}>
                      Recap generado por AI
                    </span>
                  </div>

                  {recapLoading ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <RefreshCw size={14} color="#B347FF" style={{ animation: 'spin 700ms linear infinite' }} />
                      <span style={{ fontFamily: 'Space Grotesk', fontSize: 13, color: 'rgba(250,245,235,0.6)' }}>
                        Analizando el partido…
                      </span>
                    </div>
                  ) : (
                    <div style={{
                      fontFamily: 'Space Grotesk', fontSize: 13, lineHeight: 1.55,
                      color: 'rgba(250,245,235,0.88)',
                    }}>
                      {recap}
                    </div>
                  )}
                </div>

                {/* Momentos clave */}
                {!recapLoading && highlights.length > 0 && (
                  <div style={{ marginBottom: 14 }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
                    }}>
                      <Star size={12} color="#FFB800" />
                      <span style={{
                        fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
                        color: '#FFB800', textTransform: 'uppercase', letterSpacing: '0.1em',
                      }}>
                        Momentos clave del partido
                      </span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {highlights.map((hl, i) => {
                        const typeColor: Record<string, string> = {
                          goal: '#CCFF00', red: '#FF5B3A', save: '#00D4FF',
                          chance: '#FFB800', halftime: '#B347FF', fulltime: '#CCFF00',
                        }
                        const color = typeColor[hl.event.type] ?? '#FAF5EB'
                        return (
                          <div key={i} style={{
                            display: 'flex', alignItems: 'flex-start', gap: 10,
                            padding: '10px 12px', borderRadius: 10,
                            background: `${color}0d`,
                            border: `1px solid ${color}33`,
                          }}>
                            <div style={{
                              minWidth: 34, height: 22, borderRadius: 6,
                              background: `${color}22`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'Archivo', fontWeight: 900, fontSize: 10,
                              color,
                            }}>
                              {hl.event.minute}'
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{
                                fontFamily: 'Space Grotesk', fontSize: 12,
                                color: 'rgba(250,245,235,0.85)', lineHeight: 1.4,
                              }}>
                                {hl.event.text}
                              </div>
                              <div style={{
                                marginTop: 3, fontFamily: 'Space Grotesk', fontSize: 10,
                                color: color, fontWeight: 600,
                              }}>
                                {hl.reason}
                              </div>
                            </div>
                            <Zap size={12} color={color} style={{ flexShrink: 0, marginTop: 2 }} />
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {!recapLoading && (
                  <button
                    onClick={() => {
                      navigator.clipboard?.writeText(recap).catch(() => {})
                      setToast('Recap copiado')
                    }}
                    style={{
                      width: '100%', padding: '11px', borderRadius: 12,
                      background: 'transparent',
                      border: '1px solid rgba(179,71,255,0.3)',
                      color: '#B347FF',
                      fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 12,
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}
                  >
                    <Share2 size={13} /> Compartir recap
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom CTA */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10,
        padding: '16px 20px calc(28px + env(safe-area-inset-bottom))',
      }}>
        <NeonButton
          variant="gradient"
          onClick={advance}
          disabled={!canAdvance || recapLoading || saved}
        >
          {saved ? (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Check size={15} /> ¡Guardado!
            </span>
          ) : step === 3
            ? '✅ Guardar partido'
            : step === 2
            ? 'Generar recap →'
            : 'Continuar →'
          }
        </NeonButton>
      </div>
    </div>
  )
}
