import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/highlight_model.dart';
import 'dart:io';

class HighlightService {
  final SupabaseClient _supabase = Supabase.instance.client;

  /// Obtiene el feed de highlights para un equipo
  Future<List<HighlightModel>> getHighlightsFeed({
    required String teamId,
    int limit = 10,
    int offset = 0,
  }) async {
    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) return [];

      // Traer los highlights base desde la vista enriquecida
      final response = await _supabase
          .from('social_highlights_detailed')
          .select()
          .eq('team_id', teamId)
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      final List<dynamic> data = response as List<dynamic>;
      final highlights = data.map((json) => HighlightModel.fromJson(json)).toList();

      if (highlights.isEmpty) return [];

      // Traer los likes del usuario actual para saber qué corazones pintar de rojo
      final highlightIds = highlights.map((h) => h.id).toList();
      final likesResponse = await _supabase
          .from('highlight_likes')
          .select('highlight_id')
          .eq('user_id', userId)
          .filter('highlight_id', 'in', highlightIds);

      final likedIds = (likesResponse as List).map((l) => l['highlight_id'] as String).toSet();

      // Marcar los que tengan like
      for (var highlight in highlights) {
        if (likedIds.contains(highlight.id)) {
          highlight.isLikedByMe = true;
        }
      }

      return highlights;
    } catch (e) {
      debugPrint('❌ Error obteniendo highlights: $e');
      return [];
    }
  }

  /// Sube un video y crea un Highlight
  Future<HighlightModel?> createHighlight({
    required String teamId,
    required File videoFile,
    required String description,
  }) async {
    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) throw Exception("Usuario no autenticado");

      // 1. Subir al Storage (Reutilizamos el bucket social_media)
      final String fileName = '${DateTime.now().millisecondsSinceEpoch}_highlight.mp4';
      final String safePath = 'highlights/$userId/$fileName';

      await _supabase.storage.from('social_media').upload(
            safePath,
            videoFile,
            fileOptions: const FileOptions(cacheControl: '3600', upsert: false),
          );

      final String publicUrl = _supabase.storage.from('social_media').getPublicUrl(safePath);

      // 2. Insertar en Base de Datos
      final response = await _supabase.from('social_highlights').insert({
        'team_id': teamId,
        'user_id': userId,
        'video_url': publicUrl,
        'description': description,
      }).select().single();

      return HighlightModel.fromJson(response);
    } catch (e) {
      debugPrint('❌ Error subiendo highlight: $e');
      rethrow;
    }
  }

  /// Toggle Like
  Future<bool> toggleLike(String highlightId) async {
    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) return false;

      // Verificar si ya tiene like
      final existingLike = await _supabase
          .from('highlight_likes')
          .select()
          .eq('highlight_id', highlightId)
          .eq('user_id', userId)
          .maybeSingle();

      if (existingLike != null) {
        // Quitar Like
        await _supabase
            .from('highlight_likes')
            .delete()
            .eq('highlight_id', highlightId)
            .eq('user_id', userId);
        return false; // Ya no tiene like
      } else {
        // Dar Like
        await _supabase.from('highlight_likes').insert({
          'highlight_id': highlightId,
          'user_id': userId,
        });
        return true; // Ahora tiene like
      }
    } catch (e) {
      debugPrint('❌ Error toggle like highlight: $e');
      rethrow;
    }
  }

  /// Increment View Count (Llamado silenciosamente desde la UI al reproducir)
  Future<void> logView(String highlightId) async {
    try {
      await _supabase.rpc(
        'increment_highlight_view_count',
        params: {'p_highlight_id': highlightId},
      );
    } catch (e) {
      debugPrint('❌ Log View Failed: $e');
    }
  }
}
