/**
 * /api/coach — Edge Function que proxea al Coach AI de Claude.
 * La API key vive en servidor; el cliente nunca la ve.
 */

export const config = { runtime: 'edge' }

interface CoachRequest {
  name: string
  position: string
  query?: string
  grade: string
  strengths: string[]
  weaknesses: string[]
  stats: { matches: number; goals: number; assists: number; mvps: number }
}

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return new Response(JSON.stringify({ error: 'Coach AI no configurado' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }

  let body: CoachRequest
  try {
    body = await req.json()
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400 })
  }

  const { name, position, query, grade, strengths, weaknesses, stats } = body

  const system = `Eres el Coach AI de GRADA, una app de fútbol amateur. Das feedback personalizado, motivador y técnico a jugadores de ligas locales.

Jugador: ${name}
Posición: ${position}
Nivel actual: ${grade}
Fortalezas: ${strengths.join(', ')}
Áreas de mejora: ${weaknesses.join(', ')}
Stats temporada: ${stats.matches} partidos · ${stats.goals} goles · ${stats.assists} asistencias · ${stats.mvps} MVPs

Reglas:
- Máximo 3 frases concisas. Directo al punto.
- Tono: entrenador profesional cercano, motivador sin ser genérico.
- En español. Sin emojis. Sin asteriscos ni markdown.
- Referencia los datos específicos del jugador, no des consejos genéricos.`

  const userMsg = query?.trim() || `Dame un análisis rápido de mi temporada y el área que más debo trabajar.`

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system,
        messages: [{ role: 'user', content: userMsg }],
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      console.error('Anthropic error:', err)
      return new Response(JSON.stringify({ error: 'Error del Coach AI' }), {
        status: 502, headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await res.json() as { content: { text: string }[] }
    const reply = data.content?.[0]?.text?.trim() ?? 'Sin respuesta del Coach.'

    return new Response(JSON.stringify({ reply }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    console.error('Coach API fetch error:', err)
    return new Response(JSON.stringify({ error: 'Error de conexión con Coach AI' }), {
      status: 500, headers: { 'Content-Type': 'application/json' },
    })
  }
}
