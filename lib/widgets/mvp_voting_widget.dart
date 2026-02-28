import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class MvpVotingWidget extends StatefulWidget {
  final String matchId;
  final List<Map<String, dynamic>> players;
  final VoidCallback onVoteCast;

  const MvpVotingWidget({
    super.key,
    required this.matchId,
    required this.players,
    required this.onVoteCast,
  });

  @override
  State<MvpVotingWidget> createState() => _MvpVotingWidgetState();
}

class _MvpVotingWidgetState extends State<MvpVotingWidget> {
  bool _isVoting = false;
  String? _myVoteId;
  Map<String, int> _voteCounts = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadVotes();
  }

  Future<void> _loadVotes() async {
    try {
      final supabase = Supabase.instance.client;
      final userId = supabase.auth.currentUser!.id;

      // 1. Cargar todos los votos del partido
      final votesResponse = await supabase
          .from('match_mvp_votes')
          .select('voted_user_id, voter_id')
          .eq('match_id', widget.matchId);

      Map<String, int> counts = {};
      String? myVote;

      for (var row in votesResponse) {
        final votedFor = row['voted_user_id'] as String;
        final voter = row['voter_id'] as String;

        counts[votedFor] = (counts[votedFor] ?? 0) + 1;
        if (voter == userId) {
          myVote = votedFor;
        }
      }

      if (mounted) {
        setState(() {
          _voteCounts = counts;
          _myVoteId = myVote;
          _isLoading = false;
        });
      }
    } catch (e) {
      debugPrint('Error loading MVP votes: $e');
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _castVote(String targetUserId) async {
    if (_myVoteId != null || _isVoting) return;

    setState(() => _isVoting = true);

    try {
      final supabase = Supabase.instance.client;
      final userId = supabase.auth.currentUser!.id;

      await supabase.from('match_mvp_votes').insert({
        'match_id': widget.matchId,
        'voter_id': userId,
        'voted_user_id': targetUserId,
      });

      setState(() {
        _myVoteId = targetUserId;
        _voteCounts[targetUserId] = (_voteCounts[targetUserId] ?? 0) + 1;
      });

      widget.onVoteCast(); // Notificar al padre

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('¡Voto emitido con éxito! 🏆'), backgroundColor: Colors.amber),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error al procesar voto: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isVoting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const Center(child: CircularProgressIndicator());

    // Ordenar jugadores por cantidad de votos de mayor a menor
    List<Map<String, dynamic>> sortedPlayers = List.from(widget.players);
    sortedPlayers.sort((a, b) {
      int scoreA = _voteCounts[a['id']] ?? 0;
      int scoreB = _voteCounts[b['id']] ?? 0;
      return scoreB.compareTo(scoreA); // Descendente
    });

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Vota por el Jugador Más Valioso (MVP)',
          textAlign: TextAlign.center,
          style: GoogleFonts.oswald(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Colors.amber,
          ),
        ),
        const SizedBox(height: 8),
        Text(
          _myVoteId != null
              ? 'Gracias por participar en la elección.'
              : 'Selecciona al crack del partido. Solo puedes votar una vez.',
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.white70),
        ),
        const SizedBox(height: 24),
        Expanded(
          child: ListView.separated(
            itemCount: sortedPlayers.length,
            separatorBuilder: (_, __) => const SizedBox(height: 12),
            itemBuilder: (context, index) {
              final player = sortedPlayers[index];
              final playerId = player['id'] as String;
              final name = player['full_name'] ?? 'Jugador Desconocido';
              final avatarUrl = player['avatar_url'];
              final votes = _voteCounts[playerId] ?? 0;
              final isMyVote = _myVoteId == playerId;
              final isTop = index == 0 && votes > 0; // Va ganando

              return Container(
                decoration: BoxDecoration(
                  color: isMyVote ? Colors.amber.withValues(alpha: 0.1) : const Color(0xFF1D1E33),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: isMyVote ? Colors.amber : Colors.transparent,
                    width: isMyVote ? 2 : 1,
                  ),
                ),
                child: ListTile(
                  contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  leading: Stack(
                    children: [
                      CircleAvatar(
                        radius: 26,
                        backgroundImage: avatarUrl != null ? CachedNetworkImageProvider(avatarUrl) : null,
                        backgroundColor: Colors.black26,
                        child: avatarUrl == null ? const Icon(Icons.person, color: Colors.white) : null,
                      ),
                      if (isTop)
                        const Positioned(
                          top: -4,
                          right: -4,
                          child: Icon(Icons.star, color: Colors.amber, size: 20),
                        )
                    ],
                  ),
                  title: Text(
                    name,
                    style: GoogleFonts.roboto(
                        color: Colors.white, fontWeight: isTop ? FontWeight.bold : FontWeight.w500),
                  ),
                  subtitle: Text(
                    '$votes ${votes == 1 ? 'voto' : 'votos'}',
                    style: TextStyle(color: isTop ? Colors.amber : Colors.white54),
                  ),
                  trailing: _myVoteId == null
                      ? ElevatedButton(
                          onPressed: _isVoting ? null : () => _castVote(playerId),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Theme.of(context).primaryColor,
                            foregroundColor: Colors.white,
                          ),
                          child: const Text('Votar'),
                        )
                      : (isMyVote
                          ? const Icon(Icons.check_circle, color: Colors.amber, size: 30)
                          : const SizedBox.shrink()),
                ),
              );
            },
          ),
        ),
      ],
    );
  }
}
