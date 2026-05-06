import { describe, it, expect } from 'vitest'
import { detectHighlights } from './highlights'
import type { MatchEvent } from '../agents/matchCommentatorAgent'

const EVENTS: MatchEvent[] = [
  { id: 'e1', minute: 3,  type: 'goal',     team: 'home', text: 'Gol temprano',  impact: 3 },
  { id: 'e2', minute: 22, type: 'chance',   team: 'away', text: 'Ocasión',        impact: 2 },
  { id: 'e3', minute: 45, type: 'halftime', team: 'home', text: 'Entretiempo',    impact: 1 },
  { id: 'e4', minute: 67, type: 'save',     team: 'home', text: 'Gran atajada',   impact: 2 },
  { id: 'e5', minute: 88, type: 'goal',     team: 'away', text: 'Empate agónico', impact: 4 },
  { id: 'e6', minute: 90, type: 'red',      team: 'home', text: 'Roja directa',   impact: 3 },
]

describe('detectHighlights (service)', () => {
  it('devuelve los topK más altos', () => {
    const r = detectHighlights(EVENTS, 3)
    expect(r.highlights).toHaveLength(3)
    expect(r.highlights[0].event.minute).toBe(88)
  })

  it('está ordenado descendente por score', () => {
    const r = detectHighlights(EVENTS, 3)
    const scores = r.highlights.map(h => h.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
  })

  it('total coincide con eventos input', () => {
    const r = detectHighlights(EVENTS, 3)
    expect(r.total).toBe(EVENTS.length)
  })
})
