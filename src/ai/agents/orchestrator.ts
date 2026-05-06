/**
 * Orchestrator de agentes — soporta ejecución secuencial, paralela
 * y pipelines con salida de uno alimentando al siguiente.
 */

import type { Agent, AgentContext, AgentResult } from './types'

export async function runParallel<T extends readonly Agent<unknown, unknown>[]>(
  agents: T,
  inputs: unknown[],
  ctx?: AgentContext,
): Promise<AgentResult<unknown>[]> {
  return Promise.all(agents.map((a, i) => a.run(inputs[i], ctx)))
}

export async function runSequential(
  agents: Agent<unknown, unknown>[],
  inputs: unknown[],
  ctx?: AgentContext,
): Promise<AgentResult<unknown>[]> {
  const out: AgentResult<unknown>[] = []
  for (let i = 0; i < agents.length; i++) {
    const r = await agents[i].run(inputs[i], ctx)
    out.push(r)
    if (!r.ok) break
  }
  return out
}

/**
 * Pipeline: la salida de un agente se pasa como input del siguiente.
 * Si uno falla, el pipeline se detiene y el último resultado indica el fallo.
 */
export async function runPipeline(
  agents: Agent<unknown, unknown>[],
  initialInput: unknown,
  ctx?: AgentContext,
): Promise<AgentResult<unknown>[]> {
  const out: AgentResult<unknown>[] = []
  let current = initialInput
  for (const a of agents) {
    const r = await a.run(current, ctx)
    out.push(r)
    if (!r.ok) break
    current = r.data
  }
  return out
}
