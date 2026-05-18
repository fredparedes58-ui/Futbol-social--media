/**
 * Webhook Edge Function — recibe actualizaciones del scraper humanscraper-toolkit
 * para la integración FFCV.
 *
 * En producción:
 *  - Verifica firma HMAC X-Scraper-Signature (shared secret env var)
 *  - Escribe en Supabase con service_role key (server-side, nunca cliente)
 *  - Detecta cambios y encola notificaciones push + Telegram por team_subscriptions
 *
 * Ahora mismo: mock que valida la firma y devuelve 200 con el payload recibido.
 *
 * BLOQUEANTE: no escribe en players / coaches / team_rosters — datos de plantilla
 * son consent-only (RGPD menores, precedentes AEPD PS-00104-2021).
 */
export const config = { runtime: 'edge' }

// Types (sin importar de lib para no mezclar server/client)
type WebhookPayloadType =
  | 'match_update'
  | 'classification_update'
  | 'team_update'
  | 'competition_update'

interface WebhookBody {
  type: WebhookPayloadType
  data: Record<string, unknown>
  timestamp: string
}

export default async function handler(req: Request): Promise<Response> {
  // Solo POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'method_not_allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // Leer body como texto para verificar la firma sobre el raw payload
  const rawBody = await req.text()

  // ─── Verificación HMAC ────────────────────────────────────────────────────
  const signature = req.headers.get('X-Scraper-Signature')
  const secret = process.env.SCRAPER_WEBHOOK_SECRET

  if (!secret) {
    // En desarrollo sin secret configurado: log y continuar (útil para pruebas)
    console.warn('[humanscraper webhook] SCRAPER_WEBHOOK_SECRET no configurado — omitiendo verificación')
  } else {
    if (!signature) {
      return new Response(JSON.stringify({ error: 'missing_signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const valid = await verifyHmac(rawBody, secret, signature)
    if (!valid) {
      return new Response(JSON.stringify({ error: 'invalid_signature' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }
  }

  // ─── Parse ────────────────────────────────────────────────────────────────
  let body: WebhookBody
  try {
    body = JSON.parse(rawBody)
  } catch {
    return new Response(JSON.stringify({ error: 'invalid_json' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  const validTypes: WebhookPayloadType[] = [
    'match_update',
    'classification_update',
    'team_update',
    'competition_update',
  ]
  if (!validTypes.includes(body.type)) {
    return new Response(JSON.stringify({ error: 'unknown_payload_type', got: body.type }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // ─── Proceso por tipo ─────────────────────────────────────────────────────
  // TODO (Phase 1 — Supabase):
  //   - Upsert en matches_external / classifications / teams_external / competitions
  //   - Detectar cambios comparando previous_* con valores actuales
  //   - Encolar en notification_queue para subscribers afectados
  //   - Respetar opt-in granular (notify_schedule_change, notify_live_goals, notify_final_result)
  //
  // 🚨 BLOQUEANTE: NUNCA escribir en players / coaches / team_rosters aquí.
  console.log(`[humanscraper webhook] type=${body.type} ts=${body.timestamp}`)

  return new Response(
    JSON.stringify({
      status: 'ok',
      type: body.type,
      received_at: new Date().toISOString(),
      // En producción no devolvemos el data recibido (info leakage)
    }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-GRADA-Webhook-Version': '1.0',
      },
    }
  )
}

// ─── HMAC-SHA256 helper (Web Crypto API, compatible con Edge Runtime) ─────────

async function verifyHmac(payload: string, secret: string, received: string): Promise<boolean> {
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(payload))
  const expected = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
  return timingSafeEqual(expected, received)
}

/** Comparación en tiempo constante para evitar timing attacks */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return diff === 0
}
