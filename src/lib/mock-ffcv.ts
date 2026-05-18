/**
 * Mock FFCV data — misma estructura que producirán las tablas de Supabase.
 * Reemplazar con queries reales cuando se integre el backend.
 *
 * Datos públicos: competiciones, equipos (entidad jurídica), partidos, clasificaciones.
 * NUNCA incluye jugadores, entrenadores ni plantillas (RGPD + AEPD precedentes menores).
 */

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'
export type EventSeverity = 'info' | 'notice' | 'important' | 'critical'
export type NotifType =
  | 'match_rescheduled'
  | 'match_postponed'
  | 'match_cancelled'
  | 'match_started'
  | 'match_finished'
  | 'live_goal'

export interface Competition {
  id: string
  ffcv_external_id: string
  name: string
  category: string
  season: string
  matchday_current: number
  last_synced_at: string
}

export interface TeamExternal {
  id: string
  ffcv_external_id: string
  club_name: string
  competition_id: string
  initials: string
  color: string // color para el avatar
}

export interface MatchExternal {
  id: string
  ffcv_external_id: string
  competition_id: string
  matchday: number
  home_team_id: string
  away_team_id: string
  scheduled_at: string            // ISO string
  venue: string
  home_score: number | null
  away_score: number | null
  status: MatchStatus
  previous_scheduled_at?: string  // distinto de scheduled_at → cambio de hora
  previous_venue?: string         // distinto de venue → cambio de campo
  previous_status?: string
  last_synced_at: string
}

export interface Classification {
  competition_id: string
  team_id: string
  position: number
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  points: number
}

export interface TeamSubscription {
  team_external_id: string
  notify_schedule_change: boolean
  notify_live_goals: boolean
  notify_final_result: boolean
}

export interface FFCVFeedEvent {
  id: string
  type: NotifType
  severity: EventSeverity
  match_id: string
  competition_name: string
  detected_at: string   // e.g. 'hace 5 min'
}

// ─── Datos mock ───────────────────────────────────────────────────────────────

export const COMPETITIONS: Competition[] = [
  {
    id: 'comp-1',
    ffcv_external_id: 'comp_2025_preferente_grupo_b',
    name: 'Preferente Grupo B',
    category: 'preferente',
    season: '2025-26',
    matchday_current: 28,
    last_synced_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(),
  },
  {
    id: 'comp-2',
    ffcv_external_id: 'comp_2025_primera_regional_cadete_a',
    name: 'Primera Regional Cadete A',
    category: 'cadete_a',
    season: '2025-26',
    matchday_current: 22,
    last_synced_at: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: 'comp-3',
    ffcv_external_id: 'comp_2025_segunda_regional_infantil',
    name: 'Segunda Regional Infantil',
    category: 'infantil',
    season: '2025-26',
    matchday_current: 19,
    last_synced_at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
  },
]

export const TEAMS_EXTERNAL: TeamExternal[] = [
  // Preferente Grupo B
  { id: 'te-1',  ffcv_external_id: 'team_vilareal_cf_b',         club_name: 'Vila-real CF B',         competition_id: 'comp-1', initials: 'VR', color: '#FFD700' },
  { id: 'te-2',  ffcv_external_id: 'team_cf_burjassot',          club_name: 'CF Burjassot',            competition_id: 'comp-1', initials: 'BU', color: '#FF5B3A' },
  { id: 'te-3',  ffcv_external_id: 'team_cd_castellon_b',        club_name: 'CD Castellón B',          competition_id: 'comp-1', initials: 'CS', color: '#FF8C00' },
  { id: 'te-4',  ffcv_external_id: 'team_levante_ud_b',          club_name: 'Levante UD B',            competition_id: 'comp-1', initials: 'LE', color: '#00D4FF' },
  { id: 'te-5',  ffcv_external_id: 'team_cd_benidorm',           club_name: 'CD Benidorm',             competition_id: 'comp-1', initials: 'BD', color: '#CCFF00' },
  { id: 'te-6',  ffcv_external_id: 'team_cf_gandia',             club_name: 'CF Gandía',               competition_id: 'comp-1', initials: 'GD', color: '#B347FF' },
  { id: 'te-7',  ffcv_external_id: 'team_cd_torrevieja',         club_name: 'CD Torrevieja',           competition_id: 'comp-1', initials: 'TV', color: '#FFB800' },
  { id: 'te-8',  ffcv_external_id: 'team_ud_alcoy',              club_name: 'UD Alcoy',                competition_id: 'comp-1', initials: 'AL', color: '#FF5B3A' },
  // Primera Regional Cadete A
  { id: 'te-9',  ffcv_external_id: 'team_valencia_cf_cadete',    club_name: 'Valencia CF Cadete A',    competition_id: 'comp-2', initials: 'VC', color: '#FF8C00' },
  { id: 'te-10', ffcv_external_id: 'team_atletico_sagunt',       club_name: 'Atlético Sagunto',        competition_id: 'comp-2', initials: 'AS', color: '#00D4FF' },
  { id: 'te-11', ffcv_external_id: 'team_cd_paiporta',          club_name: 'CD Paiporta',             competition_id: 'comp-2', initials: 'PP', color: '#CCFF00' },
  { id: 'te-12', ffcv_external_id: 'team_cf_paterna',            club_name: 'CF Paterna',              competition_id: 'comp-2', initials: 'PT', color: '#FFD700' },
  // Segunda Regional Infantil
  { id: 'te-13', ffcv_external_id: 'team_cd_xativa_inf',         club_name: 'CD Xàtiva Infantil',      competition_id: 'comp-3', initials: 'XT', color: '#B347FF' },
  { id: 'te-14', ffcv_external_id: 'team_cf_elda_inf',           club_name: 'CF Elda Infantil',        competition_id: 'comp-3', initials: 'EL', color: '#CCFF00' },
]

// Fixture completo para comp-1 (Preferente Grupo B) — mezcla de estados
export const MATCHES_EXTERNAL: MatchExternal[] = [
  // Partido EN VIVO ahora mismo
  {
    id: 'mx-1', ffcv_external_id: 'match_20260518_vilareal_burjassot',
    competition_id: 'comp-1', matchday: 28,
    home_team_id: 'te-1', away_team_id: 'te-2',
    scheduled_at: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    venue: 'Estadio de la Cerámica (fútbol 11)',
    home_score: 2, away_score: 1,
    status: 'live',
    last_synced_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
  },
  // Partido terminado hoy
  {
    id: 'mx-2', ffcv_external_id: 'match_20260518_castellon_levante',
    competition_id: 'comp-1', matchday: 28,
    home_team_id: 'te-3', away_team_id: 'te-4',
    scheduled_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    venue: 'Estadio Castalia Annexo',
    home_score: 0, away_score: 0,
    status: 'finished',
    last_synced_at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  // Partido con cambio de hora — previous_scheduled_at diferente
  {
    id: 'mx-3', ffcv_external_id: 'match_20260525_benidorm_gandia',
    competition_id: 'comp-1', matchday: 28,
    home_team_id: 'te-5', away_team_id: 'te-6',
    scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 10 * 60 * 60 * 1000).toISOString(),
    venue: 'Campa El Murtal',
    home_score: null, away_score: null,
    status: 'scheduled',
    previous_scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 12 * 60 * 60 * 1000).toISOString(),
    last_synced_at: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  // Partido aplazado
  {
    id: 'mx-4', ffcv_external_id: 'match_20260525_torrevieja_alcoy',
    competition_id: 'comp-1', matchday: 28,
    home_team_id: 'te-7', away_team_id: 'te-8',
    scheduled_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    venue: 'Campo Municipal de Torrevieja',
    home_score: null, away_score: null,
    status: 'postponed',
    previous_status: 'scheduled',
    last_synced_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  // Próximo partido programado (jornada 29)
  {
    id: 'mx-5', ffcv_external_id: 'match_20260601_burjassot_castellon',
    competition_id: 'comp-1', matchday: 29,
    home_team_id: 'te-2', away_team_id: 'te-3',
    scheduled_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 11 * 60 * 60 * 1000).toISOString(),
    venue: 'Poliesportiu Municipal de Burjassot',
    home_score: null, away_score: null,
    status: 'scheduled',
    last_synced_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'mx-6', ffcv_external_id: 'match_20260601_levante_vilareal',
    competition_id: 'comp-1', matchday: 29,
    home_team_id: 'te-4', away_team_id: 'te-1',
    scheduled_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000 + 17 * 60 * 60 * 1000).toISOString(),
    venue: 'Annex Estadi Olímpic Levante',
    home_score: null, away_score: null,
    status: 'scheduled',
    last_synced_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
]

export const CLASSIFICATIONS: Classification[] = [
  { competition_id: 'comp-1', team_id: 'te-1', position: 1, played: 27, won: 19, drawn: 5, lost: 3,  goals_for: 58, goals_against: 22, points: 62 },
  { competition_id: 'comp-1', team_id: 'te-4', position: 2, played: 27, won: 17, drawn: 6, lost: 4,  goals_for: 51, goals_against: 28, points: 57 },
  { competition_id: 'comp-1', team_id: 'te-3', position: 3, played: 27, won: 15, drawn: 7, lost: 5,  goals_for: 44, goals_against: 30, points: 52 },
  { competition_id: 'comp-1', team_id: 'te-2', position: 4, played: 27, won: 14, drawn: 5, lost: 8,  goals_for: 42, goals_against: 35, points: 47 },
  { competition_id: 'comp-1', team_id: 'te-5', position: 5, played: 27, won: 11, drawn: 6, lost: 10, goals_for: 38, goals_against: 38, points: 39 },
  { competition_id: 'comp-1', team_id: 'te-6', position: 6, played: 27, won: 9,  drawn: 6, lost: 12, goals_for: 32, goals_against: 41, points: 33 },
  { competition_id: 'comp-1', team_id: 'te-7', position: 7, played: 27, won: 7,  drawn: 5, lost: 15, goals_for: 26, goals_against: 48, points: 26 },
  { competition_id: 'comp-1', team_id: 'te-8', position: 8, played: 27, won: 3,  drawn: 4, lost: 20, goals_for: 18, goals_against: 67, points: 13 },
]

export const SCORERS_FFCV = [
  { club_name: 'Vila-real CF B',  goals: 22, competition_id: 'comp-1', position: 1 },
  { club_name: 'Levante UD B',    goals: 18, competition_id: 'comp-1', position: 2 },
  { club_name: 'CD Castellón B',  goals: 15, competition_id: 'comp-1', position: 3 },
  { club_name: 'CF Burjassot',    goals: 13, competition_id: 'comp-1', position: 4 },
]

// Eventos del feed derivados del scraper (cambios detectados)
export const FFCV_FEED_EVENTS: FFCVFeedEvent[] = [
  {
    id: 'ev-1',
    type: 'live_goal',
    severity: 'notice',
    match_id: 'mx-1',
    competition_name: 'Preferente Grupo B',
    detected_at: 'hace 4 min',
  },
  {
    id: 'ev-2',
    type: 'match_rescheduled',
    severity: 'important',
    match_id: 'mx-3',
    competition_name: 'Preferente Grupo B',
    detected_at: 'hace 10 min',
  },
  {
    id: 'ev-3',
    type: 'match_postponed',
    severity: 'critical',
    match_id: 'mx-4',
    competition_name: 'Preferente Grupo B',
    detected_at: 'hace 32 min',
  },
]

// Subscriptions del usuario (mock — en prod viene de Supabase)
export const MOCK_SUBSCRIPTIONS: TeamSubscription[] = [
  {
    team_external_id: 'te-2',
    notify_schedule_change: true,
    notify_live_goals: true,
    notify_final_result: true,
  },
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function getTeam(id: string): TeamExternal | undefined {
  return TEAMS_EXTERNAL.find(t => t.id === id)
}

export function getCompetition(id: string): Competition | undefined {
  return COMPETITIONS.find(c => c.id === id)
}

export function getMatchesByCompetition(competitionId: string): MatchExternal[] {
  return MATCHES_EXTERNAL.filter(m => m.competition_id === competitionId)
}

export function getClassificationsByCompetition(competitionId: string): Classification[] {
  return CLASSIFICATIONS
    .filter(c => c.competition_id === competitionId)
    .sort((a, b) => a.position - b.position)
}

export function getTeamsByCompetition(competitionId: string): TeamExternal[] {
  return TEAMS_EXTERNAL.filter(t => t.competition_id === competitionId)
}

export function isSubscribed(teamExternalId: string): boolean {
  return MOCK_SUBSCRIPTIONS.some(s => s.team_external_id === teamExternalId)
}

/** Formato de hora relativo a lastSyncedAt */
export function formatSyncAge(isoString: string): string {
  const diff = Math.round((Date.now() - new Date(isoString).getTime()) / 1000)
  if (diff < 60) return `hace ${diff}s`
  if (diff < 3600) return `hace ${Math.round(diff / 60)} min`
  return `hace ${Math.round(diff / 3600)} h`
}

/** Formatea una fecha ISO a texto legible */
export function formatMatchDate(isoString: string): string {
  const d = new Date(isoString)
  const now = new Date()
  const isToday = d.toDateString() === now.toDateString()
  const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1)
  const isTomorrow = d.toDateString() === tomorrow.toDateString()

  const time = d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
  const weekday = d.toLocaleDateString('es-ES', { weekday: 'short' })
  const day = d.getDate()
  const month = d.toLocaleDateString('es-ES', { month: 'short' })

  if (isToday) return `Hoy · ${time}`
  if (isTomorrow) return `Mañana · ${time}`
  return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} ${day} ${month} · ${time}`
}

export function eventLabel(type: NotifType, m: MatchExternal): string {
  const home = getTeam(m.home_team_id)?.club_name ?? '?'
  const away = getTeam(m.away_team_id)?.club_name ?? '?'
  switch (type) {
    case 'live_goal':
      return `⚽ ${home} ${m.home_score ?? 0} – ${m.away_score ?? 0} ${away}`
    case 'match_rescheduled':
      return `⏰ Cambio de hora: ${home} vs ${away}`
    case 'match_postponed':
      return `🚨 Aplazado: ${home} vs ${away}`
    case 'match_cancelled':
      return `❌ Cancelado: ${home} vs ${away}`
    case 'match_started':
      return `🔴 Ha empezado: ${home} vs ${away}`
    case 'match_finished':
      return `🏁 Final: ${home} ${m.home_score} – ${m.away_score} ${away}`
  }
}
