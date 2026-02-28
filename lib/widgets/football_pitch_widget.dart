import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';

class FootballPitchWidget extends StatelessWidget {
  final List<Map<String, dynamic>> players;

  const FootballPitchWidget({super.key, required this.players});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      // La proporción estándar de una cancha es aprox 1.5 a 1.7
      aspectRatio: 0.65, 
      decoration: BoxDecoration(
        color: const Color(0xFF2E8B57), // Verde Césped
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withValues(alpha: 0.8), width: 3),
        boxShadow: const [
          BoxShadow(color: Colors.black45, blurRadius: 10, offset: Offset(0, 5))
        ],
      ),
      child: Stack(
        children: [
          // LÍNEAS DE LA CANCHA (Dibujadas con Containers)
          
          // Línea Central
          Align(
            alignment: Alignment.center,
            child: Container(
              height: 3,
              width: double.infinity,
              color: Colors.white.withValues(alpha: 0.6),
            ),
          ),
          
          // Círculo Central
          Align(
            alignment: Alignment.center,
            child: Container(
              width: 100,
              height: 100,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: Colors.white.withValues(alpha: 0.6), width: 3),
              ),
            ),
          ),

          // Área Abajo (Nuestra)
          Align(
            alignment: Alignment.bottomCenter,
            child: Container(
              width: 150,
              height: 100,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white.withValues(alpha: 0.6), width: 3),
              ),
            ),
          ),
          
          // Área Arriba (Rival)
          Align(
            alignment: Alignment.topCenter,
            child: Container(
              width: 150,
              height: 100,
              decoration: BoxDecoration(
                border: Border.all(color: Colors.white.withValues(alpha: 0.6), width: 3),
              ),
            ),
          ),

          // JUGADORES (Renderizados estáticamente en Posiciones Relativas para la Beta)
          // Nota: En una versión final, las coordenadas X e Y vienen de la base de datos `match_lineups`.
          ...players.map((p) => _PositionedPlayer(player: p)),
        ],
      ),
    );
  }
}

class _PositionedPlayer extends StatelessWidget {
  final Map<String, dynamic> player;

  const _PositionedPlayer({required this.player});

  @override
  Widget build(BuildContext context) {
    // Si la DB no trae X e Y, usamos la posición como string para mapear a la cancha estáticamente
    final pos = player['position'] ?? 'MID';
    final name = player['full_name']?.toString().split(' ').first ?? 'Jugador';
    final url = player['avatar_url'];

    // Lógica estática temporal (Beta) para alinear jugadores según su rol
    Alignment alignment = Alignment.center;
    if (pos == 'POR' || pos == 'GK') alignment = const Alignment(0, 0.90);
    else if (pos == 'DEF') {
      // Aleatorizamos un poco la linea defensiva si hay muchos
      int hash = player['id'].hashCode % 3;
      if (hash == 0) alignment = const Alignment(-0.6, 0.6);
      else if (hash == 1) alignment = const Alignment(0, 0.65);
      else alignment = const Alignment(0.6, 0.6);
    } 
    else if (pos == 'MID') {
      int hash = player['id'].hashCode % 3;
      if (hash == 0) alignment = const Alignment(-0.4, 0.1);
      else if (hash == 1) alignment = const Alignment(0, -0.1);
      else alignment = const Alignment(0.4, 0.1);
    }
    else if (pos == 'FWD') {
      int hash = player['id'].hashCode % 2;
      if (hash == 0) alignment = const Alignment(-0.3, -0.6);
      else alignment = const Alignment(0.3, -0.6);
    }

    return Align(
      alignment: alignment,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white, width: 2),
              color: Colors.black87,
              boxShadow: const [BoxShadow(color: Colors.black54, blurRadius: 4)],
            ),
            child: ClipOval(
              child: url != null && url.isNotEmpty
                  ? CachedNetworkImage(imageUrl: url, fit: BoxFit.cover)
                  : const Icon(Icons.person, color: Colors.white, size: 24),
            ),
          ),
          const SizedBox(height: 4),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
            decoration: BoxDecoration(
              color: Colors.black.withValues(alpha: 0.7),
              borderRadius: BorderRadius.circular(4),
            ),
            child: Text(
              name,
              style: GoogleFonts.roboto(
                color: Colors.white,
                fontSize: 10,
                fontWeight: FontWeight.bold,
              ),
            ),
          )
        ],
      ),
    );
  }
}
