/**
 * AssistantAgent — responde preguntas sobre la app y fútbol base usando RAG.
 * Reemplaza `answerAppQuestion` con una arquitectura real de agente:
 *   input → retriever → compose → output con citas.
 */

import { defineAgent } from './types'
import { ragAnswer, retrieve } from '../rag/retriever'

export interface AssistantInput {
  query: string
}

export interface AssistantOutput {
  reply: string
  suggestions: string[]
  citations: { topic: string; source?: string }[]
  confidence: number
}

const FOLLOWUPS_BY_TOPIC: Record<string, string[]> = {
  'Quiniela Copilot':   ['¿Qué es el Match Preview?', '¿Puedo cambiar mi predicción?'],
  'Team Matcher':       ['¿Puedo crear un equipo?', '¿Qué es el Coach AI?'],
  'Coach AI':           ['¿Qué es el Weekly Digest?', '¿Cómo mejoro mi nota?'],
  'Weekly Digest':      ['¿Cómo hago una predicción?', '¿Qué es el Coach AI?'],
  'Match Recap':        ['¿Cómo genero clips?', '¿Qué es el Weekly Digest?'],
  'Chat & Tonos':       ['¿Cómo cambio el tono?', '¿Qué es el asistente global?'],
  'Rival Scouting':     ['¿Cómo genero una alineación?', '¿Qué es Coach AI?'],
  'Auto-alineación':    ['¿Qué es el scouting?', '¿Cambiar formación?'],
  'Logros':             ['¿Cómo desbloqueo logros?', '¿Cuántos logros hay?'],
}

const GREETINGS = /(hola|buenas|hey|holi|saludos|qué tal|que tal)/i
const THANKS    = /(gracias|genial|perfecto|ok|dale|barbaro|buenisimo)/i
const HELP_ME   = /(ayuda|help|qu[eé] pod[eé]s|qu[eé] haces|capacidades|funcion)/i

export const assistantAgent = defineAgent<AssistantInput, AssistantOutput>(
  'assistant-rag',
  'Responde preguntas sobre FútbolBase y fútbol base usando RAG con citas.',
  (input, _ctx, trace) => {
    const q = (input.query ?? '').trim()
    trace.push(`query: "${q}"`)

    if (!q) {
      return {
        reply: 'Contame qué querés saber de FútbolBase 👇',
        suggestions: ['¿Cómo hago una predicción?', '¿Qué es el Coach AI?', '¿Cómo uno un equipo?'],
        citations: [],
        confidence: 0,
      }
    }

    // Quick-intents que no necesitan RAG
    if (GREETINGS.test(q)) {
      trace.push('intent: greeting')
      return {
        reply: '¡Hola! 👋 Soy el asistente de FútbolBase con RAG. Puedo consultar mi base de conocimiento sobre la app, tácticas, reglas y más. Preguntame lo que quieras.',
        suggestions: ['¿Cómo hago una predicción?', '¿Qué es el Team Matcher?', '¿Cómo funciona el scouting?'],
        citations: [],
        confidence: 1,
      }
    }
    if (THANKS.test(q) && q.length < 25) {
      trace.push('intent: thanks')
      return {
        reply: '¡De nada! 🙌 Estoy acá si necesitás más.',
        suggestions: ['¿Qué más podés hacer?'],
        citations: [],
        confidence: 1,
      }
    }
    if (HELP_ME.test(q)) {
      trace.push('intent: help')
      return {
        reply: 'Puedo responder con base de conocimiento (RAG) sobre: predicciones, Team Matcher, Coach AI, Weekly Digest, Recap, chats, scouting, alineaciones, logros, y reglas/tácticas de fútbol.',
        suggestions: ['¿Cómo hago una predicción?', '¿Qué es 4-3-3?', '¿Cómo uno a un equipo?'],
        citations: [],
        confidence: 1,
      }
    }

    // RAG path
    const hits = retrieve(q, 3)
    trace.push(`rag-hits: ${hits.map(h => `${h.doc.topic}(${h.score.toFixed(2)})`).join(', ') || 'none'}`)
    const { reply, citations, confidence } = ragAnswer(q, 2)

    const topTopic = hits[0]?.doc.topic
    const suggestions: string[] = (topTopic ? FOLLOWUPS_BY_TOPIC[topTopic] : undefined)
      ?? ['¿Cómo hago una predicción?', '¿Qué es el Coach AI?', '¿Cómo uno a un equipo?']

    return { reply, suggestions, citations, confidence }
  },
)
