import {
  createContext, useContext, useState, useCallback, useEffect, type ReactNode,
} from 'react'

export interface PredictionMatch {
  id: string
  home: string
  away: string
  homeColor: string
  awayColor: string
  homeBadge: string
  awayBadge: string
  date: string
  venue: string
  /** undefined while match is upcoming; set when result is settled (mock) */
  finalHome?: number
  finalAway?: number
}

export interface Prediction {
  userName: string
  badge: string
  color: string
  home: number
  away: number
  at: number // timestamp
}

interface PredictionsCtx {
  matches: PredictionMatch[]
  /** Map matchId → list of predictions (empty = nobody joined yet) */
  predictions: Record<string, Prediction[]>
  /** Adds or updates the current user's prediction for a match. */
  submit: (matchId: string, p: Omit<Prediction, 'at'>) => void
  /** Removes the current user's prediction (opt-out). */
  withdraw: (matchId: string, userName: string) => void
  hasJoined: (matchId: string, userName: string) => boolean
  getUserPrediction: (matchId: string, userName: string) => Prediction | undefined
  totalParticipants: (matchId: string) => number
}

const STORAGE_KEY = 'grada_predictions_v1'

const MATCHES: PredictionMatch[] = [
  {
    id: 'm1',
    home: 'Los Pumas FC', away: 'Rayo Urbano',
    homeColor: '#CCFF00', awayColor: '#FF5B3A',
    homeBadge: 'LP', awayBadge: 'RU',
    date: 'Dom · 10:00', venue: 'Cancha A',
  },
  {
    id: 'm2',
    home: 'Águilas Doradas', away: 'Tigres Verdes',
    homeColor: '#FFB800', awayColor: '#FFB800',
    homeBadge: 'AD', awayBadge: 'TV',
    date: 'Dom · 12:00', venue: 'Cancha B',
  },
  {
    id: 'm3',
    home: 'Phantom FC', away: 'Cometa SC',
    homeColor: '#CCFF00', awayColor: '#FF5B3A',
    homeBadge: 'PF', awayBadge: 'CS',
    date: 'Sáb · 16:00', venue: 'Cancha C',
  },
  {
    id: 'm4',
    home: 'Tigres Verdes', away: 'Los Pumas FC',
    homeColor: '#FFB800', awayColor: '#CCFF00',
    homeBadge: 'TV', awayBadge: 'LP',
    date: 'Sáb · 18:30', venue: 'Cancha A',
  },
]

/** Seeded mock predictions so the feature doesn't look empty on first load. */
const SEED: Record<string, Prediction[]> = {
  m1: [
    { userName: 'Carlos Méndez', badge: 'CM', color: '#FFB800', home: 2, away: 1, at: Date.now() - 3600_000 },
    { userName: 'Ana Torres',    badge: 'AT', color: '#CCFF00', home: 3, away: 0, at: Date.now() - 1800_000 },
    { userName: 'Diego S.',      badge: 'DS', color: '#FF5B3A', home: 1, away: 1, at: Date.now() - 600_000 },
  ],
  m2: [
    { userName: 'Lautaro Paz', badge: 'LP', color: '#FFB800', home: 2, away: 2, at: Date.now() - 7200_000 },
  ],
  m3: [],
  m4: [
    { userName: 'Ana Torres', badge: 'AT', color: '#CCFF00', home: 1, away: 3, at: Date.now() - 500_000 },
    { userName: 'Emi Quiroga', badge: 'EQ', color: '#FF5B3A', home: 0, away: 2, at: Date.now() - 300_000 },
  ],
}

const Ctx = createContext<PredictionsCtx | null>(null)

export function PredictionsProvider({ children }: { children: ReactNode }) {
  const [predictions, setPredictions] = useState<Record<string, Prediction[]>>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      return raw ? JSON.parse(raw) : SEED
    } catch {
      return SEED
    }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(predictions)) }
    catch { /* ignore */ }
  }, [predictions])

  const submit = useCallback<PredictionsCtx['submit']>((matchId, p) => {
    setPredictions(prev => {
      const list = prev[matchId] ?? []
      const others = list.filter(x => x.userName !== p.userName)
      const next: Prediction = { ...p, at: Date.now() }
      return { ...prev, [matchId]: [next, ...others] }
    })
  }, [])

  const withdraw = useCallback<PredictionsCtx['withdraw']>((matchId, userName) => {
    setPredictions(prev => {
      const list = prev[matchId] ?? []
      return { ...prev, [matchId]: list.filter(x => x.userName !== userName) }
    })
  }, [])

  const hasJoined = useCallback<PredictionsCtx['hasJoined']>((matchId, userName) => {
    return (predictions[matchId] ?? []).some(p => p.userName === userName)
  }, [predictions])

  const getUserPrediction = useCallback<PredictionsCtx['getUserPrediction']>((matchId, userName) => {
    return (predictions[matchId] ?? []).find(p => p.userName === userName)
  }, [predictions])

  const totalParticipants = useCallback<PredictionsCtx['totalParticipants']>((matchId) => {
    return (predictions[matchId] ?? []).length
  }, [predictions])

  return (
    <Ctx.Provider value={{ matches: MATCHES, predictions, submit, withdraw, hasJoined, getUserPrediction, totalParticipants }}>
      {children}
    </Ctx.Provider>
  )
}

export function usePredictions() {
  const v = useContext(Ctx)
  if (!v) throw new Error('usePredictions must be used within PredictionsProvider')
  return v
}
