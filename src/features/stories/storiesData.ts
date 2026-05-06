/**
 * Stories mock — 24h highlights. Cada story se marca como "vista" en localStorage.
 */

export interface StoryItem {
  id: string
  title: string
  subtitle: string
  emoji: string
  bg: string      // gradient css
  ring: string    // color del anillo
  durationMs: number
  caption: string
  authorBadge: string
  authorColor: string
  timeAgo: string
}

export const STORIES: StoryItem[] = [
  {
    id: 's1', title: 'Pumas FC', subtitle: 'Gol de tiro libre', emoji: '⚽',
    bg: 'radial-gradient(circle at 30% 20%, rgba(204,255,0,0.4), rgba(15,13,10,0.95))',
    ring: '#CCFF00', durationMs: 5000,
    caption: '¡Qué golazo de tiro libre en el 88\'!',
    authorBadge: 'PF', authorColor: '#CCFF00', timeAgo: 'hace 2h',
  },
  {
    id: 's2', title: 'Carlos Méndez', subtitle: 'Hat-trick brutal', emoji: '🔥',
    bg: 'radial-gradient(circle at 70% 30%, rgba(255,184,0,0.4), rgba(15,13,10,0.95))',
    ring: '#FFB800', durationMs: 5000,
    caption: 'Tres goles en una tarde. MVP indiscutido.',
    authorBadge: 'CM', authorColor: '#FFB800', timeAgo: 'hace 4h',
  },
  {
    id: 's3', title: 'Rayo Urbano', subtitle: 'Atajada del año', emoji: '🧤',
    bg: 'radial-gradient(circle at 20% 70%, rgba(0,212,255,0.4), rgba(15,13,10,0.95))',
    ring: '#00D4FF', durationMs: 5000,
    caption: 'El arquero voló para sacar la del empate.',
    authorBadge: 'RU', authorColor: '#00D4FF', timeAgo: 'hace 6h',
  },
  {
    id: 's4', title: 'Águilas', subtitle: 'Entrenamiento', emoji: '💪',
    bg: 'radial-gradient(circle at 80% 80%, rgba(179,71,255,0.4), rgba(15,13,10,0.95))',
    ring: '#B347FF', durationMs: 5000,
    caption: 'Preparándose para el clásico del domingo.',
    authorBadge: 'AG', authorColor: '#B347FF', timeAgo: 'hace 8h',
  },
  {
    id: 's5', title: 'Tigres Verdes', subtitle: 'Nuevo fichaje', emoji: '🎯',
    bg: 'radial-gradient(circle at 50% 50%, rgba(255,91,58,0.4), rgba(15,13,10,0.95))',
    ring: '#FF5B3A', durationMs: 5000,
    caption: 'Delantero de 18 años se suma al plantel.',
    authorBadge: 'TV', authorColor: '#FF5B3A', timeAgo: 'hace 12h',
  },
]

const KEY = 'fb_stories_viewed'

export function getViewed(): Set<string> {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return new Set()
    return new Set(JSON.parse(raw) as string[])
  } catch { return new Set() }
}

export function markViewed(id: string) {
  try {
    const s = getViewed()
    s.add(id)
    localStorage.setItem(KEY, JSON.stringify([...s]))
  } catch { /* ignore */ }
}
