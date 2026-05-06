import { useMemo } from 'react'
import { AlertTriangle, Zap, ShieldOff, Lightbulb, Flame, Activity } from 'lucide-react'
import BottomSheet from './BottomSheet'
import AIBorder from './AIBorder'
import { generateRivalReport } from '../../lib/aiMocks'

interface RivalScoutSheetProps {
  open: boolean
  onClose: () => void
  opponent: string
}

const THREAT_COLOR: Record<string, string> = {
  bajo:    '#00D4FF',
  medio:   '#CCFF00',
  alto:    '#FFB800',
  extremo: '#FF5B3A',
}

export default function RivalScoutSheet({ open, onClose, opponent }: RivalScoutSheetProps) {
  const report = useMemo(() => generateRivalReport(opponent), [opponent])
  const threatColor = THREAT_COLOR[report.threatLevel]

  return (
    <BottomSheet open={open} onClose={onClose} title="Scouting rival">
      {/* Header */}
      <AIBorder colors={[threatColor, '#B347FF', threatColor]} radius={14} speed={8} halo={0.45} style={{ marginBottom: 14 }}>
        <div
          style={{
            padding: 16,
            background: 'linear-gradient(135deg, rgba(26,22,18,0.9), rgba(15,13,10,0.95))',
            display: 'flex', alignItems: 'center', gap: 14,
          }}
        >
          <div
            style={{
              width: 56, height: 56, borderRadius: 14,
              background: `linear-gradient(135deg, ${threatColor}33, ${threatColor}11)`,
              border: `1.5px solid ${threatColor}77`,
              color: threatColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Archivo', fontWeight: 900, fontSize: 22,
              boxShadow: `0 0 16px ${threatColor}55`,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {report.overall}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: 'Archivo', fontWeight: 900, fontSize: 18,
              color: '#FAF5EB', lineHeight: 1.1,
            }}>
              {report.opponent}
            </div>
            <div style={{
              fontFamily: 'Space Grotesk', fontSize: 11,
              color: 'rgba(250,245,235,0.55)', marginTop: 4,
              textTransform: 'capitalize',
            }}>
              {report.preferredStyle} · {report.preferredFormation}
            </div>
            <div style={{
              marginTop: 6,
              display: 'inline-flex', alignItems: 'center', gap: 4,
              padding: '2px 8px', borderRadius: 999,
              background: `${threatColor}22`,
              border: `1px solid ${threatColor}66`,
              color: threatColor,
              fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 700,
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}>
              <AlertTriangle size={10} />
              Amenaza {report.threatLevel}
            </div>
          </div>
        </div>
      </AIBorder>

      {/* Forma reciente */}
      <div style={{
        marginBottom: 14,
        padding: '10px 12px', borderRadius: 10,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,220,180,0.08)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <Activity size={14} color="rgba(250,245,235,0.55)" />
        <div style={{
          fontFamily: 'Space Grotesk', fontSize: 10,
          color: 'rgba(250,245,235,0.5)',
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          Forma
        </div>
        <div style={{ display: 'flex', gap: 4, marginLeft: 'auto' }}>
          {report.form.map((f, i) => (
            <div
              key={i}
              style={{
                width: 22, height: 22, borderRadius: 6,
                background: f === 'W' ? 'rgba(204,255,0,0.2)' : f === 'D' ? 'rgba(255,184,0,0.2)' : 'rgba(255,91,58,0.2)',
                border: `1px solid ${f === 'W' ? '#CCFF00' : f === 'D' ? '#FFB800' : '#FF5B3A'}88`,
                color: f === 'W' ? '#CCFF00' : f === 'D' ? '#FFB800' : '#FF5B3A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Archivo', fontWeight: 900, fontSize: 10,
              }}
            >
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Jugador peligroso */}
      <div style={{
        marginBottom: 14,
        padding: '12px 14px', borderRadius: 12,
        background: 'linear-gradient(90deg, rgba(255,91,58,0.12), rgba(255,91,58,0.02))',
        border: '1px solid rgba(255,91,58,0.4)',
        display: 'flex', alignItems: 'center', gap: 12,
      }}>
        <div style={{
          width: 34, height: 34, borderRadius: 10,
          background: 'rgba(255,91,58,0.22)', color: '#FF5B3A',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,91,58,0.5)',
          flexShrink: 0,
        }}>
          <Flame size={17} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'Space Grotesk', fontSize: 9,
            color: 'rgba(255, 91, 58, 0.8)',
            letterSpacing: '0.12em', textTransform: 'uppercase',
            fontWeight: 700,
          }}>
            Jugador peligroso · {report.dangerPlayer.role}
          </div>
          <div style={{
            fontFamily: 'Archivo', fontWeight: 800, fontSize: 14,
            color: '#FAF5EB', marginTop: 2,
          }}>
            {report.dangerPlayer.name}
          </div>
          <div style={{
            fontFamily: 'Space Grotesk', fontSize: 11,
            color: 'rgba(250,245,235,0.65)', marginTop: 2,
          }}>
            {report.dangerPlayer.note}
          </div>
        </div>
      </div>

      {/* Fortalezas y debilidades */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
        <div style={{
          padding: 12, borderRadius: 12,
          background: 'rgba(0,212,255,0.06)',
          border: '1px solid rgba(0,212,255,0.3)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8,
            fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
            color: '#00D4FF', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <Zap size={11} />
            Fortalezas
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {report.strengths.map((s, i) => (
              <li key={i} style={{
                fontFamily: 'Space Grotesk', fontSize: 11,
                color: 'rgba(250,245,235,0.8)', lineHeight: 1.35,
                paddingLeft: 10, position: 'relative',
              }}>
                <span style={{
                  position: 'absolute', left: 0, top: 5,
                  width: 4, height: 4, borderRadius: '50%', background: '#00D4FF',
                }} />
                {s}
              </li>
            ))}
          </ul>
        </div>

        <div style={{
          padding: 12, borderRadius: 12,
          background: 'rgba(204,255,0,0.06)',
          border: '1px solid rgba(204,255,0,0.3)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 5, marginBottom: 8,
            fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
            color: '#CCFF00', letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            <ShieldOff size={11} />
            Debilidades
          </div>
          <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 6 }}>
            {report.weaknesses.map((s, i) => (
              <li key={i} style={{
                fontFamily: 'Space Grotesk', fontSize: 11,
                color: 'rgba(250,245,235,0.8)', lineHeight: 1.35,
                paddingLeft: 10, position: 'relative',
              }}>
                <span style={{
                  position: 'absolute', left: 0, top: 5,
                  width: 4, height: 4, borderRadius: '50%', background: '#CCFF00',
                }} />
                {s}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Consejos tácticos */}
      <div style={{ marginBottom: 10 }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8,
          fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
          color: '#B347FF', letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          <Lightbulb size={11} />
          Plan de partido
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {report.tacticalAdvice.map((a, i) => (
            <div
              key={i}
              style={{
                padding: '10px 12px', borderRadius: 10,
                background: 'rgba(179,71,255,0.06)',
                border: '1px solid rgba(179,71,255,0.28)',
                fontFamily: 'Space Grotesk', fontSize: 12,
                color: 'rgba(250,245,235,0.85)',
                lineHeight: 1.45,
                display: 'flex', gap: 8, alignItems: 'flex-start',
              }}
            >
              <span style={{
                fontFamily: 'Archivo', fontWeight: 900, fontSize: 10,
                color: '#B347FF', flexShrink: 0,
                paddingTop: 1,
              }}>
                {i + 1}.
              </span>
              <span>{a}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{
        fontFamily: 'Space Grotesk', fontSize: 9,
        color: 'rgba(250,245,235,0.35)',
        textAlign: 'center',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
      }}>
        Confianza del análisis · {Math.round(report.confidence * 100)}%
      </div>
    </BottomSheet>
  )
}
