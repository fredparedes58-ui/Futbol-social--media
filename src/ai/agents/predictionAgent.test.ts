import { describe, it, expect } from 'vitest'
import { predictionAgent } from './predictionAgent'

describe('predictionAgent', () => {
  it('es determinístico', async () => {
    const input = { home: 'Pumas', away: 'Rayo', homeRating: 1600, awayRating: 1500 }
    const a = await predictionAgent.run(input)
    const b = await predictionAgent.run(input)
    expect(a.data).toEqual(b.data)
  })

  it('probs suman ≈ 1', async () => {
    const r = await predictionAgent.run({ home: 'A', away: 'B' })
    const { home, draw, away } = r.data.probs
    expect(home + draw + away).toBeCloseTo(1, 2)
  })

  it('local favorito con más rating', async () => {
    const r = await predictionAgent.run({ home: 'Strong', away: 'Weak', homeRating: 1800, awayRating: 1400 })
    expect(r.data.probs.home).toBeGreaterThan(r.data.probs.away)
  })

  it('lesiones bajan la probabilidad', async () => {
    const sano = await predictionAgent.run({ home: 'A', away: 'B', homeRating: 1600, awayRating: 1500 })
    const lesionado = await predictionAgent.run({ home: 'A', away: 'B', homeRating: 1600, awayRating: 1500, homeInjuries: 3 })
    expect(lesionado.data.probs.home).toBeLessThan(sano.data.probs.home)
  })

  it('incluye citations RAG', async () => {
    const r = await predictionAgent.run({ home: 'A', away: 'B' })
    expect(r.data.citations.length).toBeGreaterThan(0)
  })
})
