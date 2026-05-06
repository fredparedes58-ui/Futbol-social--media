/**
 * MatchCommentatorAgent — simula un comentarista generando eventos
 * minuto a minuto para un live match tracker.
 * Totalmente determinístico vía seed (reproducible).
 */

import { defineAgent } from './types'
import { mulberry32, seedFromString } from '../services/deterministic'

export type EventType =
  | 'kickoff' | 'goal' | 'chance' | 'save' | 'yellow' | 'red'
  | 'sub' | 'foul' | 'corner' | 'halftime' | 'fulltime' | 'commentary'

export interface MatchEvent {
  id: string
  minute: number
  type: EventType
  team?: 'home' | 'away'
  player?: string
  text: string
  impact: 1 | 2 | 3 | 4  // 1 filler, 4 momento clave
}

export interface CommentatorInput {
  home: string
  away: string
  homeLineup?: string[]
  awayLineup?: string[]
  /** minuto desde el cual generar (para streaming) */
  fromMinute?: number
  /** cuántos eventos generar */
  count?: number
  seed?: number
}

export interface CommentatorOutput {
  events: MatchEvent[]
}

const HOME_PLAYERS = ['Alex Rivera', 'Carlos Méndez', 'Rafa Ortiz', 'Pablo Lanza', 'Diego Fuentes']
const AWAY_PLAYERS = ['Martín Solís', 'Dylan Castro', 'Axel Romero', 'Tomás Ibáñez', 'Iván Pereyra']

const TEMPLATES: Record<EventType, string[]> = {
  kickoff:    ['¡Arranca el partido! {H} recibe a {A}.'],
  goal:       ['¡GOOOL de {P} para {T}! Definición impecable.', '¡{P} la clava al ángulo! Gol de {T}.', '¡{P} pica la pelota por arriba del arquero!'],
  chance:     ['{P} probó desde afuera, se fue cerca.', '¡Qué jugada de {P}! La tapó el arquero.', '{P} cabeceó al palo — increíble.'],
  save:       ['Atajadón del arquero de {T} — mano cambiada.', 'Gran respuesta del 1 de {T}.'],
  yellow:     ['Amarilla para {P} por falta táctica.', '{P} ve la amarilla — debe cuidarse.'],
  red:        ['¡Roja directa a {P}! {T} se queda con 10.'],
  sub:        ['Cambio en {T}: entra fuerza fresca.'],
  foul:       ['Falta dura de {P} — amonestación cantada.'],
  corner:     ['Córner a favor de {T}.'],
  halftime:   ['Se va al descanso. {H} {SH} - {SA} {A}.'],
  fulltime:   ['Final del partido. {H} {SH} - {SA} {A}.'],
  commentary: ['{T} maneja la pelota en mitad de cancha.', 'Partido trabado, sin claras.', '{P} pide la pelota entre líneas.'],
}

function template(type: EventType, subs: Record<string, string>): string {
  const pool = TEMPLATES[type]
  const s = pool[Math.floor(subs['__rand'] as unknown as number * pool.length)] ?? pool[0]
  return s.replace(/\{(\w+)\}/g, (_, k) => subs[k] ?? `{${k}}`)
}

function impactOf(type: EventType): MatchEvent['impact'] {
  switch (type) {
    case 'goal': case 'red': case 'fulltime': return 4
    case 'chance': case 'save': case 'halftime': case 'kickoff': return 3
    case 'yellow': case 'sub': return 2
    default: return 1
  }
}

export const matchCommentatorAgent = defineAgent<CommentatorInput, CommentatorOutput>(
  'match-commentator',
  'Genera stream de eventos minuto-a-minuto de un partido en vivo.',
  (input, _ctx, trace) => {
    const seed = input.seed ?? seedFromString(`${input.home}-${input.away}`)
    const rng = mulberry32(seed)
    trace.push(`seed: ${seed}`)

    const from = input.fromMinute ?? 0
    const count = input.count ?? 12

    // Distribución de probabilidades por tipo
    const weighted: [EventType, number][] = [
      ['commentary', 30], ['foul', 12], ['corner', 10],
      ['chance', 14], ['save', 8], ['yellow', 6],
      ['goal', 7], ['sub', 5], ['red', 2],
    ]
    const totalW = weighted.reduce((a, [, w]) => a + w, 0)

    const events: MatchEvent[] = []
    let minute = from

    if (from === 0) {
      events.push({
        id: `ev-0`,
        minute: 0,
        type: 'kickoff',
        text: template('kickoff', { H: input.home, A: input.away, __rand: '0' as unknown as string }),
        impact: 3,
      })
    }

    for (let i = 0; i < count; i++) {
      minute += 2 + Math.floor(rng() * 6)
      if (minute >= 90) {
        events.push({
          id: `ev-ft-${i}`, minute: 90, type: 'fulltime',
          text: template('fulltime', {
            H: input.home, A: input.away,
            SH: events.filter(e => e.type === 'goal' && e.team === 'home').length.toString(),
            SA: events.filter(e => e.type === 'goal' && e.team === 'away').length.toString(),
            __rand: rng().toString() as unknown as string,
          }),
          impact: 4,
        })
        break
      }
      if (minute >= 45 && !events.some(e => e.type === 'halftime')) {
        events.push({
          id: `ev-ht`, minute: 45, type: 'halftime',
          text: template('halftime', {
            H: input.home, A: input.away,
            SH: events.filter(e => e.type === 'goal' && e.team === 'home').length.toString(),
            SA: events.filter(e => e.type === 'goal' && e.team === 'away').length.toString(),
            __rand: rng().toString() as unknown as string,
          }),
          impact: 3,
        })
        continue
      }

      // Pick tipo de evento
      const r = rng() * totalW
      let acc = 0
      let type: EventType = 'commentary'
      for (const [t, w] of weighted) {
        acc += w
        if (r <= acc) { type = t; break }
      }

      const team: 'home' | 'away' = rng() > 0.5 ? 'home' : 'away'
      const playerPool = team === 'home' ? HOME_PLAYERS : AWAY_PLAYERS
      const player = playerPool[Math.floor(rng() * playerPool.length)]
      const teamName = team === 'home' ? input.home : input.away

      events.push({
        id: `ev-${i}-${minute}`,
        minute,
        type,
        team,
        player,
        text: template(type, { T: teamName, P: player, H: input.home, A: input.away, __rand: rng().toString() as unknown as string }),
        impact: impactOf(type),
      })
    }

    trace.push(`generated ${events.length} events`)
    return { events }
  },
)
