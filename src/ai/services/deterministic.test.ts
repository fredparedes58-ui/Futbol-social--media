import { describe, it, expect } from 'vitest'
import {
  mulberry32,
  seedFromString,
  deriveMetrics,
  gradeFromStats,
  winProbability,
  pickDeterministic,
  clamp,
} from './deterministic'

describe('mulberry32', () => {
  it('es reproducible con misma seed', () => {
    const a = mulberry32(42)
    const b = mulberry32(42)
    for (let i = 0; i < 10; i++) expect(a()).toBe(b())
  })

  it('devuelve valores en [0,1)', () => {
    const rng = mulberry32(7)
    for (let i = 0; i < 100; i++) {
      const v = rng()
      expect(v).toBeGreaterThanOrEqual(0)
      expect(v).toBeLessThan(1)
    }
  })
})

describe('seedFromString', () => {
  it('es estable para el mismo input', () => {
    expect(seedFromString('hola')).toBe(seedFromString('hola'))
  })
  it('distinto para inputs distintos', () => {
    expect(seedFromString('a')).not.toBe(seedFromString('b'))
  })
})

describe('deriveMetrics', () => {
  it('calcula ratios correctos', () => {
    const m = deriveMetrics({ matches: 10, goals: 5, assists: 3, mvps: 2, wins: 6, draws: 2, losses: 2 })
    expect(m.goalsPerMatch).toBe(0.5)
    expect(m.assistsPerMatch).toBe(0.3)
    expect(m.winRate).toBe(60)
    expect(m.mvpRate).toBe(20)
  })
  it('no divide por cero cuando matches=0', () => {
    const m = deriveMetrics({ matches: 0, goals: 0, assists: 0, mvps: 0, wins: 0, draws: 0, losses: 0 })
    expect(Number.isFinite(m.goalsPerMatch)).toBe(true)
  })
})

describe('gradeFromStats', () => {
  it('devuelve A+ para jugador top', () => {
    expect(gradeFromStats({ matches: 20, goals: 25, assists: 10, mvps: 6, wins: 15, draws: 3, losses: 2 })).toBe('A+')
  })
  it('devuelve C para jugador con pocas contribuciones', () => {
    expect(gradeFromStats({ matches: 20, goals: 1, assists: 0, mvps: 0, wins: 3, draws: 4, losses: 13 })).toBe('C')
  })
})

describe('winProbability', () => {
  it('suma ≈ 1 (home+draw+away)', () => {
    const p = winProbability(1500, 1500)
    expect(p.home + p.draw + p.away).toBeCloseTo(1, 2)
  })
  it('local con más rating tiene más probabilidad', () => {
    const strong = winProbability(1800, 1400)
    expect(strong.home).toBeGreaterThan(strong.away)
  })
})

describe('pickDeterministic', () => {
  it('mismo seed → mismo pick', () => {
    const arr = ['a', 'b', 'c', 'd', 'e']
    expect(pickDeterministic(arr, 123, 2)).toEqual(pickDeterministic(arr, 123, 2))
  })
  it('no repite elementos', () => {
    const out = pickDeterministic(['a', 'b', 'c', 'd'], 77, 3)
    expect(new Set(out).size).toBe(3)
  })
})

describe('clamp', () => {
  it('clampa correctamente', () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-5, 0, 10)).toBe(0)
    expect(clamp(15, 0, 10)).toBe(10)
  })
})
