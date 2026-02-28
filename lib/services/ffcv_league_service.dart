import 'package:flutter/foundation.dart';
import 'package:http/http.dart' as http;
import 'package:html/parser.dart' as html_parser;
import 'package:supabase_flutter/supabase_flutter.dart';

/// Servicio que hace scraping masivo de toda la liga del Grup.-4
/// Obtiene plantillas de todos los equipos y calendario completo.
class FfcvLeagueService {
  final _supabase = Supabase.instance.client;

  static const String _idCompeticion = '29509617';
  static const String _idTorneo = '904327882';
  static const String _baseUrl = 'https://resultadosffcv.isquad.es';

  /// IDs de todos los equipos del Grup.-4
  static const Map<String, String> teamIds = {
    '20887':     'C.F. Fundació VCF \'A\'',
    '14995':     'U.D. Alzira \'A\'',
    '15250':     'C.D. Monte-Sión \'A\'',
    '14793':     'F.B.C.D. Catarroja \'B\'',
    '21932':     'C.F. Sporting Xirivella \'C\'',
    '15745':     'Col. Salgui E.D.E. \'A\'',
    '16900':     'C.F.B. Ciutat de València \'A\'',
    '17086':     'F.B.U.E. Atlètic Amistat \'A\'',
    '13674':     'Unió Benetússer-Favara C.F. \'A\'',
    '16372':     'C.D. San Marcelino \'A\'',
    '14632':     'Torrent C.F. \'C\'',
    '22299222':  'Picassent C.F. \'A\'',
    '15795':     'C.D. Don Bosco \'A\'',
  };

  /// Scrapea y guarda la plantilla de TODOS los equipos en Supabase
  Future<Map<String, int>> scrapeAllRosters() async {
    final results = <String, int>{};

    for (final entry in teamIds.entries) {
      try {
        final count = await _scrapeTeamRoster(entry.key, entry.value);
        results[entry.value] = count;
        await Future.delayed(const Duration(milliseconds: 500)); // respetar el servidor
      } catch (e) {
        debugPrint('Error scraping plantilla de ${entry.value}: $e');
        results[entry.value] = -1;
      }
    }

    return results;
  }

  /// Scrapea la plantilla de un equipo específico y la guarda en Supabase
  Future<int> _scrapeTeamRoster(String teamId, String teamName) async {
    final url = '$_baseUrl/equipo_plantilla.php?id_competicion=$_idCompeticion&id_equipo=$teamId&id_torneo=$_idTorneo';
    
    final response = await http.get(
      Uri.parse(url),
      headers: {'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'},
    ).timeout(const Duration(seconds: 15));

    if (response.statusCode != 200) {
      throw Exception('HTTP ${response.statusCode} para equipo $teamId');
    }

    final document = html_parser.parse(response.body);
    final playerCards = document.querySelectorAll('a.card_jugador');
    
    int saved = 0;
    for (final card in playerCards) {
      try {
        final href = card.attributes['href'] ?? '';
        final idMatch = RegExp(r'id_jugador=(\d+)').firstMatch(href);
        final playerId = idMatch?.group(1);
        if (playerId == null) continue;

        final nameEl = card.querySelector('h4');
        final fullName = nameEl?.text.trim() ?? '';
        if (fullName.isEmpty) continue;

        final imgEl = card.querySelector('img');
        String? photoUrl = imgEl?.attributes['src'];
        if (photoUrl != null && !photoUrl.startsWith('http')) {
          photoUrl = '$_baseUrl/$photoUrl';
        }

        await _supabase.from('ffcv_players').upsert({
          'id': playerId,
          'team_id': teamId,
          'full_name': fullName,
          'photo_url': photoUrl,
          'is_coach': false,
          'updated_at': DateTime.now().toIso8601String(),
        }, onConflict: 'id');

        saved++;
      } catch (e) {
        debugPrint('Error guardando jugador de $teamName: $e');
      }
    }

    debugPrint('Plantilla $teamName: $saved jugadores guardados');
    return saved;
  }

  /// Scrapea el calendario completo y guarda todos los partidos
  Future<int> scrapeCalendar() async {
    try {
      final url = '$_baseUrl/calendario.php?id_temp=21&id_modalidad=33345&id_competicion=$_idCompeticion&id_torneo=$_idTorneo';
      
      final response = await http.get(
        Uri.parse(url),
        headers: {'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'},
      ).timeout(const Duration(seconds: 20));

      if (response.statusCode != 200) return 0;

      final document = html_parser.parse(response.body);
      
      // La FFCV agrupa los partidos por jornada en secciones
      final jornadas = document.querySelectorAll('.jornada, .round, h3');
      int currentJornada = 0;
      int saved = 0;

      // Buscar filas de partidos
      final matchRows = document.querySelectorAll('tr.partido, .match_row, a[href*="partido.php"]');
      
      for (final row in matchRows) {
        try {
          final href = row.attributes['href'] ?? '';
          final idMatch = RegExp(r'id_partido=(\d+)').firstMatch(href);
          final idPartido = idMatch?.group(1);
          if (idPartido == null) continue;

          await _supabase.from('ffcv_fixtures').upsert({
            'id_partido': idPartido,
            'id_torneo': _idTorneo,
            'jornada': currentJornada,
            'status': 'upcoming',
            'updated_at': DateTime.now().toIso8601String(),
          }, onConflict: 'id_partido');

          saved++;
        } catch (e) {
          continue;
        }
      }

      return saved;
    } catch (e) {
      debugPrint('Error scraping calendario: $e');
      return 0;
    }
  }

  /// Obtiene el estado de cuántos jugadores hay por equipo en Supabase
  Future<Map<String, int>> getRosterCounts() async {
    try {
      final players = await _supabase
          .from('ffcv_players')
          .select('team_id')
          .not('is_coach', 'eq', true);

      final Map<String, int> counts = {};
      for (final p in players) {
        final teamId = p['team_id'] as String;
        counts[teamId] = (counts[teamId] ?? 0) + 1;
      }
      return counts;
    } catch (e) {
      return {};
    }
  }
}
