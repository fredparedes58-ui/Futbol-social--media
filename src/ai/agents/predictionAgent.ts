/**
 * PredictionAgent — predicción de partido combinando Elo-lite + factores contextuales
 * (local/visitante, forma reciente, lesiones) y justificación con citas RAG.
 */
import { defineAgent } from './types'
import { winProbability, seedFromString, mulberry32 } from '../services/deterministic'
import { retrieve } from '../rag/retriever'

export interface PredictionInput {
  home: string
  away: string
  homeRating?: number
  awayRating?: number
  homeForm?: string   // ej. 'WWDLW'
  awayForm?: string
  homeInjuries?: number
  awayInjuries?: number
}

export interface PredictionOutput {
  home: string
  away: string
  probs: { home: number; draw: number; away: number }
  predictedScore: { home: number; away: number }
  confidence: number
  reasoning: string[]
  citations: { topic: string; source?: string }[]
}

function formPoints(form?: string): number {
  if (!form) return 0
  let pts = 0
  for (const ch of form.toUpperCase()) {
    if (ch === 'W') pts += 3
    else if (ch === 'D') pts += 1
  }
  return pts
}

export const predictionAgent = defineAgent<PredictionInput, PredictionOutput>(
  'prediction',
  'Predice resultado con probabilidades + justificación RAG.',
  (input, _ctx, trace) => {
    const baseHome = input.homeRating ?? 1500
    const baseAway = input.awayRating ?? 1500

    // Ajustes por forma y lesiones
    const homeBonus = formPoints(input.homeForm) * 3 - (input.homeInjuries ?? 0) * 12
    const awayBonus = formPoints(input.awayForm) * 3 - (input.awayInjuries ?? 0) * 12
    const homeRating = baseHome + homeBonus
    const awayRating = baseAway + awayBonus
    trace.push(`ratings adj: ${homeRating} vs ${awayRating}`)

    const probs = winProbability(homeRating, awayRating)

    // Score predicho basado en probabilidades (seed determinístico)
    const seed = seedFromString(`${input.home}-${input.away}-${homeRating}-${awayRating}`)
    const rng = mulberry32(seed)
    const avgGoals = 2.4
    const homeShare = probs.home + probs.draw * 0.5
    const total = Math.round((avgGoals + rng() * 1.5) * 10) / 10
    const predictedHome = Math.round(total * homeShare)
    const predictedAway = Math.max(0, Math.round(total * (1 - homeShare)))

    // Reasoning
    const reasoning: string[] = []
    reasoning.push(`Ventaja local: +5 Elo para ${input.home}.`)
    if (input.homeForm) reasoning.push(`Forma local (${input.homeForm}): ${formPoints(input.homeForm)} pts.`)
    if (input.awayForm) reasoning.push(`Forma visitante (${input.awayForm}): ${formPoints(input.awayForm)} pts.`)
    if ((input.homeInjuries ?? 0) > 0) reasoning.push(`${input.homeInjuries} lesionado(s) en ${input.home}.`)
    if ((input.awayInjuries ?? 0) > 0) reasoning.push(`${input.awayInjuries} lesionado(s) en ${input.away}.`)
    if (probs.home > probs.away + 0.15) reasoning.push(`${input.home} parte como favorito claro.`)
    else if (probs.away > probs.home + 0.15) reasoning.push(`${input.away} llega con ventaja matemática.`)
    else reasoning.push('Duelo parejo — cualquier detalle decide.')

    // RAG citations
    const hits = retrieve('predicción táctica Elo forma', 2)
    const citations = hits.map(h => ({ topic: h.doc.topic, source: h.doc.source }))

    // Confidence: diferencia absoluta de probs
    const dominant = Math.max(probs.home, probs.draw, probs.away)
    const confidence = +dominant.toFixed(2)

    return {
      home: input.home,
      away: input.away,
      probs,
      predictedScore: { home: predictedHome, away: predictedAway },
      confidence,
      reasoning,
      citations,
    }
  },
)
