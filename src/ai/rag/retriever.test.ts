import { describe, it, expect } from 'vitest'
import { retrieve } from './retriever'

describe('retrieve (RAG BM25-lite)', () => {
  it('devuelve resultados ordenados por score', () => {
    const r = retrieve('táctica formación', 3)
    expect(r.length).toBeGreaterThan(0)
    const scores = r.map(h => h.score)
    expect(scores).toEqual([...scores].sort((a, b) => b - a))
  })

  it('es determinístico', () => {
    const a = retrieve('predicción partido', 3)
    const b = retrieve('predicción partido', 3)
    expect(a.map(x => x.doc.topic)).toEqual(b.map(x => x.doc.topic))
  })

  it('query vacía devuelve array vacío', () => {
    expect(retrieve('', 3)).toEqual([])
  })

  it('ignora acentos y mayúsculas', () => {
    const a = retrieve('TÁCTICA')
    const b = retrieve('tactica')
    expect(a.length).toBeGreaterThan(0)
    expect(a.map(x => x.doc.topic)).toEqual(b.map(x => x.doc.topic))
  })
})
