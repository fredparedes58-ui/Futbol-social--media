import { Target, Calendar, MessageCircle, Users, Trophy, Check } from 'lucide-react'
import BottomSheet from './BottomSheet'
import { useNotifications, type NotifKind } from '../../context/NotificationsContext'

interface Props { open: boolean; onClose: () => void }

const ICONS: Record<NotifKind, { icon: typeof Target; color: string }> = {
  goal:                 { icon: Target,         color: '#CCFF00' },
  match:                { icon: Calendar,       color: '#FFB800' },
  message:              { icon: MessageCircle,  color: '#CCFF00' },
  team:                 { icon: Users,          color: '#FF5B3A' },
  trophy:               { icon: Trophy,         color: '#FFB800' },
  // FFCV
  ffcv_schedule_change: { icon: Calendar,       color: '#FFB800' },
  ffcv_postponed:       { icon: Calendar,       color: '#FF5B3A' },
  ffcv_live_goal:       { icon: Target,         color: '#FF5B3A' },
  ffcv_result:          { icon: Trophy,         color: '#CCFF00' },
}

export default function NotificationsPanel({ open, onClose }: Props) {
  const { items, unread, markAllRead, markRead } = useNotifications()

  return (
    <BottomSheet open={open} onClose={onClose} title="Notificaciones" accent="#CCFF00" height="75%">
      {/* Summary bar */}
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '4px 2px 14px',
          borderBottom: '1px solid rgba(255, 220, 180, 0.06)',
          marginBottom: 12,
        }}
      >
        <div>
          <div style={{ fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 20, color: '#FAF5EB' }}>
            {unread}{' '}
            <span style={{ fontFamily: 'Space Grotesk', fontWeight: 500, fontSize: 13, color: 'rgba(250,245,235,0.5)' }}>
              sin leer
            </span>
          </div>
          <div style={{ fontFamily: 'Space Grotesk', fontSize: 11, color: 'rgba(250,245,235,0.5)' }}>
            {items.length} notificaciones totales
          </div>
        </div>
        {unread > 0 && (
          <button
            onClick={markAllRead}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 12px', borderRadius: 10,
              background: 'rgba(204, 255, 0, 0.12)',
              border: '1px solid rgba(204, 255, 0, 0.3)',
              color: '#CCFF00',
              fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 11,
              cursor: 'pointer',
            }}
          >
            <Check size={13} /> Marcar todo
          </button>
        )}
      </div>

      {/* List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(n => {
          const { icon: I, color } = ICONS[n.kind]
          return (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              style={{
                display: 'flex', gap: 12, padding: '12px',
                background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(204, 255, 0, 0.06)',
                borderRadius: 12,
                border: n.read ? '1px solid rgba(255,220,180,0.05)' : `1px solid ${color}44`,
                cursor: 'pointer',
                transition: 'all 200ms',
                position: 'relative',
              }}
            >
              {!n.read && (
                <div
                  style={{
                    position: 'absolute', top: 14, right: 12,
                    width: 8, height: 8, borderRadius: '50%',
                    background: color,
                    boxShadow: `0 0 8px ${color}`,
                  }}
                />
              )}
              <div
                style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: `${color}22`, color,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <I size={18} />
              </div>
              <div style={{ flex: 1, minWidth: 0, paddingRight: 14 }}>
                <div
                  style={{
                    fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 13,
                    color: '#FAF5EB', marginBottom: 2,
                  }}
                >
                  {n.title}
                </div>
                <div
                  style={{
                    fontFamily: 'Space Grotesk', fontSize: 12,
                    color: 'rgba(250,245,235,0.6)', lineHeight: 1.3,
                  }}
                >
                  {n.body}
                </div>
                <div
                  style={{
                    marginTop: 6,
                    fontFamily: 'Space Grotesk', fontSize: 10,
                    color: 'rgba(250,245,235,0.4)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}
                >
                  {n.time}
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </BottomSheet>
  )
}
