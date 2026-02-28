import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'san_marcelino_hub_screen.dart';

class FfcvLeagueTeamsScreen extends StatefulWidget {
  const FfcvLeagueTeamsScreen({super.key});

  @override
  State<FfcvLeagueTeamsScreen> createState() => _FfcvLeagueTeamsScreenState();
}

class _FfcvLeagueTeamsScreenState extends State<FfcvLeagueTeamsScreen> {
  final _supabase = Supabase.instance.client;
  List<Map<String, dynamic>> _teams = [];
  Map<String, Map<String, dynamic>> _standings = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    try {
      // Cargar equipos
      final teams = await _supabase
          .from('ffcv_teams')
          .select()
          .order('name');

      // Cargar clasificación para mostrar puntos/posición junto a cada equipo
      final standingsData = await _supabase
          .from('ffcv_standings')
          .select()
          .eq('id_torneo', '904327882')
          .order('position');

      Map<String, Map<String, dynamic>> standingsMap = {};
      for (final s in standingsData) {
        // Mapear por nombre de equipo (aproximación)
        standingsMap[s['team_name']] = s;
      }

      setState(() {
        _teams = List<Map<String, dynamic>>.from(teams);
        _standings = standingsMap;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error cargando equipos: $e');
      setState(() => _isLoading = false);
    }
  }

  void _onTeamTap(Map<String, dynamic> team) {
    if (team['is_our_team'] == true) {
      // Navegar al Hub del San Marcelino
      Navigator.push(context, MaterialPageRoute(
        builder: (_) => const SanMarcelinoHubScreen(),
      ));
    } else {
      // Mostrar la plantilla del rival en un BottomSheet
      _showRivalRoster(team);
    }
  }

  void _showRivalRoster(Map<String, dynamic> team) async {
    final players = await _supabase
        .from('ffcv_players')
        .select()
        .eq('team_id', team['id'])
        .eq('is_coach', false)
        .order('full_name');

    if (!mounted) return;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1D1E33),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => DraggableScrollableSheet(
        expand: false,
        initialChildSize: 0.6,
        maxChildSize: 0.9,
        builder: (_, controller) => _buildRosterSheet(team, players, controller),
      ),
    );
  }

  Widget _buildRosterSheet(
    Map<String, dynamic> team,
    List<dynamic> players,
    ScrollController controller,
  ) {
    return Column(
      children: [
        // Barra de agarre
        Container(
          margin: const EdgeInsets.symmetric(vertical: 12),
          width: 40, height: 4,
          decoration: BoxDecoration(
            color: Colors.white30,
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        // Cabecera
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: [
              const Icon(Icons.shield, color: Colors.white38, size: 32),
              const SizedBox(width: 12),
              Expanded(
                child: Text(
                  team['short_name'] ?? team['name'],
                  style: GoogleFonts.oswald(
                    color: Colors.white,
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
              Text(
                '${players.length} jugadores',
                style: const TextStyle(color: Colors.white38, fontSize: 13),
              ),
            ],
          ),
        ),
        const Divider(color: Colors.white12, height: 24),
        // Lista de jugadores
        Expanded(
          child: players.isEmpty
              ? Center(
                  child: Text(
                    'Plantilla no disponible aún',
                    style: GoogleFonts.roboto(color: Colors.white38),
                  ),
                )
              : ListView.builder(
                  controller: controller,
                  itemCount: players.length,
                  itemBuilder: (_, index) {
                    final p = players[index];
                    return ListTile(
                      leading: CircleAvatar(
                        backgroundColor: Colors.white12,
                        child: Text(
                          '${index + 1}',
                          style: GoogleFonts.oswald(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                      title: Text(
                        _formatName(p['full_name'] ?? ''),
                        style: GoogleFonts.roboto(
                          color: Colors.white,
                          fontSize: 14,
                        ),
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  // Convierte "APELLIDO, NOMBRE" → "Nombre Apellido"
  String _formatName(String rawName) {
    final parts = rawName.split(',');
    if (parts.length == 2) {
      final firstName = parts[1].trim().split(' ').map((w) {
        if (w.isEmpty) return '';
        return w[0].toUpperCase() + w.substring(1).toLowerCase();
      }).join(' ');
      final lastName = parts[0].trim().split(' ').map((w) {
        if (w.isEmpty) return '';
        return w[0].toUpperCase() + w.substring(1).toLowerCase();
      }).join(' ');
      return '$firstName $lastName';
    }
    return rawName;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Column(
          children: [
            Text(
              'EQUIPOS DEL GRUP.-4',
              style: GoogleFonts.oswald(
                color: Colors.white,
                fontWeight: FontWeight.bold,
                fontSize: 18,
                letterSpacing: 1.5,
              ),
            ),
            Text(
              'Primera FFCV Benjamí · Valencia',
              style: GoogleFonts.roboto(color: Colors.white38, fontSize: 11),
            ),
          ],
        ),
        centerTitle: true,
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.amber))
          : _teams.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(Icons.sports_soccer, size: 64, color: Colors.white12),
                      const SizedBox(height: 16),
                      Text('Ejecuta SETUP_FFCV_PLANTILLAS.sql primero',
                          style: GoogleFonts.roboto(color: Colors.white38)),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(12),
                  itemCount: _teams.length,
                  itemBuilder: (_, index) {
                    final team = _teams[index];
                    final isUs = team['is_our_team'] == true;

                    return GestureDetector(
                      onTap: () => _onTeamTap(team),
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        margin: const EdgeInsets.only(bottom: 10),
                        padding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 14),
                        decoration: BoxDecoration(
                          color: isUs
                              ? Colors.amber.withValues(alpha: 0.1)
                              : const Color(0xFF1D1E33),
                          borderRadius: BorderRadius.circular(14),
                          border: Border.all(
                            color: isUs ? Colors.amber : Colors.white12,
                            width: isUs ? 2 : 1,
                          ),
                          boxShadow: isUs
                              ? [
                                  BoxShadow(
                                    color: Colors.amber.withValues(alpha: 0.2),
                                    blurRadius: 12,
                                  )
                                ]
                              : [],
                        ),
                        child: Row(
                          children: [
                            // Escudo
                            Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: Colors.white10,
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Icon(
                                Icons.shield,
                                color: isUs ? Colors.amber : Colors.white38,
                                size: 26,
                              ),
                            ),
                            const SizedBox(width: 14),
                            // Nombre
                            Expanded(
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    team['short_name'] ?? team['name'],
                                    style: GoogleFonts.oswald(
                                      color: isUs ? Colors.amber : Colors.white,
                                      fontSize: 17,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                  if (isUs)
                                    Text(
                                      '⭐ Nuestro Equipo',
                                      style: GoogleFonts.roboto(
                                        color: Colors.amber.withValues(alpha: 0.7),
                                        fontSize: 11,
                                      ),
                                    ),
                                ],
                              ),
                            ),
                            // Arrow
                            Icon(
                              isUs
                                  ? Icons.star_rounded
                                  : Icons.arrow_forward_ios,
                              color: isUs ? Colors.amber : Colors.white24,
                              size: isUs ? 22 : 14,
                            ),
                          ],
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
