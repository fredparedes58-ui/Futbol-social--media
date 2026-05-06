/**
 * Service: detectHighlights — función pura, sin contrato de agente.
 * Scorea eventos de un partido por tipo + minuto + impacto y devuelve topK.
 */
import type { MatchEvent } from '../agents/matchCommentatorAgent'

export interface Highlight {
  event: MatchEvent
  score: number
  reason: string
}

export interface HighlightsResult {
  highlights: Highlight[]
  total: number
}

const TYPE_WEIGHT: Record<string, number> = {
  goal: 100, red: 80, chance: 50, save: 55,
  halftime: 10, fulltime: 25, kickoff: 5,
  yellow: 20, sub: 8, foul: 6, corner: 8, commentary: 2,
}

function minuteBonus(m: number): number {
  if (m >= 85) return 30
  if (m >= 70) return 15
  if (m >= 45 && m < 50) return 8
  if (m < 10) return 10
  return 0
}

function reasonFor(ev: MatchEvent, score: number): string {
  if (ev.type === 'goal') {
    if (ev.minute >= 85) return `Gol agónico en el ${ev.minute}' — define el partido.`
    if (ev.minute < 10) return `Gol madrugador (${ev.minute}') que marcó el ritmo.`
    return `Gol de impacto al minuto ${ev.minute}.`
  }
  if (ev.type === 'red')  return `Expulsión en el ${ev.minute}' — cambió el partido.`
  if (ev.type === 'save') return `Atajadón clave al ${ev.minute}'.`
  if (ev.type === 'chance') return `Ocasión clarísima al ${ev.minute}'.`
  return `Momento relevante (${score.toFixed(0)} pts).`
}

export function detectHighlights(events: MatchEvent[], topK = 3): HighlightsResult {
  const scored: Highlight[] = events.map(ev => {
    const w = TYPE_WEIGHT[ev.type] ?? 1
    const mb = minuteBonus(ev.minute)
    const impactMult = (ev.impact ?? 1) * 1.1
    const score = +(w * impactMult + mb).toFixed(1)
    return { event: ev, score, reason: reasonFor(ev, score) }
  })
  scored.sort((a, b) => b.score - a.score)
  return { highlights: scored.slice(0, topK), total: events.length }
}
