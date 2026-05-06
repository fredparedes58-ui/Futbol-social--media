/**
 * Servicios determinísticos puros.
 * Inputs iguales → outputs idénticos. Sin side-effects.
 * Usados por agentes y UI para cálculos estables (stats, ratings, probabilidad).
 */

// ── Seed PRNG (reproducible) ────────────────────────────────────────
export function mulberry32(seed: number): () => number {
  let s = seed >>> 0
  return () => {
    s = (s + 0x6D2B79F5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function seedFromString(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  }
  return h >>> 0
}

// ── Estadísticas ────────────────────────────────────────────────────
export interface PlayerStats {
  matches: number
  goals: number
  assists: number
  mvps: number
  wins: number
  draws: number
  losses: number
}

/** Métricas derivadas — 100% determinístico */
export function deriveMetrics(s: PlayerStats) {
  const played = Math.max(1, s.matches)
  return {
    goalsPerMatch: +(s.goals / played).toFixed(2),
    assistsPerMatch: +(s.assists / played).toFixed(2),
    winRate: +((s.wins / played) * 100).toFixed(1),
    contributionRate: +(((s.goals + s.assists) / played) * 100).toFixed(1),
    mvpRate: +((s.mvps / played) * 100).toFixed(1),
  }
}

/** Grado A+…C basado en reglas fijas (sin randomness). */
export function gradeFromStats(s: PlayerStats): 'A+' | 'A' | 'B+' | 'B' | 'C' {
  const m = deriveMetrics(s)
  const score =
    m.goalsPerMatch * 40 +
    m.assistsPerMatch * 25 +
    m.winRate * 0.5 +
    m.mvpRate * 1.2
  if (score >= 100) return 'A+'
  if (score >= 75)  return 'A'
  if (score >= 55)  return 'B+'
  if (score >= 35)  return 'B'
  return 'C'
}

// ── Probabilidad de partido (Elo-lite) ──────────────────────────────
export function winProbability(homeRating: number, awayRating: number): {
  home: number; draw: number; away: number
} {
  const diff = homeRating - awayRating + 5 // ventaja local
  const expected = 1 / (1 + Math.pow(10, -diff / 400))
  const home = +(expected * 0.9).toFixed(3)
  const away = +((1 - expected) * 0.9).toFixed(3)
  const draw = +(1 - home - away).toFixed(3)
  return { home, draw, away }
}

// ── Utilidades generales ────────────────────────────────────────────
export function pickDeterministic<T>(arr: readonly T[], seed: number, n = 1): T[] {
  const rng = mulberry32(seed)
  const copy = [...arr]
  const out: T[] = []
  for (let i = 0; i < n && copy.length > 0; i++) {
    const idx = Math.floor(rng() * copy.length)
    out.push(copy.splice(idx, 1)[0])
  }
  return out
}

export function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x))
}
