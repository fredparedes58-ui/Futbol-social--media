/**
 * Service: simulateLeaderboard — simulación pura determinística de ranking.
 * Mismo seed → mismo ranking. Sin contrato de agente.
 */
import { mulberry32, seedFromString, gradeFromStats, type PlayerStats } from './deterministic'

export type LeaderboardScope = 'regional' | 'national' | 'friends'

export interface LeaderboardEntry {
  rank: number
  delta: number
  name: string
  team: string
  badge: string
  color: string
  stats: PlayerStats
  score: number
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C'
}

export interface LeaderboardInput {
  scope?: LeaderboardScope
  me?: string
  seed?: number
}

export interface LeaderboardResult {
  scope: LeaderboardScope
  updatedAt: string
  entries: LeaderboardEntry[]
}

const NAMES = [
  { name: 'Carlos Méndez',  team: 'Los Pumas FC',   badge: 'CM', color: '#FFB800' },
  { name: 'Martín Solís',   team: 'Rayo Urbano',    badge: 'MS', color: '#00D4FF' },
  { name: 'Diego Fuentes',  team: 'Águilas Doradas', badge: 'DF', color: '#B347FF' },
  { name: 'Alex Rivera',    team: 'Los Pumas FC',   badge: 'AR', color: '#CCFF00' },
  { name: 'Pablo Lanza',    team: 'Tigres Verdes',  badge: 'PL', color: '#FF5B3A' },
  { name: 'Rafa Ortiz',     team: 'Los Pumas FC',   badge: 'RO', color: '#CCFF00' },
  { name: 'Axel Romero',    team: 'Águilas Doradas', badge: 'AX', color: '#B347FF' },
  { name: 'Iván Pereyra',   team: 'Rayo Urbano',    badge: 'IP', color: '#00D4FF' },
  { name: 'Tomás Ibáñez',   team: 'Tigres Verdes',  badge: 'TI', color: '#FF5B3A' },
  { name: 'Dylan Castro',   team: 'Rayo Urbano',    badge: 'DC', color: '#00D4FF' },
]

function scoreOf(s: PlayerStats) {
  const played = Math.max(1, s.matches)
  return +(
    (s.goals / played) * 40 +
    (s.assists / played) * 25 +
    (s.wins / played) * 50 +
    (s.mvps / played) * 30
  ).toFixed(1)
}

export function simulateLeaderboard(input: LeaderboardInput = {}): LeaderboardResult {
  const scope = input.scope ?? 'regional'
  const seed = input.seed ?? seedFromString(`${scope}-week-${Math.floor(Date.now() / (7 * 864e5))}`)
  const rng = mulberry32(seed)

  const entries: LeaderboardEntry[] = NAMES.map((p) => {
    const matches = 10 + Math.floor(rng() * 35)
    const goals = Math.floor(rng() * matches * 0.9)
    const assists = Math.floor(rng() * matches * 0.5)
    const mvps = Math.floor(rng() * Math.min(8, matches * 0.3))
    const wins = Math.floor(rng() * matches * 0.8)
    const draws = Math.floor(rng() * (matches - wins) * 0.5)
    const losses = Math.max(0, matches - wins - draws)
    const stats: PlayerStats = { matches, goals, assists, mvps, wins, draws, losses }
    return {
      rank: 0,
      delta: Math.floor(rng() * 7) - 3,
      name: p.name, team: p.team, badge: p.badge, color: p.color,
      stats,
      score: scoreOf(stats),
      grade: gradeFromStats(stats),
    }
  })

  entries.sort((a, b) => b.score - a.score)
  entries.forEach((e, i) => { e.rank = i + 1 })

  return { scope, updatedAt: new Date().toISOString(), entries }
}
