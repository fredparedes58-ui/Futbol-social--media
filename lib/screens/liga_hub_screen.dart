import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'ffcv_standings_screen.dart';
import 'ffcv_league_teams_screen.dart';
import 'san_marcelino_hub_screen.dart';
import 'partido_detail_screen.dart';
import 'goleadores_san_marcelino_screen.dart';

// ============================================================
// LIGA HUB PREMIUM v2 - Pantalla principal de la Liga Grup-4
// ============================================================
// Diferenciadores vs otras apps:
// • Jornadas con resultados en tiempo real (Supabase Realtime)
// • Al pinchar un partido → mapa del campo + detalle premium
// • Clasificación animada con racha de resultados
// • Plantillas de 13 equipos escaneadas de la FFCV
// • Hub San Marcelino con registro de goles y estadísticas
// ============================================================

class LigaHubScreen extends StatefulWidget {
  const LigaHubScreen({super.key});

  @override
  State<LigaHubScreen> createState() => _LigaHubScreenState();
}

class _LigaHubScreenState extends State<LigaHubScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final _supabase = Supabase.instance.client;

  List<Map<String, dynamic>> _allFixtures = [];
  List<Map<String, dynamic>> _standings = [];
  bool _isLoading = true;
  int _currentJornada = 1;
  RealtimeChannel? _realtimeChannel;
  bool _showUpdateBanner = false;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadData();
    _subscribeToRealtime();
  }

  void _subscribeToRealtime() {
    _realtimeChannel = _supabase
        .channel('ffcv_fixtures_changes')
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'ffcv_fixtures',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'id_torneo',
            value: '904327882',
          ),
          callback: (payload) {
            debugPrint('⚡ Realtime: resultado actualizado -> ${payload.newRecord}');
            if (mounted) {
              setState(() => _showUpdateBanner = true);
              _loadData();
              Future.delayed(const Duration(seconds: 4),
                  () { if (mounted) setState(() => _showUpdateBanner = false); });
            }
          },
        )
        .subscribe();
  }

  @override
  void dispose() {
    _tabController.dispose();
    _realtimeChannel?.unsubscribe();
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final fixtures = await _supabase
          .from('ffcv_fixtures')
          .select()
          .eq('id_torneo', '904327882')
          .order('jornada')
          .order('match_date');

      final standings = await _supabase
          .from('ffcv_standings')
          .select()
          .eq('id_torneo', '904327882')
          .order('position');

      // Calcular jornada más reciente con resultado
      int currentJornada = 1;
      for (var f in fixtures) {
        final j = (f['jornada'] as int?) ?? 0;
        final hasResult = f['home_goals'] != null;
        if (hasResult && j >= currentJornada) currentJornada = j;
      }

      if (mounted) {
        setState(() {
          _allFixtures = List<Map<String, dynamic>>.from(fixtures);
          _standings = List<Map<String, dynamic>>.from(standings);
          _currentJornada = currentJornada;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error LigaHub: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.amber))
          : Stack(
              children: [
                NestedScrollView(
                  headerSliverBuilder: (context, innerBoxIsScrolled) => [
                    _buildSliverHeader(innerBoxIsScrolled),
                  ],
                  body: TabBarView(
                    controller: _tabController,
                    children: [
                      _JornadasTab(
                        allFixtures: _allFixtures,
                        currentJornada: _currentJornada,
                        onJornadaChanged: (j) => setState(() => _currentJornada = j),
                      ),
                      FfcvStandingsScreen(ourTeamName: 'San Marcelino'),
                      const FfcvLeagueTeamsScreen(),
                      _SanMarcelinoTab(),
                    ],
                  ),
                ),
                // Banner de resultado en vivo
                if (_showUpdateBanner)
                  Positioned(
                    top: 0, left: 0, right: 0,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      color: Colors.green.withValues(alpha: 0.95),
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                      child: SafeArea(
                        bottom: false,
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            const Icon(Icons.sports_soccer, color: Colors.white, size: 18),
                            const SizedBox(width: 8),
                            Text('⚽ Resultado actualizado desde la FFCV',
                                style: GoogleFonts.oswald(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                          ],
                        ),
                      ),
                    ),
                  ),
              ],
            ),
    );
  }

  Widget _buildSliverHeader(bool innerBoxIsScrolled) {
    return SliverAppBar(
      expandedHeight: 160,
      pinned: true,
      backgroundColor: const Color(0xFF0A0E21),
      elevation: 0,
      flexibleSpace: FlexibleSpaceBar(
        background: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              begin: Alignment.topCenter,
              end: Alignment.bottomCenter,
              colors: [Color(0xFF1A1B35), Color(0xFF0A0E21)],
            ),
          ),
          child: Stack(
            children: [
              Positioned.fill(child: CustomPaint(painter: _PitchLinePainter())),
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 50, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: Colors.amber, borderRadius: BorderRadius.circular(6)),
                          child: Text('GRUP.-4',
                              style: GoogleFonts.oswald(color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(color: Colors.white12, borderRadius: BorderRadius.circular(6)),
                          child: Text('FFCV · BENJAMÍ 2N. ANY',
                              style: GoogleFonts.roboto(color: Colors.white54, fontSize: 10)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('LIGA HUB',
                        style: GoogleFonts.oswald(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 30, letterSpacing: 1)),
                    Text('Primera FFCV · Valencia · Temporada 25/26',
                        style: GoogleFonts.roboto(color: Colors.white38, fontSize: 12)),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
      bottom: TabBar(
        controller: _tabController,
        indicatorColor: Colors.amber,
        indicatorWeight: 3,
        labelColor: Colors.amber,
        unselectedLabelColor: Colors.white38,
        labelStyle: GoogleFonts.oswald(fontWeight: FontWeight.bold, fontSize: 11),
        isScrollable: false,
        tabs: const [
          Tab(icon: Icon(Icons.calendar_today, size: 16), text: 'Jornadas'),
          Tab(icon: Icon(Icons.format_list_numbered, size: 16), text: 'Liga'),
          Tab(icon: Icon(Icons.groups, size: 16), text: 'Equipos'),
          Tab(icon: Icon(Icons.star, size: 16), text: 'San Marc.'),
        ],
      ),
    );
  }
}


// ============================================================
// TAB 4: SAN MARCELINO
// ============================================================
class _SanMarcelinoTab extends StatelessWidget {
  const _SanMarcelinoTab();

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        // Hub completo del San Marcelino
        const SanMarcelinoHubScreen(),
        // Botón flotante de Goleadores
        Positioned(
          bottom: 20,
          left: 16,
          right: 16,
          child: GestureDetector(
            onTap: () => Navigator.push(context,
                MaterialPageRoute(builder: (_) => const GoleadoresSanMarcelinoScreen())),
            child: Container(
              padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFFFFB300), Color(0xFFFF6F00)],
                ),
                borderRadius: BorderRadius.circular(18),
                boxShadow: [
                  BoxShadow(color: Colors.amber.withValues(alpha: 0.4), blurRadius: 16, spreadRadius: 2),
                ],
              ),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  const Icon(Icons.sports_soccer, color: Colors.black, size: 22),
                  const SizedBox(width: 10),
                  Text('VER GOLEADORES TEMPORADA',
                      style: GoogleFonts.oswald(
                          color: Colors.black, fontWeight: FontWeight.bold, fontSize: 15, letterSpacing: 0.5)),
                  const SizedBox(width: 10),
                  const Icon(Icons.arrow_forward_ios, color: Colors.black, size: 14),
                ],
              ),
            ),
          ),
        ),
      ],
    );
  }
}

// ============================================================
// TAB 1: JORNADAS
// ============================================================
class _JornadasTab extends StatefulWidget {
  final List<Map<String, dynamic>> allFixtures;
  final int currentJornada;
  final Function(int) onJornadaChanged;

  const _JornadasTab({
    required this.allFixtures,
    required this.currentJornada,
    required this.onJornadaChanged,
  });

  @override
  State<_JornadasTab> createState() => _JornadasTabState();
}

class _JornadasTabState extends State<_JornadasTab> {
  late int _selectedJornada;
  late PageController _pageController;

  @override
  void initState() {
    super.initState();
    _selectedJornada = widget.currentJornada;
    _pageController = PageController(initialPage: _selectedJornada - 1);
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> _fixturesForJornada(int jornada) =>
      widget.allFixtures.where((f) => f['jornada'] == jornada).toList();

  Set<int> get _availableJornadas {
    return widget.allFixtures
        .map((f) => (f['jornada'] as int?) ?? 0)
        .where((j) => j > 0)
        .toSet()
      ..add(1);
  }

  @override
  Widget build(BuildContext context) {
    final jornadas = _availableJornadas.toList()..sort();
    if (jornadas.isEmpty) {
      return Center(child: Text('Sin datos', style: GoogleFonts.roboto(color: Colors.white38)));
    }

    return Column(
      children: [
        // Selector de jornada - pastillas con scroll
        SizedBox(
          height: 48,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            itemCount: jornadas.length,
            itemBuilder: (_, i) {
              final j = jornadas[i];
              final isSelected = j == _selectedJornada;
              // Comprobar si San Marcelino juega en esta jornada
              final smPlays = widget.allFixtures.any((f) =>
                  f['jornada'] == j &&
                  ((f['home_team_name'] ?? '').contains('San Marcelino') ||
                      (f['away_team_name'] ?? '').contains('San Marcelino')));

              return GestureDetector(
                onTap: () {
                  setState(() => _selectedJornada = j);
                  _pageController.animateToPage(j - 1,
                      duration: const Duration(milliseconds: 300), curve: Curves.easeInOut);
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.amber : Colors.white10,
                    borderRadius: BorderRadius.circular(20),
                    border: smPlays && !isSelected
                        ? Border.all(color: Colors.amber.withValues(alpha: 0.3), width: 1)
                        : null,
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      if (smPlays && !isSelected)
                        Container(
                          width: 6, height: 6,
                          margin: const EdgeInsets.only(right: 5),
                          decoration: const BoxDecoration(color: Colors.amber, shape: BoxShape.circle),
                        ),
                      Text('J$j',
                          style: GoogleFonts.oswald(
                            color: isSelected ? Colors.black : Colors.white54,
                            fontWeight: FontWeight.bold, fontSize: 14,
                          )),
                    ],
                  ),
                ),
              );
            },
          ),
        ),

        // PageView de jornadas
        Expanded(
          child: PageView.builder(
            controller: _pageController,
            itemCount: jornadas.isEmpty ? 1 : jornadas.last,
            onPageChanged: (index) => setState(() => _selectedJornada = index + 1),
            itemBuilder: (_, index) {
              final jornada = index + 1;
              final fixtures = _fixturesForJornada(jornada);
              return _buildJornadaPage(jornada, fixtures);
            },
          ),
        ),
      ],
    );
  }

  Widget _buildJornadaPage(int jornada, List<Map<String, dynamic>> fixtures) {
    // Contar partidos jugados
    final played = fixtures.where((f) => f['home_goals'] != null).length;
    final total = fixtures.length;

    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      children: [
        // Header jornada mejorado
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 14),
          child: Row(
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('JORNADA $jornada',
                        style: GoogleFonts.oswald(
                            color: Colors.amber.withValues(alpha: 0.7), fontSize: 13, letterSpacing: 3)),
                    if (total > 0)
                      Text('$played de $total partidos jugados',
                          style: GoogleFonts.roboto(color: Colors.white24, fontSize: 11)),
                  ],
                ),
              ),
              if (total > 0)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: played == total
                        ? Colors.green.withValues(alpha: 0.15)
                        : Colors.white.withValues(alpha: 0.06),
                    borderRadius: BorderRadius.circular(8),
                    border: Border.all(
                      color: played == total ? Colors.greenAccent.withValues(alpha: 0.3) : Colors.white12,
                    ),
                  ),
                  child: Text(
                    played == total ? '✓ COMPLETA' : '${total - played} PENDIENTES',
                    style: GoogleFonts.oswald(
                      color: played == total ? Colors.greenAccent : Colors.white38,
                      fontSize: 10, fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
            ],
          ),
        ),

        if (fixtures.isEmpty)
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(vertical: 40),
              child: Text('Sin partidos en esta jornada',
                  style: GoogleFonts.roboto(color: Colors.white24)),
            ),
          )
        else
          ...fixtures.map((f) => _MatchCard(fixture: f)),

        const SizedBox(height: 20),
      ],
    );
  }
}

// ============================================================
// WIDGET: Tarjeta de Partido Premium v2
// Al pulsar abre el PartidoDetailSheet con mapa del campo
// ============================================================
class _MatchCard extends StatelessWidget {
  final Map<String, dynamic> fixture;

  const _MatchCard({required this.fixture});

  bool get _isOurMatch {
    final home = (fixture['home_team_name'] ?? '').toString().toLowerCase();
    final away = (fixture['away_team_name'] ?? '').toString().toLowerCase();
    return home.contains('san marcelino') || away.contains('san marcelino');
  }

  bool get _isPlayed =>
      fixture['home_goals'] != null && fixture['away_goals'] != null;

  String _simplify(String name) {
    name = name
        .replaceAll("'A'", '').replaceAll("'B'", '').replaceAll("'C'", '').trim()
        .replaceAll('C.D.', '').replaceAll('C.F.', '').replaceAll('U.D.', '')
        .replaceAll('F.B.C.D.', '').replaceAll('F.B.U.E.', '')
        .replaceAll('Col.', '').replaceAll('Fundació VCF', 'VCF').trim();
    if (name.length > 16) name = '${name.substring(0, 14)}..';
    return name;
  }

  @override
  Widget build(BuildContext context) {
    final homeGoals = fixture['home_goals'];
    final awayGoals = fixture['away_goals'];
    final homeName = fixture['home_team_name'] ?? '?';
    final awayName = fixture['away_team_name'] ?? '?';
    final homeSimple = _simplify(homeName);
    final awaySimple = _simplify(awayName);

    // Colores de equipo desde los datos de campos
    final homeCampo = getCampoForTeam(homeName);
    final awayCampo = getCampoForTeam(awayName);

    bool? smWon;
    if (_isOurMatch && _isPlayed) {
      final smIsHome = homeName.contains('San Marcelino');
      final smGoals = smIsHome ? homeGoals : awayGoals;
      final rivalGoals = smIsHome ? awayGoals : homeGoals;
      if (smGoals > rivalGoals) smWon = true;
      if (smGoals < rivalGoals) smWon = false;
    }

    Color borderColor = _isOurMatch
        ? (_isPlayed
            ? (smWon == null ? Colors.amber : (smWon == true ? Colors.greenAccent : Colors.redAccent))
            : Colors.amber)
        : Colors.white12;

    // Formatear hora
    String? hora;
    if (fixture['match_date'] != null) {
      try {
        final dt = DateTime.parse(fixture['match_date'].toString());
        hora = '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
      } catch (_) {}
    }

    return GestureDetector(
      onTap: () => showModalBottomSheet(
        context: context,
        isScrollControlled: true,
        backgroundColor: Colors.transparent,
        builder: (_) => PartidoDetailSheet(fixture: fixture),
      ),
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        decoration: BoxDecoration(
          color: _isOurMatch ? const Color(0xFF1A1C38) : const Color(0xFF13152A),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: borderColor, width: _isOurMatch ? 2 : 1),
          boxShadow: _isOurMatch
              ? [BoxShadow(color: borderColor.withValues(alpha: 0.2), blurRadius: 8)]
              : [],
        ),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
          child: Row(
            children: [
              // Equipo local
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    TeamBadgeInline(
                      name: homeName,
                      color: homeCampo?.color ?? Colors.white24,
                      isOurs: homeName.contains('San Marcelino'),
                      size: 38,
                    ),
                    const SizedBox(height: 5),
                    Text(homeSimple,
                        maxLines: 2,
                        textAlign: TextAlign.right,
                        style: GoogleFonts.roboto(
                          color: homeName.contains('San Marcelino') ? Colors.amber : Colors.white,
                          fontSize: 11,
                          fontWeight: homeName.contains('San Marcelino') ? FontWeight.bold : FontWeight.w400,
                        )),
                  ],
                ),
              ),

              // Marcador / VS + hora
              Container(
                margin: const EdgeInsets.symmetric(horizontal: 10),
                child: Column(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                      decoration: BoxDecoration(
                        color: _isPlayed ? Colors.white.withValues(alpha: 0.06) : Colors.transparent,
                        borderRadius: BorderRadius.circular(10),
                        border: Border.all(color: Colors.white12),
                      ),
                      child: _isPlayed
                          ? Text('$homeGoals - $awayGoals',
                              style: GoogleFonts.oswald(
                                  color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold))
                          : Text('VS',
                              style: GoogleFonts.oswald(
                                  color: Colors.white30, fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                    if (hora != null && !_isPlayed) ...[
                      const SizedBox(height: 4),
                      Text(hora, style: GoogleFonts.roboto(color: Colors.white24, fontSize: 10)),
                    ],
                    // Indicador tap
                    const SizedBox(height: 4),
                    Icon(Icons.touch_app, color: Colors.white12, size: 12),
                  ],
                ),
              ),

              // Equipo visitante
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    TeamBadgeInline(
                      name: awayName,
                      color: awayCampo?.color ?? Colors.white24,
                      isOurs: awayName.contains('San Marcelino'),
                      size: 38,
                    ),
                    const SizedBox(height: 5),
                    Text(awaySimple,
                        maxLines: 2,
                        style: GoogleFonts.roboto(
                          color: awayName.contains('San Marcelino') ? Colors.amber : Colors.white,
                          fontSize: 11,
                          fontWeight: awayName.contains('San Marcelino') ? FontWeight.bold : FontWeight.w400,
                        )),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// Badge inline (usa la lógica de partido_detail_screen)
class TeamBadgeInline extends StatelessWidget {
  final String name;
  final Color color;
  final bool isOurs;
  final double size;

  const TeamBadgeInline({super.key, required this.name, required this.color, required this.isOurs, required this.size});

  String get _initials {
    final words = name
        .replaceAll(RegExp(r"['\.]"), '')
        .replaceAll(RegExp(r"C[FD]|UD|FB"), '')
        .split(' ')
        .where((w) => w.length > 1 && !RegExp(r'^[ABCabc]$').hasMatch(w))
        .toList();
    if (words.isEmpty) return '?';
    if (words.length == 1) return words[0].substring(0, min(2, words[0].length)).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  int min(int a, int b) => a < b ? a : b;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size, height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withValues(alpha: isOurs ? 0.2 : 0.1),
        border: Border.all(
          color: isOurs ? Colors.amber : color.withValues(alpha: 0.5),
          width: isOurs ? 2 : 1.5,
        ),
        boxShadow: isOurs ? [BoxShadow(color: Colors.amber.withValues(alpha: 0.25), blurRadius: 6)] : [],
      ),
      child: Center(
        child: Text(
          _initials,
          style: GoogleFonts.oswald(
            color: isOurs ? Colors.amber : color,
            fontSize: size * 0.3,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  }
}

// ============================================================
// CUSTOM PAINTER: Líneas de campo en el header
// ============================================================
class _PitchLinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.04)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    canvas.drawLine(Offset(0, size.height * 0.6), Offset(size.width, size.height * 0.6), paint);
    canvas.drawCircle(Offset(size.width * 0.5, size.height * 0.6), 50, paint);
    canvas.drawRect(
      Rect.fromCenter(center: Offset(size.width * 0.5, size.height + 30), width: 180, height: 100),
      paint,
    );
  }

  @override
  bool shouldRepaint(_) => false;
}
