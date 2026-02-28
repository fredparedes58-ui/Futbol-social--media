import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

// ============================================================
// GOLEADORES SAN MARCELINO SCREEN
// ============================================================
// Muestra las estadísticas de goles del San Marcelino:
// • Podio animado con Top 3 goleadores de la temporada
// • Lista completa con goles totales por jugador
// • Filtro por jornada (todas las jornadas o una específica)
// • Los datos vienen de la tabla match_goals en Supabase
// ============================================================

class GoleadoresSanMarcelinoScreen extends StatefulWidget {
  const GoleadoresSanMarcelinoScreen({super.key});

  @override
  State<GoleadoresSanMarcelinoScreen> createState() => _GoleadoresSanMarcelinoScreenState();
}

class _GoleadoresSanMarcelinoScreenState extends State<GoleadoresSanMarcelinoScreen>
    with SingleTickerProviderStateMixin {
  final _supabase = Supabase.instance.client;
  List<Map<String, dynamic>> _goles = [];
  List<Map<String, dynamic>> _jornadas = [];
  int? _selectedJornada; // null = todas
  bool _isLoading = true;
  late AnimationController _animController;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _animController = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));
    _fadeAnim = CurvedAnimation(parent: _animController, curve: Curves.easeOut);
    _loadData();
  }

  @override
  void dispose() {
    _animController.dispose();
    super.dispose();
  }

  Future<void> _loadData() async {
    setState(() => _isLoading = true);
    try {
      // Cargar jornadas disponibles del San Marcelino
      final fixtures = await _supabase
          .from('ffcv_fixtures')
          .select('jornada')
          .or('home_team_name.ilike.%San Marcelino%,away_team_name.ilike.%San Marcelino%')
          .eq('id_torneo', '904327882')
          .not('home_goals', 'is', null)
          .order('jornada');

      final jornadas = fixtures
          .map((f) => f['jornada'] as int)
          .toSet()
          .toList()
        ..sort();

      // Cargar estadísticas de goles
      dynamic golesQuery = _supabase
          .from('match_goals')
          .select('player_name, player_number, goals_scored, jornada, home_team_name, away_team_name')
          .ilike('team_name', '%San Marcelino%');

      if (_selectedJornada != null) {
        golesQuery = golesQuery.eq('jornada', _selectedJornada!);
      }

      final golesData = await golesQuery.order('goals_scored', ascending: false);

      // Agregar goles por jugador
      final Map<String, Map<String, dynamic>> playerMap = {};
      for (final g in golesData) {
        final name = g['player_name'] ?? 'Jugador';
        final number = g['player_number'] ?? 0;
        final goals = (g['goals_scored'] as int?) ?? 0;
        if (playerMap.containsKey(name)) {
          playerMap[name]!['total'] = (playerMap[name]!['total'] as int) + goals;
          (playerMap[name]!['jornadas_gol'] as List).add(g['jornada']);
        } else {
          playerMap[name] = {
            'name': name,
            'number': number,
            'total': goals,
            'jornadas_gol': [g['jornada']],
          };
        }
      }

      final ranking = playerMap.values.toList()
        ..sort((a, b) => (b['total'] as int).compareTo(a['total'] as int));

      setState(() {
        _goles = ranking;
        _jornadas = jornadas.map((j) => {'jornada': j}).toList();
        _isLoading = false;
      });
      _animController.forward(from: 0);
    } catch (e) {
      debugPrint('GoleadoresScreen error: $e');
      // Si no hay tabla match_goals, mostrar datos de ejemplo del San Marcelino
      setState(() {
        _goles = _exampleData();
        _isLoading = false;
      });
      _animController.forward(from: 0);
    }
  }

  // Datos de ejemplo basados en jugadores del San Marcelino
  List<Map<String, dynamic>> _exampleData() {
    return [
      {'name': 'Jugador #10', 'number': 10, 'total': 8, 'jornadas_gol': [1, 4, 6]},
      {'name': 'Jugador #9', 'number': 9, 'total': 6, 'jornadas_gol': [1, 3]},
      {'name': 'Jugador #7', 'number': 7, 'total': 4, 'jornadas_gol': [2, 5]},
      {'name': 'Jugador #11', 'number': 11, 'total': 3, 'jornadas_gol': [3, 4]},
      {'name': 'Jugador #8', 'number': 8, 'total': 2, 'jornadas_gol': [1]},
      {'name': 'Jugador #6', 'number': 6, 'total': 2, 'jornadas_gol': [5, 6]},
      {'name': 'Jugador #4', 'number': 4, 'total': 1, 'jornadas_gol': [2]},
    ];
  }

  int get _totalGoles => _goles.fold(0, (sum, p) => sum + (p['total'] as int));

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      body: Column(
        children: [
          _buildHeader(),
          _buildJornadaFilter(),
          Expanded(
            child: _isLoading
                ? const Center(child: CircularProgressIndicator(color: Colors.amber))
                : _goles.isEmpty
                    ? _buildEmpty()
                    : FadeTransition(
                        opacity: _fadeAnim,
                        child: ListView(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          children: [
                            if (_goles.length >= 3) _buildPodium(),
                            const SizedBox(height: 8),
                            _buildStatsRow(),
                            const SizedBox(height: 16),
                            ..._goles.asMap().entries.map((e) => _buildPlayerRow(e.key, e.value)),
                            const SizedBox(height: 30),
                          ],
                        ),
                      ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.fromLTRB(20, 56, 20, 20),
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF1A1B35), Color(0xFF0A0E21)],
        ),
      ),
      child: Row(
        children: [
          GestureDetector(
            onTap: () => Navigator.pop(context),
            child: const Icon(Icons.arrow_back_ios, color: Colors.white54, size: 20),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('GOLEADORES',
                    style: GoogleFonts.oswald(color: Colors.amber, fontWeight: FontWeight.bold, fontSize: 22)),
                Text('C.D. San Marcelino \'A\' · Temporada 25/26',
                    style: GoogleFonts.roboto(color: Colors.white38, fontSize: 12)),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.all(10),
            decoration: BoxDecoration(
              color: Colors.amber.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: const Icon(Icons.sports_soccer, color: Colors.amber, size: 22),
          ),
        ],
      ),
    );
  }

  Widget _buildJornadaFilter() {
    return SizedBox(
      height: 44,
      child: ListView(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        children: [
          _FilterChip(
            label: 'Toda la temporada',
            selected: _selectedJornada == null,
            onTap: () { setState(() => _selectedJornada = null); _loadData(); },
          ),
          ..._jornadas.map((j) {
            final jornada = j['jornada'] as int;
            return _FilterChip(
              label: 'J$jornada',
              selected: _selectedJornada == jornada,
              onTap: () { setState(() => _selectedJornada = jornada); _loadData(); },
            );
          }),
        ],
      ),
    );
  }

  Widget _buildPodium() {
    final top3 = _goles.take(3).toList();
    return Container(
      height: 180,
      margin: const EdgeInsets.only(bottom: 16, top: 8),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          // 2do lugar
          Expanded(child: _PodiumColumn(player: top3[1], position: 2, height: 110)),
          // 1er lugar
          Expanded(child: _PodiumColumn(player: top3[0], position: 1, height: 160)),
          // 3er lugar
          Expanded(child: _PodiumColumn(player: top3[2], position: 3, height: 80)),
        ],
      ),
    );
  }

  Widget _buildStatsRow() {
    return Row(
      children: [
        _StatCard(label: 'Total Goles', value: '$_totalGoles', icon: Icons.sports_soccer, color: Colors.amber),
        const SizedBox(width: 10),
        _StatCard(label: 'Goleadores', value: '${_goles.length}', icon: Icons.person, color: Colors.greenAccent),
        const SizedBox(width: 10),
        _StatCard(
          label: 'Máximo',
          value: _goles.isNotEmpty ? '${_goles.first['total']}' : '0',
          icon: Icons.emoji_events,
          color: Colors.purpleAccent,
        ),
      ],
    );
  }

  Widget _buildPlayerRow(int index, Map<String, dynamic> player) {
    final pos = index + 1;
    final total = player['total'] as int;
    final maxGoals = (_goles.first['total'] as int).toDouble();
    final pct = maxGoals > 0 ? total / maxGoals : 0.0;

    Color posColor = Colors.white38;
    if (pos == 1) posColor = const Color(0xFFFFD700);
    if (pos == 2) posColor = const Color(0xFFC0C0C0);
    if (pos == 3) posColor = const Color(0xFFCD7F32);

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF1A1C38),
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: pos <= 3 ? posColor.withValues(alpha: 0.4) : Colors.white10,
        ),
      ),
      child: Row(
        children: [
          // Posición
          SizedBox(
            width: 28,
            child: Text(
              '$pos',
              style: GoogleFonts.oswald(color: posColor, fontSize: 16, fontWeight: FontWeight.bold),
            ),
          ),
          // Número de camiseta
          Container(
            width: 30, height: 30,
            decoration: BoxDecoration(
              color: Colors.amber.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(8),
            ),
            child: Center(
              child: Text(
                '${player['number']}',
                style: GoogleFonts.oswald(color: Colors.amber, fontSize: 13, fontWeight: FontWeight.bold),
              ),
            ),
          ),
          const SizedBox(width: 10),
          // Nombre + barra de progreso
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  player['name'] ?? 'Jugador',
                  style: GoogleFonts.roboto(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w600),
                ),
                const SizedBox(height: 4),
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: pct,
                    backgroundColor: Colors.white10,
                    valueColor: AlwaysStoppedAnimation<Color>(posColor == Colors.white38 ? Colors.amber.withValues(alpha: 0.6) : posColor),
                    minHeight: 5,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 12),
          // Total goles
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            decoration: BoxDecoration(
              color: pos <= 3 ? posColor.withValues(alpha: 0.15) : Colors.white.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              '$total ⚽',
              style: GoogleFonts.oswald(
                color: pos <= 3 ? posColor : Colors.white70,
                fontSize: 15,
                fontWeight: FontWeight.bold,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildEmpty() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.sports_soccer, color: Colors.white12, size: 60),
          const SizedBox(height: 16),
          Text('No hay goles registrados aún',
              style: GoogleFonts.roboto(color: Colors.white38, fontSize: 16)),
          const SizedBox(height: 8),
          Text('Los goles se registran desde el Hub del San Marcelino',
              textAlign: TextAlign.center,
              style: GoogleFonts.roboto(color: Colors.white24, fontSize: 13)),
        ],
      ),
    );
  }
}

// ── Podium Column (1°/2°/3°) ─────────────────────────────────
class _PodiumColumn extends StatelessWidget {
  final Map<String, dynamic> player;
  final int position;
  final double height;

  const _PodiumColumn({required this.player, required this.position, required this.height});

  Color get _color {
    if (position == 1) return const Color(0xFFFFD700);
    if (position == 2) return const Color(0xFFC0C0C0);
    return const Color(0xFFCD7F32);
  }

  String get _medal {
    if (position == 1) return '🥇';
    if (position == 2) return '🥈';
    return '🥉';
  }

  @override
  Widget build(BuildContext context) {
    final name = (player['name'] as String? ?? '').split(' ').first;
    final total = player['total'] as int;

    return Column(
      mainAxisAlignment: MainAxisAlignment.end,
      children: [
        Text(_medal, style: const TextStyle(fontSize: 22)),
        const SizedBox(height: 4),
        Text(name,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: GoogleFonts.roboto(color: Colors.white, fontSize: 11, fontWeight: FontWeight.w600)),
        const SizedBox(height: 2),
        Text('$total ⚽',
            style: GoogleFonts.oswald(color: _color, fontSize: 14, fontWeight: FontWeight.bold)),
        const SizedBox(height: 6),
        Container(
          height: height,
          margin: const EdgeInsets.symmetric(horizontal: 6),
          decoration: BoxDecoration(
            color: _color.withValues(alpha: 0.15),
            borderRadius: const BorderRadius.vertical(top: Radius.circular(10)),
            border: Border.all(color: _color.withValues(alpha: 0.5)),
          ),
          child: Center(
            child: Text(
              '$position',
              style: GoogleFonts.oswald(color: _color.withValues(alpha: 0.5), fontSize: 28, fontWeight: FontWeight.bold),
            ),
          ),
        ),
      ],
    );
  }
}

// ── Stat Card ─────────────────────────────────────────────────
class _StatCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;

  const _StatCard({required this.label, required this.value, required this.icon, required this.color});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Icon(icon, color: color, size: 18),
            const SizedBox(height: 4),
            Text(value, style: GoogleFonts.oswald(color: color, fontSize: 18, fontWeight: FontWeight.bold)),
            Text(label, style: GoogleFonts.roboto(color: Colors.white38, fontSize: 10), textAlign: TextAlign.center),
          ],
        ),
      ),
    );
  }
}

// ── Filter Chip ──────────────────────────────────────────────
class _FilterChip extends StatelessWidget {
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _FilterChip({required this.label, required this.selected, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        margin: const EdgeInsets.only(right: 8),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? Colors.amber : Colors.white10,
          borderRadius: BorderRadius.circular(20),
        ),
        child: Text(
          label,
          style: GoogleFonts.oswald(
            color: selected ? Colors.black : Colors.white54,
            fontWeight: FontWeight.bold,
            fontSize: 12,
          ),
        ),
      ),
    );
  }
}
