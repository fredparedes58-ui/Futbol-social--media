import { useMemo, useState } from 'react'
import { Shield, Users, RefreshCw, Crown, Swords, Target } from 'lucide-react'
import BottomSheet from './BottomSheet'
import RippleButton from './RippleButton'
import { generateLineup, type Formation, type Lineup } from '../../lib/aiMocks'

const FORMATIONS: Formation[] = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2']
const STYLES: Lineup['style'][] = ['ofensivo', 'equilibrado', 'defensivo']

const STYLE_COLOR: Record<Lineup['style'], string> = {
  ofensivo: '#FF5B3A',
  equilibrado: '#CCFF00',
  defensivo: '#00D4FF',
}

interface LineupSheetProps {
  open: boolean
  onClose: () => void
  opponent: string
}

export default function LineupSheet({ open, onClose, opponent }: LineupSheetProps) {
  const [formation, setFormation] = useState<Formation>('4-3-3')
  const [style, setStyle] = useState<Lineup['style']>('equilibrado')
  const [seed, setSeed] = useState(0)
  const lineup = useMemo(() => generateLineup(opponent, formation, style),
    [opponent, formation, style, seed])

  const styleColor = STYLE_COLOR[style]

  return (
    <BottomSheet open={open} onClose={onClose} title={`Alineación vs ${opponent}`}>
      {/* Selectors */}
      <div style={{ marginBottom: 14 }}>
        <div style={{
          fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
          color: 'rgba(250,245,235,0.5)', letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: 6,
        }}>
          Formación
        </div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
          {FORMATIONS.map(f => (
            <button
              key={f}
              onClick={() => setFormation(f)}
              style={{
                padding: '6px 12px', borderRadius: 999,
                background: formation === f ? 'rgba(204, 255, 0, 0.18)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${formation === f ? 'rgba(204, 255, 0, 0.5)' : 'rgba(255, 220, 180, 0.1)'}`,
                color: formation === f ? '#CCFF00' : 'rgba(250, 245, 235, 0.6)',
                fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 11,
                letterSpacing: '0.04em', cursor: 'pointer',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {f}
            </button>
          ))}
        </div>

        <div style={{
          fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
          color: 'rgba(250,245,235,0.5)', letterSpacing: '0.1em',
          textTransform: 'uppercase', marginBottom: 6,
        }}>
          Estilo
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {STYLES.map(s => (
            <button
              key={s}
              onClick={() => setStyle(s)}
              style={{
                flex: 1, padding: '8px 10px', borderRadius: 10,
                background: style === s ? `${STYLE_COLOR[s]}22` : 'rgba(255,255,255,0.04)',
                border: `1px solid ${style === s ? STYLE_COLOR[s] + '88' : 'rgba(255, 220, 180, 0.1)'}`,
                color: style === s ? STYLE_COLOR[s] : 'rgba(250, 245, 235, 0.6)',
                fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
                textTransform: 'capitalize', cursor: 'pointer',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Campo */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '16/11',
          borderRadius: 14,
          background: `
            linear-gradient(90deg, rgba(204,255,0,0.06), transparent 40%, transparent 60%, rgba(0,212,255,0.06)),
            repeating-linear-gradient(90deg, rgba(0,0,0,0.18) 0 24px, transparent 24px 48px),
            linear-gradient(180deg, #1a2f1a, #0f2010)
          `,
          border: '1px solid rgba(204, 255, 0, 0.2)',
          boxShadow: `inset 0 0 40px rgba(0,0,0,0.5), 0 0 24px ${styleColor}22`,
          overflow: 'hidden',
          marginBottom: 14,
        }}
      >
        {/* Línea media */}
        <div style={{
          position: 'absolute', left: '50%', top: 0, bottom: 0,
          width: 1, background: 'rgba(255,255,255,0.2)',
        }} />
        {/* Círculo central */}
        <div style={{
          position: 'absolute', left: '50%', top: '50%',
          width: '15%', aspectRatio: '1', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.18)',
          transform: 'translate(-50%,-50%)',
        }} />
        {/* Áreas */}
        <div style={{
          position: 'absolute', left: 0, top: '22%', bottom: '22%',
          width: '12%', border: '1px solid rgba(255,255,255,0.15)', borderLeft: 'none',
        }} />
        <div style={{
          position: 'absolute', right: 0, top: '22%', bottom: '22%',
          width: '12%', border: '1px solid rgba(255,255,255,0.15)', borderRight: 'none',
        }} />

        {/* Jugadores */}
        {lineup.players.map((p, i) => (
          <div
            key={`${p.slot}-${i}`}
            style={{
              position: 'absolute',
              left: `${p.x}%`, top: `${p.y}%`,
              transform: 'translate(-50%, -50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2,
              animation: `slide-up-fade 420ms ease-out backwards`,
              animationDelay: `${i * 35}ms`,
            }}
          >
            <div
              style={{
                width: 30, height: 30, borderRadius: '50%',
                background: p.name === lineup.keyPlayer
                  ? `linear-gradient(135deg, ${styleColor}, #FFB800)`
                  : `${styleColor}dd`,
                color: '#0F0D0A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Archivo, sans-serif', fontWeight: 900, fontSize: 12,
                border: p.name === lineup.keyPlayer ? `2px solid #FFB800` : `1.5px solid ${styleColor}`,
                boxShadow: p.name === lineup.keyPlayer
                  ? `0 0 14px ${styleColor}, 0 0 22px rgba(255,184,0,0.6)`
                  : `0 0 8px ${styleColor}66`,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {p.number}
            </div>
            <div style={{
              fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 8,
              color: '#FAF5EB',
              background: 'rgba(15, 13, 10, 0.75)',
              padding: '1px 5px',
              borderRadius: 3,
              whiteSpace: 'nowrap',
              letterSpacing: '0.02em',
              textShadow: '0 1px 2px rgba(0,0,0,0.8)',
            }}>
              {p.name.split(' ')[0]}
            </div>
          </div>
        ))}
      </div>

      {/* Insights */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: `linear-gradient(90deg, ${styleColor}14, transparent)`,
          border: `1px solid ${styleColor}55`,
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <Crown size={16} color={styleColor} />
          <div style={{ flex: 1 }}>
            <div style={{
              fontFamily: 'Space Grotesk', fontSize: 10,
              color: 'rgba(250,245,235,0.5)',
              letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              Jugador clave
            </div>
            <div style={{
              fontFamily: 'Archivo', fontWeight: 800, fontSize: 14,
              color: '#FAF5EB', marginTop: 2,
            }}>
              {lineup.keyPlayer}
            </div>
          </div>
        </div>

        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(255, 91, 58, 0.06)',
          border: '1px solid rgba(255, 91, 58, 0.3)',
          display: 'flex', alignItems: 'start', gap: 10,
        }}>
          <Shield size={14} color="#FF5B3A" style={{ marginTop: 2, flexShrink: 0 }} />
          <div style={{
            fontFamily: 'Space Grotesk', fontSize: 12,
            color: 'rgba(250,245,235,0.85)', lineHeight: 1.5,
          }}>
            <strong style={{ color: '#FF5B3A' }}>Riesgo:</strong> {lineup.risk}
          </div>
        </div>

        <div style={{
          padding: '10px 12px', borderRadius: 10,
          background: 'rgba(204, 255, 0, 0.05)',
          border: '1px solid rgba(204, 255, 0, 0.25)',
          fontFamily: 'Archivo', fontStyle: 'italic', fontSize: 13,
          color: '#FAF5EB',
          textAlign: 'center',
        }}>
          "{lineup.hypeLine}"
        </div>
      </div>

      <RippleButton
        onClick={() => setSeed(s => s + 1)}
        rippleColor="rgba(15, 13, 10, 0.35)"
        style={{
          width: '100%', padding: '12px 14px', borderRadius: 12,
          background: 'linear-gradient(135deg, #CCFF00, #FFB800)',
          border: 'none',
          color: '#0F0D0A',
          fontFamily: 'Archivo', fontWeight: 800, fontSize: 12,
          letterSpacing: '0.06em', textTransform: 'uppercase',
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          boxShadow: '0 6px 20px rgba(204, 255, 0, 0.35)',
        }}
      >
        <RefreshCw size={13} />
        Regenerar alineación
      </RippleButton>

      {/* Footer info */}
      <div style={{
        marginTop: 10,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'Space Grotesk', fontSize: 10,
        color: 'rgba(250, 245, 235, 0.4)',
      }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Users size={10} /> {lineup.players.length} jugadores
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Swords size={10} /> Estilo {style}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Target size={10} /> {formation}
        </span>
      </div>
    </BottomSheet>
  )
}
