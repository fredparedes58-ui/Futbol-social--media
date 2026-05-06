import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type ThemeMode = 'dark' | 'light'

interface ThemeCtx {
  mode: ThemeMode
  toggle: () => void
  setMode: (m: ThemeMode) => void
}

const STORAGE_KEY = 'grada_theme_v1'

const Ctx = createContext<ThemeCtx | null>(null)

/**
 * Theme CSS tokens applied to :root. Pages can read via `var(--*)` or keep
 * legacy hex values (dark default). Light mode swaps surfaces + text contrast.
 */
const TOKENS: Record<ThemeMode, Record<string, string>> = {
  dark: {
    '--bg-deep':       '#0F0D0A',
    '--bg-base':       '#141009',
    '--bg-surface':    'rgba(255, 255, 255, 0.04)',
    '--bg-surface-alt':'rgba(255, 255, 255, 0.06)',
    '--text-primary':  '#FAF5EB',
    '--text-muted':    'rgba(250, 245, 235, 0.6)',
    '--text-dim':      'rgba(250, 245, 235, 0.4)',
    '--border':        'rgba(255, 220, 180, 0.08)',
    '--accent-primary':'#CCFF00',
    '--accent-amber':  '#FFB800',
    '--accent-coral':  '#FF5B3A',
  },
  light: {
    '--bg-deep':       '#F5F1E8',
    '--bg-base':       '#FAF5EB',
    '--bg-surface':    'rgba(15, 13, 10, 0.04)',
    '--bg-surface-alt':'rgba(15, 13, 10, 0.06)',
    '--text-primary':  '#0F0D0A',
    '--text-muted':    'rgba(15, 13, 10, 0.65)',
    '--text-dim':      'rgba(15, 13, 10, 0.4)',
    '--border':        'rgba(15, 13, 10, 0.12)',
    '--accent-primary':'#7AB800',
    '--accent-amber':  '#D99200',
    '--accent-coral':  '#E04828',
  },
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return (raw === 'light' || raw === 'dark') ? raw : 'dark'
    } catch {
      return 'dark'
    }
  })

  useEffect(() => {
    const tokens = TOKENS[mode]
    const root = document.documentElement
    Object.entries(tokens).forEach(([k, v]) => root.style.setProperty(k, v))
    root.setAttribute('data-theme', mode)
    try { localStorage.setItem(STORAGE_KEY, mode) } catch { /* ignore */ }
  }, [mode])

  const toggle = () => setModeState(m => (m === 'dark' ? 'light' : 'dark'))
  const setMode = (m: ThemeMode) => setModeState(m)

  return (
    <Ctx.Provider value={{ mode, toggle, setMode }}>
      {children}
    </Ctx.Provider>
  )
}

export function useTheme() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useTheme must be used within ThemeProvider')
  return v
}
