import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';

class PlayerCardWidget extends StatelessWidget {
  final Map<String, dynamic> profile;

  const PlayerCardWidget({super.key, required this.profile});

  @override
  Widget build(BuildContext context) {
    // Extraer estadisticas (Con valores por defecto para no romper si aún no existen)
    final int ovr = profile['overall_rating'] ?? 50;
    final String pos = profile['position'] ?? 'MID';
    final int pac = profile['stat_pace'] ?? 50;
    final int sho = profile['stat_shooting'] ?? 50;
    final int pas = profile['stat_passing'] ?? 50;
    final int dri = profile['stat_dribbling'] ?? 50;
    final int def = profile['stat_defending'] ?? 50;
    final int phy = profile['stat_physical'] ?? 50;
    
    final avatarUrl = profile['avatar_url'];
    final name = profile['full_name'] ?? 'Player';

    // Determinar el color base de la carta según el OVERALL
    Color cardColor;
    if (ovr >= 85) {
      cardColor = const Color(0xFFFFD700); // Dorado
    } else if (ovr >= 75) {
      cardColor = const Color(0xFFC0C0C0); // Plata
    } else {
      cardColor = const Color(0xFFCD7F32); // Bronce
    }

    return Container(
      width: 220,
      height: 340,
      decoration: BoxDecoration(
        color: const Color(0xFF111111),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: cardColor, width: 3),
        boxShadow: [
          BoxShadow(
            color: cardColor.withValues(alpha: 0.3),
            blurRadius: 15,
            spreadRadius: 2,
          )
        ],
        gradient: LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [
            const Color(0xFF1D1E33),
            const Color(0xFF0A0E21),
            cardColor.withValues(alpha: 0.1),
          ],
        ),
      ),
      child: Stack(
        children: [
          // Número Overall y Posición Top Left
          Positioned(
            top: 15,
            left: 15,
            child: Column(
              children: [
                Text(
                  ovr.toString(),
                  style: GoogleFonts.oswald(
                    fontSize: 38,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    height: 1.0,
                  ),
                ),
                Text(
                  pos,
                  style: GoogleFonts.oswald(
                    fontSize: 16,
                    fontWeight: FontWeight.bold,
                    color: cardColor,
                  ),
                ),
                const SizedBox(height: 8),
                // Banderita o Logo del Club aquí en el futuro
                const Icon(Icons.sports_soccer, color: Colors.white54, size: 24),
              ],
            ),
          ),

          // Foto del Jugador (Avatar grande sin padding)
          Positioned(
            top: 30,
            right: -10,
            bottom: 120, // Deja espacio para las stats
            left: 60,
            child: avatarUrl != null && avatarUrl.isNotEmpty
                ? CachedNetworkImage(
                    imageUrl: avatarUrl,
                    fit: BoxFit.contain,
                    alignment: Alignment.bottomRight,
                    errorWidget: (context, url, err) => 
                        const Icon(Icons.person, size: 100, color: Colors.white24),
                  )
                : const Icon(Icons.person, size: 120, color: Colors.white24),
          ),

          // Gradiente inferior para oscurecer la foto detrás del nombre
          Positioned(
            bottom: 0, left: 0, right: 0, height: 160,
            child: Container(
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  begin: Alignment.topCenter,
                  end: Alignment.bottomCenter,
                  colors: [Colors.transparent, Colors.black87, Colors.black],
                ),
              ),
            ),
          ),

          // Nombre y Línea
          Positioned(
            bottom: 105,
            left: 20,
            right: 20,
            child: Column(
              children: [
                Text(
                  name.toUpperCase(),
                  textAlign: TextAlign.center,
                  maxLines: 1,
                  style: GoogleFonts.oswald(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    letterSpacing: 1.2,
                  ),
                ),
                Container(
                  margin: const EdgeInsets.symmetric(vertical: 4),
                  height: 1,
                  color: cardColor.withValues(alpha: 0.5),
                ),
              ],
            ),
          ),

          // 6 Stats Bottom
          Positioned(
            bottom: 20,
            left: 20,
            right: 20,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                // Columna Izquierda
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildStatRow(pac, 'PAC', cardColor),
                    const SizedBox(height: 4),
                    _buildStatRow(sho, 'SHO', cardColor),
                    const SizedBox(height: 4),
                    _buildStatRow(pas, 'PAS', cardColor),
                  ],
                ),
                // Separador
                Container(width: 1, height: 60, color: cardColor.withValues(alpha: 0.3)),
                // Columna Derecha
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildStatRow(dri, 'DRI', cardColor),
                    const SizedBox(height: 4),
                    _buildStatRow(def, 'DEF', cardColor),
                    const SizedBox(height: 4),
                    _buildStatRow(phy, 'PHY', cardColor),
                  ],
                )
              ],
            ),
          )
        ],
      ),
    );
  }

  Widget _buildStatRow(int val, String label, Color accent) {
    return Row(
      children: [
        SizedBox(
          width: 26,
          child: Text(
            val.toString(),
            style: GoogleFonts.oswald(
              fontSize: 16,
              fontWeight: FontWeight.bold,
              color: Colors.white,
            ),
          ),
        ),
        Text(
          label,
          style: GoogleFonts.oswald(
            fontSize: 14,
            fontWeight: FontWeight.w400,
            color: Colors.white70,
          ),
        ),
      ],
    );
  }
}
