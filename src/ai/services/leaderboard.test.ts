import { describe, it, expect } from 'vitest'
import { simulateLeaderboard } from './leaderboard'

describe('simulateLeaderboard (service)', () => {
  it('es determinístico con mismo seed', () => {
    const a = simulateLeaderboard({ scope: 'regional', seed: 42 })
    const b = simulateLeaderboard({ scope: 'regional', seed: 42 })
    expect(a.entries.map(e => e.name)).toEqual(b.entries.map(e => e.name))
    expect(a.entries.map(e => e.score)).toEqual(b.entries.map(e => e.score))
  })

  it('entries ordenadas descendente por score y ranks secuenciales', () => {
    const r = simulateLeaderboard({ scope: 'regional', seed: 7 })
    const scores = r.entries.map(e => e.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
    expect(r.entries.map(e => e.rank)).toEqual(r.entries.map((_, i) => i + 1))
  })
})
