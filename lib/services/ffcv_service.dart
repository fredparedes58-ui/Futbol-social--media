import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:html/parser.dart' as html_parser;
import 'package:supabase_flutter/supabase_flutter.dart';

/// URLs base de los resultados de la FFCV (plataforma isquad.es)
class FfcvConfig {
  static const String baseUrl = 'https://resultadosffcv.isquad.es';

  // Parámetros del Grup.-4 Primera FFCV Benjamí 2n. any Valencia (MASCULI F8)
  static const String idTemp = '21';
  static const String idModalidad = '33345';
  static const String idCompeticion = '29509617';
  static const String idTorneo = '904327882';

  static String get standingsUrl =>
      '$baseUrl/clasificacion.php?id_temp=$idTemp&id_modalidad=$idModalidad&id_competicion=$idCompeticion&id_torneo=$idTorneo';

  static String get calendarUrl =>
      '$baseUrl/calendario.php?id_temp=$idTemp&id_modalidad=$idModalidad&id_competicion=$idCompeticion&id_torneo=$idTorneo';
}

/// Modelo de una fila de la Clasificación FFCV
class FfcvStandingEntry {
  final int position;
  final String teamName;
  final String? logoUrl;
  final int gamesPlayed;
  final int wins;
  final int draws;
  final int losses;
  final int goalsFor;
  final int goalsAgainst;
  final int goalDifference;
  final int points;

  const FfcvStandingEntry({
    required this.position,
    required this.teamName,
    this.logoUrl,
    required this.gamesPlayed,
    required this.wins,
    required this.draws,
    required this.losses,
    required this.goalsFor,
    required this.goalsAgainst,
    required this.goalDifference,
    required this.points,
  });
}

/// Modelo de un partido del Calendario FFCV
class FfcvFixture {
  final String idPartido;
  final int jornada;
  final String homeTeam;
  final String awayTeam;
  final String? homeLogo;
  final String? awayLogo;
  final int? homeGoals;
  final int? awayGoals;
  final DateTime? matchDate;
  final String? venueName;
  final String status; // upcoming, finished

  const FfcvFixture({
    required this.idPartido,
    required this.jornada,
    required this.homeTeam,
    required this.awayTeam,
    this.homeLogo,
    this.awayLogo,
    this.homeGoals,
    this.awayGoals,
    this.matchDate,
    this.venueName,
    this.status = 'upcoming',
  });

  bool get isFinished => homeGoals != null && awayGoals != null;
  bool get isOurTeam => homeTeam.contains('VCF') || awayTeam.contains('VCF'); // Ajustar al nombre real
}


class FfcvService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // ===========================================================
  // OBTENER CLASIFICACIÓN (Primero de caché, luego del scraper)
  // ===========================================================
  Future<List<FfcvStandingEntry>> getStandings({bool forceRefresh = false}) async {
    try {
      // 1. Intentar leer desde la caché en Supabase primero
      if (!forceRefresh) {
        final cached = await _supabase
            .from('ffcv_standings')
            .select()
            .eq('id_torneo', FfcvConfig.idTorneo)
            .order('position');

        if (cached.isNotEmpty) {
          return cached.map((row) => FfcvStandingEntry(
            position: row['position'],
            teamName: row['team_name'],
            logoUrl: row['team_logo_url'],
            gamesPlayed: row['games_played'] ?? 0,
            wins: row['wins'] ?? 0,
            draws: row['draws'] ?? 0,
            losses: row['losses'] ?? 0,
            goalsFor: row['goals_for'] ?? 0,
            goalsAgainst: row['goals_against'] ?? 0,
            goalDifference: row['goal_difference'] ?? 0,
            points: row['points'] ?? 0,
          )).toList();
        }
      }

      // 2. Si no hay caché, hacer el scraping en vivo
      return await _scrapeStandings();
    } catch (e) {
      debugPrint('Error en FfcvService.getStandings: $e');
      return [];
    }
  }

  // ===========================================================
  // SCRAPER DE CLASIFICACIÓN (Lee HTML de isquad.es)
  // ===========================================================
  Future<List<FfcvStandingEntry>> _scrapeStandings() async {
    try {
      final response = await http.get(
        Uri.parse(FfcvConfig.standingsUrl),
        headers: {'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'},
      ).timeout(const Duration(seconds: 10));

      if (response.statusCode != 200) {
        throw Exception('Error HTTP ${response.statusCode} al acceder a la FFCV');
      }

      final document = html_parser.parse(response.body);
      final rows = document.querySelectorAll('tr');
      
      List<FfcvStandingEntry> standings = [];
      int position = 0;

      for (final row in rows) {
        final cells = row.querySelectorAll('td');
        if (cells.isEmpty) continue;

        try {
          // Intentar parsear una fila de datos (la FFCV usa tablas HTML clásicas)
          final logoImg = row.querySelector('img');
          final logoUrl = logoImg?.attributes['src'];
          
          // Cada fila tiene: Position, Logo, TeamName, PJ, V, E, D, GF, GC, DG, PTS
          final textCells = cells.map((c) => c.text.trim()).toList();
          
          if (textCells.length >= 8) {
            position++;
            
            // Intentar parsear inteligentemente
            final gp = int.tryParse(textCells.length > 2 ? textCells[2] : '0') ?? 0;
            final wins = int.tryParse(textCells.length > 3 ? textCells[3] : '0') ?? 0;
            final draws = int.tryParse(textCells.length > 4 ? textCells[4] : '0') ?? 0;
            final losses = int.tryParse(textCells.length > 5 ? textCells[5] : '0') ?? 0;
            final gf = int.tryParse(textCells.length > 6 ? textCells[6].split('\n').first : '0') ?? 0;
            final gc = int.tryParse(textCells.length > 7 ? textCells[7].split('\n').first : '0') ?? 0;
            final dg = int.tryParse(textCells.length > 8 ? textCells[8] : '0') ?? 0;
            final pts = int.tryParse(textCells.last) ?? 0;
            
            final teamName = cells.length > 1 
              ? (cells[1].querySelector('span')?.text.trim() ?? cells[1].text.trim())
              : 'Equipo $position';

            if (pts > 0 || gp > 0) {
              final entry = FfcvStandingEntry(
                position: position,
                teamName: teamName,
                logoUrl: logoUrl != null && logoUrl.startsWith('http') 
                    ? logoUrl 
                    : '${FfcvConfig.baseUrl}/$logoUrl',
                gamesPlayed: gp,
                wins: wins,
                draws: draws,
                losses: losses,
                goalsFor: gf,
                goalsAgainst: gc,
                goalDifference: dg,
                points: pts,
              );
              standings.add(entry);

              // Guardar en caché en Supabase
              await _cacheStandingEntry(entry);
            }
          }
        } catch (e) {
          debugPrint('Error parseando fila: $e');
          continue;
        }
      }

      return standings;
    } catch (e) {
      debugPrint('Error en _scrapeStandings: $e');
      return [];
    }
  }

  // Guardar en caché de Supabase
  Future<void> _cacheStandingEntry(FfcvStandingEntry entry) async {
    try {
      await _supabase.from('ffcv_standings').upsert({
        'team_id_ffcv': entry.teamName.replaceAll(' ', '_').toLowerCase(),
        'team_name': entry.teamName,
        'team_logo_url': entry.logoUrl,
        'position': entry.position,
        'games_played': entry.gamesPlayed,
        'wins': entry.wins,
        'draws': entry.draws,
        'losses': entry.losses,
        'goals_for': entry.goalsFor,
        'goals_against': entry.goalsAgainst,
        'goal_difference': entry.goalDifference,
        'points': entry.points,
        'id_torneo': FfcvConfig.idTorneo,
        'id_competicion': FfcvConfig.idCompeticion,
        'updated_at': DateTime.now().toIso8601String(),
      }, onConflict: 'id_torneo, team_id_ffcv');
    } catch (e) {
      debugPrint('Error cacheando clasificación: $e');
    }
  }

  // ===========================================================
  // OBTENER CALENDARIO / PRÓXIMOS PARTIDOS
  // ===========================================================
  Future<List<FfcvFixture>> getCalendar() async {
    try {
      // Leer caché de Supabase
      final cached = await _supabase
          .from('ffcv_fixtures')
          .select()
          .eq('id_torneo', FfcvConfig.idTorneo)
          .order('match_date');

      if (cached.isNotEmpty) {
        return cached.map((row) => FfcvFixture(
          idPartido: row['id_partido'],
          jornada: row['jornada'] ?? 0,
          homeTeam: row['home_team_name'],
          awayTeam: row['away_team_name'],
          homeLogo: row['home_team_logo_url'],
          awayLogo: row['away_team_logo_url'],
          homeGoals: row['home_goals'],
          awayGoals: row['away_goals'],
          matchDate: row['match_date'] != null ? DateTime.parse(row['match_date']) : null,
          venueName: row['venue_name'],
          status: row['status'] ?? 'upcoming',
        )).toList();
      }

      return [];
    } catch (e) {
      debugPrint('Error en FfcvService.getCalendar: $e');
      return [];
    }
  }
}
