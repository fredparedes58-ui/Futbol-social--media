/**
 * Mock "AI" helpers — simula un backend con LLM.
 * Cada función expone un contrato estable (entrada/salida) para que las vistas
 * no cambien cuando se enchufe un modelo real.
 */

/* -------------------------------------------------------------------------- */
/* Shared types                                                               */
/* -------------------------------------------------------------------------- */

export type Tone = 'casual' | 'hype' | 'formal'
export type Lang = 'es' | 'en'

/* -------------------------------------------------------------------------- */
/* Smart Replies (chat)                                                       */
/* -------------------------------------------------------------------------- */

export interface SuggestRepliesContext {
  teamName?: string
  active?: boolean
  tone?: Tone
  lang?: Lang
}

type ReplyRule = {
  match: RegExp
  replies: Record<Tone, string[]>
}

const RULES_ES: ReplyRule[] = [
  {
    match: /(confirm|confirmamos|juegan|vamos|dale|jugamos)/i,
    replies: {
      casual: ['Confirmado ✅', 'Dale, cuenten conmigo', '¿A qué hora nos vemos?', 'Ahí estoy 👊', 'Anotame'],
      hype:   ['¡A ganar esto! 🔥', '¡Vamos equipo! 💪', 'No me pierdo ni uno 🚀', '¡Listo para romperla!', 'Cuenten con todo 🔥'],
      formal: ['Confirmo mi asistencia', 'Estaré presente', 'Agradezco la convocatoria', 'Me anoto al partido', 'Perfecto, confirmado'],
    },
  },
  {
    match: /(cancha|lugar|d[oó]nde|sede|predio)/i,
    replies: {
      casual: ['¿Cancha A como siempre?', '¿Mismo lugar del sábado?', 'Mándame la ubicación 📍', '¿Dónde queda?', 'Dale, te sigo'],
      hype:   ['¡Vamos a la cancha 🔥!', '¡Allí nos vemos! 🚀', '¡Ubicación al grupo ya!', 'Voy saliendo 💨', 'Cancha activada 🔥'],
      formal: ['¿Podrían compartir la dirección?', 'Solicito la ubicación exacta', '¿En qué sede se realizará?', 'Necesito referencia del predio'],
    },
  },
  {
    match: /(hora|horario|a qué hora|cuando)/i,
    replies: {
      casual: ['Perfecto, ahí estoy', '¿Podemos 30 min antes?', 'Dale, me acomodo 🙌', 'Ok, agendado', '¿Caemos temprano?'],
      hype:   ['¡Listo, cuenten conmigo! 🔥', '¡Voy a calentar antes!', 'Llego con todo 🚀'],
      formal: ['Confirmado, anoto el horario', 'De acuerdo con ese horario', 'Agendado en mi calendario'],
    },
  },
  {
    match: /(entrenamiento|entreno|pr[aá]ctica)/i,
    replies: {
      casual: ['Voy con todo 💪', '¿Cuántos confirmados van?', 'Me cuelo al final del entreno', '¿Qué trabajamos hoy?'],
      hype:   ['¡A meterle pila! 🔥', '¡Vamos a sudar la camiseta! 💪', '¡Hoy la rompemos!'],
      formal: ['Confirmo mi asistencia al entrenamiento', '¿Cuál es el plan de la práctica?', 'Perfecto, estaré puntual'],
    },
  },
  {
    match: /(gol|golazo|ganamos|victoria|triunfo|hat[ -]?trick)/i,
    replies: {
      casual: ['¡Vamos equipo! 🔥', 'Tremendo 🙌', 'Hay que repetirlo el finde', 'Qué grande', 'Bestial'],
      hype:   ['¡GOLAZO! ⚽🔥', '¡VAMOS CARAJO! 🚀', '¡Somos los mejores! 💪', '¡A seguir rompiéndola!', '¡Imparables!'],
      formal: ['Felicitaciones al equipo', 'Muy merecido el resultado', 'Gran triunfo colectivo', 'Enhorabuena'],
    },
  },
  {
    match: /(perdimos|derrota|empate|igual[oó]|no pudimos)/i,
    replies: {
      casual: ['La próxima se gana 💪', 'Nos vemos en el próximo', 'Hay que entrenar más', 'Tranquilo, se viene'],
      hype:   ['¡La próxima los arrollamos! 🔥', '¡A entrenar el doble!', '¡Revancha asegurada! 🚀'],
      formal: ['Lo importante es aprender del partido', 'Analicemos qué mejorar', 'Próximo partido, nueva oportunidad'],
    },
  },
  {
    match: /(hola|buenas|qué tal|como estás|como andan|saludos)/i,
    replies: {
      casual: ['¡Hola! Todo bien', '¿Cómo va todo?', '¡Buenas! Listo para el partido', 'Hola crack', 'Todo tranqui'],
      hype:   ['¡Buenas! 🔥 Listo para romper todo', '¡Qué hacés capo! 🚀', '¡Todo al 100! 💪'],
      formal: ['Buenos días, ¿cómo se encuentra?', 'Saludos cordiales', 'Un gusto saludarte'],
    },
  },
  {
    match: /(foto|video|highlight|clip|grabaci[oó]n)/i,
    replies: {
      casual: ['Pásame el link 🎥', '¡Subilo al grupo!', 'Quiero verlo 👀', 'Mándalo por acá'],
      hype:   ['¡COMPARTILO YA! 🔥', '¡Quiero el highlight! 🚀', 'Súbelo a stories 📸'],
      formal: ['¿Podrías compartir el material?', 'Agradecería el archivo', '¿Dónde puedo acceder al contenido?'],
    },
  },
  {
    match: /(faltan|falt[oó]|no puedo|no llego|no voy)/i,
    replies: {
      casual: ['Sin drama, la próxima 👍', '¿Queda lugar?', '¿Alguien lo reemplaza?', 'Todo bien, cuídate'],
      hype:   ['¡Te esperamos la próxima! 💪', '¡No te pierdas el siguiente! 🔥'],
      formal: ['Gracias por avisar con tiempo', 'Entendido, buscaremos reemplazo', 'Sin problema, nos vemos pronto'],
    },
  },
  {
    match: /(cumple|cumplea[ñn]os|aniversario|felicidades)/i,
    replies: {
      casual: ['¡Feliz cumple! 🎉', 'Mil años más crack 🥳', '¡Salud!'],
      hype:   ['¡FELIZ CUMPLE CAMPEÓN! 🎉🔥', '¡A festejar con goles! ⚽🥳'],
      formal: ['Felicitaciones por tu cumpleaños', 'Muchas felicidades en tu día', 'Te deseo lo mejor'],
    },
  },
  {
    match: /(gracias|graci|agradezco)/i,
    replies: {
      casual: ['De nada 👊', 'Cuando quieras', 'Todo bien capo'],
      hype:   ['¡Somos equipo! 🔥', '¡Para eso estamos! 💪'],
      formal: ['Un gusto colaborar', 'Para eso estamos', 'No hay de qué'],
    },
  },
  {
    match: /(llu|lluvia|clima|fr[ií]o|calor)/i,
    replies: {
      casual: ['¿Y si llueve qué hacemos?', 'Espero que mejore el clima', 'Revisa el pronóstico 🌤', 'Igual se juega ¿no?'],
      hype:   ['¡Llueva o truene jugamos! 🌧🔥', '¡Con barro se juega mejor! 💪'],
      formal: ['¿Se suspende por condiciones climáticas?', 'Consulto el pronóstico y aviso', 'Evaluemos el estado de la cancha'],
    },
  },
  {
    match: /(dinero|plata|cuota|pag|costo|precio)/i,
    replies: {
      casual: ['¿Cuánto sale? 💸', 'Te transfiero después', '¿CBU/alias?', 'Lo paso hoy'],
      hype:   ['¡Lo que sea, jugamos!', '¡Pongo mi parte sin drama! 💪'],
      formal: ['¿Cuál es el monto exacto?', 'Envíenme los datos bancarios', 'Realizo la transferencia hoy'],
    },
  },
  {
    match: /(lesion|dolor|me duele|molesta|tobillo|rodilla|musculo|m[uú]sculo)/i,
    replies: {
      casual: ['Uf, mejórate 🙏', '¿Fuiste al médico?', 'Descansa lo que haga falta', 'Hielo y reposo 💪'],
      hype:   ['¡Vuelve pronto crack! 🔥', '¡Te esperamos recuperado!'],
      formal: ['Cuídate, priorizá la recuperación', 'Recomiendo consulta médica', 'Descanso completo es clave'],
    },
  },
  {
    match: /(convoc|lista|citad|plantel|alineaci)/i,
    replies: {
      casual: ['¿Quiénes van hoy?', 'Avísame si me necesitas', 'Contame la lista'],
      hype:   ['¡Mándame en la titular! 🔥', '¡Voy desde el arranque!'],
      formal: ['¿Podrían compartir la convocatoria?', 'Confirmo disponibilidad', 'Quedo a la espera'],
    },
  },
  {
    match: /\?$/,
    replies: {
      casual: ['Sí, dale', 'Depende, contame más', 'Déjame ver y te aviso', 'Mmm no sé, tú decís'],
      hype:   ['¡Claro que sí! 🔥', '¡Dale sin dudar!', '¡Obvio capo! 💪'],
      formal: ['Lo verificaré y respondo', 'Dame un momento para revisar', 'Procedo a confirmar'],
    },
  },
]

const GENERIC: Record<Tone, string[]> = {
  casual: ['Ok, dale 👊', '¡Perfecto!', 'Avísame cuando confirmes', 'Listo', 'Entendido'],
  hype:   ['¡Dale que arranca! 🔥', '¡Todo listo! 🚀', '¡Vamos con todo! 💪'],
  formal: ['Entendido, gracias', 'Confirmado', 'De acuerdo'],
}

/**
 * Devuelve hasta 3 chips contextuales. Cuando hay más opciones que slots, rota
 * según un hash del input para que el mismo mensaje siempre muestre el mismo set
 * (evita "parpadeo" entre renders) pero mensajes distintos varíen.
 */
export function suggestReplies(
  lastMessage: string,
  ctx: SuggestRepliesContext = {},
): string[] {
  const text = (lastMessage ?? '').trim()
  const tone: Tone = ctx.tone ?? 'casual'
  if (!text) return GENERIC[tone].slice(0, 3)

  const seed = text.split('').reduce((a, c) => a + c.charCodeAt(0), 0)

  for (const rule of RULES_ES) {
    if (rule.match.test(text)) {
      const pool = rule.replies[tone] ?? rule.replies.casual
      return rotate(pool, seed).slice(0, 3)
    }
  }
  return rotate(GENERIC[tone], seed).slice(0, 3)
}

function rotate<T>(arr: T[], by: number): T[] {
  if (arr.length === 0) return arr
  const k = ((by % arr.length) + arr.length) % arr.length
  return [...arr.slice(k), ...arr.slice(0, k)]
}

/* -------------------------------------------------------------------------- */
/* Quiniela Copilot — sugiere un marcador con "razonamiento"                  */
/* -------------------------------------------------------------------------- */

export type CopilotMood = 'balanced' | 'optimistic' | 'analytic'

export interface CopilotSuggestion {
  home: number
  away: number
  reason: string
  confidence: 'baja' | 'media' | 'alta'
  mood: CopilotMood
}

const SCENARIOS_BALANCED = (home: string, away: string): CopilotSuggestion[] => [
  { home: 2, away: 1, reason: `${home} juega de local y llega con racha de 3 partidos sin perder.`, confidence: 'media',  mood: 'balanced' },
  { home: 1, away: 2, reason: `${away} presiona arriba y le cuesta al rival salir jugado.`,          confidence: 'media',  mood: 'balanced' },
  { home: 2, away: 2, reason: 'Equipos parejos, últimos 3 cruces terminaron en empate.',             confidence: 'media',  mood: 'balanced' },
  { home: 1, away: 1, reason: 'Estadísticas muy parejas — se define por detalles.',                  confidence: 'media',  mood: 'balanced' },
]

const SCENARIOS_OPTIMISTIC = (home: string, away: string): CopilotSuggestion[] => [
  { home: 3, away: 1, reason: `${home} arrolló en su último partido y mantiene titular.`,            confidence: 'alta',  mood: 'optimistic' },
  { home: 3, away: 2, reason: 'Ambos marcan y reciben — pronóstico de partidazo abierto.',           confidence: 'baja',  mood: 'optimistic' },
  { home: 4, away: 2, reason: `${home} promedia 2.8 goles por partido en condición de local.`,       confidence: 'media', mood: 'optimistic' },
  { home: 2, away: 3, reason: `${away} viene goleando 3+ en sus últimos 4 encuentros.`,              confidence: 'media', mood: 'optimistic' },
]

const SCENARIOS_ANALYTIC = (home: string, away: string): CopilotSuggestion[] => [
  { home: 1, away: 0, reason: `${home} viene sólido en defensa (0.7 goles recibidos/partido).`,      confidence: 'alta',  mood: 'analytic' },
  { home: 0, away: 1, reason: `${away} suele golpear de contragolpe fuera de casa.`,                 confidence: 'media', mood: 'analytic' },
  { home: 1, away: 1, reason: 'xG esperado: 1.2 vs 1.1. Modelo Poisson sugiere empate.',              confidence: 'alta',  mood: 'analytic' },
  { home: 2, away: 0, reason: `${home} con +65% posesión histórica en este cruce.`,                   confidence: 'alta',  mood: 'analytic' },
]

export function suggestScore(
  home: string,
  away: string,
  mood: CopilotMood = 'balanced',
): CopilotSuggestion {
  const seed = (home + away + mood).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const pool =
    mood === 'optimistic' ? SCENARIOS_OPTIMISTIC(home, away) :
    mood === 'analytic'   ? SCENARIOS_ANALYTIC(home, away) :
                            SCENARIOS_BALANCED(home, away)
  return pool[seed % pool.length]
}

/* -------------------------------------------------------------------------- */
/* Match Recap Generator — narrativa auto-generada a partir de datos          */
/* -------------------------------------------------------------------------- */

export interface MatchFact {
  home: string
  away: string
  homeScore: number
  awayScore: number
  topScorer?: { name: string; goals: number; team: 'home' | 'away' }
  keyMoment?: { minute: number; description: string }
  attendance?: number
}

export interface RecapOptions {
  tone?: Tone
  lang?: Lang
}

export interface MatchRecap {
  headline: string
  tagline: string
  body: string
  highlights: string[]
  tone: Tone
  lang: Lang
}

export function generateMatchRecap(f: MatchFact, opts: RecapOptions = {}): MatchRecap {
  const tone: Tone = opts.tone ?? 'casual'
  const lang: Lang = opts.lang ?? 'es'
  return lang === 'en' ? recapEN(f, tone) : recapES(f, tone)
}

function recapES(f: MatchFact, tone: Tone): MatchRecap {
  const winner = f.homeScore > f.awayScore ? f.home : f.awayScore > f.homeScore ? f.away : null
  const loser  = winner === f.home ? f.away : winner === f.away ? f.home : null
  const draw   = winner === null
  const total  = f.homeScore + f.awayScore
  const top    = Math.max(f.homeScore, f.awayScore)
  const bot    = Math.min(f.homeScore, f.awayScore)

  const headline = draw
    ? tone === 'hype'
      ? `¡${f.home} y ${f.away} dieron un ESPECTÁCULO en el empate!`
      : tone === 'formal'
      ? `${f.home} y ${f.away} firman tablas en un encuentro equilibrado`
      : `${f.home} y ${f.away} firman tablas en un partido parejo`
    : tone === 'hype'
    ? `¡${winner} ARROLLÓ ${top}-${bot} a ${loser}! 🔥`
    : tone === 'formal'
    ? `${winner} se impone ${top}-${bot} sobre ${loser} en encuentro decisivo`
    : `${winner} vence ${top}-${bot} a ${loser}`

  const tagline = draw
    ? tone === 'hype'   ? 'Empate eléctrico con emociones hasta el final 🔥'
    : tone === 'formal' ? 'Resultado equilibrado que refleja el nivel de ambos equipos'
    :                     'Empate justo que deja sensaciones encontradas'
    : total >= 4
    ? tone === 'hype'   ? '¡Partidazo con goles por todos lados! ⚽🔥'
    : tone === 'formal' ? 'Encuentro ofensivo de alto nivel técnico'
    :                     'Partidazo de ida y vuelta con goles en los dos arcos'
    : total === 0
    ? tone === 'hype'   ? 'Duelo cerradísimo — ¡defensas al máximo!'
    : tone === 'formal' ? 'Encuentro trabado decidido por aspectos defensivos'
    :                     'Duelo trabado que se define en los detalles'
    : tone === 'hype'   ? `¡${winner} LO ROMPIÓ desde el arranque! 💪`
    : tone === 'formal' ? `${winner} impuso su propuesta desde el inicio`
    :                     `${winner} impuso condiciones desde el arranque`

  const intro = draw
    ? `${f.home} y ${f.away} se repartieron los puntos tras un encuentro intenso que terminó ${f.homeScore}-${f.awayScore}.`
    : `${winner} se impuso ${top}-${bot} sobre ${loser} en un partido que tuvo momentos clave de ambos lados.`

  const moment = f.keyMoment
    ? ` Al minuto ${f.keyMoment.minute}, ${f.keyMoment.description.toLowerCase()}, cambiando el rumbo del encuentro.`
    : ''
  const scorer = f.topScorer
    ? ` La figura fue ${f.topScorer.name}, autor de ${f.topScorer.goals} ${f.topScorer.goals === 1 ? 'gol' : 'goles'} para ${f.topScorer.team === 'home' ? f.home : f.away}.`
    : ''
  const attendance = f.attendance ? ` ${f.attendance} personas acompañaron desde la tribuna.` : ''
  const outro =
    tone === 'hype'   ? ' ¡El equipo se lleva la gloria y encara con todo el próximo partido! 🔥' :
    tone === 'formal' ? ' El plantel ya prepara la siguiente jornada con objetivos claros.' :
                        ''

  const body = `${intro}${moment}${scorer}${attendance}${outro}`.trim()

  const highlights: string[] = []
  if (f.topScorer) highlights.push(`⚽ ${f.topScorer.goals}x goles de ${f.topScorer.name}`)
  if (f.keyMoment) highlights.push(`⏱ Min ${f.keyMoment.minute}: ${f.keyMoment.description}`)
  highlights.push(`🏟 ${f.home} ${f.homeScore}-${f.awayScore} ${f.away}`)
  if (total >= 4) highlights.push('🔥 Partido de alto voltaje ofensivo')
  else if (total === 0) highlights.push('🛡 Duelo defensivo sin goles')
  if (f.attendance && f.attendance >= 200) highlights.push(`👥 ${f.attendance} en tribuna`)

  return { headline, tagline, body, highlights, tone, lang: 'es' }
}

/* -------------------------------------------------------------------------- */
/* Media auto-tagging — detecta etiquetas a partir de texto/contexto          */
/* -------------------------------------------------------------------------- */

export interface MediaTag {
  label: string
  kind: 'action' | 'player' | 'team' | 'emotion' | 'moment'
  confidence: number // 0..1
}

export interface MediaTagInput {
  caption?: string
  team?: string
  mediaType?: 'photo' | 'video'
}

/**
 * Simula lo que haría un modelo de visión + NLP: extrae hasta 5 tags relevantes
 * a partir del caption + metadatos. Determinista por el input.
 */
export function suggestMediaTags(input: MediaTagInput): MediaTag[] {
  const text = (input.caption ?? '').toLowerCase()
  const tags: MediaTag[] = []

  const push = (label: string, kind: MediaTag['kind'], confidence: number) => {
    if (!tags.some(t => t.label === label)) tags.push({ label, kind, confidence })
  }

  // Actions
  if (/(gol|golazo|marca|anota|met[eió])/.test(text)) push('#gol', 'action', 0.94)
  if (/(hat[ -]?trick)/.test(text)) push('#hatTrick', 'action', 0.97)
  if (/(asist|pase)/.test(text)) push('#asistencia', 'action', 0.86)
  if (/(atajada|tapada|arquero)/.test(text)) push('#atajada', 'action', 0.88)
  if (/(tiro libre|falta|tarjeta)/.test(text)) push('#tiroLibre', 'action', 0.8)
  if (/(penal|penalti)/.test(text)) push('#penal', 'action', 0.91)

  // Moments
  if (/(final|ultimo minuto|último minuto|90)/.test(text)) push('#tiempoExtra', 'moment', 0.82)
  if (/(cuartos|semi|final|torneo|copa)/.test(text)) push('#torneo', 'moment', 0.78)
  if (/(domingo|s[aá]bado|finde)/.test(text)) push('#finDeSemana', 'moment', 0.72)

  // Outcomes / emotion
  if (/(ganamos|victoria|triunfo|vencimos)/.test(text)) push('#victoria', 'emotion', 0.9)
  if (/(perdimos|derrota)/.test(text)) push('#derrota', 'emotion', 0.88)
  if (/(empate|igualamos)/.test(text)) push('#empate', 'emotion', 0.85)
  if (/🔥|épic|tremen|brutal/.test(text)) push('#épico', 'emotion', 0.76)
  if (/💪|vamos|fuerza/.test(text)) push('#garra', 'emotion', 0.74)

  // Player/team extraction — nombre propio detectado por palabra capitalizada
  const rawCaps = (input.caption ?? '').match(/\b[A-ZÁÉÍÓÚÑ][a-záéíóúñ]{2,}(?:\s[A-ZÁÉÍÓÚÑ]\.?)?/g) ?? []
  for (const w of rawCaps.slice(0, 2)) {
    push(`@${w.replace(/\s+/g, '')}`, 'player', 0.7)
  }

  if (input.team) push(`#${input.team.replace(/\s+/g, '')}`, 'team', 0.95)

  // Fallback si no matcheó nada
  if (tags.length === 0) {
    push('#fútbol', 'moment', 0.6)
    push('#equipo', 'team', 0.55)
  }

  // Priorizar por confianza y cortar a 5
  return tags.sort((a, b) => b.confidence - a.confidence).slice(0, 5)
}

/* -------------------------------------------------------------------------- */
/* Match Preview — análisis pre-partido generado antes del encuentro          */
/* -------------------------------------------------------------------------- */

export interface MatchPreviewInput {
  home: string
  away: string
  date?: string
  venue?: string
}

export interface MatchPreview {
  headline: string
  keyMatchup: string
  homeStrength: string
  awayStrength: string
  xFactor: string
  hypeLine: string
}

export function generateMatchPreview(i: MatchPreviewInput): MatchPreview {
  const seed = (i.home + i.away).split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const roll = seed % 4

  const HOME_STRENGTHS = [
    `${i.home} llega con la mejor ofensiva del torneo (2.4 goles/partido).`,
    `${i.home} lleva 5 partidos invicto jugando de local.`,
    `${i.home} tiene el mejor porcentaje de posesión de la fecha (58%).`,
    `${i.home} destaca por su juego aéreo — 40% de sus goles en pelota parada.`,
  ]
  const AWAY_STRENGTHS = [
    `${i.away} es letal al contragolpe — 7 goles así este torneo.`,
    `${i.away} presiona alto y recupera rápido en mitad de cancha.`,
    `${i.away} tiene la defensa menos goleada (0.6/partido).`,
    `${i.away} viene de 3 triunfos consecutivos fuera de casa.`,
  ]
  const MATCHUPS = [
    `Delantera de ${i.home} vs línea de fondo de ${i.away} — duelo clave.`,
    `Mediocampo: el equipo que gane el control marca la tónica.`,
    `Rematadores vs arquero — partido que se define en pocas jugadas.`,
    `Duelo de entrenadores: disciplina vs creatividad.`,
  ]
  const XFACTORS = [
    'El clima podría complicar el juego combinativo.',
    'Jugador figura de la fecha está en duda — se decide al vestuario.',
    'Público local empujando desde el arranque puede pesar.',
    'Quien marque primero suele ganar en este cruce (80% histórico).',
  ]
  const HYPES = [
    '🔥 No te pierdas este cruce — promete ser el partido de la fecha.',
    '⚽ Todos los ingredientes para un clásico con emoción hasta el final.',
    '🎯 Dos estilos opuestos — ajedrez puro en la cancha.',
    '🚀 Ambos necesitan los 3 puntos — no habrá especulación.',
  ]

  return {
    headline: `${i.home} recibe a ${i.away}${i.date ? ` · ${i.date}` : ''}`,
    keyMatchup: MATCHUPS[roll],
    homeStrength: HOME_STRENGTHS[roll],
    awayStrength: AWAY_STRENGTHS[(roll + 1) % 4],
    xFactor: XFACTORS[(roll + 2) % 4],
    hypeLine: HYPES[roll],
  }
}

/* -------------------------------------------------------------------------- */
/* Coach Feedback — análisis personalizado a partir de las stats del jugador  */
/* -------------------------------------------------------------------------- */

export interface PlayerStats {
  name: string
  position?: string
  matches: number
  goals: number
  assists: number
  mvps: number
  minutesPerMatch?: number
}

export interface CoachFeedback {
  verdict: string
  strengths: string[]
  improvements: string[]
  nextFocus: string
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C+' | 'C'
}

export function generateCoachFeedback(s: PlayerStats): CoachFeedback {
  const goalsPer = s.matches > 0 ? s.goals / s.matches : 0
  const assistsPer = s.matches > 0 ? s.assists / s.matches : 0
  const mvpRate = s.matches > 0 ? s.mvps / s.matches : 0
  const score = goalsPer * 3 + assistsPer * 2 + mvpRate * 4

  const grade: CoachFeedback['grade'] =
    score >= 2.5 ? 'A+' :
    score >= 1.8 ? 'A'  :
    score >= 1.3 ? 'B+' :
    score >= 0.9 ? 'B'  :
    score >= 0.5 ? 'C+' : 'C'

  const strengths: string[] = []
  if (goalsPer >= 0.6)   strengths.push(`Definición letal: promedio de ${goalsPer.toFixed(2)} goles/partido.`)
  if (assistsPer >= 0.4) strengths.push(`Buena visión de juego: ${s.assists} asistencias en ${s.matches} partidos.`)
  if (mvpRate >= 0.15)   strengths.push(`Aparece en partidos grandes — ${s.mvps} MVPs.`)
  if (strengths.length === 0) strengths.push('Compromiso y regularidad en la cancha.')

  const improvements: string[] = []
  if (goalsPer < 0.3)    improvements.push('Trabajar llegada al área y definición con menos toques.')
  if (assistsPer < 0.2)  improvements.push('Mejorar pase filtrado en zonas de definición.')
  if (mvpRate < 0.1)     improvements.push('Sostener nivel alto durante los 90 minutos.')
  if (improvements.length === 0) improvements.push('Mantener la intensidad sumando más duelos defensivos.')

  const verdict =
    grade === 'A+' ? `${s.name} tuvo una campaña sobresaliente — referente del equipo.` :
    grade === 'A'  ? `${s.name} es pieza clave en el plantel y viene creciendo.` :
    grade === 'B+' ? `${s.name} muestra buenos destellos, con margen para romper la barrera.` :
    grade === 'B'  ? `${s.name} aporta regularidad, próximo salto es convertirse en decisivo.` :
    grade === 'C+' ? `${s.name} tiene participación sostenida, foco en elevar impacto en resultados.` :
                     `${s.name} está construyendo base sólida, enfocarse en fundamentos.`

  const nextFocus =
    goalsPer < assistsPer ? 'Este mes trabajar finalización — series de 20 tiros post-entreno.' :
    assistsPer < goalsPer * 0.5 ? 'Variar el juego: sumar pases entre líneas para generar para otros.' :
    'Sostener el nivel y sumar liderazgo dentro del vestuario.'

  return { verdict, strengths, improvements, nextFocus, grade }
}

/* -------------------------------------------------------------------------- */
/* Team Matcher — recomienda equipos según respuestas del usuario             */
/* -------------------------------------------------------------------------- */

export type PlayStyle = 'ofensivo' | 'defensivo' | 'tocar' | 'intenso'
export type PlayDay  = 'semana' | 'sabado' | 'domingo' | 'flexible'
export type PlayLevel = 'casual' | 'competitivo' | 'profesional'

export interface MatcherAnswers {
  style: PlayStyle
  day: PlayDay
  level: PlayLevel
}

export interface TeamCandidate {
  id: string
  name: string
  color: string
  badge: string
  style: PlayStyle
  day: PlayDay
  level: PlayLevel
  members: number
}

export interface TeamMatch {
  team: TeamCandidate
  score: number // 0..100
  reason: string
}

export function matchTeams(candidates: TeamCandidate[], a: MatcherAnswers): TeamMatch[] {
  const scored = candidates.map(t => {
    let s = 40 // base
    const reasons: string[] = []
    if (t.style === a.style) { s += 28; reasons.push(`juegan estilo ${t.style}`) }
    if (t.day === a.day || a.day === 'flexible') { s += 20; reasons.push(`coinciden en día`) }
    if (t.level === a.level) { s += 18; reasons.push(`tu mismo nivel`) }
    // bonus leve por tamaño
    if (t.members >= 10 && t.members <= 18) s += 6
    const score = Math.min(99, s + ((t.id.charCodeAt(0) % 5)))
    const reason = reasons.length ? reasons.join(' · ') : 'coincidencia básica de perfil'
    return { team: t, score, reason }
  })
  return scored.sort((x, y) => y.score - x.score).slice(0, 2)
}

/* -------------------------------------------------------------------------- */
/* Weekly Digest — resumen narrativo de la semana                             */
/* -------------------------------------------------------------------------- */

export interface WeekStats {
  userName: string
  matchesPlayed: number
  goals: number
  assists: number
  wins: number
  losses: number
  draws: number
  topPostLikes?: number
  nextMatch?: { opponent: string; when: string }
}

export interface WeeklyDigest {
  title: string
  highlight: string
  sections: Array<{ label: string; text: string; color: string }>
  outlook: string
}

export function generateWeeklyDigest(w: WeekStats): WeeklyDigest {
  const goalDiff = w.goals
  const recordStr = `${w.wins}W-${w.draws}D-${w.losses}L`
  const highlight = w.wins > w.losses
    ? `Semana positiva para ${w.userName} — ${recordStr} con ${w.goals} goles y ${w.assists} asistencias.`
    : w.wins === w.losses
    ? `Semana pareja (${recordStr}) — oportunidad de dar el salto la próxima fecha.`
    : `Semana dura (${recordStr}), pero con impacto personal: ${w.goals} goles anotados.`

  const sections: WeeklyDigest['sections'] = [
    {
      label: 'Partidos',
      text: `${w.matchesPlayed} partido${w.matchesPlayed === 1 ? '' : 's'} disputado${w.matchesPlayed === 1 ? '' : 's'} · récord ${recordStr}.`,
      color: '#CCFF00',
    },
    {
      label: 'Ofensiva',
      text: goalDiff > 0
        ? `Aportaste ${w.goals} gol${w.goals === 1 ? '' : 'es'} y ${w.assists} asistencia${w.assists === 1 ? '' : 's'} — ${(w.goals / Math.max(1, w.matchesPlayed)).toFixed(1)} goles/partido.`
        : 'Sin goles esta semana — se viene la reacción.',
      color: '#FFB800',
    },
  ]
  if (w.topPostLikes && w.topPostLikes > 0) {
    sections.push({
      label: 'Feed',
      text: `Tu post más popular de la semana sumó ${w.topPostLikes} likes 🔥`,
      color: '#FF5B3A',
    })
  }

  const outlook = w.nextMatch
    ? `📅 Próximo: vs ${w.nextMatch.opponent} · ${w.nextMatch.when}. ¡A preparar lo mejor!`
    : '📅 Sin partidos agendados — buena ventana para entrenamiento.'

  return {
    title: `Tu resumen semanal, ${w.userName.split(' ')[0]}`,
    highlight,
    sections,
    outlook,
  }
}

/* -------------------------------------------------------------------------- */
/* Semantic Search — interpreta query en lenguaje natural                     */
/* -------------------------------------------------------------------------- */

export interface SearchIntent {
  rawQuery: string
  interpretation: string
  filters: {
    day?: PlayDay
    style?: PlayStyle
    level?: PlayLevel
    zone?: string
    member?: 'pocos' | 'muchos'
  }
}

export function parseSearchIntent(query: string): SearchIntent {
  const q = query.toLowerCase().trim()
  const filters: SearchIntent['filters'] = {}
  const parts: string[] = []

  // Day
  if (/\b(domingo|dom)\b/.test(q))        { filters.day = 'domingo';  parts.push('domingo') }
  else if (/\b(s[aá]bado|sab)\b/.test(q)) { filters.day = 'sabado';   parts.push('sábado') }
  else if (/\b(semana|entre semana)\b/.test(q)) { filters.day = 'semana'; parts.push('entre semana') }

  // Style
  if (/\b(ofensiv|goleador|atacar)/.test(q))      { filters.style = 'ofensivo';  parts.push('estilo ofensivo') }
  else if (/\b(defensiv|s[oó]lido)/.test(q))       { filters.style = 'defensivo'; parts.push('estilo defensivo') }
  else if (/\b(toque|tocar|posesi[oó]n)/.test(q))  { filters.style = 'tocar';     parts.push('de toque') }
  else if (/\b(intens|presi[oó]n|pressing|correr)/.test(q)) { filters.style = 'intenso'; parts.push('intenso') }

  // Level
  if (/\b(casual|amateur|recreativ)/.test(q))            { filters.level = 'casual';       parts.push('nivel casual') }
  else if (/\b(competitiv|serio|liga)/.test(q))           { filters.level = 'competitivo';  parts.push('competitivo') }
  else if (/\b(profesional|pro|alto nivel)/.test(q))      { filters.level = 'profesional';  parts.push('profesional') }

  // Zone
  const zoneMatch = q.match(/\b(zona\s+\w+|norte|sur|este|oeste|centro|capital)\b/)
  if (zoneMatch) { filters.zone = zoneMatch[0]; parts.push(`zona ${zoneMatch[0].replace(/^zona\s+/, '')}`) }

  // Size
  if (/\b(pocos|poca gente|peque[ñn]o)/.test(q)) { filters.member = 'pocos'; parts.push('equipos chicos') }
  else if (/\b(grande|muchos|popular)/.test(q))  { filters.member = 'muchos'; parts.push('equipos grandes') }

  const interpretation = parts.length > 0
    ? `Buscando: ${parts.join(' · ')}`
    : `Búsqueda general: "${query}"`

  return { rawQuery: query, interpretation, filters }
}

function recapEN(f: MatchFact, tone: Tone): MatchRecap {
  const winner = f.homeScore > f.awayScore ? f.home : f.awayScore > f.homeScore ? f.away : null
  const loser  = winner === f.home ? f.away : winner === f.away ? f.home : null
  const draw   = winner === null
  const total  = f.homeScore + f.awayScore
  const top    = Math.max(f.homeScore, f.awayScore)
  const bot    = Math.min(f.homeScore, f.awayScore)

  const headline = draw
    ? tone === 'hype'
      ? `${f.home} and ${f.away} put on a SHOW in a thrilling draw!`
      : tone === 'formal'
      ? `${f.home} and ${f.away} share the points in a balanced clash`
      : `${f.home} and ${f.away} share the points in a tight match`
    : tone === 'hype'
    ? `${winner} CRUSHES ${loser} ${top}-${bot}! 🔥`
    : tone === 'formal'
    ? `${winner} defeats ${loser} ${top}-${bot} in a decisive encounter`
    : `${winner} beats ${loser} ${top}-${bot}`

  const tagline = draw
    ? 'An evenly matched contest with nothing to separate them'
    : total >= 4
    ? 'A high-scoring thriller with goals at both ends'
    : total === 0
    ? 'A tight defensive battle decided by small margins'
    : `${winner} set the pace from the opening whistle`

  const intro = draw
    ? `${f.home} and ${f.away} split the points after an intense ${f.homeScore}-${f.awayScore} draw.`
    : `${winner} beat ${loser} ${top}-${bot} in a match with turning points on both sides.`
  const moment = f.keyMoment
    ? ` In the ${f.keyMoment.minute}th minute, ${f.keyMoment.description.toLowerCase()}, shifting the momentum.`
    : ''
  const scorer = f.topScorer
    ? ` The standout player was ${f.topScorer.name}, scoring ${f.topScorer.goals} ${f.topScorer.goals === 1 ? 'goal' : 'goals'} for ${f.topScorer.team === 'home' ? f.home : f.away}.`
    : ''
  const attendance = f.attendance ? ` ${f.attendance} fans cheered from the stands.` : ''

  const body = `${intro}${moment}${scorer}${attendance}`.trim()

  const highlights: string[] = []
  if (f.topScorer) highlights.push(`⚽ ${f.topScorer.goals}x goals by ${f.topScorer.name}`)
  if (f.keyMoment) highlights.push(`⏱ Min ${f.keyMoment.minute}: ${f.keyMoment.description}`)
  highlights.push(`🏟 ${f.home} ${f.homeScore}-${f.awayScore} ${f.away}`)
  if (total >= 4) highlights.push('🔥 High-scoring thriller')
  else if (total === 0) highlights.push('🛡 Defensive battle, no goals')
  if (f.attendance && f.attendance >= 200) highlights.push(`👥 ${f.attendance} in attendance`)

  return { headline, tagline, body, highlights, tone, lang: 'en' }
}

/* -------------------------------------------------------------------------- */
/* Video Highlights — auto-cut                                                */
/* -------------------------------------------------------------------------- */

export type ClipType = 'goal' | 'save' | 'skill' | 'tackle' | 'chance'

export interface VideoClip {
  id: string
  start: number
  end: number
  type: ClipType
  label: string
  confidence: number
}

export interface VideoMeta {
  duration: number
  title?: string
  homeScore?: number
  awayScore?: number
  topScorer?: string
}

const CLIP_LABEL: Record<ClipType, string[]> = {
  goal:   ['Gol clavado al ángulo', 'Gol tras contra fulminante', 'Golazo de media distancia', 'Cabezazo letal'],
  save:   ['Atajadón del arquero', 'Mano cambiada increíble', 'Reflejo de categoría', 'Salvada bajo el arco'],
  skill:  ['Caño + asistencia', 'Gambeta endiablada', 'Sombrerito y definición', 'Taco de lujo'],
  tackle: ['Barrida perfecta', 'Quite limpio en el área', 'Anticipo de crack'],
  chance: ['Tiro al palo', 'Remate exigente al arquero', 'Centro peligroso'],
}

const CLIP_EMOJI: Record<ClipType, string> = {
  goal: '⚽', save: '🧤', skill: '✨', tackle: '🛡', chance: '🎯',
}

export function clipEmoji(t: ClipType): string { return CLIP_EMOJI[t] }

export function formatClipTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function suggestVideoClips(meta: VideoMeta): VideoClip[] {
  const total = Math.max(60, Math.floor(meta.duration || 5400))
  const goals = Math.max(0, (meta.homeScore || 0) + (meta.awayScore || 0))
  const numClips = Math.min(6, Math.max(3, goals + 2))

  const typesPool: ClipType[] = []
  for (let i = 0; i < goals; i++) typesPool.push('goal')
  typesPool.push('save', 'skill')
  const fillers: ClipType[] = ['skill', 'save', 'tackle', 'chance']
  while (typesPool.length < numClips) typesPool.push(fillers[typesPool.length % fillers.length])

  const clips: VideoClip[] = []
  for (let i = 0; i < numClips; i++) {
    const type = typesPool[i]
    const center = Math.floor(((i + 0.5) / numClips) * total)
    const jitter = Math.floor((Math.sin(i * 9.31) + 1) * 30)
    const start = Math.max(0, center + jitter - 6)
    const end = Math.min(total, start + (type === 'goal' ? 18 : 12))
    const labels = CLIP_LABEL[type]
    const label = labels[i % labels.length]
    const confidence = type === 'goal' ? 0.92 - i * 0.03 : 0.78 - i * 0.04
    clips.push({
      id: 'clip-' + (i + 1),
      start, end, type, label,
      confidence: Math.max(0.55, +confidence.toFixed(2)),
    })
  }
  return clips.sort((a, b) => b.confidence - a.confidence)
}

/* -------------------------------------------------------------------------- */
/* App Assistant — FAQ bot                                                    */
/* -------------------------------------------------------------------------- */

export interface AssistantAnswer {
  reply: string
  suggestions?: string[]
}

type FaqRule = {
  match: RegExp
  answer: string
  followups?: string[]
}

const FAQ: FaqRule[] = [
  {
    match: /(hola|buenas|hey|holi|saludos)/i,
    answer: '¡Hola! 👋 Soy el asistente de FútbolBase. Puedo ayudarte con predicciones, equipos, chats, highlights y tu perfil. ¿Qué querés saber?',
    followups: ['¿Cómo hago una predicción?', '¿Cómo uno a un equipo?', '¿Qué es el Coach AI?'],
  },
  {
    match: /(predic|quiniel|pron[oó]stico|apuesta)/i,
    answer: 'Para predecir: tocá un partido en Home → abre Quiniela Copilot. Elegí modo (⚖ balanceado, 🔥 optimista, 📊 analítico) y tocá "Usar sugerencia". Tu pick se guarda solo.',
    followups: ['¿Qué es el Match Preview?', '¿Puedo cambiar mi predicción?'],
  },
  {
    match: /(equipo|unirme|comunidad|club)/i,
    answer: 'En Comunidad buscás equipos con lenguaje natural ("competitivo sábados") o hacés el Team Matcher (3 preguntas) que recomienda los 2 mejores según tu estilo.',
    followups: ['¿Cómo funciona el Team Matcher?'],
  },
  {
    match: /(matcher|quiz|recomendac)/i,
    answer: 'El Team Matcher hace 3 preguntas (nivel, compromiso, estilo) y calcula score de compatibilidad. Muestra top-2 con porcentaje y razones.',
  },
  {
    match: /(chat|mensaje|conversaci[oó]n|hablar)/i,
    answer: 'En Chat tenés tus conversaciones. Al escribir aparecen respuestas sugeridas (chips). Podés cambiar el tono casual/hype/formal — se recuerda por chat.',
    followups: ['¿Cómo cambio el tono?'],
  },
  {
    match: /(tono|casual|hype|formal)/i,
    answer: 'El tono ajusta las respuestas sugeridas: casual (relajado), hype (energético con emojis) o formal (educado). Se guarda por conversación.',
  },
  {
    match: /(highlight|video|clip|recap|resumen)/i,
    answer: 'Cada partido finalizado tiene "Recap AI" — resumen narrativo (tono + idioma) e highlights con timestamps. Podés generar clips automáticos.',
    followups: ['¿Qué es el Weekly Digest?'],
  },
  {
    match: /(coach|feedback|consejo|mejorar)/i,
    answer: 'Coach AI (en Perfil) analiza tus stats y te da: nota (A+ a C), fortalezas, puntos a mejorar y foco para la próxima semana.',
  },
  {
    match: /(digest|semana|weekly|resumen semanal)/i,
    answer: 'Weekly Digest está en Home (ícono periódico). Narrativa con tus stats de la semana + objetivo para la siguiente.',
  },
  {
    match: /(idioma|espa[ñn]ol|ingl[eé]s|language)/i,
    answer: 'El recap soporta ES/EN — usá el switcher dentro del panel.',
  },
  {
    match: /(tag|hashtag|menci[oó]n|foto|post)/i,
    answer: 'Al postear fotos/videos la AI sugiere hashtags y @menciones leyendo tu caption. Tocás para aplicar.',
  },
  {
    match: /(perfil|profile|stats|estad)/i,
    answer: 'Tu perfil muestra tarjeta FIFA, stats, últimos 3 partidos y Coach AI actualizado.',
  },
  {
    match: /(notific|aviso|alerta)/i,
    answer: 'Notificaciones en la campana del header: confirmaciones, menciones y updates del equipo.',
  },
  {
    match: /(gracias|genial|perfecto|ok|dale)/i,
    answer: '¡De nada! 🙌 Si necesitás algo más, estoy acá.',
    followups: ['¿Qué más podés hacer?'],
  },
  {
    match: /(qu[eé] pod[eé]s|qu[eé] haces|ayuda|help|capacidades|funcion)/i,
    answer: 'Puedo explicar: predicciones, Team Matcher, chats y tonos, highlights, Coach AI, Weekly Digest, auto-tags, idioma, perfil y notificaciones. Preguntame 👇',
    followups: ['¿Cómo hago una predicción?', '¿Qué es el Coach AI?', '¿Cómo uno un equipo?'],
  },
]

export function answerAppQuestion(query: string): AssistantAnswer {
  const q = (query || '').trim()
  if (!q) {
    return {
      reply: 'Contame qué querés saber de FútbolBase 👇',
      suggestions: ['¿Cómo hago una predicción?', '¿Qué es el Coach AI?', '¿Cómo uno un equipo?'],
    }
  }
  for (const rule of FAQ) {
    if (rule.match.test(q)) return { reply: rule.answer, suggestions: rule.followups }
  }
  return {
    reply: 'Mmm, no tengo respuesta exacta para eso. Puedo con predicciones, equipos, chats, highlights, Coach AI o perfil. ¿Cuál te interesa?',
    suggestions: ['¿Cómo hago una predicción?', '¿Cómo uno a un equipo?', '¿Qué es el Coach AI?'],
  }
}

/* -------------------------------------------------------------------------- */
/* Auto-alineación (Tier 5)                                                   */
/* -------------------------------------------------------------------------- */

export type Formation = '4-3-3' | '4-4-2' | '3-5-2' | '4-2-3-1' | '5-3-2'
export type FieldPos = 'GK' | 'DEF' | 'MID' | 'FWD'

export interface LineupPlayer {
  name: string
  number: number
  role: FieldPos
  slot: string           // etiqueta específica: "LB", "CM", "ST", etc.
  x: number              // 0..100 (campo horizontal desde portería propia)
  y: number              // 0..100 (ancho del campo)
  rating: number         // 60..99
  note?: string          // razón de la AI ("en forma", "marca de rival", etc.)
}

export interface Lineup {
  formation: Formation
  opponent: string
  style: 'ofensivo' | 'equilibrado' | 'defensivo'
  players: LineupPlayer[]
  keyPlayer: string
  risk: string
  hypeLine: string
}

// Pool de jugadores mock
const PLAYER_POOL = [
  { name: 'Alex Rivera',     number: 10, rating: 88, best: ['MID', 'FWD'] },
  { name: 'Carlos Méndez',   number: 9,  rating: 90, best: ['FWD'] },
  { name: 'Diego Fuentes',   number: 1,  rating: 84, best: ['GK'] },
  { name: 'Mateo Silva',     number: 4,  rating: 82, best: ['DEF'] },
  { name: 'Lucas Arana',     number: 5,  rating: 80, best: ['DEF'] },
  { name: 'Nico Torres',     number: 3,  rating: 78, best: ['DEF'] },
  { name: 'Bruno Vega',      number: 2,  rating: 79, best: ['DEF'] },
  { name: 'Pablo Lanza',     number: 6,  rating: 85, best: ['MID'] },
  { name: 'Santi Romero',    number: 8,  rating: 83, best: ['MID'] },
  { name: 'Gabo Ruiz',       number: 11, rating: 81, best: ['MID', 'FWD'] },
  { name: 'Rafa Ortiz',      number: 7,  rating: 87, best: ['FWD', 'MID'] },
  { name: 'Tincho Paredes',  number: 14, rating: 76, best: ['MID'] },
]

const FORMATION_SLOTS: Record<Formation, { slot: string; role: FieldPos; x: number; y: number }[]> = {
  '4-3-3': [
    { slot: 'GK', role: 'GK',  x: 6,  y: 50 },
    { slot: 'RB', role: 'DEF', x: 22, y: 82 },
    { slot: 'CB', role: 'DEF', x: 20, y: 60 },
    { slot: 'CB', role: 'DEF', x: 20, y: 40 },
    { slot: 'LB', role: 'DEF', x: 22, y: 18 },
    { slot: 'CM', role: 'MID', x: 46, y: 50 },
    { slot: 'CM', role: 'MID', x: 42, y: 28 },
    { slot: 'CM', role: 'MID', x: 42, y: 72 },
    { slot: 'LW', role: 'FWD', x: 76, y: 20 },
    { slot: 'ST', role: 'FWD', x: 82, y: 50 },
    { slot: 'RW', role: 'FWD', x: 76, y: 80 },
  ],
  '4-4-2': [
    { slot: 'GK', role: 'GK',  x: 6,  y: 50 },
    { slot: 'RB', role: 'DEF', x: 22, y: 82 },
    { slot: 'CB', role: 'DEF', x: 20, y: 60 },
    { slot: 'CB', role: 'DEF', x: 20, y: 40 },
    { slot: 'LB', role: 'DEF', x: 22, y: 18 },
    { slot: 'RM', role: 'MID', x: 48, y: 82 },
    { slot: 'CM', role: 'MID', x: 44, y: 60 },
    { slot: 'CM', role: 'MID', x: 44, y: 40 },
    { slot: 'LM', role: 'MID', x: 48, y: 18 },
    { slot: 'ST', role: 'FWD', x: 78, y: 58 },
    { slot: 'ST', role: 'FWD', x: 78, y: 42 },
  ],
  '3-5-2': [
    { slot: 'GK', role: 'GK',  x: 6,  y: 50 },
    { slot: 'CB', role: 'DEF', x: 20, y: 70 },
    { slot: 'CB', role: 'DEF', x: 18, y: 50 },
    { slot: 'CB', role: 'DEF', x: 20, y: 30 },
    { slot: 'RWB', role: 'MID', x: 42, y: 86 },
    { slot: 'CM', role: 'MID', x: 44, y: 62 },
    { slot: 'CM', role: 'MID', x: 44, y: 50 },
    { slot: 'CM', role: 'MID', x: 44, y: 38 },
    { slot: 'LWB', role: 'MID', x: 42, y: 14 },
    { slot: 'ST', role: 'FWD', x: 78, y: 58 },
    { slot: 'ST', role: 'FWD', x: 78, y: 42 },
  ],
  '4-2-3-1': [
    { slot: 'GK',  role: 'GK',  x: 6,  y: 50 },
    { slot: 'RB',  role: 'DEF', x: 22, y: 82 },
    { slot: 'CB',  role: 'DEF', x: 20, y: 60 },
    { slot: 'CB',  role: 'DEF', x: 20, y: 40 },
    { slot: 'LB',  role: 'DEF', x: 22, y: 18 },
    { slot: 'DM',  role: 'MID', x: 38, y: 40 },
    { slot: 'DM',  role: 'MID', x: 38, y: 60 },
    { slot: 'AM',  role: 'MID', x: 60, y: 50 },
    { slot: 'LW',  role: 'FWD', x: 70, y: 20 },
    { slot: 'RW',  role: 'FWD', x: 70, y: 80 },
    { slot: 'ST',  role: 'FWD', x: 84, y: 50 },
  ],
  '5-3-2': [
    { slot: 'GK',  role: 'GK',  x: 6,  y: 50 },
    { slot: 'RWB', role: 'DEF', x: 26, y: 88 },
    { slot: 'CB',  role: 'DEF', x: 20, y: 66 },
    { slot: 'CB',  role: 'DEF', x: 18, y: 50 },
    { slot: 'CB',  role: 'DEF', x: 20, y: 34 },
    { slot: 'LWB', role: 'DEF', x: 26, y: 12 },
    { slot: 'CM',  role: 'MID', x: 48, y: 60 },
    { slot: 'CM',  role: 'MID', x: 44, y: 50 },
    { slot: 'CM',  role: 'MID', x: 48, y: 40 },
    { slot: 'ST',  role: 'FWD', x: 80, y: 58 },
    { slot: 'ST',  role: 'FWD', x: 80, y: 42 },
  ],
}

const NOTES_POOL: Record<FieldPos, string[]> = {
  GK:  ['En forma', 'Buenas manos las últimas 3 fechas'],
  DEF: ['Cubre al mejor del rival', 'Lectura de contraataques', 'Sale jugando limpio', 'Anticipa bien'],
  MID: ['Dueño del medio', 'Presión alta', 'Pases filtrados', 'Box-to-box', 'Pisa área'],
  FWD: ['Desmarque constante', 'Ancha la cancha', 'Definidor clínico', 'Remate de cabeza', 'Va por dentro'],
}

export function generateLineup(
  opponent: string,
  formation: Formation = '4-3-3',
  style: Lineup['style'] = 'equilibrado',
): Lineup {
  const slots = FORMATION_SLOTS[formation]
  const byRole: Record<FieldPos, typeof PLAYER_POOL> = { GK: [], DEF: [], MID: [], FWD: [] }
  PLAYER_POOL.forEach(p => {
    (p.best as FieldPos[]).forEach(r => byRole[r].push(p))
  })

  const used = new Set<string>()
  const players: LineupPlayer[] = slots.map((s) => {
    // Picking: mejor rating del rol que no esté ya usado
    const candidates = byRole[s.role]
      .filter(p => !used.has(p.name))
      .sort((a, b) => b.rating - a.rating)
    const p = candidates[0] ?? PLAYER_POOL.find(pp => !used.has(pp.name))!
    used.add(p.name)
    const notes = NOTES_POOL[s.role]
    const note = notes[Math.floor(Math.random() * notes.length)]
    return {
      name: p.name,
      number: p.number,
      role: s.role,
      slot: s.slot,
      x: s.x, y: s.y,
      rating: p.rating,
      note,
    }
  })

  const best = [...players].sort((a, b) => b.rating - a.rating)[0]
  const riskByStyle: Record<Lineup['style'], string> = {
    ofensivo: `Dejamos espacios atrás — cuidado con la contra de ${opponent}.`,
    equilibrado: `Balance cubre errores, pero ${opponent} puede dominar si presionamos mal.`,
    defensivo: `Posible que no generemos volumen ofensivo — necesitamos ser clínicos.`,
  }
  const hypeByStyle: Record<Lineup['style'], string> = {
    ofensivo: `¡${formation} al ataque! Salimos a comerlos 🔥`,
    equilibrado: `${formation} estándar — ganamos la pelota y lastimamos.`,
    defensivo: `${formation} muralla — aguantar y salir rápido.`,
  }

  return {
    formation,
    opponent,
    style,
    players,
    keyPlayer: best.name,
    risk: riskByStyle[style],
    hypeLine: hypeByStyle[style],
  }
}

/* -------------------------------------------------------------------------- */
/* Rival scouting report (Tier 5)                                             */
/* -------------------------------------------------------------------------- */

export interface RivalReport {
  opponent: string
  overall: number                   // 50..95
  form: ('W' | 'D' | 'L')[]         // últimos 5
  strengths: string[]
  weaknesses: string[]
  dangerPlayer: { name: string; role: string; note: string }
  preferredFormation: Formation
  preferredStyle: 'alta presión' | 'contragolpe' | 'posesión' | 'defensivo'
  tacticalAdvice: string[]
  threatLevel: 'bajo' | 'medio' | 'alto' | 'extremo'
  confidence: number                // 0..1
}

const RIVAL_DB: Record<string, Partial<RivalReport>> = {
  'Rayo Urbano':      { overall: 78, preferredStyle: 'contragolpe',   threatLevel: 'alto',   dangerPlayer: { name: 'Kevin "Rayo" Durán', role: 'RW', note: 'desequilibra por afuera' } },
  'Águilas Doradas':  { overall: 82, preferredStyle: 'posesión',      threatLevel: 'alto',   dangerPlayer: { name: 'Martín Solís',       role: 'AM',  note: 'último pase letal' } },
  'Halcones FC':      { overall: 74, preferredStyle: 'alta presión',  threatLevel: 'medio',  dangerPlayer: { name: 'Dylan Castro',       role: 'CM',  note: 'recuperador implacable' } },
  'Titanes':          { overall: 80, preferredStyle: 'posesión',      threatLevel: 'alto',   dangerPlayer: { name: 'Axel Romero',        role: 'ST',  note: '8 goles en 5 partidos' } },
  'Atlético Sur':     { overall: 68, preferredStyle: 'defensivo',     threatLevel: 'bajo',   dangerPlayer: { name: 'Tomás Ibáñez',       role: 'CB',  note: 'aéreo dominante' } },
}

const STRENGTH_POOL = [
  'Pressing alto coordinado', 'Centros precisos al área', 'Salida limpia desde el fondo',
  'Transiciones rápidas en 4 segundos', 'Remates de media distancia', 'Dominio por bandas',
  'Juego aéreo en ABP', 'Rotaciones ofensivas', 'Bloque bajo sólido',
]
const WEAKNESS_POOL = [
  'Vulnerables al balón parado a favor', 'Línea defensiva alta', 'Lateral izq. queda expuesto',
  'Bajo rendimiento en segundos tiempos', 'Pocos recursos contra presión alta', 'Arquero indeciso en centros',
  'Falta de profundidad en el banco', 'Tarjetas amarillas frecuentes', 'Defienden mal las transiciones',
]
const ADVICE_POOL = [
  'Atacá la espalda del lateral derecho en los primeros 15 min.',
  'Buscá al 10 con pases filtrados entre líneas.',
  'Saca el pressing a los centrales en salida — pierden la pelota.',
  'En ABP a favor, tirá segundo palo.',
  'No entres a su ritmo los primeros 10 — aguantá y contragolpeá.',
  'Doble marca al 9 — es donde canalizan todo.',
  'Subí los laterales — su medio es lento para cubrir.',
]

function pickN<T>(arr: readonly T[], n: number, seed: number): T[] {
  const out: T[] = []
  const used = new Set<number>()
  for (let i = 0; i < n; i++) {
    const idx = (seed * (i + 1) * 31) % arr.length
    const safe = used.has(idx) ? (idx + 1) % arr.length : idx
    used.add(safe)
    out.push(arr[safe])
  }
  return out
}

export function generateRivalReport(opponent: string): RivalReport {
  const seed = opponent.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const db = RIVAL_DB[opponent] ?? {}
  const overall = db.overall ?? 65 + (seed % 25)

  // forma aleatoria basada en overall
  const form: ('W' | 'D' | 'L')[] = []
  for (let i = 0; i < 5; i++) {
    const r = (seed * (i + 7)) % 100
    const winThresh = overall - 20
    const drawThresh = overall + 10
    form.push(r < winThresh ? 'W' : r < drawThresh ? 'D' : 'L')
  }

  const threatLevel = db.threatLevel ?? (
    overall >= 85 ? 'extremo' :
    overall >= 75 ? 'alto' :
    overall >= 65 ? 'medio' : 'bajo'
  )

  const formations: Formation[] = ['4-3-3', '4-4-2', '3-5-2', '4-2-3-1', '5-3-2']

  return {
    opponent,
    overall,
    form,
    strengths: pickN(STRENGTH_POOL, 3, seed),
    weaknesses: pickN(WEAKNESS_POOL, 3, seed + 5),
    dangerPlayer: db.dangerPlayer ?? {
      name: 'Jugador #10',
      role: 'AM',
      note: 'figura histórica del equipo',
    },
    preferredFormation: db.preferredFormation ?? formations[seed % formations.length],
    preferredStyle: db.preferredStyle ?? 'posesión',
    tacticalAdvice: pickN(ADVICE_POOL, 3, seed + 3),
    threatLevel,
    confidence: Math.min(0.95, 0.6 + (seed % 30) / 100),
  }
}
