import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'ffcv_standings_screen.dart';
import 'ffcv_league_teams_screen.dart';
import 'san_marcelino_hub_screen.dart';

// ============================================================
// LIGA HUB PREMIUM - Pantalla principal de la Liga del Grup-4
// Diferenciadores vs otras apps:
// • Jornadas visuales con resultados en tiempo real de la FFCV
// • Clasificación animada estilo EA FC con racha de resultados
// • Plantillas de 13 equipos con fotos de jugadores
// • Hub exclusivo San Marcelino con registro de goles
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
  bool _showUpdateBanner = false; // Banner de "Resultado actualizado"

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 4, vsync: this);
    _loadData();
    _subscribeToRealtime(); // ⚡ Escuchar cambios en vivo
  }

  /// Suscripción Realtime: cuando la Edge Function actualiza un resultado,
  /// la app lo recibe instantáneamente y recarga los datos.
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
            debugPrint('Realtime: resultado actualizado -> ${payload.newRecord}');
            if (mounted) {
              setState(() => _showUpdateBanner = true);
              _loadData(); // Recargar datos silenciosamente
              // Ocultar el banner después de 4 segundos
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
    _realtimeChannel?.unsubscribe(); // ⚡ Limpiar suscripción
    super.dispose();
  }

  Future<void> _loadData() async {
    try {
      final fixtures = await _supabase
          .from('ffcv_fixtures')
          .select()
          .eq('id_torneo', '904327882')
          .order('jornada, match_date');

      final standings = await _supabase
          .from('ffcv_standings')
          .select()
          .eq('id_torneo', '904327882')
          .order('position');

      // Calcular jornada más reciente
      int maxJornada = 1;
      for (var f in fixtures) {
        final j = (f['jornada'] as int?) ?? 0;
        if (j > maxJornada) maxJornada = j;
      }

      if (mounted) {
        setState(() {
          _allFixtures = List<Map<String, dynamic>>.from(fixtures);
          _standings = List<Map<String, dynamic>>.from(standings);
          _currentJornada = maxJornada;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error LigaHub: $e');
      setState(() => _isLoading = false);
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
                      const SanMarcelinoHubScreen(),
                    ],
                  ),
                ),
                // Banner de actualización en tiempo real
                if (_showUpdateBanner)
                  Positioned(
                    top: 0,
                    left: 0,
                    right: 0,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 300),
                      color: Colors.green.withValues(alpha: 0.95),
                      padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 16),
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          const Icon(Icons.sports_soccer, color: Colors.white, size: 18),
                          const SizedBox(width: 8),
                          Text(
                            '⚽ Resultado actualizado desde la FFCV',
                            style: GoogleFonts.oswald(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                        ],
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
              // Fondo con patrón de cancha
              Positioned.fill(
                child: CustomPaint(painter: _PitchLinePainter()),
              ),
              // Contenido del header
              Padding(
                padding: const EdgeInsets.fromLTRB(20, 50, 20, 0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.amber,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text('GRUP.-4',
                              style: GoogleFonts.oswald(
                                  color: Colors.black, fontWeight: FontWeight.bold, fontSize: 11)),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: Colors.white12,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: Text('MASCULI F8',
                              style: GoogleFonts.roboto(color: Colors.white54, fontSize: 11)),
                        ),
                      ],
                    ),
                    const SizedBox(height: 8),
                    Text('PRIMERA FFCV',
                        style: GoogleFonts.oswald(
                            color: Colors.white, fontWeight: FontWeight.bold, fontSize: 26)),
                    Text('Benjamí 2n. any · Valencia',
                        style: GoogleFonts.roboto(color: Colors.white54, fontSize: 13)),
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
        labelStyle: GoogleFonts.oswald(fontWeight: FontWeight.bold, fontSize: 12),
        isScrollable: false,
        tabs: const [
          Tab(icon: Icon(Icons.calendar_today, size: 18), text: 'Jornadas'),
          Tab(icon: Icon(Icons.format_list_numbered, size: 18), text: 'Liga'),
          Tab(icon: Icon(Icons.groups, size: 18), text: 'Equipos'),
          Tab(icon: Icon(Icons.star, size: 18), text: 'San Marc.'),
        ],
      ),
    );
  }
}

// ============================================================
// TAB 1: JORNADAS - El Diferenciador Principal
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

  List<Map<String, dynamic>> _fixturesForJornada(int jornada) {
    return widget.allFixtures.where((f) => f['jornada'] == jornada).toList();
  }

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
    if (jornadas.isEmpty) return const Center(child: Text('Sin datos',style: TextStyle(color: Colors.white38)));

    return Column(
      children: [
        // Selector de Jornada con scroll horizontal (estilo pastilla)
        SizedBox(
          height: 48,
          child: ListView.builder(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
            itemCount: jornadas.length,
            itemBuilder: (_, i) {
              final j = jornadas[i];
              final isSelected = j == _selectedJornada;
              return GestureDetector(
                onTap: () {
                  setState(() => _selectedJornada = j);
                  _pageController.animateToPage(
                    j - 1,
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                  );
                },
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 200),
                  margin: const EdgeInsets.only(right: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
                  decoration: BoxDecoration(
                    color: isSelected ? Colors.amber : Colors.white10,
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    'J$j',
                    style: GoogleFonts.oswald(
                      color: isSelected ? Colors.black : Colors.white54,
                      fontWeight: FontWeight.bold,
                      fontSize: 14,
                    ),
                  ),
                ),
              );
            },
          ),
        ),

        // Vista deslizable de partidos (PageView entre jornadas)
        Expanded(
          child: PageView.builder(
            controller: _pageController,
            itemCount: jornadas.isEmpty ? 1 : jornadas.last,
            onPageChanged: (index) {
              setState(() => _selectedJornada = index + 1);
            },
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
    return ListView(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 12),
          child: Center(
            child: Text(
              'JORNADA $jornada',
              style: GoogleFonts.oswald(
                color: Colors.amber.withValues(alpha: 0.6),
                fontSize: 13,
                letterSpacing: 3,
              ),
            ),
          ),
        ),
        if (fixtures.isEmpty)
          Center(
            child: Text('Sin partidos en esta jornada',
                style: GoogleFonts.roboto(color: Colors.white24)),
          )
        else
          ...fixtures.map((f) => _MatchCard(fixture: f)),
        const SizedBox(height: 20),
      ],
    );
  }
}

// ============================================================
// WIDGET: Tarjeta de Partido Premium (diferenciador clave)
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

  String _abbrev(String name) {
    // Acortar nombre del equipo para mostrar en la tarjeta
    name = name.replaceAll("'A'", '').replaceAll("'B'", '').replaceAll("'C'", '').trim();
    if (name.startsWith('C.D.')) name = name.replaceFirst('C.D.', '').trim();
    if (name.startsWith('C.F.')) name = name.replaceFirst('C.F.', '').trim();
    if (name.startsWith('U.D.')) name = name.replaceFirst('U.D.', '').trim();
    if (name.startsWith('F.B.')) name = name.replaceFirst(RegExp(r'F\.B\.[A-Z]+\. '), '').trim();
    if (name.startsWith('Col.')) name = name.replaceFirst('Col.', '').trim();
    if (name.length > 18) name = '${name.substring(0, 16)}...';
    return name;
  }

  @override
  Widget build(BuildContext context) {
    final homeGoals = fixture['home_goals'];
    final awayGoals = fixture['away_goals'];
    final home = _abbrev(fixture['home_team_name'] ?? '?');
    final away = _abbrev(fixture['away_team_name'] ?? '?');

    // Calcular resultado para San Marcelino
    bool? smWon;
    if (_isOurMatch && _isPlayed) {
      final isSanMarcHome = (fixture['home_team_name'] ?? '').contains('San Marcelino');
      if (isSanMarcHome) {
        smWon = homeGoals > awayGoals;
        if (homeGoals == awayGoals) smWon = null;
      } else {
        smWon = awayGoals > homeGoals;
        if (homeGoals == awayGoals) smWon = null;
      }
    }

    Color borderColor = _isOurMatch
        ? (_isPlayed
            ? (smWon == null ? Colors.amber : (smWon ? Colors.greenAccent : Colors.redAccent))
            : Colors.amber)
        : Colors.white12;

    return Container(
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
        padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        child: Row(
          children: [
            // Equipo Local
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: (fixture['home_team_name'] ?? '').contains('San Marcelino')
                          ? Colors.amber.withValues(alpha: 0.15)
                          : Colors.white10,
                    ),
                    child: Icon(Icons.shield,
                        color: (fixture['home_team_name'] ?? '').contains('San Marcelino')
                            ? Colors.amber
                            : Colors.white24,
                        size: 20),
                  ),
                  const SizedBox(height: 4),
                  Text(home,
                      maxLines: 2,
                      textAlign: TextAlign.right,
                      style: GoogleFonts.roboto(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: (fixture['home_team_name'] ?? '').contains('San Marcelino')
                              ? FontWeight.bold
                              : FontWeight.w400)),
                ],
              ),
            ),

            // Marcador o Vs
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 12),
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
              decoration: BoxDecoration(
                color: _isPlayed ? Colors.white.withValues(alpha: 0.06) : Colors.transparent,
                borderRadius: BorderRadius.circular(10),
                border: Border.all(color: Colors.white12),
              ),
              child: _isPlayed
                  ? Text(
                      '$homeGoals - $awayGoals',
                      style: GoogleFonts.oswald(
                          color: Colors.white, fontSize: 22, fontWeight: FontWeight.bold),
                    )
                  : Text(
                      'VS',
                      style: GoogleFonts.oswald(
                          color: Colors.white30, fontSize: 16, fontWeight: FontWeight.bold),
                    ),
            ),

            // Equipo Visitante
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    width: 36, height: 36,
                    decoration: BoxDecoration(
                      shape: BoxShape.circle,
                      color: (fixture['away_team_name'] ?? '').contains('San Marcelino')
                          ? Colors.amber.withValues(alpha: 0.15)
                          : Colors.white10,
                    ),
                    child: Icon(Icons.shield,
                        color: (fixture['away_team_name'] ?? '').contains('San Marcelino')
                            ? Colors.amber
                            : Colors.white24,
                        size: 20),
                  ),
                  const SizedBox(height: 4),
                  Text(away,
                      maxLines: 2,
                      style: GoogleFonts.roboto(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: (fixture['away_team_name'] ?? '').contains('San Marcelino')
                              ? FontWeight.bold
                              : FontWeight.w400)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ============================================================
// CUSTOM PAINTER: Líneas de Cancha para el Header
// ============================================================
class _PitchLinePainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = Colors.white.withValues(alpha: 0.04)
      ..strokeWidth = 1.5
      ..style = PaintingStyle.stroke;

    // Centro
    canvas.drawLine(
      Offset(0, size.height * 0.6),
      Offset(size.width, size.height * 0.6),
      paint,
    );

    // Círculo central
    canvas.drawCircle(
      Offset(size.width * 0.5, size.height * 0.6),
      50,
      paint,
    );

    // Área
    canvas.drawRect(
      Rect.fromCenter(
        center: Offset(size.width * 0.5, size.height + 30),
        width: 180,
        height: 100,
      ),
      paint,
    );
  }

  @override
  bool shouldRepaint(_) => false;
}
