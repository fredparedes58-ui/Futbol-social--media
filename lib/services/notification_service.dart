// ============================================================
// NOTIFICATION SERVICE
// ============================================================
// Servicio para manejar el feed de notificaciones del usuario
// ============================================================

import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/notification_model.dart';

class NotificationService {
  final SupabaseClient _supabase = Supabase.instance.client;

  /// Obtiene las notificaciones del usuario actual paginadas
  Future<List<SocialNotification>> getUserNotifications({
    int limit = 30,
    int offset = 0,
  }) async {
    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) throw Exception("Usuario no autenticado");

      final response = await _supabase
          .from('notifications_detailed')
          .select()
          .eq('recipient_id', userId)
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      final List<dynamic> data = response as List<dynamic>;
      return data.map((json) => SocialNotification.fromJson(json)).toList();
    } catch (e) {
      debugPrint('❌ Error obteniendo notificaciones: $e');
      return [];
    }
  }

  /// Stream en tiempo real de nuevas notificaciones (ej. para mostrar un punto rojo en UI)
  Stream<List<SocialNotification>> streamUserNotifications() {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return const Stream.empty();

    return _supabase
        .from('notifications_detailed')
        .stream(primaryKey: ['id'])
        .eq('recipient_id', userId)
        .order('created_at', ascending: false)
        .map((data) => data.map((json) => SocialNotification.fromJson(json)).toList());
  }

  /// Cuenta las notificaciones no leídas
  Future<int> getUnreadCount() async {
    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) return 0;

      final response = await _supabase
          .from('notifications')
          .select()
          .eq('recipient_id', userId)
          .eq('is_read', false)
          .count();

      return response.count;
    } catch (e) {
      debugPrint('❌ Error contando notificaciones: $e');
      return 0;
    }
  }

  /// Marca una notificación como leída
  Future<void> markAsRead(String notificationId) async {
    try {
      await _supabase
          .from('notifications')
          .update({'is_read': true})
          .eq('id', notificationId);
    } catch (e) {
      debugPrint('❌ Error marcando notificación como leída: $e');
    }
  }

  /// Marca TODAS las notificaciones del usuario como leídas (llamando al RPC)
  Future<void> markAllAsRead() async {
    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) return;

      await _supabase.rpc(
        'mark_all_notifications_read',
        params: {'p_user_id': userId},
      );
    } catch (e) {
      debugPrint('❌ Error marcando todas como leídas: $e');
      
      // Fallback por si la función RPC no se instaló bien: Update por lote
      try {
        final userId = _supabase.auth.currentUser?.id;
        await _supabase
            .from('notifications')
            .update({'is_read': true})
            .eq('recipient_id', userId!)
            .eq('is_read', false);
      } catch (fallbackError) {
         debugPrint('❌ Error fallback marcando todas: $fallbackError');
      }
    }
  }
}
