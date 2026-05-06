import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/ui/BottomNav'
import { Skeleton, SkeletonCircle } from '../components/ui/Skeleton'
import { useSimulatedLoad } from '../hooks/useSimulatedLoad'

const CHATS = [
  { name: 'Asistente FútbolBase', badge: '🤖', color: '#B347FF', preview: 'Preguntame lo que quieras de la app', time: 'Ahora', unread: 0, active: true, bot: true },
  { name: 'Los Pumas FC',   badge: 'LP', color: '#CCFF00', preview: 'Reunión el sábado 10am', time: '10:24', unread: 3, active: true },
  { name: 'Carlos Méndez',  badge: 'CM', color: '#FFB800', preview: '¡Vamos por ese hat-trick! 🔥', time: '09:15', unread: 1, active: true },
  { name: 'Entrenadores',   badge: 'EN', color: '#FF5B3A', preview: 'Táctica nueva para el domingo', time: 'Ayer', unread: 0, active: false },
  { name: 'Liga Regional',  badge: 'LR', color: '#CCFF00', preview: 'Resultados cuartos de final', time: 'Ayer', unread: 5, active: true },
  { name: 'Ana Torres',     badge: 'AT', color: '#FFB800', preview: 'Videos del partido subidos', time: 'Mar', unread: 0, active: false },
  { name: 'Rayo Urbano',    badge: 'RU', color: '#FF5B3A', preview: 'Amistoso confirmado', time: 'Lun', unread: 2, active: false },
]

export default function ChatPage() {
  const nav = useNavigate()
  const loading = useSimulatedLoad(600)
  return (
    <div style={{ position: 'absolute', inset: 0, background: 'var(--bg-deep, #0F0D0A)', overflow: 'hidden' }}>
      <div
        className="screen-scroll"
        style={{ position: 'absolute', inset: 0, overflowY: 'auto', paddingTop: 60, paddingBottom: 90 }}
      >
        <div style={{ padding: '0 20px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              fontFamily: 'Archivo, sans-serif', fontWeight: 800,
              fontSize: 32, color: '#FAF5EB', letterSpacing: '-0.02em',
            }}
          >
            Chats
          </div>
        </div>

        <div style={{ padding: '0 12px' }}>
          {loading && Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`sk-${i}`}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 8px',
                borderBottom: '1px solid rgba(255, 220, 180, 0.06)',
              }}
            >
              <SkeletonCircle size={50} />
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Skeleton width="40%" height={13} />
                  <Skeleton width={30} height={10} />
                </div>
                <Skeleton width="75%" height={11} />
              </div>
            </div>
          ))}
          {!loading && CHATS.map((c, i) => (
            <div
              key={i}
              onClick={() => nav('/chat/conversation', { state: { name: c.name, badge: c.badge, color: c.color, active: c.active, bot: (c as { bot?: boolean }).bot } })}
              style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '12px 8px',
                borderBottom: '1px solid rgba(255, 220, 180, 0.06)',
                cursor: 'pointer',
              }}
            >
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    width: 50, height: 50, borderRadius: '50%',
                    background: `${c.color}22`, color: c.color,
                    border: `2px solid ${c.active ? c.color : 'rgba(255, 220, 180, 0.15)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: 'Archivo, sans-serif', fontWeight: 800, fontSize: 15,
                    boxShadow: c.active ? `0 0 12px ${c.color}55` : 'none',
                  }}
                >
                  {c.badge}
                </div>
                {c.active && (
                  <div
                    style={{
                      position: 'absolute', bottom: 0, right: 0,
                      width: 12, height: 12, borderRadius: '50%',
                      background: '#CCFF00', border: '2px solid #0F0D0A',
                    }}
                  />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700,
                      fontSize: 15, color: '#FAF5EB',
                    }}
                  >
                    {c.name}
                  </div>
                  <div
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 11, color: 'rgba(250, 245, 235, 0.4)',
                    }}
                  >
                    {c.time}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <div
                    style={{
                      fontFamily: 'Space Grotesk, sans-serif',
                      fontSize: 13, color: 'rgba(250, 245, 235, 0.6)',
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      maxWidth: 220,
                    }}
                  >
                    {c.preview}
                  </div>
                  {c.unread > 0 && (
                    <div
                      style={{
                        minWidth: 20, height: 20, padding: '0 6px',
                        borderRadius: 999, background: '#CCFF00', color: '#0F0D0A',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, fontSize: 11,
                        boxShadow: '0 0 10px rgba(204, 255, 0, 0.5)',
                      }}
                    >
                      {c.unread}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
