import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'register_match_result_screen.dart';

class SanMarcelinoHubScreen extends StatefulWidget {
  const SanMarcelinoHubScreen({super.key});

  @override
  State<SanMarcelinoHubScreen> createState() => _SanMarcelinoHubScreenState();
}

class _SanMarcelinoHubScreenState extends State<SanMarcelinoHubScreen>
    with SingleTickerProviderStateMixin {
  final _supabase = Supabase.instance.client;
  late TabController _tabController;

  List<Map<String, dynamic>> _players = [];
  List<Map<String, dynamic>> _results = [];
  Map<String, dynamic>? _standing;
  bool _isLoading = true;
  bool _isAdmin = false;

  static const String _teamId = '16372';

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _loadData();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      // Cargar perfil del usuario para saber si es admin
      final userId = _supabase.auth.currentUser?.id;
      if (userId != null) {
        final profile = await _supabase
            .from('profiles')
            .select('role')
            .eq('id', userId)
            .maybeSingle();
        _isAdmin = profile?['role'] == 'admin';
      }

      // Cargar jugadores del San Marcelino
      final players = await _supabase
          .from('ffcv_players')
          .select()
          .eq('team_id', _teamId)
          .order('is_coach, full_name');

      // Cargar resultados registrados + goles
      final results = await _supabase
          .from('match_results')
          .select('*, match_goals(player_name, minute, is_own_goal)')
          .order('created_at', ascending: false)
          .limit(20);

      // Cargar posición en la clasificación
      final standing = await _supabase
          .from('ffcv_standings')
          .select()
          .eq('id_torneo', '904327882')
          .ilike('team_name', '%San Marcelino%')
          .maybeSingle();

      if (mounted) {
        setState(() {
          _players = List<Map<String, dynamic>>.from(players);
          _results = List<Map<String, dynamic>>.from(results);
          _standing = standing;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error en SanMarcelinoHub: $e');
      setState(() => _isLoading = false);
    }
  }

  String _formatName(String raw) {
    final parts = raw.split(',');
    if (parts.length == 2) {
      String fn = parts[1].trim().split(' ').map((w) =>
          w.isEmpty ? '' : '${w[0].toUpperCase()}${w.substring(1).toLowerCase()}').join(' ');
      String ln = parts[0].trim().split(' ').map((w) =>
          w.isEmpty ? '' : '${w[0].toUpperCase()}${w.substring(1).toLowerCase()}').join(' ');
      return '$fn $ln';
    }
    return raw;
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
            Text('SAN MARCELINO',
                style: GoogleFonts.oswald(
                    color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 20, letterSpacing: 2)),
            Text('C.D. San Marcelino \'A\' · Grup.-4',
                style: GoogleFonts.roboto(color: Colors.white38, fontSize: 11)),
          ],
        ),
        centerTitle: true,
        actions: [
          if (_isAdmin)
            IconButton(
              icon: const Icon(Icons.add_circle, color: Colors.amber),
              tooltip: 'Registrar Resultado',
              onPressed: () async {
                final reload = await Navigator.push(context, MaterialPageRoute(
                  builder: (_) => const RegisterMatchResultScreen(),
                ));
                if (reload == true) _loadData();
              },
            ),
        ],
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: Colors.amber,
          labelColor: Colors.amber,
          unselectedLabelColor: Colors.white38,
          tabs: const [
            Tab(icon: Icon(Icons.people), text: 'Plantilla'),
            Tab(icon: Icon(Icons.scoreboard), text: 'Resultados'),
          ],
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.amber))
          : Column(
              children: [
                // Tarjeta resumen del equipo
                _buildTeamSummaryCard(),
                // Contenido de las pestañas
                Expanded(
                  child: TabBarView(
                    controller: _tabController,
                    children: [
                      _buildRosterTab(),
                      _buildResultsTab(),
                    ],
                  ),
                ),
              ],
            ),
      floatingActionButton: _isAdmin
          ? FloatingActionButton.extended(
              backgroundColor: Colors.amber,
              foregroundColor: Colors.black,
              icon: const Icon(Icons.sports_soccer),
              label: Text('Registrar Partido', style: GoogleFonts.oswald(fontWeight: FontWeight.bold)),
              onPressed: () async {
                final reload = await Navigator.push(context, MaterialPageRoute(
                  builder: (_) => const RegisterMatchResultScreen(),
                ));
                if (reload == true) _loadData();
              },
            )
          : null,
    );
  }

  Widget _buildTeamSummaryCard() {
    final pts = _standing?['points'] ?? '?';
    final pos = _standing?['position'] ?? '?';
    final gp = _standing?['games_played'] ?? 0;
    final wins = _standing?['wins'] ?? 0;
    final draws = _standing?['draws'] ?? 0;
    final losses = _standing?['losses'] ?? 0;

    return Container(
      margin: const EdgeInsets.all(16),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFF1D1E33), Color(0xFF2A2B4A)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.amber.withValues(alpha: 0.4)),
        boxShadow: [
          BoxShadow(
            color: Colors.amber.withValues(alpha: 0.15),
            blurRadius: 12,
          )
        ],
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceAround,
        children: [
          // Posición
          Column(children: [
            Text('$pos', style: GoogleFonts.oswald(color: Colors.amber, fontSize: 36, fontWeight: FontWeight.bold)),
            Text('Posición', style: GoogleFonts.roboto(color: Colors.white54, fontSize: 11)),
          ]),
          const VerticalDivider(color: Colors.white12),
          // PJ
          Column(children: [
            Text('$gp', style: GoogleFonts.oswald(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold)),
            Text('PJ', style: GoogleFonts.roboto(color: Colors.white54, fontSize: 11)),
          ]),
          // Victorias
          Column(children: [
            Text('$wins', style: GoogleFonts.oswald(color: Colors.greenAccent, fontSize: 28, fontWeight: FontWeight.bold)),
            Text('V', style: GoogleFonts.roboto(color: Colors.white54, fontSize: 11)),
          ]),
          // Empates
          Column(children: [
            Text('$draws', style: GoogleFonts.oswald(color: Colors.yellowAccent, fontSize: 28, fontWeight: FontWeight.bold)),
            Text('E', style: GoogleFonts.roboto(color: Colors.white54, fontSize: 11)),
          ]),
          // Derrotas
          Column(children: [
            Text('$losses', style: GoogleFonts.oswald(color: Colors.redAccent, fontSize: 28, fontWeight: FontWeight.bold)),
            Text('D', style: GoogleFonts.roboto(color: Colors.white54, fontSize: 11)),
          ]),
          const VerticalDivider(color: Colors.white12),
          // Puntos
          Column(children: [
            Text('$pts', style: GoogleFonts.oswald(color: Colors.amber, fontSize: 36, fontWeight: FontWeight.bold)),
            Text('PTS', style: GoogleFonts.roboto(color: Colors.white54, fontSize: 11)),
          ]),
        ],
      ),
    );
  }

  Widget _buildRosterTab() {
    final coaches = _players.where((p) => p['is_coach'] == true).toList();
    final players = _players.where((p) => p['is_coach'] == false).toList();

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      children: [
        Text('TÉCNICOS', style: GoogleFonts.oswald(color: Colors.white38, letterSpacing: 2, fontSize: 12)),
        const SizedBox(height: 8),
        ...coaches.map((c) => _buildPlayerTile(c, isCoach: true)),
        const SizedBox(height: 16),
        Text('${players.length} JUGADORES', style: GoogleFonts.oswald(color: Colors.white38, letterSpacing: 2, fontSize: 12)),
        const SizedBox(height: 8),
        ...players.asMap().entries.map((e) => _buildPlayerTile(e.value, number: e.key + 1)),
        const SizedBox(height: 80),
      ],
    );
  }

  Widget _buildPlayerTile(Map<String, dynamic> player, {int? number, bool isCoach = false}) {
    final name = _formatName(player['full_name'] ?? '');
    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: const Color(0xFF1D1E33),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.white10),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 18,
            backgroundColor: isCoach ? Colors.purpleAccent.withValues(alpha: 0.2) : Colors.amber.withValues(alpha: 0.15),
            child: Text(
              isCoach ? '🏋' : '${number ?? 0}',
              style: GoogleFonts.oswald(
                color: isCoach ? Colors.purpleAccent : Colors.amber,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Text(name, style: GoogleFonts.roboto(color: Colors.white, fontSize: 14)),
          ),
          Text(
            isCoach ? 'TÉCNICO' : 'JUGADOR',
            style: GoogleFonts.roboto(color: Colors.white24, fontSize: 10, letterSpacing: 1),
          ),
        ],
      ),
    );
  }

  Widget _buildResultsTab() {
    if (_results.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.scoreboard_outlined, size: 64, color: Colors.white12),
            const SizedBox(height: 16),
            Text('Sin resultados registrados aún',
                style: GoogleFonts.oswald(color: Colors.white38, fontSize: 18)),
            const SizedBox(height: 8),
            if (_isAdmin)
              Text('Usa el botón de abajo para añadir el resultado de un partido.',
                  textAlign: TextAlign.center,
                  style: GoogleFonts.roboto(color: Colors.white24, fontSize: 13)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: _results.length,
      itemBuilder: (_, index) {
        final r = _results[index];
        final ourGoals = r['our_goals'] as int? ?? 0;
        final rivalGoals = r['rival_goals'] as int? ?? 0;
        final isWin = ourGoals > rivalGoals;
        final isDraw = ourGoals == rivalGoals;
        final goals = (r['match_goals'] as List?) ?? [];

        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: const Color(0xFF1D1E33),
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: isWin ? Colors.green : (isDraw ? Colors.amber : Colors.redAccent),
              width: 1.5,
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: (isWin ? Colors.green : (isDraw ? Colors.amber : Colors.redAccent))
                          .withValues(alpha: 0.15),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      isWin ? '✅ VICTORIA' : (isDraw ? '🤝 EMPATE' : '❌ DERROTA'),
                      style: GoogleFonts.oswald(
                        color: isWin ? Colors.green : (isDraw ? Colors.amber : Colors.redAccent),
                        fontWeight: FontWeight.bold,
                        fontSize: 12,
                        letterSpacing: 1,
                      ),
                    ),
                  ),
                  Text(
                    '$ourGoals - $rivalGoals',
                    style: GoogleFonts.oswald(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
              if (r['notes'] != null && (r['notes'] as String).isNotEmpty) ...[
                const SizedBox(height: 8),
                Text(r['notes'], style: GoogleFonts.roboto(color: Colors.white54, fontSize: 13)),
              ],
              if (goals.isNotEmpty) ...[
                const SizedBox(height: 10),
                const Divider(color: Colors.white12),
                Text('⚽ Goleadores:', style: GoogleFonts.roboto(color: Colors.amber, fontSize: 12, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                ...goals.map((g) => Text(
                  '• ${_formatName(g['player_name'] ?? '')}${g['minute'] != null ? ' (${g['minute']}\')' : ''}',
                  style: GoogleFonts.roboto(color: Colors.white70, fontSize: 13),
                )),
              ],
            ],
          ),
        );
      },
    );
  }
}
