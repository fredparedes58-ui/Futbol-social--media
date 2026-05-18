/**
 * Tarjeta de feed para eventos detectados por el scraper FFCV.
 * Aparece en el feed principal de HomePage cuando hay cambios recientes.
 */
import { AlertTriangle, Clock, Zap, CheckCircle2, Radio } from 'lucide-react'
import type { FFCVFeedEvent, MatchExternal } from '../../lib/mock-ffcv'
import { getTeam, eventLabel } from '../../lib/mock-ffcv'

interface Props {
  event: FFCVFeedEvent
  match: MatchExternal
  onTap?: () => void
}

const SEVERITY_CONFIG = {
  critical: {
    bg: 'linear-gradient(135deg, rgba(255, 91, 58, 0.18), rgba(255, 91, 58, 0.06))',
    border: 'rgba(255, 91, 58, 0.45)',
    color: '#FF5B3A',
    glow: 'rgba(255, 91, 58, 0.25)',
    Icon: AlertTriangle,
  },
  important: {
    bg: 'linear-gradient(135deg, rgba(255, 184, 0, 0.18), rgba(255, 184, 0, 0.06))',
    border: 'rgba(255, 184, 0, 0.45)',
    color: '#FFB800',
    glow: 'rgba(255, 184, 0, 0.20)',
    Icon: Clock,
  },
  notice: {
    bg: 'linear-gradient(135deg, rgba(0, 212, 255, 0.16), rgba(0, 212, 255, 0.05))',
    border: 'rgba(0, 212, 255, 0.40)',
    color: '#00D4FF',
    glow: 'rgba(0, 212, 255, 0.18)',
    Icon: Zap,
  },
  info: {
    bg: 'linear-gradient(135deg, rgba(204, 255, 0, 0.12), rgba(204, 255, 0, 0.04))',
    border: 'rgba(204, 255, 0, 0.30)',
    color: '#CCFF00',
    glow: 'rgba(204, 255, 0, 0.15)',
    Icon: CheckCircle2,
  },
}

const TYPE_LABEL: Record<string, string> = {
  live_goal: 'GOLES EN DIRECTO',
  match_rescheduled: 'CAMBIO DE HORARIO',
  match_postponed: 'PARTIDO APLAZADO',
  match_cancelled: 'PARTIDO CANCELADO',
  match_started: 'EN JUEGO',
  match_finished: 'RESULTADO FINAL',
}

export default function FFCVEventCard({ event, match, onTap }: Props) {
  const cfg = SEVERITY_CONFIG[event.severity]
  const Icon = cfg.Icon
  const homeTeam = getTeam(match.home_team_id)
  const awayTeam = getTeam(match.away_team_id)
  const isLive = match.status === 'live'

  return (
    <div
      onClick={onTap}
      style={{
        borderRadius: 16,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        padding: 14,
        cursor: onTap ? 'pointer' : 'default',
        boxShadow: `0 4px 20px ${cfg.glow}`,
        animation: 'slide-up-fade 280ms ease-out both',
      }}
    >
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 8,
          background: `${cfg.color}22`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: cfg.color,
          flexShrink: 0,
        }}>
          {isLive
            ? <Radio size={14} style={{ animation: 'pulse-glow 1.2s ease-in-out infinite' }} />
            : <Icon size={14} />
          }
        </div>

        <div style={{
          fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 10,
          color: cfg.color, letterSpacing: '0.12em', textTransform: 'uppercase',
          flex: 1,
        }}>
          {TYPE_LABEL[event.type] ?? 'ACTUALIZACIÓN FFCV'}
        </div>

        {/* FFCV badge */}
        <div style={{
          padding: '2px 8px', borderRadius: 999,
          background: 'rgba(255, 255, 255, 0.05)',
          border: '1px solid rgba(255, 220, 180, 0.12)',
          fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: 9,
          color: 'rgba(250, 245, 235, 0.5)', letterSpacing: '0.08em',
        }}>
          FFCV · {event.detected_at}
        </div>
      </div>

      {/* Match display */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
        {/* Home */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: homeTeam ? `${homeTeam.color}22` : 'rgba(255,255,255,0.08)',
            border: `1.5px solid ${homeTeam?.color ?? 'rgba(255,220,180,0.15)'}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Archivo', fontWeight: 800, fontSize: 11,
            color: homeTeam?.color ?? '#FAF5EB',
          }}>
            {homeTeam?.initials ?? '?'}
          </div>
          <span style={{
            fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 12,
            color: '#FAF5EB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {homeTeam?.club_name ?? 'Local'}
          </span>
        </div>

        {/* Score or VS */}
        <div style={{
          fontFamily: 'Archivo', fontWeight: 900, fontSize: isLive ? 20 : 14,
          color: isLive ? cfg.color : 'rgba(250, 245, 235, 0.5)',
          letterSpacing: '-0.02em', flexShrink: 0,
          textShadow: isLive ? `0 0 12px ${cfg.color}88` : 'none',
          minWidth: 44, textAlign: 'center',
        }}>
          {match.home_score !== null && match.away_score !== null
            ? `${match.home_score}–${match.away_score}`
            : 'VS'
          }
        </div>

        {/* Away */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, minWidth: 0, justifyContent: 'flex-end' }}>
          <span style={{
            fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: 12,
            color: '#FAF5EB', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            textAlign: 'right',
          }}>
            {awayTeam?.club_name ?? 'Visitante'}
          </span>
          <div style={{
            width: 32, height: 32, borderRadius: 8, flexShrink: 0,
            background: awayTeam ? `${awayTeam.color}22` : 'rgba(255,255,255,0.08)',
            border: `1.5px solid ${awayTeam?.color ?? 'rgba(255,220,180,0.15)'}55`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: 'Archivo', fontWeight: 800, fontSize: 11,
            color: awayTeam?.color ?? '#FAF5EB',
          }}>
            {awayTeam?.initials ?? '?'}
          </div>
        </div>
      </div>

      {/* Event description */}
      <div style={{
        fontFamily: 'Space Grotesk', fontSize: 12, lineHeight: 1.4,
        color: 'rgba(250, 245, 235, 0.75)',
      }}>
        {eventLabel(event.type, match)}
      </div>

      {/* Competition */}
      <div style={{
        marginTop: 8, fontFamily: 'Space Grotesk', fontSize: 10,
        color: 'rgba(250, 245, 235, 0.4)', letterSpacing: '0.05em',
      }}>
        {event.competition_name}
      </div>
    </div>
  )
}
