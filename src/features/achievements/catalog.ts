/**
 * Catálogo de logros — reglas 100% determinísticas basadas en PlayerStats.
 * No depende de randomness, así que lo mismo se desbloquea siempre.
 */

import type { PlayerStats } from '../../ai/services/deterministic'

export type AchievementRarity = 'common' | 'rare' | 'epic' | 'legendary'

export interface Achievement {
  id: string
  title: string
  description: string
  emoji: string
  rarity: AchievementRarity
  /** Predicado determinístico sobre stats */
  check: (s: PlayerStats) => boolean
  /** Progreso 0-1 para barra */
  progress: (s: PlayerStats) => number
}

const pct = (x: number, target: number) => Math.max(0, Math.min(1, x / target))

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first-match',
    title: 'Debut',
    description: 'Jugá tu primer partido.',
    emoji: '👟',
    rarity: 'common',
    check: s => s.matches >= 1,
    progress: s => pct(s.matches, 1),
  },
  {
    id: 'ten-matches',
    title: 'Regular',
    description: 'Jugá 10 partidos.',
    emoji: '📅',
    rarity: 'common',
    check: s => s.matches >= 10,
    progress: s => pct(s.matches, 10),
  },
  {
    id: 'first-goal',
    title: 'Estreno goleador',
    description: 'Anotá tu primer gol.',
    emoji: '⚽',
    rarity: 'common',
    check: s => s.goals >= 1,
    progress: s => pct(s.goals, 1),
  },
  {
    id: 'ten-goals',
    title: 'Artillero',
    description: 'Marcá 10 goles en total.',
    emoji: '🎯',
    rarity: 'rare',
    check: s => s.goals >= 10,
    progress: s => pct(s.goals, 10),
  },
  {
    id: 'fifty-goals',
    title: 'Máquina de goles',
    description: '50 goles totales.',
    emoji: '🔥',
    rarity: 'epic',
    check: s => s.goals >= 50,
    progress: s => pct(s.goals, 50),
  },
  {
    id: 'assist-master',
    title: 'Habilitador',
    description: '10 asistencias en total.',
    emoji: '🎁',
    rarity: 'rare',
    check: s => s.assists >= 10,
    progress: s => pct(s.assists, 10),
  },
  {
    id: 'mvp',
    title: 'MVP',
    description: 'Ganá tu primer MVP.',
    emoji: '🏅',
    rarity: 'rare',
    check: s => s.mvps >= 1,
    progress: s => pct(s.mvps, 1),
  },
  {
    id: 'mvp-5',
    title: 'Líder del vestuario',
    description: '5 MVPs acumulados.',
    emoji: '👑',
    rarity: 'epic',
    check: s => s.mvps >= 5,
    progress: s => pct(s.mvps, 5),
  },
  {
    id: 'winstreak',
    title: 'Racha ganadora',
    description: '10 victorias.',
    emoji: '📈',
    rarity: 'rare',
    check: s => s.wins >= 10,
    progress: s => pct(s.wins, 10),
  },
  {
    id: 'win-rate-70',
    title: 'Ganador serial',
    description: '70% de partidos ganados (mín. 10).',
    emoji: '🏆',
    rarity: 'epic',
    check: s => s.matches >= 10 && (s.wins / s.matches) >= 0.7,
    progress: s => s.matches < 10 ? pct(s.matches, 10) * 0.5 : pct(s.wins / Math.max(1, s.matches), 0.7),
  },
  {
    id: 'contribution-king',
    title: 'Rey de la contribución',
    description: 'Goles + asistencias ≥ 30.',
    emoji: '💎',
    rarity: 'epic',
    check: s => (s.goals + s.assists) >= 30,
    progress: s => pct(s.goals + s.assists, 30),
  },
  {
    id: 'legend',
    title: 'Leyenda',
    description: '100 partidos + 50 goles + 10 MVPs.',
    emoji: '🌟',
    rarity: 'legendary',
    check: s => s.matches >= 100 && s.goals >= 50 && s.mvps >= 10,
    progress: s => (pct(s.matches, 100) + pct(s.goals, 50) + pct(s.mvps, 10)) / 3,
  },
]

export const RARITY_STYLE: Record<AchievementRarity, { color: string; bg: string; label: string }> = {
  common:    { color: '#94A3B8', bg: 'rgba(148,163,184,0.10)', label: 'Común' },
  rare:      { color: '#00D4FF', bg: 'rgba(0,212,255,0.12)',   label: 'Raro' },
  epic:      { color: '#B347FF', bg: 'rgba(179,71,255,0.14)',  label: 'Épico' },
  legendary: { color: '#FFB800', bg: 'rgba(255,184,0,0.16)',   label: 'Legendario' },
}

export function evaluateAchievements(stats: PlayerStats) {
  return ACHIEVEMENTS.map(a => ({
    achievement: a,
    unlocked: a.check(stats),
    progress: a.progress(stats),
  }))
}
