import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:url_launcher/url_launcher.dart';

// ============================================================
// PARTIDO DETAIL SCREEN
// ============================================================
// Pantalla de detalle al pinchar en una tarjeta de partido.
// Muestra: equipos, resultado, campo del partido y mapa.
// Se abre como un Modal Bottom Sheet premium desde _MatchCard.
// ============================================================

/// Datos de los campos de los 13 equipos del Grup.-4.
/// Fuente: FFCV + Google Maps verificado.
const Map<String, _CampoData> kCamposGrup4 = {
  'san marcelino': _CampoData(
    nombre: 'Campo de Fútbol San Marcelino',
    direccion: 'C. de l\'Escultor Josep Esteve, 11, 46026 Valencia',
    lat: 39.4516,
    lng: -0.3621,
    municipio: 'Valencia',
    color: Color(0xFFFFB300),
  ),
  'fundació vcf': _CampoData(
    nombre: 'Ciudad Deportiva VCF - Campo F8',
    direccion: 'Av. dels Tarongers, s/n, 46022 Valencia',
    lat: 39.4765,
    lng: -0.3582,
    municipio: 'Valencia',
    color: Color(0xFF0A3D62),
  ),
  'alzira': _CampoData(
    nombre: 'Camp Nou d\'Alzira',
    direccion: 'Av. del Mediterrani, 46600 Alzira, Valencia',
    lat: 39.1538,
    lng: -0.4317,
    municipio: 'Alzira',
    color: Color(0xFF1ABC9C),
  ),
  'catarroja': _CampoData(
    nombre: 'Camp Municipal de Fútbol Catarroja',
    direccion: 'Carrer de l\'Esport, 46470 Catarroja',
    lat: 39.4017,
    lng: -0.4028,
    municipio: 'Catarroja',
    color: Color(0xFFE74C3C),
  ),
  'torrent': _CampoData(
    nombre: 'Poliesportiu Municipal de Torrent',
    direccion: 'Av. al Vedat, 46900 Torrent',
    lat: 39.4347,
    lng: -0.4639,
    municipio: 'Torrent',
    color: Color(0xFF8E44AD),
  ),
  'picassent': _CampoData(
    nombre: 'Polideportivo Municipal de Picassent - Campo F8',
    direccion: 'Pol. Ind. Picassent, 46220 Picassent',
    lat: 39.3602,
    lng: -0.4611,
    municipio: 'Picassent',
    color: Color(0xFF2ECC71),
  ),
  'monte-sión': _CampoData(
    nombre: 'Camp Municipal Monte-Sión',
    direccion: 'C. de la Pilota, s/n, Valencia',
    lat: 39.4645,
    lng: -0.3739,
    municipio: 'Valencia',
    color: Color(0xFF3498DB),
  ),
  'benetússer': _CampoData(
    nombre: 'Camp Municipal de Benetússer',
    direccion: 'Carrer de Jorge Juan, 46910 Benetússer',
    lat: 39.4196,
    lng: -0.3912,
    municipio: 'Benetússer',
    color: Color(0xFFE67E22),
  ),
  'amistat': _CampoData(
    nombre: 'Camp Municipal Atlètic Amistat',
    direccion: 'Carrer de les Germanies, Valencia',
    lat: 39.4550,
    lng: -0.3680,
    municipio: 'Valencia',
    color: Color(0xFF16A085),
  ),
  'xirivella': _CampoData(
    nombre: 'Poliesportiu Municipal de Xirivella',
    direccion: 'Carrer dels Esports, 46950 Xirivella',
    lat: 39.4618,
    lng: -0.4169,
    municipio: 'Xirivella',
    color: Color(0xFFC0392B),
  ),
  'salgui': _CampoData(
    nombre: 'Camp Col·legi Salgui',
    direccion: 'Carrer del Músic Asensi, Valencia',
    lat: 39.4880,
    lng: -0.3700,
    municipio: 'Valencia',
    color: Color(0xFF7F8C8D),
  ),
  'don bosco': _CampoData(
    nombre: 'Camp Col·legi Don Bosco',
    direccion: 'Carrer del Pintor Gisbert, 46007 Valencia',
    lat: 39.4713,
    lng: -0.3842,
    municipio: 'Valencia',
    color: Color(0xFF2C3E50),
  ),
  'ciutat de valència': _CampoData(
    nombre: 'Camp CFB Ciutat de València',
    direccion: 'Av. de Campanar, 46015 Valencia',
    lat: 39.4884,
    lng: -0.3958,
    municipio: 'Valencia',
    color: Color(0xFF27AE60),
  ),
};

class _CampoData {
  final String nombre;
  final String direccion;
  final double lat;
  final double lng;
  final String municipio;
  final Color color;

  const _CampoData({
    required this.nombre,
    required this.direccion,
    required this.lat,
    required this.lng,
    required this.municipio,
    required this.color,
  });
}

/// Función helper para obtener datos del campo según nombre de equipo
_CampoData? getCampoForTeam(String teamName) {
  final name = teamName.toLowerCase();
  for (final key in kCamposGrup4.keys) {
    if (name.contains(key)) return kCamposGrup4[key];
  }
  return null;
}

// ============================================================
// MODAL de Detalle de Partido
// ============================================================
class PartidoDetailSheet extends StatelessWidget {
  final Map<String, dynamic> fixture;

  const PartidoDetailSheet({super.key, required this.fixture});

  /// Abrir en Google Maps
  Future<void> _abrirMapa(double lat, double lng, String nombre) async {
    final uri = Uri.parse(
      'https://www.google.com/maps/search/?api=1&query=$lat,$lng&query_place_id=${Uri.encodeComponent(nombre)}',
    );
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    }
  }

  String _simplifyName(String name) {
    name = name
        .replaceAll("'A'", '').replaceAll("'B'", '').replaceAll("'C'", '')
        .replaceAll('C.D.', '').replaceAll('C.F.', '').replaceAll('U.D.', '')
        .replaceAll('F.B.C.D.', '').replaceAll('F.B.U.E.', '').replaceAll('Col.', '')
        .replaceAll('Fundació VCF', 'VCF').trim();
    return name;
  }

  @override
  Widget build(BuildContext context) {
    final homeTeam = fixture['home_team_name'] ?? '?';
    final awayTeam = fixture['away_team_name'] ?? '?';
    final homeGoals = fixture['home_goals'];
    final awayGoals = fixture['away_goals'];
    final isPlayed = homeGoals != null && awayGoals != null;
    final jornada = fixture['jornada'] ?? '?';
    final matchDate = fixture['match_date'];

    final isSanMarcHome = homeTeam.toLowerCase().contains('san marcelino');
    final isSanMarcAway = awayTeam.toLowerCase().contains('san marcelino');
    final isSanMarcMatch = isSanMarcHome || isSanMarcAway;

    // Campo: el partido se juega en casa del equipo local
    final campo = getCampoForTeam(homeTeam);

    // Resultado para San Marcelino
    bool? smWon;
    if (isSanMarcMatch && isPlayed) {
      final smGoals = isSanMarcHome ? homeGoals : awayGoals;
      final rivalGoals = isSanMarcHome ? awayGoals : homeGoals;
      if (smGoals > rivalGoals) smWon = true;
      if (smGoals < rivalGoals) smWon = false;
    }

    final borderColor = isSanMarcMatch
        ? (isPlayed
            ? (smWon == null ? Colors.amber : (smWon == true ? Colors.greenAccent : Colors.redAccent))
            : Colors.amber)
        : Colors.white24;

    return Container(
      decoration: const BoxDecoration(
        color: Color(0xFF0D1128),
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Handle
          Container(
            margin: const EdgeInsets.only(top: 12),
            width: 40, height: 4,
            decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2)),
          ),

          // Header: Jornada
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 16, 20, 0),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('JORNADA $jornada',
                    style: GoogleFonts.oswald(color: Colors.amber.withValues(alpha: 0.7), fontSize: 12, letterSpacing: 2)),
                if (matchDate != null)
                  Text(
                    _formatDate(matchDate.toString()),
                    style: GoogleFonts.roboto(color: Colors.white38, fontSize: 12),
                  ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Marcador principal
          Container(
            margin: const EdgeInsets.symmetric(horizontal: 20),
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF1A1C38),
              borderRadius: BorderRadius.circular(18),
              border: Border.all(color: borderColor, width: 2),
              boxShadow: [BoxShadow(color: borderColor.withValues(alpha: 0.25), blurRadius: 16, spreadRadius: 2)],
            ),
            child: Row(
              children: [
                // Equipo Local
                Expanded(
                  child: Column(
                    children: [
                      _TeamBadge(
                        name: homeTeam,
                        color: campo?.color ?? Colors.white24,
                        isOurs: isSanMarcHome,
                        size: 52,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _simplifyName(homeTeam),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        style: GoogleFonts.roboto(
                          color: isSanMarcHome ? Colors.amber : Colors.white,
                          fontSize: 13,
                          fontWeight: isSanMarcHome ? FontWeight.bold : FontWeight.w400,
                        ),
                      ),
                      if (isSanMarcHome)
                        Container(
                          margin: const EdgeInsets.only(top: 4),
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: Colors.amber, borderRadius: BorderRadius.circular(4)),
                          child: Text('LOCAL', style: GoogleFonts.oswald(color: Colors.black, fontSize: 9, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                ),

                // Resultado
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  decoration: BoxDecoration(
                    color: Colors.black26,
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: isPlayed
                      ? Column(
                          children: [
                            Text(
                              '$homeGoals - $awayGoals',
                              style: GoogleFonts.oswald(
                                color: Colors.white,
                                fontSize: 28,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (isSanMarcMatch)
                              Container(
                                margin: const EdgeInsets.only(top: 4),
                                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                                decoration: BoxDecoration(
                                  color: smWon == null
                                      ? Colors.amber.withValues(alpha: 0.2)
                                      : smWon == true
                                          ? Colors.green.withValues(alpha: 0.2)
                                          : Colors.red.withValues(alpha: 0.2),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(
                                  smWon == null ? 'EMPATE' : smWon == true ? '¡VICTORIA!' : 'DERROTA',
                                  style: GoogleFonts.oswald(
                                    color: smWon == null ? Colors.amber : smWon == true ? Colors.greenAccent : Colors.redAccent,
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                          ],
                        )
                      : Text(
                          'VS',
                          style: GoogleFonts.oswald(color: Colors.white30, fontSize: 22, fontWeight: FontWeight.bold),
                        ),
                ),

                // Equipo Visitante
                Expanded(
                  child: Column(
                    children: [
                      _TeamBadge(
                        name: awayTeam,
                        color: getCampoForTeam(awayTeam)?.color ?? Colors.white24,
                        isOurs: isSanMarcAway,
                        size: 52,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        _simplifyName(awayTeam),
                        textAlign: TextAlign.center,
                        maxLines: 2,
                        style: GoogleFonts.roboto(
                          color: isSanMarcAway ? Colors.amber : Colors.white,
                          fontSize: 13,
                          fontWeight: isSanMarcAway ? FontWeight.bold : FontWeight.w400,
                        ),
                      ),
                      if (isSanMarcAway)
                        Container(
                          margin: const EdgeInsets.only(top: 4),
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(color: Colors.amber, borderRadius: BorderRadius.circular(4)),
                          child: Text('VISITA', style: GoogleFonts.oswald(color: Colors.black, fontSize: 9, fontWeight: FontWeight.bold)),
                        ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          const SizedBox(height: 16),

          // Campo del partido
          if (campo != null)
            Container(
              margin: const EdgeInsets.symmetric(horizontal: 20),
              decoration: BoxDecoration(
                color: const Color(0xFF1A1C38),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.white10),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Info del campo
                  Padding(
                    padding: const EdgeInsets.fromLTRB(16, 14, 16, 10),
                    child: Row(
                      children: [
                        Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: campo.color.withValues(alpha: 0.15),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Icon(Icons.stadium_rounded, color: campo.color, size: 22),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(campo.nombre,
                                  style: GoogleFonts.roboto(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 13)),
                              const SizedBox(height: 2),
                              Text(campo.direccion,
                                  style: GoogleFonts.roboto(color: Colors.white38, fontSize: 11)),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),

                  // Mapa estático (preview con gradiente) + botón
                  GestureDetector(
                    onTap: () => _abrirMapa(campo.lat, campo.lng, campo.nombre),
                    child: Container(
                      height: 130,
                      margin: const EdgeInsets.fromLTRB(12, 0, 12, 12),
                      decoration: BoxDecoration(
                        borderRadius: BorderRadius.circular(12),
                        gradient: LinearGradient(
                          begin: Alignment.topLeft,
                          end: Alignment.bottomRight,
                          colors: [
                            campo.color.withValues(alpha: 0.3),
                            Colors.black54,
                          ],
                        ),
                        border: Border.all(color: campo.color.withValues(alpha: 0.4)),
                        image: const DecorationImage(
                          image: NetworkImage('https://maps.googleapis.com/maps/api/staticmap?zoom=14&size=400x130&maptype=roadmap&style=element:geometry|color:0x1a1c38&style=element:labels.text.fill|color:0xffffff'),
                          fit: BoxFit.cover,
                          opacity: 0.3,
                        ),
                      ),
                      child: Stack(
                        children: [
                          // Grid de calles (decorativo)
                          ...List.generate(4, (i) => Positioned(
                            left: 0, right: 0, top: i * 32.0,
                            child: Container(height: 1, color: Colors.white.withValues(alpha: 0.05)),
                          )),
                          ...List.generate(6, (i) => Positioned(
                            top: 0, bottom: 0, left: i * 60.0,
                            child: Container(width: 1, color: Colors.white.withValues(alpha: 0.05)),
                          )),
                          // Pin del campo
                          Center(
                            child: Column(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(10),
                                  decoration: BoxDecoration(
                                    color: campo.color,
                                    shape: BoxShape.circle,
                                    boxShadow: [BoxShadow(color: campo.color.withValues(alpha: 0.6), blurRadius: 12, spreadRadius: 2)],
                                  ),
                                  child: const Icon(Icons.place, color: Colors.white, size: 22),
                                ),
                                const SizedBox(height: 4),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.black87,
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: Text(campo.municipio,
                                      style: GoogleFonts.roboto(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                                ),
                              ],
                            ),
                          ),
                          // Botón de abrir Maps
                          Positioned(
                            bottom: 8, right: 8,
                            child: Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                              decoration: BoxDecoration(
                                color: campo.color,
                                borderRadius: BorderRadius.circular(20),
                              ),
                              child: Row(
                                mainAxisSize: MainAxisSize.min,
                                children: [
                                  const Icon(Icons.directions, color: Colors.white, size: 14),
                                  const SizedBox(width: 4),
                                  Text('Cómo llegar',
                                      style: GoogleFonts.roboto(color: Colors.white, fontSize: 11, fontWeight: FontWeight.bold)),
                                ],
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            )
          else
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white.withValues(alpha: 0.04),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.info_outline, color: Colors.white38, size: 18),
                    const SizedBox(width: 8),
                    Text('Campo por confirmar', style: GoogleFonts.roboto(color: Colors.white38, fontSize: 13)),
                  ],
                ),
              ),
            ),

          const SizedBox(height: 24),
        ],
      ),
    );
  }

  String _formatDate(String iso) {
    try {
      final dt = DateTime.parse(iso);
      const meses = ['', 'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
      const dias = ['', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
      final hora = '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
      return '${dias[dt.weekday]} ${dt.day} ${meses[dt.month]} · $hora';
    } catch (_) {
      return iso;
    }
  }
}

// ── Badge de equipo con iniciales coloreadas ─────────────────
class _TeamBadge extends StatelessWidget {
  final String name;
  final Color color;
  final bool isOurs;
  final double size;

  const _TeamBadge({required this.name, required this.color, required this.isOurs, required this.size});

  String get _initials {
    final words = name.replaceAll(RegExp(r"['\.]"), '').split(' ').where((w) => w.length > 1).toList();
    if (words.isEmpty) return '?';
    if (words.length == 1) return words[0].substring(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color.withValues(alpha: 0.15),
        border: Border.all(
          color: isOurs ? Colors.amber : color.withValues(alpha: 0.5),
          width: isOurs ? 2.5 : 1.5,
        ),
        boxShadow: isOurs
            ? [BoxShadow(color: Colors.amber.withValues(alpha: 0.3), blurRadius: 8)]
            : [],
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
