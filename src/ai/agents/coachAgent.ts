/**
 * CoachAgent — conversacional. Recibe stats del usuario + query y devuelve
 * feedback (Claude AI) + plan semanal (determinístico).
 * Llama a /api/coach (Edge Function) para el reply; fallback determinístico si falla.
 */
import { defineAgent } from './types'
import { mulberry32, seedFromString, deriveMetrics, gradeFromStats, type PlayerStats } from '../services/deterministic'

export interface CoachInput {
  name: string
  position: string
  stats: PlayerStats
  query?: string
}

export interface CoachOutput {
  reply: string
  plan: { day: string; focus: string; drill: string }[]
  grade: string
  strengths: string[]
  weaknesses: string[]
}

const DRILLS = {
  shot:    ['Finalización 1v1 con portero', 'Volea de media distancia', 'Tiro libre curvo con cono'],
  pass:    ['Rondos 5v2 en espacio reducido', 'Pase largo cambio de orientación', 'Pared + llegada al área'],
  def:     ['Marca al hombre reactiva', 'Coberturas zonales 3v3', 'Anticipación con señal visual'],
  phy:     ['Intervalos 4x400m', 'Plyo saltos laterales', 'Core 15 min rutina'],
  pace:    ['Sprints 10x30m con vuelta', 'Aceleración desde pausa', 'Cambios de ritmo con balón'],
  dribble: ['Conducción entre conos figura 8', 'Regate 1v1 con finta corporal', 'Control orientado lado débil'],
  mental:  ['Visualización pre-partido 5 min', 'Diario de 3 jugadas buenas', 'Rutina pre-tiro consistente'],
}

function analyze(stats: PlayerStats) {
  const m = deriveMetrics(stats)
  const strengths: string[] = []
  const weaknesses: string[] = []
  if (m.goalsPerMatch >= 0.8) strengths.push('definición letal')
  else if (m.goalsPerMatch < 0.3) weaknesses.push('definición')
  if (m.assistsPerMatch >= 0.5) strengths.push('visión de juego')
  else if (m.assistsPerMatch < 0.15) weaknesses.push('último pase')
  if (m.winRate >= 65) strengths.push('mentalidad ganadora')
  else if (m.winRate < 40) weaknesses.push('regularidad')
  if (m.mvpRate >= 15) strengths.push('liderazgo en campo')
  if (strengths.length === 0) strengths.push('esfuerzo y compromiso')
  if (weaknesses.length === 0) weaknesses.push('mantener ritmo alto')
  return { strengths, weaknesses }
}

function deterministicReply(input: CoachInput, grade: string, strengths: string[], weaknesses: string[]): string {
  const q = (input.query ?? '').trim().toLowerCase()
  if (!q) return `Hola ${input.name}. Tu nivel es ${grade}. Fortalezas en ${strengths.join(' y ')}, y una oportunidad clara en ${weaknesses[0]}. Plan de 7 días abajo.`
  if (/plan|entren|rutina|ejercicio/.test(q)) return `Plan semanal enfocado en ${weaknesses[0]}. Cada sesión 40-60 min. Clave: consistencia.`
  if (/gol|definic|remate/.test(q)) return `Ratio de goles ${input.stats.goals}/${input.stats.matches}. Finalización con arquero 3x/semana y 20 visualizaciones de remate antes de dormir.`
  if (/asisten|pase/.test(q)) return `Asistencias = leer 2 pases antes. Rondos + pase largo + 20 min de video-análisis semanal.`
  if (/mvp|mejorar|consejo/.test(q)) return `Para MVPs regulares: primer toque limpio, dominio del lado débil y comunicación constante.`
  return `Seguí apalancando "${strengths[0]}" y metele foco esta semana en "${weaknesses[0]}".`
}

async function fetchAIReply(input: CoachInput, grade: string, strengths: string[], weaknesses: string[]): Promise<string> {
  try {
    const res = await fetch('/api/coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: input.name,
        position: input.position,
        query: input.query,
        grade,
        strengths,
        weaknesses,
        stats: input.stats,
      }),
    })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const { reply } = await res.json() as { reply: string }
    return reply
  } catch {
    return deterministicReply(input, grade, strengths, weaknesses)
  }
}

export const coachAgent = defineAgent<CoachInput, CoachOutput>(
  'coach-ai',
  'Feedback con Claude AI + plan semanal determinístico.',
  async (input, _ctx, trace) => {
    const seed = seedFromString(`${input.name}-${input.stats.matches}-${input.stats.goals}`)
    const rng = mulberry32(seed)
    trace.push(`seed: ${seed}`)

    const { strengths, weaknesses } = analyze(input.stats)
    const grade = gradeFromStats(input.stats)

    const weakMap: Record<string, keyof typeof DRILLS> = {
      'definición': 'shot',
      'último pase': 'pass',
      'regularidad': 'mental',
      'mantener ritmo alto': 'phy',
    }

    const tail: (keyof typeof DRILLS)[] = ['pace', 'dribble', 'pass', 'def']
    const focusAreas: (keyof typeof DRILLS)[] = [
      ...weaknesses.map<keyof typeof DRILLS>(w => weakMap[w] ?? 'phy'),
      ...tail,
    ].slice(0, 7)

    const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
    const FOCUS_LABEL: Record<keyof typeof DRILLS, string> = {
      shot: 'Definición', pass: 'Pase', def: 'Defensa',
      phy: 'Físico', pace: 'Velocidad', dribble: 'Regate', mental: 'Mental',
    }
    const plan = DAYS.map((d, i) => {
      const area = focusAreas[i % focusAreas.length]
      const drills = DRILLS[area]
      const drill = drills[Math.floor(rng() * drills.length)]
      return { day: d, focus: FOCUS_LABEL[area], drill }
    })

    trace.push('fetching AI reply')
    const reply = await fetchAIReply(input, grade, strengths, weaknesses)
    trace.push('reply ok')

    return { reply, plan, grade, strengths, weaknesses }
  },
)
