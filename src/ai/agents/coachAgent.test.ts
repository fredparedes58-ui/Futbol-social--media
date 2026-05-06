import { describe, it, expect } from 'vitest'
import { coachAgent } from './coachAgent'
import type { PlayerStats } from '../services/deterministic'

const STATS: PlayerStats = { matches: 42, goals: 32, assists: 15, mvps: 5, wins: 28, draws: 8, losses: 6 }

describe('coachAgent', () => {
  it('es determinístico: mismo input → mismo output', async () => {
    const a = await coachAgent.run({ name: 'Alex', position: 'Delantero', stats: STATS })
    const b = await coachAgent.run({ name: 'Alex', position: 'Delantero', stats: STATS })
    expect(a.data).toEqual(b.data)
  })

  it('genera plan de 7 días', async () => {
    const r = await coachAgent.run({ name: 'Alex', position: 'Delantero', stats: STATS })
    expect(r.data.plan).toHaveLength(7)
    expect(r.data.plan[0].day).toBe('Lun')
  })

  it('devuelve grade A+/A/B+/B/C', async () => {
    const r = await coachAgent.run({ name: 'Alex', position: 'Delantero', stats: STATS })
    expect(['A+', 'A', 'B+', 'B', 'C']).toContain(r.data.grade)
  })

  it('responde distinto según query (gol vs plan)', async () => {
    const gol = await coachAgent.run({ name: 'Alex', position: 'Delantero', stats: STATS, query: '¿cómo mejoro mis goles?' })
    const plan = await coachAgent.run({ name: 'Alex', position: 'Delantero', stats: STATS, query: 'dame un plan de entreno' })
    expect(gol.data.reply).not.toBe(plan.data.reply)
  })
})
