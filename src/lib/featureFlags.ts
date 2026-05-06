/**
 * Feature flags — gate de features con persistencia en localStorage.
 * Uso: `if (isEnabled('coach-chat')) { ... }` o hook `useFlag('coach-chat')`.
 */
import { useEffect, useState } from 'react'

export type FlagKey =
  | 'coach-chat'
  | 'match-replay'
  | 'duels'
  | 'market'
  | 'season-pass'
  | 'stories'
  | 'polls'
  | 'events'
  | 'leaderboard'

const DEFAULTS: Record<FlagKey, boolean> = {
  'coach-chat':   true,
  'match-replay': true,
  'duels':        true,
  'market':       true,
  'season-pass':  true,
  'stories':      true,
  'polls':        true,
  'events':       true,
  'leaderboard':  true,
}

const KEY = 'fb_feature_flags_v1'

function load(): Partial<Record<FlagKey, boolean>> {
  try { return JSON.parse(localStorage.getItem(KEY) ?? '{}') }
  catch { return {} }
}

function save(flags: Partial<Record<FlagKey, boolean>>) {
  try { localStorage.setItem(KEY, JSON.stringify(flags)) } catch { /* ignore */ }
}

export function isEnabled(key: FlagKey): boolean {
  const overrides = load()
  return overrides[key] ?? DEFAULTS[key]
}

export function setFlag(key: FlagKey, value: boolean) {
  const overrides = load()
  overrides[key] = value
  save(overrides)
  window.dispatchEvent(new CustomEvent('fb-flags-changed'))
}

export function resetFlags() {
  try { localStorage.removeItem(KEY) } catch { /* ignore */ }
  window.dispatchEvent(new CustomEvent('fb-flags-changed'))
}

export function useFlag(key: FlagKey): boolean {
  const [enabled, setEnabled] = useState(() => isEnabled(key))
  useEffect(() => {
    const h = () => setEnabled(isEnabled(key))
    window.addEventListener('fb-flags-changed', h)
    return () => window.removeEventListener('fb-flags-changed', h)
  }, [key])
  return enabled
}
