import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

/// Servicio de Notificaciones 100% Supabase (sin Firebase).
///
/// Flujo:
/// 1. Supabase Edge Function detecta cambio en la FFCV (nuevo resultado).
/// 2. Actualiza `ffcv_fixtures` en Supabase.
/// 3. Supabase Realtime dispara el evento a todas las apps abiertas.
/// 4. Este servicio muestra la notificación local al usuario.
///    (Si la app está cerrada, la Edge Function puede usar OneSignal o
///     la API de Supabase vault para notificaciones diferidas)
class PushNotificationService {
  static final PushNotificationService _instance = PushNotificationService._internal();
  factory PushNotificationService() => _instance;
  PushNotificationService._internal();

  final _supabase = Supabase.instance.client;
  final FlutterLocalNotificationsPlugin _localNotifications =
      FlutterLocalNotificationsPlugin();

  RealtimeChannel? _channel;

  // Callback para navegar al Liga Hub cuando llega un resultado
  Function(String idPartido)? onMatchResultReceived;

  // ────────────────────────────────────────────────────────────
  // INICIALIZAR (llamar desde main.dart)
  // ────────────────────────────────────────────────────────────
  Future<void> initialize() async {
    // Configurar las notificaciones locales
    const androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    const iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );

    await _localNotifications.initialize(
      const InitializationSettings(android: androidSettings, iOS: iosSettings),
      onDidReceiveNotificationResponse: (details) {
        // El usuario tocó la notificación → navegar al Liga Hub
        final idPartido = details.payload ?? '';
        onMatchResultReceived?.call(idPartido);
      },
    );

    // Suscribirse a cambios en ffcv_fixtures via Supabase Realtime
    _subscribeToFfcvChanges();

    debugPrint('[Notificaciones] Servicio inicializado (100% Supabase) ✅');
  }

  // ────────────────────────────────────────────────────────────
  // SUPABASE REALTIME: Escuchar cambios en resultados FFCV
  // ────────────────────────────────────────────────────────────
  void _subscribeToFfcvChanges() {
    _channel = _supabase
        .channel('ffcv_result_notifications')
        .onPostgresChanges(
          event: PostgresChangeEvent.update,
          schema: 'public',
          table: 'ffcv_fixtures',
          filter: PostgresChangeFilter(
            type: PostgresChangeFilterType.eq,
            column: 'id_torneo',
            value: '904327882',
          ),
          callback: (payload) async {
            final newData = payload.newRecord;
            final oldData = payload.oldRecord;

            // Detectar cambio de resultado
            final homeGoals = newData['home_goals'];
            final awayGoals = newData['away_goals'];
            final oldHomeGoals = oldData['home_goals'];
            final oldAwayGoals = oldData['away_goals'];

            final resultChanged = homeGoals != null &&
                awayGoals != null &&
                (homeGoals != oldHomeGoals || awayGoals != oldAwayGoals);

            if (resultChanged) {
              final homeTeam = newData['home_team_name'] ?? 'Local';
              final awayTeam = newData['away_team_name'] ?? 'Visitante';
              final idPartido = newData['id_partido'] ?? '';

              await _showResultNotification(
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                homeGoals: homeGoals,
                awayGoals: awayGoals,
                idPartido: idPartido,
              );
            }

            // Detectar cambio de horario
            final dateChanged = newData['match_date'] != oldData['match_date'] &&
                newData['match_date'] != null;

            if (dateChanged && !resultChanged) {
              final homeTeam = newData['home_team_name'] ?? 'Local';
              final awayTeam = newData['away_team_name'] ?? 'Visitante';

              await _showScheduleNotification(
                homeTeam: homeTeam,
                awayTeam: awayTeam,
                newDate: newData['match_date'],
              );
            }
          },
        )
        .subscribe();

    debugPrint('[Notificaciones] Suscrito a cambios Realtime FFCV ✅');
  }

  // ────────────────────────────────────────────────────────────
  // MOSTRAR NOTIFICACIÓN DE RESULTADO
  // ────────────────────────────────────────────────────────────
  Future<void> _showResultNotification({
    required String homeTeam,
    required String awayTeam,
    required int homeGoals,
    required int awayGoals,
    required String idPartido,
  }) async {
    final home = _simplifyName(homeTeam);
    final away = _simplifyName(awayTeam);

    final isSanMarcHome = homeTeam.toLowerCase().contains('san marcelino');
    final isSanMarcAway = awayTeam.toLowerCase().contains('san marcelino');
    final isSanMarcMatch = isSanMarcHome || isSanMarcAway;

    String title;
    String body;

    if (isSanMarcMatch) {
      final smGoals = isSanMarcHome ? homeGoals : awayGoals;
      final rivalGoals = isSanMarcHome ? awayGoals : homeGoals;
      final rival = isSanMarcHome ? away : home;

      if (smGoals > rivalGoals) {
        title = '🏆 ¡VICTORIA! $smGoals-$rivalGoals $rival';
        body = '¡El San Marcelino ganó! Abre la app para ver los detalles. ⚽';
      } else if (smGoals == rivalGoals) {
        title = '🤝 Empate $smGoals-$rivalGoals $rival';
        body = 'Resultado final actualizado. Pulsa para ver el partido.';
      } else {
        title = '❌ Derrota $smGoals-$rivalGoals $rival';
        body = 'Resultado actualizado desde la FFCV.';
      }
    } else {
      title = '⚽ $home $homeGoals-$awayGoals $away';
      body = 'Resultado actualizado en el Grup.-4';
    }

    await _localNotifications.show(
      idPartido.hashCode,
      title,
      body,
      NotificationDetails(
        android: AndroidNotificationDetails(
          'ffcv_results',
          'Resultados FFCV',
          channelDescription: 'Notificaciones de resultados y cambios de la FFCV',
          importance: Importance.high,
          priority: Priority.high,
          icon: '@mipmap/ic_launcher',
          color: const Color(0xFFFFB300), // Ámbar del San Marcelino
          styleInformation: BigTextStyleInformation(body),
        ),
        iOS: const DarwinNotificationDetails(
          presentAlert: true,
          presentBadge: true,
          presentSound: true,
        ),
      ),
      payload: idPartido,
    );

    debugPrint('[Notificaciones] Enviada: "$title"');
  }

  // ────────────────────────────────────────────────────────────
  // MOSTRAR NOTIFICACIÓN DE CAMBIO DE HORARIO
  // ────────────────────────────────────────────────────────────
  Future<void> _showScheduleNotification({
    required String homeTeam,
    required String awayTeam,
    required String newDate,
  }) async {
    final home = _simplifyName(homeTeam);
    final away = _simplifyName(awayTeam);

    final isSanMarcMatch = homeTeam.toLowerCase().contains('san marcelino') ||
        awayTeam.toLowerCase().contains('san marcelino');

    if (!isSanMarcMatch) return; // Solo notificar cambios de nuestro equipo

    await _localNotifications.show(
      '$homeTeam$awayTeam'.hashCode,
      '📅 Cambio de horario: $home vs $away',
      'El partido ha sido reprogramado. Abre la app para ver la nueva fecha.',
      const NotificationDetails(
        android: AndroidNotificationDetails(
          'ffcv_schedule',
          'Horarios FFCV',
          channelDescription: 'Notificaciones de cambios de horario',
          importance: Importance.defaultImportance,
          priority: Priority.defaultPriority,
        ),
        iOS: DarwinNotificationDetails(),
      ),
    );
  }

  // ────────────────────────────────────────────────────────────
  // LIMPIEZA: Al cerrar sesión
  // ────────────────────────────────────────────────────────────
  void dispose() {
    _channel?.unsubscribe();
    debugPrint('[Notificaciones] Suscripción Realtime cancelada');
  }

  String _simplifyName(String name) {
    return name
        .replaceAll(RegExp(r"'[ABC]'"), '')
        .replaceAll(RegExp(r"C\.D\.|C\.F\.|U\.D\.|F\.B\.[A-Z]+\."), '')
        .replaceAll('Fundació VCF', 'VCF')
        .trim()
        .split(' ')
        .take(2)
        .join(' ');
  }
}
