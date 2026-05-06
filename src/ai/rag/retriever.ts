/**
 * Mini RAG retriever determinístico.
 *
 * Scoring híbrido:
 *   - BM25-lite sobre el texto tokenizado
 *   - boost por match exacto de tag
 *   - stemming light en español (quita plurales, acentos)
 *
 * No es un LLM — es puro TypeScript puro y reproducible.
 */

import { KNOWLEDGE_BASE, type KbDoc } from './knowledgeBase'

export interface Retrieved {
  doc: KbDoc
  score: number
  matchedTokens: string[]
}

// ── tokenización ───────────────────────────────────────────────────
const STOPWORDS = new Set([
  'de', 'la', 'el', 'en', 'y', 'a', 'los', 'del', 'se', 'las', 'por',
  'un', 'para', 'con', 'una', 'su', 'o', 'lo', 'como', 'mi', 'que',
  'qué', 'cómo', 'cuál', 'dónde', 'cuándo', 'por qué', 'the', 'a', 'of',
  'is', 'to', 'and', 'in', 'for', 'on', 'hay', 'tengo', 'tiene',
])

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // quita acentos
    .replace(/[^\w\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function stem(tok: string): string {
  // stemming básico español: quita plurales y sufijos comunes
  return tok
    .replace(/(es|s)$/, '')
    .replace(/(ndo|ada|ado|aba)$/, '')
}

function tokenize(s: string): string[] {
  return normalize(s).split(' ')
    .filter(t => t.length > 1 && !STOPWORDS.has(t))
    .map(stem)
}

// ── índice (calculado una vez) ─────────────────────────────────────
interface IndexedDoc {
  doc: KbDoc
  tokens: string[]
  tagTokens: Set<string>
  tf: Map<string, number>  // term frequency
}

let indexed: IndexedDoc[] | null = null
let idf: Map<string, number> | null = null

function buildIndex(): { docs: IndexedDoc[]; idf: Map<string, number> } {
  const docs = KNOWLEDGE_BASE.map(doc => {
    const tokens = tokenize(`${doc.topic} ${doc.text}`)
    const tf = new Map<string, number>()
    tokens.forEach(t => tf.set(t, (tf.get(t) ?? 0) + 1))
    return {
      doc,
      tokens,
      tagTokens: new Set(doc.tags.flatMap(tg => tokenize(tg))),
      tf,
    }
  })

  const N = docs.length
  const df = new Map<string, number>()
  docs.forEach(d => {
    new Set(d.tokens).forEach(t => df.set(t, (df.get(t) ?? 0) + 1))
  })
  const idfMap = new Map<string, number>()
  df.forEach((freq, term) => {
    idfMap.set(term, Math.log(1 + (N - freq + 0.5) / (freq + 0.5)))
  })

  return { docs, idf: idfMap }
}

function ensureIndex() {
  if (!indexed) {
    const { docs, idf: idfMap } = buildIndex()
    indexed = docs
    idf = idfMap
  }
  return { docs: indexed!, idf: idf! }
}

// ── retrieval ──────────────────────────────────────────────────────
export function retrieve(query: string, k = 3): Retrieved[] {
  const { docs, idf } = ensureIndex()
  const qTokens = tokenize(query)
  if (qTokens.length === 0) return []

  const avgdl = docs.reduce((a, d) => a + d.tokens.length, 0) / docs.length
  const k1 = 1.4
  const b = 0.75

  const scored = docs.map(d => {
    let score = 0
    const matched: string[] = []

    qTokens.forEach(qt => {
      const tf = d.tf.get(qt) ?? 0
      const tagBoost = d.tagTokens.has(qt) ? 2.5 : 0
      if (tf > 0) matched.push(qt)

      // BM25
      const idfVal = idf.get(qt) ?? 0
      const dl = d.tokens.length
      const numer = tf * (k1 + 1)
      const denom = tf + k1 * (1 - b + b * (dl / avgdl))
      score += idfVal * (denom === 0 ? 0 : numer / denom)
      score += tagBoost
    })

    return { doc: d.doc, score, matchedTokens: matched }
  })

  return scored
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
}

export interface RagAnswer {
  reply: string
  citations: { topic: string; source?: string }[]
  confidence: number  // 0..1
  matched: string[]
}

/**
 * Respuesta con citas. Si no encuentra nada, devuelve fallback educado.
 */
export function ragAnswer(query: string, k = 2): RagAnswer {
  const hits = retrieve(query, k)
  if (hits.length === 0) {
    return {
      reply: 'No encontré info específica en mi base. Preguntame sobre predicciones, equipos, chats, highlights, Coach AI, scouting o alineaciones.',
      citations: [],
      confidence: 0,
      matched: [],
    }
  }

  const top = hits[0]
  // Construir respuesta combinando el top-1 con posible complemento del top-2
  let reply = top.doc.text
  if (hits[1] && hits[1].score > top.score * 0.55) {
    reply += ` ${hits[1].doc.text}`
  }

  const maxScore = Math.max(...hits.map(h => h.score))
  const confidence = Math.min(0.95, 0.35 + maxScore / 15)

  return {
    reply,
    citations: hits.map(h => ({ topic: h.doc.topic, source: h.doc.source })),
    confidence,
    matched: top.matchedTokens,
  }
}
