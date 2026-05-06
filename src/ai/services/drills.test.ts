import { describe, it, expect } from 'vitest'
import { generateDrills, type Weakness } from './drills'

describe('generateDrills (service)', () => {
  it('es determinístico con misma semana', () => {
    const weaknesses: Weakness[] = ['shot', 'pace']
    const a = generateDrills({ name: 'Alex', weaknesses, weekIsoDate: '2026-W17' })
    const b = generateDrills({ name: 'Alex', weaknesses: [...weaknesses], weekIsoDate: '2026-W17' })
    expect(a).toEqual(b)
  })

  it('mezcla ejercicios según weaknesses', () => {
    const r = generateDrills({ name: 'Alex', weaknesses: ['shot'] })
    const areas = new Set(r.drills.map(d => d.area))
    expect(areas.has('shot')).toBe(true)
  })

  it('totalMinutes coincide con suma', () => {
    const r = generateDrills({ name: 'Alex', weaknesses: ['shot', 'pass'] })
    const sum = r.drills.reduce((a, d) => a + d.durationMin, 0)
    expect(r.totalMinutes).toBe(sum)
  })
})
