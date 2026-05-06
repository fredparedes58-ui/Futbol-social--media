/**
 * Contratos de agentes.
 * Cada agente tiene un nombre, un schema de input y una función `run`.
 * El orchestrator puede correrlos en serie, paralelo o pipelines.
 */

export interface AgentContext {
  userId?: string
  lang?: 'es' | 'en'
  /** cache por key para reusar resultados en una misma sesión */
  cache?: Map<string, unknown>
}

export interface AgentResult<T = unknown> {
  agent: string
  ok: boolean
  data: T
  ms: number
  /** trazas opcionales de subpasos (RAG hits, decisiones, fallbacks) */
  trace?: string[]
}

export interface Agent<I = unknown, O = unknown> {
  name: string
  description: string
  run(input: I, ctx?: AgentContext): Promise<AgentResult<O>>
}

/** Helper tipado para crear agentes con timing y trace automáticos. */
export function defineAgent<I, O>(
  name: string,
  description: string,
  fn: (input: I, ctx: AgentContext, trace: string[]) => Promise<O> | O,
): Agent<I, O> {
  return {
    name,
    description,
    async run(input, ctx = {}) {
      const t0 = performance.now()
      const trace: string[] = []
      try {
        const data = await fn(input, ctx, trace)
        return { agent: name, ok: true, data, ms: performance.now() - t0, trace }
      } catch (err) {
        trace.push(`error: ${(err as Error).message}`)
        return {
          agent: name, ok: false,
          data: undefined as unknown as O,
          ms: performance.now() - t0,
          trace,
        }
      }
    },
  }
}
