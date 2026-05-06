/**
 * i18n base — diccionarios ES/EN para strings comunes.
 * Uso: `const { t } = useT(); t('home.title')`.
 */

export type Lang = 'es' | 'en'

type Dict = Record<string, string>

export const ES: Dict = {
  'app.name':            'FútbolBase',
  'nav.home':            'Inicio',
  'nav.community':       'Comunidad',
  'nav.league':          'Liga',
  'nav.chat':            'Chat',
  'nav.profile':         'Perfil',
  'home.greeting':       'Hola',
  'home.stats.goals':    'Goles',
  'home.stats.assists':  'Asistencias',
  'home.stats.mvps':     'MVPs',
  'home.cta.lineup':     'Ver formación',
  'home.cta.scout':      'Scouting rival',
  'home.cta.live':       'Partido en vivo',
  'profile.overall':     'Overall',
  'profile.achievements': 'Logros',
  'profile.recent':      'Últimos partidos',
  'profile.edit':        'Editar',
  'profile.save':        'Guardar',
  'profile.logout':      'Cerrar sesión',
  'chat.placeholder':    'Escribe un mensaje...',
  'chat.online':         'En línea',
  'chat.tone':           'Tono',
  'common.cancel':       'Cancelar',
  'common.loading':      'Cargando...',
  'assistant.greeting':  '¡Hola! 👋 Soy el asistente de FútbolBase.',
}

export const EN: Dict = {
  'app.name':            'FútbolBase',
  'nav.home':            'Home',
  'nav.community':       'Community',
  'nav.league':          'League',
  'nav.chat':            'Chat',
  'nav.profile':         'Profile',
  'home.greeting':       'Hello',
  'home.stats.goals':    'Goals',
  'home.stats.assists':  'Assists',
  'home.stats.mvps':     'MVPs',
  'home.cta.lineup':     'View lineup',
  'home.cta.scout':      'Rival scouting',
  'home.cta.live':       'Live match',
  'profile.overall':     'Overall',
  'profile.achievements': 'Achievements',
  'profile.recent':      'Recent matches',
  'profile.edit':        'Edit',
  'profile.save':        'Save',
  'profile.logout':      'Log out',
  'chat.placeholder':    'Type a message...',
  'chat.online':         'Online',
  'chat.tone':           'Tone',
  'common.cancel':       'Cancel',
  'common.loading':      'Loading...',
  'assistant.greeting':  'Hi! 👋 I am the FútbolBase assistant.',
}

export const DICTIONARIES: Record<Lang, Dict> = { es: ES, en: EN }

export function translate(lang: Lang, key: string): string {
  return DICTIONARIES[lang][key] ?? DICTIONARIES.es[key] ?? key
}
