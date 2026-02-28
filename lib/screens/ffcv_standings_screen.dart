import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../services/ffcv_service.dart';

class FfcvStandingsScreen extends StatefulWidget {
  /// Nombre de nuestro equipo en la FFCV para resaltarlo en la tabla
  final String ourTeamName;

  const FfcvStandingsScreen({
    super.key,
    this.ourTeamName = '',
  });

  @override
  State<FfcvStandingsScreen> createState() => _FfcvStandingsScreenState();
}

class _FfcvStandingsScreenState extends State<FfcvStandingsScreen>
    with SingleTickerProviderStateMixin {
  final FfcvService _ffcvService = FfcvService();
  List<FfcvStandingEntry> _standings = [];
  bool _isLoading = true;
  bool _isRefreshing = false;
  late AnimationController _shimmerController;

  @override
  void initState() {
    super.initState();
    _shimmerController = AnimationController(
      vsync: this,
      duration: const Duration(seconds: 2),
    )..repeat();
    _loadStandings();
  }

  @override
  void dispose() {
    _shimmerController.dispose();
    super.dispose();
  }

  Future<void> _loadStandings({bool forceRefresh = false}) async {
    setState(() {
      if (forceRefresh) _isRefreshing = true;
      else _isLoading = true;
    });
    
    final data = await _ffcvService.getStandings(forceRefresh: forceRefresh);
    
    if (mounted) {
      setState(() {
        _standings = data;
        _isLoading = false;
        _isRefreshing = false;
      });
    }
  }

  bool _isOurTeam(String teamName) {
    if (widget.ourTeamName.isEmpty) return false;
    return teamName.toLowerCase().contains(widget.ourTeamName.toLowerCase());
  }

  Color _getPositionColor(int position) {
    if (position == 1) return const Color(0xFFFFD700); // Oro - Campeón
    if (position <= 3) return const Color(0xFF4CAF50); // Verde - Ascenso
    if (position >= _standings.length - 1) return const Color(0xFFE53935); // Rojo - Descenso
    return Colors.transparent;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.center,
          children: [
            Text(
              'CLASIFICACIÓN',
              style: GoogleFonts.oswald(
                color: Colors.amber,
                fontWeight: FontWeight.bold,
                fontSize: 20,
                letterSpacing: 2,
              ),
            ),
            Text(
              'Primera FFCV Benjamí · Grup 4',
              style: GoogleFonts.roboto(color: Colors.white54, fontSize: 11),
            ),
          ],
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: _isRefreshing
                ? const SizedBox(
                    width: 18,
                    height: 18,
                    child: CircularProgressIndicator(color: Colors.amber, strokeWidth: 2))
                : const Icon(Icons.refresh, color: Colors.white70),
            onPressed: () => _loadStandings(forceRefresh: true),
            tooltip: 'Actualizar desde FFCV',
          ),
        ],
      ),
      body: _isLoading
          ? _buildShimmerLoading()
          : _standings.isEmpty
              ? _buildEmptyState()
              : Column(
                  children: [
                    // Cabecera de columnas
                    _buildTableHeader(),
                    // Lista de equipos
                    Expanded(
                      child: RefreshIndicator(
                        onRefresh: () => _loadStandings(forceRefresh: true),
                        color: Colors.amber,
                        child: ListView.builder(
                          padding: const EdgeInsets.only(bottom: 20),
                          itemCount: _standings.length,
                          itemBuilder: (context, index) {
                            return _buildTeamRow(_standings[index]);
                          },
                        ),
                      ),
                    ),
                    // Fuente de datos
                    Padding(
                      padding: const EdgeInsets.all(8.0),
                      child: Text(
                        'Datos oficiales de la FFCV · resultadosffcv.isquad.es',
                        style: GoogleFonts.roboto(color: Colors.white24, fontSize: 10),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ],
                ),
    );
  }

  Widget _buildTableHeader() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      color: const Color(0xFF1D1E33),
      child: Row(
        children: [
          const SizedBox(width: 28), // Posición
          const SizedBox(width: 36), // Logo
          const Expanded(child: SizedBox()), // Nombre
          _buildHeaderText('PJ'),
          _buildHeaderText('V'),
          _buildHeaderText('E'),
          _buildHeaderText('D'),
          _buildHeaderText('DG'),
          _buildHeaderText('PTS', bold: true),
        ],
      ),
    );
  }

  Widget _buildHeaderText(String text, {bool bold = false}) {
    return SizedBox(
      width: 32,
      child: Text(
        text,
        textAlign: TextAlign.center,
        style: GoogleFonts.roboto(
          color: Colors.white38,
          fontSize: 11,
          fontWeight: bold ? FontWeight.bold : FontWeight.normal,
        ),
      ),
    );
  }

  Widget _buildTeamRow(FfcvStandingEntry entry) {
    final isUs = _isOurTeam(entry.teamName);
    final posColor = _getPositionColor(entry.position);

    return AnimatedContainer(
      duration: const Duration(milliseconds: 300),
      margin: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      decoration: BoxDecoration(
        color: isUs ? Colors.amber.withValues(alpha: 0.08) : Colors.transparent,
        borderRadius: BorderRadius.circular(10),
        border: isUs
            ? Border.all(color: Colors.amber, width: 1.5)
            : Border.all(color: Colors.white10, width: 0.5),
      ),
      child: IntrinsicHeight(
        child: Row(
          children: [
            // Barra de color indicadora (Posición)
            Container(
              width: 4,
              decoration: BoxDecoration(
                color: posColor,
                borderRadius: const BorderRadius.horizontal(left: Radius.circular(10)),
              ),
            ),
            const SizedBox(width: 6),

            // Número posición
            SizedBox(
              width: 22,
              child: Text(
                '${entry.position}',
                textAlign: TextAlign.center,
                style: GoogleFonts.oswald(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: isUs ? Colors.amber : Colors.white54,
                ),
              ),
            ),
            const SizedBox(width: 6),

            // Logo del equipo
            SizedBox(
              width: 32,
              height: 32,
              child: entry.logoUrl != null
                  ? CachedNetworkImage(
                      imageUrl: entry.logoUrl!,
                      fit: BoxFit.contain,
                      placeholder: (_, __) => const Icon(Icons.shield, color: Colors.white24, size: 22),
                      errorWidget: (_, __, ___) => const Icon(Icons.shield, color: Colors.white24, size: 22),
                    )
                  : const Icon(Icons.shield, color: Colors.white24, size: 22),
            ),
            const SizedBox(width: 8),

            // Nombre del equipo
            Expanded(
              child: Text(
                entry.teamName,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: GoogleFonts.roboto(
                  fontSize: 13,
                  fontWeight: isUs ? FontWeight.bold : FontWeight.w400,
                  color: isUs ? Colors.amber : Colors.white,
                ),
              ),
            ),

            // Estadísticas
            _buildStatCell('${entry.gamesPlayed}'),
            _buildStatCell('${entry.wins}', color: Colors.greenAccent.withValues(alpha: 0.7)),
            _buildStatCell('${entry.draws}', color: Colors.yellowAccent.withValues(alpha: 0.6)),
            _buildStatCell('${entry.losses}', color: Colors.redAccent.withValues(alpha: 0.7)),
            _buildStatCell('${entry.goalDifference}',
                color: entry.goalDifference > 0 ? Colors.greenAccent : Colors.redAccent),
            _buildStatCell(
              '${entry.points}',
              bold: true,
              color: isUs ? Colors.amber : Colors.white,
              size: 15,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatCell(String text,
      {Color? color, bool bold = false, double size = 13}) {
    return SizedBox(
      width: 32,
      height: 48,
      child: Center(
        child: Text(
          text,
          textAlign: TextAlign.center,
          style: GoogleFonts.oswald(
            fontSize: size,
            fontWeight: bold ? FontWeight.bold : FontWeight.w400,
            color: color ?? Colors.white70,
          ),
        ),
      ),
    );
  }

  Widget _buildShimmerLoading() {
    return ListView.builder(
      padding: const EdgeInsets.all(8),
      itemCount: 10,
      itemBuilder: (context, index) {
        return AnimatedBuilder(
          animation: _shimmerController,
          builder: (context, child) {
            return Container(
              margin: const EdgeInsets.symmetric(vertical: 3),
              height: 48,
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(10),
                gradient: LinearGradient(
                  begin: Alignment(-1 + _shimmerController.value * 2, 0),
                  end: Alignment(1 + _shimmerController.value * 2, 0),
                  colors: const [Color(0xFF1D1E33), Color(0xFF2D3050), Color(0xFF1D1E33)],
                ),
              ),
            );
          },
        );
      },
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const Icon(Icons.sports_soccer, size: 64, color: Colors.white24),
          const SizedBox(height: 16),
          Text(
            'No se pudo cargar la clasificación',
            style: GoogleFonts.oswald(color: Colors.white54, fontSize: 18),
          ),
          const SizedBox(height: 8),
          ElevatedButton.icon(
            onPressed: () => _loadStandings(forceRefresh: true),
            icon: const Icon(Icons.refresh),
            label: const Text('Reintentar'),
            style: ElevatedButton.styleFrom(backgroundColor: Colors.amber, foregroundColor: Colors.black),
          ),
        ],
      ),
    );
  }
}
