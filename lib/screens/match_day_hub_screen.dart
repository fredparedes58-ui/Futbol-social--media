import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../widgets/football_pitch_widget.dart';
import '../widgets/mvp_voting_widget.dart';
import 'ffcv_standings_screen.dart';
import 'ffcv_league_teams_screen.dart';

class MatchDayHubScreen extends StatefulWidget {
  final String teamId;

  const MatchDayHubScreen({super.key, required this.teamId});

  @override
  State<MatchDayHubScreen> createState() => _MatchDayHubScreenState();
}

class _MatchDayHubScreenState extends State<MatchDayHubScreen> {
  final SupabaseClient _supabase = Supabase.instance.client;
  bool _isLoading = true;
  Map<String, dynamic>? _activeMatch;
  List<Map<String, dynamic>> _teamPlayers = [];

  @override
  void initState() {
    super.initState();
    _loadMatchData();
  }

  Future<void> _loadMatchData() async {
    setState(() => _isLoading = true);

    try {
      // 1. Obtener el partido más reciente de tipo "upcoming", "live" o recién "finished"
      final matchResponse = await _supabase
          .from('match_events')
          .select()
          .eq('team_id', widget.teamId)
          .order('match_date', ascending: false)
          .limit(1)
          .maybeSingle();

      // 2. Obtener todos los jugadores del equipo para la cancha / votación
      // Para la Beta, tomamos todos los perfiles unidos al team.
      final playersResponse = await _supabase.rpc(
        'get_team_members_detailed', // Suponiendo que usabamos algo así, si no hacemos JOIN manual
        params: {'p_team_id': widget.teamId}
      ).catchError((_) async {
         // Fallback manual si el RPC falla (JOIN profiles <- team_members)
         final res = await _supabase.from('team_members')
            .select('user_id, profiles(id, full_name, avatar_url, position)')
            .eq('team_id', widget.teamId);
         
         return res.map((e) => e['profiles']).toList();
      });

      if (mounted) {
        setState(() {
          _activeMatch = matchResponse;
          _teamPlayers = List<Map<String, dynamic>>.from(playersResponse ?? []);
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error MatchDay Hub: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator(color: Colors.white));
    }

    if (_activeMatch == null) {
      return _buildEmptyState();
    }

    final opponent = _activeMatch!['opponent_name'] ?? 'Rival';
    final status = _activeMatch!['status'] ?? 'upcoming'; // upcoming, live, finished
    final isFinished = status == 'finished';

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      appBar: AppBar(
        title: Text('MATCH DAY HUB 🏆', style: GoogleFonts.oswald(color: Colors.amber, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
        child: Column(
          children: [
            // Cabecera del encuentro
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF1D1E33),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white24, width: 1),
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.spaceAround,
                children: [
                  Column(
                    children: [
                      const Icon(Icons.shield, color: Colors.blueAccent, size: 40),
                      const SizedBox(height: 8),
                      Text('Nosotros', style: GoogleFonts.oswald(color: Colors.white, fontSize: 16)),
                    ],
                  ),
                  Container(
                     padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                     decoration: BoxDecoration(
                       color: isFinished ? Colors.redAccent : Colors.green,
                       borderRadius: BorderRadius.circular(20),
                     ),
                     child: Text(
                       isFinished ? 'FINALIZADO' : (status == 'live' ? 'EN VIVO' : 'PRÓXIMO'),
                       style: GoogleFonts.roboto(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12),
                     ),
                  ),
                  Column(
                    children: [
                      const Icon(Icons.shield_outlined, color: Colors.redAccent, size: 40),
                      const SizedBox(height: 8),
                      Text(opponent, style: GoogleFonts.oswald(color: Colors.white, fontSize: 16)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 30),

            const SizedBox(height: 16),

          // ⚽ BOTÓN CLASIFICACIÓN FFCV
          GestureDetector(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(
                builder: (context) => const FfcvStandingsScreen(
                  ourTeamName: '', // Pon aquí el nombre exacto de tu equipo en la FFCV
                ),
              ),
            ),
            child: Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [Colors.amber.shade700, Colors.amber.shade400],
                ),
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: Colors.amber.withValues(alpha: 0.4),
                    blurRadius: 10,
                    offset: const Offset(0, 4),
                  )
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.format_list_numbered, color: Colors.black, size: 22),
                  const SizedBox(width: 10),
                  Text(
                    'VER CLASIFICACIÓN OFICIAL',
                    style: GoogleFonts.oswald(
                      color: Colors.black,
                      fontWeight: FontWeight.bold,
                      fontSize: 15,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Icon(Icons.arrow_forward_ios, color: Colors.black, size: 14),
                ],
              ),
            ),
          ),

          // Tablero Principal
            Expanded(
              child: isFinished
                  ? MvpVotingWidget(
                      matchId: _activeMatch!['id'],
                      players: _teamPlayers,
                      onVoteCast: () => debugPrint('Voto registrado ui refresh'),
                    )
                  : Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        Text(
                          'Alineación Titular',
                          textAlign: TextAlign.center,
                          style: GoogleFonts.oswald(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        const SizedBox(height: 20),
                        Expanded(
                          child: SingleChildScrollView(
                             child: FootballPitchWidget(players: _teamPlayers),
                          ),
                        ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.event_busy, color: Colors.white.withValues(alpha: 0.3), size: 80),
          const SizedBox(height: 20),
          Text(
            'No hay partidos programados',
            style: GoogleFonts.oswald(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 10),
          const Text(
            'El Centro de Partido se activará el día de juego.',
            style: TextStyle(color: Colors.white54),
          )
        ],
      ),
    );
  }
}
