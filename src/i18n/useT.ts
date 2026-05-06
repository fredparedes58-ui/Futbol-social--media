/**
 * useT — hook mínimo de i18n con persistencia en localStorage.
 */
import { useCallback, useEffect, useState } from 'react'
import { translate, type Lang } from './translations'

const KEY = 'fb_lang'

function detectLang(): Lang {
  try {
    const stored = localStorage.getItem(KEY) as Lang | null
    if (stored === 'es' || stored === 'en') return stored
  } catch { /* ignore */ }
  const nav = typeof navigator !== 'undefined' ? navigator.language : 'es'
  return nav.startsWith('en') ? 'en' : 'es'
}

export function useT() {
  const [lang, setLangState] = useState<Lang>(() => detectLang())

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === KEY && (e.newValue === 'es' || e.newValue === 'en')) {
        setLangState(e.newValue)
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try { localStorage.setItem(KEY, l) } catch { /* ignore */ }
  }, [])

  const t = useCallback((key: string) => translate(lang, key), [lang])

  return { t, lang, setLang }
}
