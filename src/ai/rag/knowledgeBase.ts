/**
 * Mini knowledge-base de FútbolBase.
 * Cada documento tiene id, text, tags y metadata.
 * Es el "corpus" sobre el que corre el retriever mock.
 */

export interface KbDoc {
  id: string
  topic: string
  text: string
  tags: string[]
  /** opcional — URL/referencia interna para mostrar cita */
  source?: string
}

export const KNOWLEDGE_BASE: KbDoc[] = [
  // ── App features ────────────────────────────────────────────────
  {
    id: 'kb-predictions',
    topic: 'Quiniela Copilot',
    text: 'Para predecir un partido, tocá el partido en Home. Se abre Quiniela Copilot. Elegí modo balanceado, optimista o analítico. Tu predicción se guarda automáticamente en localStorage.',
    tags: ['predicción', 'quiniela', 'pronóstico', 'match', 'partido', 'home'],
    source: 'app/home#predictions',
  },
  {
    id: 'kb-matcher',
    topic: 'Team Matcher',
    text: 'El Team Matcher en Comunidad hace 3 preguntas sobre nivel, compromiso y estilo. Calcula un score de compatibilidad con cada equipo y recomienda los 2 mejores con razones.',
    tags: ['equipo', 'comunidad', 'matcher', 'quiz', 'recomendación'],
    source: 'app/community#matcher',
  },
  {
    id: 'kb-coach',
    topic: 'Coach AI',
    text: 'Coach AI en el Perfil analiza tus estadísticas y devuelve una nota A+ a C, fortalezas, puntos a mejorar y foco para la próxima semana. Se actualiza cuando sumás partidos.',
    tags: ['coach', 'consejo', 'feedback', 'mejorar', 'perfil', 'stats'],
    source: 'app/profile#coach',
  },
  {
    id: 'kb-digest',
    topic: 'Weekly Digest',
    text: 'Weekly Digest está en Home (ícono de periódico arriba a la derecha). Genera una narrativa con stats de la semana, destacados y objetivo para la siguiente.',
    tags: ['semana', 'weekly', 'digest', 'resumen', 'home'],
    source: 'app/home#digest',
  },
  {
    id: 'kb-recap',
    topic: 'Match Recap',
    text: 'Cada partido finalizado tiene un Recap AI con resumen narrativo (tono casual/hype/formal, idioma ES/EN) y highlights con timestamps. Podés generar video-clips auto-cut.',
    tags: ['recap', 'resumen', 'partido', 'highlights', 'video', 'clip'],
    source: 'app/home#recap',
  },
  {
    id: 'kb-chat-tone',
    topic: 'Chat & Tonos',
    text: 'En cada chat aparecen respuestas sugeridas (chips) basadas en el último mensaje. Podés cambiar el tono casual/hype/formal — se guarda por conversación.',
    tags: ['chat', 'tono', 'mensaje', 'casual', 'hype', 'formal'],
    source: 'app/chat',
  },
  {
    id: 'kb-scouting',
    topic: 'Rival Scouting',
    text: 'Scouting rival muestra overall del rival, forma reciente (últimos 5), jugador peligroso, fortalezas, debilidades, formación preferida y 3 consejos tácticos.',
    tags: ['scouting', 'rival', 'análisis', 'táctica'],
    source: 'app/home#scout',
  },
  {
    id: 'kb-lineup',
    topic: 'Auto-alineación',
    text: 'Alineación AI genera una formación completa (4-3-3, 4-4-2, 3-5-2, 4-2-3-1 o 5-3-2) con 11 jugadores, estilo ofensivo/equilibrado/defensivo, jugador clave y riesgo táctico.',
    tags: ['alineación', 'formación', 'táctica', 'equipo', '11'],
    source: 'app/home#lineup',
  },
  {
    id: 'kb-notifications',
    topic: 'Notificaciones',
    text: 'Las notificaciones aparecen en el ícono de campana del header. Incluyen confirmaciones de partido, menciones en chat y updates del equipo.',
    tags: ['notificación', 'campana', 'aviso', 'alerta'],
    source: 'app/home#notifications',
  },
  {
    id: 'kb-achievements',
    topic: 'Logros',
    text: 'Los logros se desbloquean automáticamente al cumplir hitos: primer gol, hat-trick, 10 partidos, MVP, racha de victorias, predicción perfecta, etc.',
    tags: ['logros', 'achievements', 'badges', 'medallas', 'trofeos'],
    source: 'app/profile#achievements',
  },

  // ── Football knowledge (para preguntas genéricas) ────────────────
  {
    id: 'kb-fb-offside',
    topic: 'Regla del fuera de juego',
    text: 'El fuera de juego ocurre cuando un jugador está más cerca de la línea de gol que el balón y el penúltimo defensor en el momento del pase. No se sanciona en saques de banda, córners o saques de meta.',
    tags: ['fuera de juego', 'offside', 'regla', 'fútbol'],
  },
  {
    id: 'kb-fb-433',
    topic: 'Formación 4-3-3',
    text: '4-3-3 es una formación ofensiva con 4 defensores, 3 mediocampistas y 3 delanteros. Favorece la posesión y el juego por bandas con extremos abiertos.',
    tags: ['formación', '4-3-3', 'táctica', 'ofensivo'],
  },
  {
    id: 'kb-fb-433-2',
    topic: 'Formación 4-2-3-1',
    text: '4-2-3-1 usa doble pivote defensivo (DM), tres enganches (AM/LW/RW) y un 9 solo. Balancea defensa y ataque — ideal contra equipos ofensivos.',
    tags: ['formación', '4-2-3-1', 'táctica', 'equilibrado'],
  },
  {
    id: 'kb-fb-hattrick',
    topic: 'Hat-trick',
    text: 'Un hat-trick son 3 goles del mismo jugador en un partido. Tradicionalmente si los 3 son consecutivos y sin que otro marque en medio se llama "hat-trick perfecto".',
    tags: ['gol', 'hat-trick', 'delantero', 'definición'],
  },
  {
    id: 'kb-fb-pressing',
    topic: 'Presión alta (gegenpressing)',
    text: 'El pressing alto es recuperar el balón rápidamente en campo rival tras perderlo. Requiere compactación del equipo y condición física. Riesgo: espacios a la espalda.',
    tags: ['presión', 'pressing', 'gegenpressing', 'táctica'],
  },
]

/** Indexado por topic para acceso directo. */
export const KB_BY_TOPIC: Record<string, KbDoc> = Object.fromEntries(
  KNOWLEDGE_BASE.map(d => [d.topic, d]),
)
