/**
 * MarketSheet — mercado de fichajes mock. Ficha/libera con créditos.
 * Persistencia: localStorage (squad + credits).
 */
import { useEffect, useState } from 'react'
import { Coins, Plus, Minus, Shield } from 'lucide-react'
import BottomSheet from '../../components/ui/BottomSheet'

interface Player {
  id: string
  name: string
  pos: 'GK' | 'DEF' | 'MID' | 'FWD'
  rating: number
  price: number
  color: string
  emoji: string
}

const MARKET: Player[] = [
  { id: 'p1', name: 'Lucas Varela',   pos: 'FWD', rating: 88, price: 1800, color: '#FFB800', emoji: '⚡' },
  { id: 'p2', name: 'Nico Acuña',     pos: 'MID', rating: 82, price: 1200, color: '#CCFF00', emoji: '🎯' },
  { id: 'p3', name: 'Matías Godoy',   pos: 'DEF', rating: 79, price: 900,  color: '#00D4FF', emoji: '🛡️' },
  { id: 'p4', name: 'Rafa Pizarro',   pos: 'GK',  rating: 85, price: 1500, color: '#B347FF', emoji: '🧤' },
  { id: 'p5', name: 'Tobías Salas',   pos: 'FWD', rating: 76, price: 700,  color: '#FF5B3A', emoji: '🏃' },
  { id: 'p6', name: 'Emilio Ruiz',    pos: 'MID', rating: 84, price: 1400, color: '#CCFF00', emoji: '🧠' },
  { id: 'p7', name: 'Joaquín Vega',   pos: 'DEF', rating: 81, price: 1100, color: '#00D4FF', emoji: '💪' },
  { id: 'p8', name: 'Santi Paredes',  pos: 'FWD', rating: 90, price: 2400, color: '#FFB800', emoji: '🌟' },
]

const SQUAD_KEY = 'fb_market_squad'
const CREDITS_KEY = 'fb_market_credits'
const INITIAL_CREDITS = 5000

function loadSquad(): string[] {
  try { return JSON.parse(localStorage.getItem(SQUAD_KEY) ?? '[]') as string[] } catch { return [] }
}
function loadCredits(): number {
  try { const v = Number(localStorage.getItem(CREDITS_KEY)); return Number.isFinite(v) && v > 0 ? v : INITIAL_CREDITS }
  catch { return INITIAL_CREDITS }
}

interface Props { open: boolean; onClose: () => void }

export default function MarketSheet({ open, onClose }: Props) {
  const [squad, setSquad] = useState<string[]>(() => loadSquad())
  const [credits, setCredits] = useState<number>(() => loadCredits())
  const [filter, setFilter] = useState<'ALL' | Player['pos']>('ALL')

  useEffect(() => { localStorage.setItem(SQUAD_KEY, JSON.stringify(squad)) }, [squad])
  useEffect(() => { localStorage.setItem(CREDITS_KEY, String(credits)) }, [credits])

  const filtered = filter === 'ALL' ? MARKET : MARKET.filter(p => p.pos === filter)

  function sign(p: Player) {
    if (squad.includes(p.id)) return
    if (credits < p.price) return
    setCredits(c => c - p.price)
    setSquad(s => [...s, p.id])
    if ('vibrate' in navigator) navigator.vibrate([8, 40, 12])
  }

  function release(p: Player) {
    if (!squad.includes(p.id)) return
    setCredits(c => c + Math.floor(p.price * 0.7))
    setSquad(s => s.filter(id => id !== p.id))
    if ('vibrate' in navigator) navigator.vibrate(10)
  }

  return (
    <BottomSheet open={open} onClose={onClose} title="Mercado de fichajes" height="90%" accent="#CCFF00">
      {/* Wallet */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', borderRadius: 14, marginBottom: 12,
        background: 'linear-gradient(135deg, rgba(204,255,0,0.18), rgba(255,184,0,0.10))',
        border: '1px solid rgba(204,255,0,0.45)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Coins size={20} color="#FFB800" />
          <div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(250,245,235,0.55)' }}>
              Créditos
            </div>
            <div style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 22, color: '#FFB800' }}>
              {credits.toLocaleString()}
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(250,245,235,0.55)' }}>
            Plantel
          </div>
          <div style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 22, color: '#CCFF00' }}>
            {squad.length} jug.
          </div>
        </div>
      </div>

      {/* Filtro */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
        {(['ALL', 'GK', 'DEF', 'MID', 'FWD'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 12px', borderRadius: 999,
              background: filter === f ? 'rgba(204,255,0,0.15)' : 'rgba(255,255,255,0.04)',
              border: `1px solid ${filter === f ? 'rgba(204,255,0,0.5)' : 'rgba(255,220,180,0.1)'}`,
              color: filter === f ? '#CCFF00' : 'rgba(250,245,235,0.65)',
              fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
              cursor: 'pointer',
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Lista */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.map(p => {
          const signed = squad.includes(p.id)
          const canAfford = credits >= p.price
          return (
            <div key={p.id} style={{
              display: 'grid', gridTemplateColumns: '42px 1fr auto', gap: 12, alignItems: 'center',
              padding: '10px 12px', borderRadius: 12,
              background: signed ? `${p.color}14` : 'rgba(255,255,255,0.03)',
              border: `1px solid ${signed ? p.color + '55' : 'rgba(255,220,180,0.08)'}`,
            }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10,
                background: `${p.color}22`, color: p.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20,
                border: `1px solid ${p.color}66`,
              }}>
                {p.emoji}
              </div>
              <div>
                <div style={{ fontFamily: 'Archivo', fontWeight: 700, fontSize: 13, color: '#FAF5EB' }}>
                  {p.name}
                </div>
                <div style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.55)' }}>
                  {p.pos} · ⭐ {p.rating} · 🪙 {p.price}
                </div>
              </div>
              {signed ? (
                <button
                  onClick={() => release(p)}
                  style={{
                    padding: '7px 12px', borderRadius: 10,
                    background: 'rgba(255,91,58,0.14)',
                    border: '1px solid rgba(255,91,58,0.5)',
                    color: '#FF5B3A', cursor: 'pointer',
                    fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <Minus size={12} /> Liberar
                </button>
              ) : (
                <button
                  onClick={() => sign(p)}
                  disabled={!canAfford}
                  style={{
                    padding: '7px 12px', borderRadius: 10,
                    background: canAfford ? 'linear-gradient(135deg, rgba(204,255,0,0.2), rgba(255,184,0,0.12))' : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${canAfford ? 'rgba(204,255,0,0.55)' : 'rgba(255,220,180,0.1)'}`,
                    color: canAfford ? '#CCFF00' : 'rgba(250,245,235,0.3)',
                    cursor: canAfford ? 'pointer' : 'not-allowed',
                    fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
                    display: 'inline-flex', alignItems: 'center', gap: 4,
                  }}
                >
                  <Plus size={12} /> Fichar
                </button>
              )}
            </div>
          )
        })}
      </div>

      <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.45)' }}>
        <Shield size={10} /> Liberar devuelve 70% del valor. Modo simulado.
      </div>
    </BottomSheet>
  )
}
