/**
 * Sprint E — DrillsSheet: plan de entrenamiento semanal personalizado.
 * Usa generateDrills() (servicio determinístico) basado en las debilidades del jugador.
 */
import { useMemo } from 'react'
import { Zap, Clock, Dumbbell, ChevronRight } from 'lucide-react'
import BottomSheet from '../../components/ui/BottomSheet'
import { generateDrills, type Weakness, type Drill } from '../../ai/services/drills'

interface Props {
  open: boolean
  onClose: () => void
  name?: string
  /** Debilidades inferidas del rating del jugador */
  weaknesses?: Weakness[]
}

const INTENSITY_LABEL: Record<Drill['intensity'], string> = {
  low:  '🟢 Suave',
  mid:  '🟡 Moderado',
  high: '🔴 Intenso',
}

const INTENSITY_COLOR: Record<Drill['intensity'], string> = {
  low:  '#CCFF00',
  mid:  '#FFB800',
  high: '#FF5B3A',
}

const AREA_LABEL: Record<Weakness, string> = {
  shot:    '⚽ Remate',
  pass:    '🎯 Pase',
  def:     '🛡️ Defensa',
  phy:     '💪 Físico',
  pace:    '⚡ Velocidad',
  dribble: '🪄 Regate',
  mental:  '🧠 Mental',
}

const DAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie']

export default function DrillsSheet({ open, onClose, name = 'Alex Rivera', weaknesses = ['shot', 'def'] }: Props) {
  const result = useMemo(() => generateDrills({ name, weaknesses }), [name, weaknesses])

  const intensityMix = result.intensityMix
  const totalParts = result.drills.length || 1
  const bars = [
    { k: 'high' as const, label: 'Intenso',   color: '#FF5B3A' },
    { k: 'mid'  as const, label: 'Moderado',  color: '#FFB800' },
    { k: 'low'  as const, label: 'Suave',     color: '#CCFF00' },
  ]

  return (
    <BottomSheet open={open} onClose={onClose} title="Plan de entrenos" height="92%" accent="#CCFF00">
      {/* Header summary */}
      <div style={{
        padding: '12px 14px 14px',
        borderRadius: 14,
        background: 'linear-gradient(135deg, rgba(204,255,0,0.12), rgba(255,184,0,0.08))',
        border: '1px solid rgba(204,255,0,0.25)',
        marginBottom: 16,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 10,
            background: 'rgba(204,255,0,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#CCFF00',
          }}>
            <Dumbbell size={18} />
          </div>
          <div>
            <div style={{ fontFamily: 'Archivo', fontWeight: 800, fontSize: 15, color: '#FAF5EB' }}>
              Semana personalizada
            </div>
            <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.55)', marginTop: 1 }}>
              {result.drills.length} sesiones · {result.totalMinutes} min totales
            </div>
          </div>
        </div>

        {/* Intensity mix bars */}
        <div style={{ display: 'flex', gap: 4, height: 6, borderRadius: 3, overflow: 'hidden', marginBottom: 8 }}>
          {bars.map(b => (
            <div key={b.k} style={{
              flex: intensityMix[b.k] / totalParts,
              background: b.color,
              borderRadius: 3,
              transition: 'flex 500ms ease-out',
              minWidth: intensityMix[b.k] > 0 ? 4 : 0,
            }} />
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {bars.filter(b => intensityMix[b.k] > 0).map(b => (
            <div key={b.k} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: b.color }} />
              <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.6)' }}>
                {b.label} ×{intensityMix[b.k]}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Weakness chips */}
      <div style={{ marginBottom: 16 }}>
        <div style={{
          fontFamily: 'Space Grotesk', fontSize: 10, fontWeight: 700,
          color: 'rgba(250,245,235,0.5)', textTransform: 'uppercase',
          letterSpacing: '0.1em', marginBottom: 8,
        }}>
          Áreas de mejora detectadas
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {weaknesses.map(w => (
            <div key={w} style={{
              padding: '4px 10px', borderRadius: 999,
              background: 'rgba(255,91,58,0.12)',
              border: '1px solid rgba(255,91,58,0.3)',
              fontFamily: 'Space Grotesk', fontSize: 11, fontWeight: 600,
              color: '#FF5B3A',
            }}>
              {AREA_LABEL[w]}
            </div>
          ))}
        </div>
      </div>

      {/* Drill cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {result.drills.map((drill, i) => {
          const color = INTENSITY_COLOR[drill.intensity]
          return (
            <div key={i} style={{
              padding: '14px', borderRadius: 14,
              background: `linear-gradient(135deg, ${color}10, rgba(255,255,255,0.02))`,
              border: `1px solid ${color}33`,
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                {/* Day pill */}
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: `${color}22`,
                  border: `1.5px solid ${color}55`,
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontFamily: 'Archivo', fontWeight: 900, fontSize: 10, color, lineHeight: 1 }}>
                    {DAYS[i]}
                  </span>
                  <span style={{ fontFamily: 'Space Grotesk', fontSize: 8, color: 'rgba(250,245,235,0.5)', marginTop: 1 }}>
                    {i + 1}
                  </span>
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{
                      fontFamily: 'Space Grotesk', fontSize: 9, fontWeight: 700,
                      color, textTransform: 'uppercase', letterSpacing: '0.1em',
                    }}>
                      {AREA_LABEL[drill.area]}
                    </span>
                    <span style={{
                      fontFamily: 'Space Grotesk', fontSize: 9,
                      color: 'rgba(250,245,235,0.35)',
                    }}>
                      · {INTENSITY_LABEL[drill.intensity]}
                    </span>
                  </div>
                  <div style={{
                    fontFamily: 'Archivo', fontWeight: 800, fontSize: 14,
                    color: '#FAF5EB', marginBottom: 4,
                  }}>
                    {drill.title}
                  </div>
                  <div style={{
                    fontFamily: 'Space Grotesk', fontSize: 12,
                    color: 'rgba(250,245,235,0.65)', lineHeight: 1.4,
                    marginBottom: 8,
                  }}>
                    {drill.description}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} color="rgba(250,245,235,0.45)" />
                      <span style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.55)' }}>
                        {drill.durationMin} min
                      </span>
                    </div>
                    {drill.equipment.length > 0 && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Zap size={10} color="rgba(250,245,235,0.35)" />
                        <span style={{ fontFamily: 'Space Grotesk', fontSize: 10, color: 'rgba(250,245,235,0.45)' }}>
                          {drill.equipment.join(' · ')}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <ChevronRight size={14} color="rgba(250,245,235,0.25)" style={{ flexShrink: 0, marginTop: 10 }} />
              </div>
            </div>
          )
        })}
      </div>

      <div style={{
        marginTop: 16, padding: '10px 12px', borderRadius: 10,
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,220,180,0.07)',
        fontFamily: 'Space Grotesk', fontSize: 11,
        color: 'rgba(250,245,235,0.45)', textAlign: 'center',
      }}>
        Plan generado por AI · se renueva cada semana
      </div>
    </BottomSheet>
  )
}
