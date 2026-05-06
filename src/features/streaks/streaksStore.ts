/**
 * Streaks — racha de días consecutivos con actividad. Persiste en localStorage.
 */

const KEY = 'fb_streak_v1'

interface StreakState {
  current: number
  best: number
  lastDay: string  // YYYY-MM-DD
}

function today(): string { return new Date().toISOString().slice(0, 10) }

function yesterday(d: string): string {
  const dt = new Date(d + 'T00:00:00Z')
  dt.setUTCDate(dt.getUTCDate() - 1)
  return dt.toISOString().slice(0, 10)
}

function load(): StreakState {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as StreakState
  } catch { /* ignore */ }
  return { current: 0, best: 0, lastDay: '' }
}

function save(s: StreakState) {
  try { localStorage.setItem(KEY, JSON.stringify(s)) } catch { /* ignore */ }
}

export function getStreak(): StreakState {
  const s = load()
  // Si hay gap (más de 1 día sin registrar), resetear current (pero no best).
  if (s.lastDay && s.lastDay !== today() && s.lastDay !== yesterday(today())) {
    const reset = { ...s, current: 0 }
    save(reset)
    return reset
  }
  return s
}

export function pingStreak(): StreakState {
  const s = load()
  const t = today()
  if (s.lastDay === t) return s
  let current: number
  if (s.lastDay === yesterday(t)) current = s.current + 1
  else current = 1
  const next: StreakState = {
    current,
    best: Math.max(s.best, current),
    lastDay: t,
  }
  save(next)
  return next
}

export function resetStreak() {
  save({ current: 0, best: 0, lastDay: '' })
}
