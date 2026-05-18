/**
 * Bottom sheet para suscribirse a un equipo externo FFCV.
 * Permite elegir qué tipo de notificaciones recibir.
 * (En producción llama a Supabase team_subscriptions — aquí es mock.)
 */
import { useState } from 'react'
import { Bell, BellOff, Check, Calendar, Zap, Flag } from 'lucide-react'
import BottomSheet from '../ui/BottomSheet'
import type { TeamExternal, TeamSubscription } from '../../lib/mock-ffcv'

interface Props {
  open: boolean
  onClose: () => void
  team: TeamExternal | null
  existing?: TeamSubscription
  onSave: (sub: TeamSubscription) => void
}

export default function TeamSubscribeSheet({ open, onClose, team, existing, onSave }: Props) {
  const [scheduleChange, setScheduleChange] = useState(existing?.notify_schedule_change ?? true)
  const [liveGoals, setLiveGoals] = useState(existing?.notify_live_goals ?? false)
  const [finalResult, setFinalResult] = useState(existing?.notify_final_result ?? true)
  const [saving, setSaving] = useState(false)
  const isEdit = !!existing

  function handleSave() {
    if (!team) return
    setSaving(true)
    setTimeout(() => {
      onSave({
        team_external_id: team.id,
        notify_schedule_change: scheduleChange,
        notify_live_goals: liveGoals,
        notify_final_result: finalResult,
      })
      setSaving(false)
    }, 600)
  }

  const toggleStyle = (active: boolean, color: string) => ({
    width: 44,
    height: 26,
    borderRadius: 13,
    background: active ? color : 'rgba(255, 255, 255, 0.08)',
    border: `1.5px solid ${active ? color : 'rgba(255, 220, 180, 0.15)'}`,
    position: 'relative' as const,
    cursor: 'pointer',
    transition: 'all 0.2s',
    flexShrink: 0 as const,
    boxShadow: active ? `0 0 10px ${color}55` : 'none',
  })

  const knobStyle = (active: boolean) => ({
    position: 'absolute' as const,
    top: 3,
    left: active ? 20 : 3,
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: active ? '#0F0D0A' : 'rgba(250, 245, 235, 0.5)',
    transition: 'left 0.2s',
  })

  const OPTIONS = [
    {
      id: 'schedule',
      label: 'Cambios de horario',
      desc: 'Hora, campo, aplazamientos',
      icon: Calendar,
      color: '#FFB800',
      value: scheduleChange,
      set: setScheduleChange,
    },
    {
      id: 'goals',
      label: 'Goles en directo',
      desc: 'Cada vez que marcan durante el partido',
      icon: Zap,
      color: '#FF5B3A',
      value: liveGoals,
      set: setLiveGoals,
    },
    {
      id: 'result',
      label: 'Resultado final',
      desc: 'Notificación al pitido final',
      icon: Flag,
      color: '#CCFF00',
      value: finalResult,
      set: setFinalResult,
    },
  ]

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title={isEdit ? 'Editar suscripción' : 'Seguir equipo'}
      accent={team?.color ?? '#CCFF00'}
      height="65%"
    >
      {team && (
        <>
          {/* Team header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '4px 0 20px',
            borderBottom: '1px solid rgba(255, 220, 180, 0.07)',
            marginBottom: 20,
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: 14,
              background: `${team.color}22`,
              border: `2px solid ${team.color}55`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'Archivo', fontWeight: 800, fontSize: 18,
              color: team.color,
              boxShadow: `0 0 16px ${team.color}33`,
            }}>
              {team.initials}
            </div>
            <div>
              <div style={{
                fontFamily: 'Archivo', fontWeight: 800, fontSize: 18,
                color: '#FAF5EB', letterSpacing: '-0.01em',
              }}>
                {team.club_name}
              </div>
              <div style={{
                fontFamily: 'Space Grotesk', fontSize: 12,
                color: 'rgba(250, 245, 235, 0.5)', marginTop: 2,
              }}>
                Datos oficiales FFCV
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <Bell size={18} color={team.color} style={{ opacity: 0.8 }} />
            </div>
          </div>

          {/* Toggle options */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            {OPTIONS.map(o => {
              const Icon = o.icon
              return (
                <div
                  key={o.id}
                  onClick={() => o.set(!o.value)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px 14px', borderRadius: 14,
                    background: o.value ? `${o.color}0e` : 'rgba(255, 255, 255, 0.03)',
                    border: `1px solid ${o.value ? o.color + '33' : 'rgba(255, 220, 180, 0.07)'}`,
                    cursor: 'pointer',
                    transition: 'all 0.18s',
                  }}
                >
                  <div style={{
                    width: 36, height: 36, borderRadius: 10,
                    background: o.value ? `${o.color}22` : 'rgba(255, 255, 255, 0.06)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: o.value ? o.color : 'rgba(250, 245, 235, 0.4)',
                    flexShrink: 0,
                    transition: 'all 0.18s',
                  }}>
                    <Icon size={16} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13,
                      color: o.value ? '#FAF5EB' : 'rgba(250, 245, 235, 0.65)',
                    }}>
                      {o.label}
                    </div>
                    <div style={{
                      fontFamily: 'Space Grotesk', fontSize: 11,
                      color: 'rgba(250, 245, 235, 0.4)', marginTop: 2,
                    }}>
                      {o.desc}
                    </div>
                  </div>
                  {/* Toggle */}
                  <div style={toggleStyle(o.value, o.color)}>
                    <div style={knobStyle(o.value)} />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Save button */}
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              width: '100%', padding: '14px', borderRadius: 14,
              background: saving ? 'rgba(204, 255, 0, 0.4)' : 'linear-gradient(135deg, #CCFF00, #FFB800)',
              border: 'none', color: '#0F0D0A',
              fontFamily: 'Archivo', fontWeight: 800, fontSize: 13,
              letterSpacing: '0.06em', textTransform: 'uppercase',
              cursor: saving ? 'default' : 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              boxShadow: saving ? 'none' : '0 6px 20px rgba(204, 255, 0, 0.35)',
              transition: 'all 0.2s',
            }}
          >
            {saving ? (
              <>
                <div style={{
                  width: 14, height: 14, borderRadius: '50%',
                  border: '2px solid #0F0D0A',
                  borderTopColor: 'transparent',
                  animation: 'spin 700ms linear infinite',
                }} />
                Guardando...
              </>
            ) : (
              <>
                <Check size={15} />
                {isEdit ? 'Guardar cambios' : 'Seguir este equipo'}
              </>
            )}
          </button>

          {isEdit && (
            <button
              onClick={onClose}
              style={{
                width: '100%', marginTop: 10, padding: '12px', borderRadius: 14,
                background: 'transparent',
                border: '1px solid rgba(255, 91, 58, 0.3)',
                color: '#FF5B3A',
                fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13,
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              <BellOff size={14} />
              Dejar de seguir
            </button>
          )}
        </>
      )}
    </BottomSheet>
  )
}
