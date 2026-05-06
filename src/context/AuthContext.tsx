import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'

export interface User {
  name: string
  email: string
  position?: string
  team?: string
}

interface AuthCtx {
  user: User | null
  login: (u: User) => void
  logout: () => void
  updateUser: (patch: Partial<User>) => void
  toast: string
  setToast: (s: string) => void
}

const STORAGE_KEY = 'grada_user_v1'

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : null
    } catch {
      return null
    }
  })
  const [toast, setToast] = useState('')

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
      else localStorage.removeItem(STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [user])

  function login(u: User) {
    setUser(u)
    setToast(`¡Bienvenido, ${u.name.split(' ')[0]}!`)
  }

  function logout() {
    setUser(null)
    setToast('Sesión cerrada')
  }

  function updateUser(patch: Partial<User>) {
    setUser(prev => (prev ? { ...prev, ...patch } : prev))
  }

  return (
    <Ctx.Provider value={{ user, login, logout, updateUser, toast, setToast }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useAuth must be used within AuthProvider')
  return v
}
