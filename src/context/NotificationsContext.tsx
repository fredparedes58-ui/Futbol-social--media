import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'

export type NotifKind =
  | 'match'
  | 'goal'
  | 'message'
  | 'team'
  | 'trophy'
  // FFCV — detectados por humanscraper-toolkit
  | 'ffcv_schedule_change'
  | 'ffcv_postponed'
  | 'ffcv_live_goal'
  | 'ffcv_result'

export interface Notif {
  id: string
  kind: NotifKind
  title: string
  body: string
  time: string
  read: boolean
}

interface NotifCtx {
  items: Notif[]
  unread: number
  markAllRead: () => void
  markRead: (id: string) => void
  push: (n: Omit<Notif, 'id' | 'read' | 'time'>) => void
}

const INITIAL: Notif[] = [
  { id: 'n1', kind: 'goal',    title: 'Carlos Méndez anotó', body: 'Hat-trick ante Rayo Urbano (3-1)', time: 'ahora',   read: false },
  { id: 'n2', kind: 'match',   title: 'Partido confirmado',   body: 'Los Pumas vs Águilas · Sáb 10:00', time: 'hace 1 h', read: false },
  { id: 'n3', kind: 'team',    title: 'Nueva solicitud',      body: 'Phantom FC quiere jugar un amistoso', time: 'hace 3 h', read: false },
  // FFCV events
  { id: 'nf1', kind: 'ffcv_live_goal',       title: '⚽ Gol en directo',        body: 'Vila-real CF B 2 – 1 CF Burjassot · Preferente B', time: 'hace 4 min', read: false },
  { id: 'nf2', kind: 'ffcv_schedule_change', title: '⏰ Cambio de hora',        body: 'CD Benidorm vs CF Gandía: ahora sábado 10:00', time: 'hace 10 min', read: false },
  { id: 'nf3', kind: 'ffcv_postponed',       title: '🚨 Partido aplazado',      body: 'CD Torrevieja vs UD Alcoy aplazado sin nueva fecha', time: 'hace 32 min', read: false },
  { id: 'n4', kind: 'trophy',  title: 'Logro desbloqueado',   body: 'Goleador del mes · +10 goles', time: 'Ayer', read: true },
  { id: 'n5', kind: 'message', title: 'Ana Torres te etiquetó', body: '"Mira este golazo que te armé"', time: 'Ayer', read: true },
  { id: 'nf4', kind: 'ffcv_result',          title: '🏁 Resultado oficial',     body: 'CD Castellón B 0 – 0 Levante UD B · Preferente B', time: 'Ayer', read: true },
]

const Ctx = createContext<NotifCtx | null>(null)

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Notif[]>(INITIAL)

  const markAllRead = useCallback(() => {
    setItems(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const markRead = useCallback((id: string) => {
    setItems(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)))
  }, [])

  const push = useCallback<NotifCtx['push']>((n) => {
    setItems(prev => [
      { ...n, id: `n${Date.now()}`, read: false, time: 'ahora' },
      ...prev,
    ])
  }, [])

  const unread = items.filter(n => !n.read).length

  return (
    <Ctx.Provider value={{ items, unread, markAllRead, markRead, push }}>
      {children}
    </Ctx.Provider>
  )
}

export function useNotifications() {
  const v = useContext(Ctx)
  if (!v) throw new Error('useNotifications must be used within NotificationsProvider')
  return v
}
