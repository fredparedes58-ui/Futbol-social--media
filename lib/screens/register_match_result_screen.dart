import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Pantalla exclusiva para el Admin/Entrenador para registrar
/// el resultado de un partido del San Marcelino y apuntar los goleadores.
class RegisterMatchResultScreen extends StatefulWidget {
  final String? fixtureId;          // Si viene del calendario, lo recibimos
  final String? rivalName;          // Nombre del rival (pre-rellenado)

  const RegisterMatchResultScreen({
    super.key,
    this.fixtureId,
    this.rivalName,
  });

  @override
  State<RegisterMatchResultScreen> createState() => _RegisterMatchResultScreenState();
}

class _RegisterMatchResultScreenState extends State<RegisterMatchResultScreen> {
  final _supabase = Supabase.instance.client;
  final _notesController = TextEditingController();
  final _rivalController = TextEditingController();

  int _ourGoals = 0;
  int _rivalGoals = 0;
  bool _isSaving = false;

  // Lista de goleadores añadidos
  final List<Map<String, dynamic>> _goalEvents = [];

  // Plantilla del San Marcelino para elegir goleadores
  List<Map<String, dynamic>> _players = [];
  bool _loadingPlayers = true;

  @override
  void initState() {
    super.initState();
    _rivalController.text = widget.rivalName ?? '';
    _loadPlayers();
  }

  @override
  void dispose() {
    _notesController.dispose();
    _rivalController.dispose();
    super.dispose();
  }

  Future<void> _loadPlayers() async {
    try {
      final players = await _supabase
          .from('ffcv_players')
          .select()
          .eq('team_id', '16372')
          .eq('is_coach', false)
          .order('full_name');

      setState(() {
        _players = List<Map<String, dynamic>>.from(players);
        _loadingPlayers = false;
      });
    } catch (e) {
      setState(() => _loadingPlayers = false);
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

  void _addGoalEvent() {
    showModalBottomSheet(
      context: context,
      backgroundColor: const Color(0xFF1D1E33),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (_) => _GoalSelectorSheet(
        players: _players,
        onSelected: (playerName, playerId, minute, isOwnGoal) {
          setState(() {
            _goalEvents.add({
              'player_name': playerName,
              'player_ffcv_id': playerId,
              'minute': minute,
              'is_own_goal': isOwnGoal,
            });
          });
          Navigator.pop(context);
        },
      ),
    );
  }

  Future<void> _saveResult() async {
    if (_rivalController.text.trim().isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Por favor escribe el nombre del rival'), backgroundColor: Colors.red),
      );
      return;
    }

    setState(() => _isSaving = true);

    try {
      final userId = _supabase.auth.currentUser!.id;

      // Si no hay fixture_id, creamos uno temporal como ID
      final fixtureId = widget.fixtureId ?? 'manual_${DateTime.now().millisecondsSinceEpoch}';
      final rivalName = _rivalController.text.trim();

      // 1. Insertar partido en ffcv_fixtures si es manual
      if (widget.fixtureId == null) {
        await _supabase.from('ffcv_fixtures').upsert({
          'id_partido': fixtureId,
          'id_torneo': '904327882',
          'jornada': 0,
          'home_team_name': 'C.D. San Marcelino \'A\'',
          'away_team_name': rivalName,
          'home_goals': _ourGoals,
          'away_goals': _rivalGoals,
          'match_date': DateTime.now().toIso8601String(),
          'status': 'finished',
        }, onConflict: 'id_partido');
      }

      // 2. Registrar el resultado
      await _supabase.from('match_results').upsert({
        'fixture_id': fixtureId,
        'our_goals': _ourGoals,
        'rival_goals': _rivalGoals,
        'notes': _notesController.text.trim(),
        'registered_by': userId,
      }, onConflict: 'fixture_id');

      // 3. Insertar los goles uno por uno
      for (final goal in _goalEvents) {
        await _supabase.from('match_goals').insert({
          'fixture_id': fixtureId,
          'player_ffcv_id': goal['player_ffcv_id'],
          'player_name': goal['player_name'],
          'minute': goal['minute'],
          'is_own_goal': goal['is_own_goal'] ?? false,
          'created_by': userId,
        });
      }

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('✅ Resultado registrado: San Marcelino $_ourGoals - $_rivalGoals $rivalName'),
            backgroundColor: Colors.green,
          ),
        );
        Navigator.pop(context, true); // true = recargar pantalla anterior
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final ourResult = _ourGoals > _rivalGoals ? 'VICTORIA 🏆' : (_ourGoals == _rivalGoals ? 'EMPATE 🤝' : 'DERROTA ❌');
    final resultColor = _ourGoals > _rivalGoals ? Colors.greenAccent : (_ourGoals == _rivalGoals ? Colors.amber : Colors.redAccent);

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text('REGISTRAR PARTIDO',
            style: GoogleFonts.oswald(color: Colors.amber, fontWeight: FontWeight.bold, letterSpacing: 2)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [

            // Nombre del rival
            Text('RIVAL', style: GoogleFonts.oswald(color: Colors.white38, fontSize: 12, letterSpacing: 2)),
            const SizedBox(height: 8),
            TextField(
              controller: _rivalController,
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Nombre del equipo rival...',
                hintStyle: const TextStyle(color: Colors.white38),
                filled: true,
                fillColor: const Color(0xFF1D1E33),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
                prefixIcon: const Icon(Icons.shield_outlined, color: Colors.white38),
              ),
            ),

            const SizedBox(height: 24),

            // Marcador visual
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: const Color(0xFF1D1E33),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: resultColor.withValues(alpha: 0.5), width: 1.5),
              ),
              child: Column(
                children: [
                  Text(ourResult, style: GoogleFonts.oswald(color: resultColor, fontSize: 16, letterSpacing: 2)),
                  const SizedBox(height: 16),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Goles nuestros
                      Column(
                        children: [
                          Text('San Marcelino', style: GoogleFonts.roboto(color: Colors.amber, fontSize: 13, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Row(children: [
                            _GoalButton(label: '-', onPressed: () { if (_ourGoals > 0) setState(() => _ourGoals--); }),
                            const SizedBox(width: 12),
                            Text('$_ourGoals', style: GoogleFonts.oswald(color: Colors.white, fontSize: 48, fontWeight: FontWeight.bold)),
                            const SizedBox(width: 12),
                            _GoalButton(label: '+', isAdd: true, onPressed: () { setState(() => _ourGoals++); }),
                          ]),
                        ],
                      ),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 8),
                        child: Text('-', style: GoogleFonts.oswald(color: Colors.white38, fontSize: 40)),
                      ),
                      // Goles rival
                      Column(
                        children: [
                          Text('Rival', style: GoogleFonts.roboto(color: Colors.white54, fontSize: 13, fontWeight: FontWeight.bold)),
                          const SizedBox(height: 8),
                          Row(children: [
                            _GoalButton(label: '-', onPressed: () { if (_rivalGoals > 0) setState(() => _rivalGoals--); }),
                            const SizedBox(width: 12),
                            Text('$_rivalGoals', style: GoogleFonts.oswald(color: Colors.white, fontSize: 48, fontWeight: FontWeight.bold)),
                            const SizedBox(width: 12),
                            _GoalButton(label: '+', isAdd: true, onPressed: () { setState(() => _rivalGoals++); }),
                          ]),
                        ],
                      ),
                    ],
                  ),
                ],
              ),
            ),

            const SizedBox(height: 24),

            // Goleadores
            Row(
              children: [
                Text('⚽ GOLEADORES (${_goalEvents.length})',
                    style: GoogleFonts.oswald(color: Colors.white38, fontSize: 12, letterSpacing: 2)),
                const Spacer(),
                TextButton.icon(
                  onPressed: _loadingPlayers ? null : _addGoalEvent,
                  icon: const Icon(Icons.add, color: Colors.amber, size: 18),
                  label: Text('Añadir gol', style: GoogleFonts.roboto(color: Colors.amber, fontSize: 13)),
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (_goalEvents.isEmpty)
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF1D1E33),
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.white12),
                ),
                child: Text('Pulsa "Añadir gol" para registrar quién marcó',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.roboto(color: Colors.white38, fontSize: 13)),
              )
            else
              ...(_goalEvents.asMap().entries.map((e) {
                final g = e.value;
                return Container(
                  margin: const EdgeInsets.only(bottom: 8),
                  padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                  decoration: BoxDecoration(
                    color: const Color(0xFF1D1E33),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.sports_soccer, color: Colors.amber, size: 20),
                      const SizedBox(width: 10),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(_formatName(g['player_name'] ?? ''),
                                style: GoogleFonts.roboto(color: Colors.white, fontSize: 14, fontWeight: FontWeight.w500)),
                            if (g['minute'] != null)
                              Text("Min. ${g['minute']}'",
                                  style: GoogleFonts.roboto(color: Colors.white38, fontSize: 11)),
                          ],
                        ),
                      ),
                      if (g['is_own_goal'] == true)
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            color: Colors.red.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(4),
                          ),
                          child: Text('PP', style: GoogleFonts.roboto(color: Colors.red, fontSize: 10)),
                        ),
                      IconButton(
                        icon: const Icon(Icons.delete_outline, color: Colors.white24, size: 20),
                        onPressed: () => setState(() => _goalEvents.removeAt(e.key)),
                      ),
                    ],
                  ),
                );
              })),

            const SizedBox(height: 24),

            // Notas
            Text('NOTAS DEL PARTIDO (Opcional)',
                style: GoogleFonts.oswald(color: Colors.white38, fontSize: 12, letterSpacing: 2)),
            const SizedBox(height: 8),
            TextField(
              controller: _notesController,
              style: const TextStyle(color: Colors.white),
              maxLines: 3,
              decoration: InputDecoration(
                hintText: 'Ej: "Gran partido de todos. Gol en el último minuto."',
                hintStyle: const TextStyle(color: Colors.white24),
                filled: true,
                fillColor: const Color(0xFF1D1E33),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),

            const SizedBox(height: 32),

            // Botón guardar
            ElevatedButton(
              onPressed: _isSaving ? null : _saveResult,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.amber,
                foregroundColor: Colors.black,
                padding: const EdgeInsets.symmetric(vertical: 16),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
              ),
              child: _isSaving
                  ? const SizedBox(
                      height: 22,
                      width: 22,
                      child: CircularProgressIndicator(strokeWidth: 2, color: Colors.black))
                  : Text('GUARDAR RESULTADO',
                      style: GoogleFonts.oswald(
                          fontSize: 16, fontWeight: FontWeight.bold, letterSpacing: 2)),
            ),
            const SizedBox(height: 40),
          ],
        ),
      ),
    );
  }
}

// ===== Widget de botón +/- para el marcador =====
class _GoalButton extends StatelessWidget {
  final String label;
  final VoidCallback onPressed;
  final bool isAdd;

  const _GoalButton({required this.label, required this.onPressed, this.isAdd = false});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: 36, height: 36,
        decoration: BoxDecoration(
          color: isAdd ? Colors.amber.withValues(alpha: 0.2) : Colors.white12,
          shape: BoxShape.circle,
        ),
        child: Center(
          child: Text(label,
              style: TextStyle(
                  color: isAdd ? Colors.amber : Colors.white54,
                  fontSize: 22,
                  fontWeight: FontWeight.bold)),
        ),
      ),
    );
  }
}

// ===== BottomSheet para elegir el goleador =====
class _GoalSelectorSheet extends StatefulWidget {
  final List<Map<String, dynamic>> players;
  final Function(String playerName, String? playerId, int? minute, bool isOwnGoal) onSelected;

  const _GoalSelectorSheet({required this.players, required this.onSelected});

  @override
  State<_GoalSelectorSheet> createState() => _GoalSelectorSheetState();
}

class _GoalSelectorSheetState extends State<_GoalSelectorSheet> {
  final _minuteController = TextEditingController();
  Map<String, dynamic>? _selectedPlayer;
  bool _isOwnGoal = false;
  String _manualName = '';

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
    return Padding(
      padding: EdgeInsets.only(
        left: 20, right: 20, top: 20,
        bottom: MediaQuery.of(context).viewInsets.bottom + 20,
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Center(
            child: Container(
              width: 40, height: 4,
              decoration: BoxDecoration(color: Colors.white30, borderRadius: BorderRadius.circular(2)),
            ),
          ),
          const SizedBox(height: 16),
          Text('¿Quién marcó?', style: GoogleFonts.oswald(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),

          // Lista de jugadores
          SizedBox(
            height: 200,
            child: ListView.builder(
              itemCount: widget.players.length,
              itemBuilder: (_, i) {
                final p = widget.players[i];
                final isSelected = _selectedPlayer?['id'] == p['id'];
                return GestureDetector(
                  onTap: () => setState(() => _selectedPlayer = p),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 6),
                    padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: isSelected ? Colors.amber.withValues(alpha: 0.15) : const Color(0xFF2A2B4A),
                      borderRadius: BorderRadius.circular(10),
                      border: Border.all(
                          color: isSelected ? Colors.amber : Colors.transparent, width: 1.5),
                    ),
                    child: Text(
                      _formatName(p['full_name'] ?? ''),
                      style: GoogleFonts.roboto(
                        color: isSelected ? Colors.amber : Colors.white,
                        fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      ),
                    ),
                  ),
                );
              },
            ),
          ),

          const SizedBox(height: 12),

          // Minuto (opcional)
          TextField(
            controller: _minuteController,
            keyboardType: TextInputType.number,
            style: const TextStyle(color: Colors.white),
            decoration: InputDecoration(
              hintText: 'Minuto del gol (opcional)',
              hintStyle: const TextStyle(color: Colors.white38),
              filled: true,
              fillColor: const Color(0xFF2A2B4A),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10), borderSide: BorderSide.none),
              prefixIcon: const Icon(Icons.timer, color: Colors.white38),
            ),
          ),

          const SizedBox(height: 12),

          // Propia puerta
          SwitchListTile(
            title: Text('Gol en propia puerta (PP)', style: GoogleFonts.roboto(color: Colors.white54)),
            value: _isOwnGoal,
            activeColor: Colors.redAccent,
            tileColor: Colors.transparent,
            onChanged: (v) => setState(() => _isOwnGoal = v),
          ),

          const SizedBox(height: 8),

          // Botón confirmar
          ElevatedButton(
            onPressed: _selectedPlayer == null
                ? null
                : () {
                    widget.onSelected(
                      _selectedPlayer!['full_name'],
                      _selectedPlayer!['id'],
                      int.tryParse(_minuteController.text),
                      _isOwnGoal,
                    );
                  },
            style: ElevatedButton.styleFrom(
              backgroundColor: Colors.amber,
              foregroundColor: Colors.black,
              disabledBackgroundColor: Colors.white12,
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
            ),
            child: Text('CONFIRMAR GOL ⚽',
                style: GoogleFonts.oswald(fontWeight: FontWeight.bold, fontSize: 15)),
          ),
        ],
      ),
    );
  }
}
