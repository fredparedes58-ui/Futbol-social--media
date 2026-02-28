// ============================================================
// Supabase Edge Function: ffcv-sync
// ============================================================
// 100% Supabase - Sin Firebase.
// Usa Supabase Realtime como canal principal de notificaciones.
// Cuando actualiza un resultado en ffcv_fixtures, Supabase
// Realtime lo propaga instanteáneamente a todos los clientes.
// Para apps cerradas: guarda una notificación pendiente en
// la tabla `pending_notifications` que la app lee al abrirse.
// ============================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── Constantes de la FFCV Grup.-4 ─────────────────────────────
const FFCV_BASE = "https://resultadosffcv.isquad.es";
const ID_TORNEO = "904327882";
const ID_COMPETICION = "29509617";
const ID_MODALIDAD = "33345";
const ID_TEMP = "21";
const SAN_MARCELINO_NAME = "San Marcelino";

// URL del calendario oficial
const CALENDAR_URL = `${FFCV_BASE}/calendario.php?id_temp=${ID_TEMP}&id_modalidad=${ID_MODALIDAD}&id_competicion=${ID_COMPETICION}&id_torneo=${ID_TORNEO}`;

// ── Inicializar Supabase Admin Client ─────────────────────────
const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
);

// ── FCM (Firebase Cloud Messaging) ───────────────────────────
const FCM_KEY = Deno.env.get("FCM_SERVER_KEY")!;

// ────────────────────────────────────────────────────────────────
// MAIN: Entry Point de la Edge Function
// ────────────────────────────────────────────────────────────────
serve(async (req: Request) => {
  // Permitir invocación manual (desde Supabase Dashboard) o por cron
  const { manual } = await req.json().catch(() => ({ manual: false }));

  console.log(`[ffcv-sync] Iniciando sync FFCV... (manual: ${manual})`);

  try {
    const changes = await syncCalendar();

    console.log(`[ffcv-sync] Cambios detectados: ${changes.length}`);

    // Si hay cambios, enviar notificaciones
    for (const change of changes) {
      await sendPushNotification(change);
    }

    return new Response(
      JSON.stringify({
        ok: true,
        changes_detected: changes.length,
        changes,
        timestamp: new Date().toISOString(),
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("[ffcv-sync] Error:", error);
    return new Response(
      JSON.stringify({ ok: false, error: String(error) }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});

// ────────────────────────────────────────────────────────────────
// SYNC: Scrapea el calendario y detecta cambios
// ────────────────────────────────────────────────────────────────
async function syncCalendar(): Promise<ChangeEvent[]> {
  const changes: ChangeEvent[] = [];

  // 1. Obtener el HTML del calendario de la FFCV
  const response = await fetch(CALENDAR_URL, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; FutbolSocialApp/1.0)" },
  });

  if (!response.ok) {
    throw new Error(`FFCV responded with ${response.status}`);
  }

  const html = await response.text();

  // 2. Extraer todos los partidos del HTML
  const scrapedMatches = parseCalendarHtml(html);
  console.log(`[ffcv-sync] Partidos scrapeados: ${scrapedMatches.length}`);

  // 3. Obtener partidos actuales de Supabase para comparar
  const { data: storedMatches } = await supabase
    .from("ffcv_fixtures")
    .select("id_partido, home_goals, away_goals, match_date, status")
    .eq("id_torneo", ID_TORNEO);

  const storedMap = new Map(
    (storedMatches ?? []).map((m: any) => [m.id_partido, m])
  );

  // 4. Comparar y detectar cambios
  for (const scraped of scrapedMatches) {
    const stored = storedMap.get(scraped.id_partido);

    if (!stored) {
      // Partido nuevo (nueva jornada añadida)
      await upsertFixture(scraped);
      changes.push({
        type: "nuevo_partido",
        idPartido: scraped.id_partido,
        homeTeam: scraped.homeTeam,
        awayTeam: scraped.awayTeam,
        homeGoals: scraped.homeGoals,
        awayGoals: scraped.awayGoals,
        matchDate: scraped.matchDate,
      });
      continue;
    }

    // ¿Cambió el resultado?
    const resultChanged =
      scraped.homeGoals !== null &&
      scraped.awayGoals !== null &&
      (stored.home_goals !== scraped.homeGoals ||
        stored.away_goals !== scraped.awayGoals);

    // ¿Cambió el horario?
    const dateChanged =
      scraped.matchDate &&
      stored.match_date !== scraped.matchDate;

    if (resultChanged) {
      await upsertFixture(scraped);
      changes.push({
        type: "resultado",
        idPartido: scraped.id_partido,
        homeTeam: scraped.homeTeam,
        awayTeam: scraped.awayTeam,
        homeGoals: scraped.homeGoals,
        awayGoals: scraped.awayGoals,
        matchDate: scraped.matchDate,
        previousHomeGoals: stored.home_goals,
        previousAwayGoals: stored.away_goals,
      });
    } else if (dateChanged) {
      await upsertFixture(scraped);
      changes.push({
        type: "horario",
        idPartido: scraped.id_partido,
        homeTeam: scraped.homeTeam,
        awayTeam: scraped.awayTeam,
        homeGoals: scraped.homeGoals,
        awayGoals: scraped.awayGoals,
        matchDate: scraped.matchDate,
        previousDate: stored.match_date,
      });
    }
  }

  return changes;
}

// ────────────────────────────────────────────────────────────────
// HTML PARSER: Extrae partidos del calendario FFCV
// ────────────────────────────────────────────────────────────────
interface ScrapedMatch {
  id_partido: string;
  jornada: number;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  matchDate: string | null;
}

function parseCalendarHtml(html: string): ScrapedMatch[] {
  const matches: ScrapedMatch[] = [];

  // Buscar todos los partidos como links a partido.php
  const partidoRegex =
    /partido\.php\?id_partido=(\d+)[^"]*"[^>]*>([\s\S]*?)<\/a>/gi;
  const scoreRegex = /(\d+)\s*-\s*(\d+)/;
  const dateRegex = /(\d{2}-\d{2}-\d{4})\s+(\d{2}:\d{2})/;

  // Buscar también en los atributos href directos
  const hrefRegex = /href="[^"]*partido\.php\?id_partido=(\d+)/gi;

  // Extraer IDs únicos de partidos del HTML completo
  const idSet = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = hrefRegex.exec(html)) !== null) {
    idSet.add(match[1]);
  }

  // Por cada ID encontrado, buscar el contexto HTML cercano
  let jornada = 0;
  const lines = html.split("\n");

  for (const line of lines) {
    // Detectar cabecera de jornada
    if (line.includes("JORNADA") || line.includes("Jornada")) {
      const jMatch = line.match(/(\d+)/);
      if (jMatch) jornada = parseInt(jMatch[1]);
    }

    // Detectar partido
    if (line.includes("partido.php")) {
      const idMatch = line.match(/id_partido=(\d+)/);
      if (!idMatch) continue;

      const idPartido = idMatch[1];

      // Buscar nombre de equipos en líneas cercanas (contexto del HTML)
      const contextStart = Math.max(0, html.indexOf(idPartido) - 500);
      const contextEnd = Math.min(html.length, html.indexOf(idPartido) + 500);
      const context = html.substring(contextStart, contextEnd);

      // Extraer equipos (texto en spans o h tags cerca del link)
      const teamMatches = context.match(/class="[^"]*equipo[^"]*"[^>]*>([^<]+)</gi);
      let homeTeam = "Equipo Local";
      let awayTeam = "Equipo Visitante";

      if (teamMatches && teamMatches.length >= 2) {
        homeTeam = teamMatches[0].replace(/<[^>]+>/g, "").trim();
        awayTeam = teamMatches[1].replace(/<[^>]+>/g, "").trim();
      }

      // Extraer resultado si existe
      const scoreMatch = context.match(scoreRegex);
      let homeGoals: number | null = null;
      let awayGoals: number | null = null;
      if (scoreMatch) {
        homeGoals = parseInt(scoreMatch[1]);
        awayGoals = parseInt(scoreMatch[2]);
      }

      // Extraer fecha
      const dateMatch = context.match(dateRegex);
      let matchDate: string | null = null;
      if (dateMatch) {
        const [, date, time] = dateMatch;
        const [day, month, year] = date.split("-");
        matchDate = `${year}-${month}-${day}T${time}:00+00:00`;
      }

      matches.push({
        id_partido: idPartido,
        jornada,
        homeTeam,
        awayTeam,
        homeGoals,
        awayGoals,
        matchDate,
      });
    }
  }

  return matches;
}

// ────────────────────────────────────────────────────────────────
// UPSERT: Guarda/actualiza el partido en Supabase
// ────────────────────────────────────────────────────────────────
async function upsertFixture(match: ScrapedMatch): Promise<void> {
  await supabase.from("ffcv_fixtures").upsert(
    {
      id_partido: match.id_partido,
      id_torneo: ID_TORNEO,
      jornada: match.jornada,
      home_team_name: match.homeTeam,
      away_team_name: match.awayTeam,
      home_goals: match.homeGoals,
      away_goals: match.awayGoals,
      match_date: match.matchDate,
      status: match.homeGoals !== null ? "finished" : "upcoming",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id_partido" }
  );
}

// ────────────────────────────────────────────────────────────────
// PUSH NOTIFICATION: Envía a todos los padres del equipo
// ────────────────────────────────────────────────────────────────
interface ChangeEvent {
  type: "resultado" | "horario" | "nuevo_partido";
  idPartido: string;
  homeTeam: string;
  awayTeam: string;
  homeGoals: number | null;
  awayGoals: number | null;
  matchDate: string | null;
  previousHomeGoals?: number;
  previousAwayGoals?: number;
  previousDate?: string;
}

async function sendPushNotification(change: ChangeEvent): Promise<void> {
  // Solo notificar si el partido involucra al San Marcelino
  const isSanMarcMatch =
    change.homeTeam.includes(SAN_MARCELINO_NAME) ||
    change.awayTeam.includes(SAN_MARCELINO_NAME);

  // Obtener todos los FCM tokens de usuarios activos
  const { data: tokens } = await supabase
    .from("device_tokens")
    .select("token")
    .eq("active", true);

  if (!tokens || tokens.length === 0) {
    console.log("[ffcv-sync] No hay tokens de dispositivo registrados");
    return;
  }

  // Construir el mensaje
  const { title, body } = buildNotificationMessage(change, isSanMarcMatch);

  console.log(`[ffcv-sync] Enviando push a ${tokens.length} dispositivos: "${title}"`);

  // Enviar via FCM (Firebase Cloud Messaging)
  const fcmPayload = {
    registration_ids: tokens.map((t: any) => t.token),
    notification: {
      title,
      body,
      sound: "default",
      badge: "1",
    },
    data: {
      type: change.type,
      id_partido: change.idPartido,
      navigate_to: "liga_hub",
    },
    priority: "high",
    content_available: true,
  };

  const fcmResponse = await fetch("https://fcm.googleapis.com/fcm/send", {
    method: "POST",
    headers: {
      Authorization: `key=${FCM_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(fcmPayload),
  });

  const fcmResult = await fcmResponse.json();
  console.log(`[ffcv-sync] FCM response:`, JSON.stringify(fcmResult));

  // Guardar registro en la BD  
  await supabase.from("notification_log").insert({
    type: change.type,
    title,
    body,
    id_partido: change.idPartido,
    tokens_sent: tokens.length,
    fcm_success: fcmResult.success ?? 0,
    fcm_failure: fcmResult.failure ?? 0,
    created_at: new Date().toISOString(),
  });
}

function buildNotificationMessage(
  change: ChangeEvent,
  isSanMarcMatch: boolean
): { title: string; body: string } {
  const home = simplifyTeamName(change.homeTeam);
  const away = simplifyTeamName(change.awayTeam);

  if (change.type === "resultado" && change.homeGoals !== null) {
    const score = `${change.homeGoals} - ${change.awayGoals}`;

    if (isSanMarcMatch) {
      const smIsHome = change.homeTeam.includes(SAN_MARCELINO_NAME);
      const smGoals = smIsHome ? change.homeGoals! : change.awayGoals!;
      const rivalGoals = smIsHome ? change.awayGoals! : change.homeGoals!;
      const rival = smIsHome ? away : home;

      if (smGoals > rivalGoals) {
        return {
          title: `🏆 ¡VICTORIA! San Marcelino ${smGoals}-${rivalGoals} ${rival}`,
          body: "¡Abre la app para ver el resultado completo y los goleadores! ⚽",
        };
      } else if (smGoals === rivalGoals) {
        return {
          title: `🤝 Empate: San Marcelino ${smGoals}-${rivalGoals} ${rival}`,
          body: "Resultado final actulizado. ¡Ábrela app para ver los detalles!",
        };
      } else {
        return {
          title: `❌ San Marcelino ${smGoals}-${rivalGoals} ${rival}`,
          body: "Resultado actualizado desde la FFCV. ¡Pulsa para ver el partido!",
        };
      }
    } else {
      return {
        title: `⚽ Resultado: ${home} ${score} ${away}`,
        body: "Resultado actualizado en la clasificación del Grup.-4",
      };
    }
  }

  if (change.type === "horario") {
    if (isSanMarcMatch) {
      return {
        title: `📅 Cambio de horario: ${home} vs ${away}`,
        body: `El partido se ha reprogramado. Consulta el calendario actualizado.`,
      };
    } else {
      return {
        title: `📅 Horario actualizado: ${home} vs ${away}`,
        body: "Cambio de horario en el Grup.-4 de la FFCV",
      };
    }
  }

  return {
    title: `⚽ Nuevo partido: ${home} vs ${away}`,
    body: "Se ha añadido un nuevo partido al calendario del Grup.-4",
  };
}

function simplifyTeamName(name: string): string {
  return name
    .replace(/'[ABC]'/g, "")
    .replace(/C\.D\.|C\.F\.|U\.D\.|F\.B\.[A-Z]+\./g, "")
    .replace(/Fundació VCF/, "VCF")
    .trim()
    .split(" ")
    .slice(0, 2)
    .join(" ");
}
