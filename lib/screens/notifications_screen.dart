import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/notification_model.dart';
import '../services/notification_service.dart';
import '../widgets/empty_state_widget.dart';
import '../widgets/loading_widget.dart';
import '../widgets/error_state_widget.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});

  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  final NotificationService _notificationService = NotificationService();
  List<SocialNotification> _notifications = [];
  bool _isLoading = true;
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _loadNotifications();
  }

  Future<void> _loadNotifications() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final notifications = await _notificationService.getUserNotifications();

      setState(() {
        _notifications = notifications;
        _isLoading = false;
      });

      // Marcar todas como leídas en background
      if (notifications.any((n) => !n.isRead)) {
        await _notificationService.markAllAsRead();
      }

    } catch (e) {
      debugPrint('Error cargando notificaciones: $e');
      setState(() {
        _isLoading = false;
        _errorMessage = 'Error al cargar notificaciones';
        _notifications = [];
      });
    }
  }

  String _formatTimeAgo(String dateString) {
    try {
      final date = DateTime.parse(dateString);
      final now = DateTime.now();
      final difference = now.difference(date);

      if (difference.inDays > 0) {
        return 'Hace ${difference.inDays} día${difference.inDays > 1 ? 's' : ''}';
      } else if (difference.inHours > 0) {
        return 'Hace ${difference.inHours} hora${difference.inHours > 1 ? 's' : ''}';
      } else if (difference.inMinutes > 0) {
        return 'Hace ${difference.inMinutes} minuto${difference.inMinutes > 1 ? 's' : ''}';
      } else {
        return 'Ahora';
      }
    } catch (e) {
      return 'Fecha desconocida';
    }
  }

  void _onNotificationTap(SocialNotification notification) {
    if (!notification.isRead) {
      _notificationService.markAsRead(notification.id);
      setState(() {
        final index = _notifications.indexWhere((n) => n.id == notification.id);
        if (index != -1) {
          _notifications[index] = SocialNotification(
            id: notification.id,
            recipientId: notification.recipientId,
            actorId: notification.actorId,
            type: notification.type,
            entityId: notification.entityId,
            entityType: notification.entityType,
            isRead: true,
            createdAt: notification.createdAt,
            actorName: notification.actorName,
            actorAvatarUrl: notification.actorAvatarUrl,
            entityPreviewUrl: notification.entityPreviewUrl,
          );
        }
      });
    }

    // TODO: Manejar la navegación según el tipo de entidad (entityType/entityId)
    // Ejemplo: Navigator.push(context, route_to_post_detail(notification.entityId));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(
          'Notificaciones',
          style: GoogleFonts.oswald(
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            onPressed: _loadNotifications,
            tooltip: 'Actualizar',
          ),
        ],
      ),
      body: _isLoading
          ? const LoadingWidget(message: 'Cargando notificaciones...')
          : _errorMessage != null
              ? ErrorStateWidget(
                  title: _errorMessage!,
                  actionLabel: 'Reintentar',
                  onAction: _loadNotifications,
                )
              : _notifications.isEmpty
                  ? EmptyStateWidget(
                      icon: Icons.notifications_none,
                      title: 'No hay notificaciones',
                      subtitle: 'Las notificaciones importantes aparecerán aquí',
                    )
                  : RefreshIndicator(
                      onRefresh: _loadNotifications,
                      child: ListView.builder(
                        padding: const EdgeInsets.all(8),
                        itemCount: _notifications.length,
                        itemBuilder: (context, index) {
                          final notification = _notifications[index];
                          final isUnread = !notification.isRead;

                          return InkWell(
                            onTap: () => _onNotificationTap(notification),
                            child: Container(
                              color: isUnread
                                  ? Theme.of(context).primaryColor.withValues(alpha: 0.1)
                                  : Colors.transparent,
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 12,
                              ),
                              child: Row(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  // Avatar del Actor
                                  CircleAvatar(
                                    radius: 24,
                                    backgroundColor: const Color(0xFF1D1E33),
                                    backgroundImage: notification.actorAvatarUrl != null
                                        ? CachedNetworkImageProvider(notification.actorAvatarUrl!)
                                        : null,
                                    child: notification.actorAvatarUrl == null
                                        ? const Icon(Icons.person, color: Colors.white54)
                                        : null,
                                  ),
                                  const SizedBox(width: 12),
                                  
                                  // Texto de Referencia
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text.rich(
                                          TextSpan(
                                            children: [
                                              TextSpan(
                                                text: '${notification.actorName ?? 'Alguien'} ',
                                                style: GoogleFonts.roboto(
                                                  fontWeight: FontWeight.bold,
                                                  color: Colors.white,
                                                  fontSize: 14,
                                                ),
                                              ),
                                              TextSpan(
                                                text: _getActionText(notification.type),
                                                style: GoogleFonts.roboto(
                                                  color: Colors.white70,
                                                  fontSize: 14,
                                                ),
                                              ),
                                            ],
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          _formatTimeAgo(notification.createdAt.toIso8601String()),
                                          style: GoogleFonts.roboto(
                                            color: Colors.white54,
                                            fontSize: 12,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                  
                                  // Miniatura del Post (si aplica)
                                  if (notification.entityPreviewUrl != null)
                                    Container(
                                      margin: const EdgeInsets.only(left: 12),
                                      width: 45,
                                      height: 45,
                                      decoration: BoxDecoration(
                                        borderRadius: BorderRadius.circular(8),
                                        image: DecorationImage(
                                          image: CachedNetworkImageProvider(notification.entityPreviewUrl!),
                                          fit: BoxFit.cover,
                                        ),
                                      ),
                                    ),
                                ],
                              ),
                            ),
                          );
                        },
                      ),
                    ),
    );
  }

  String _getActionText(NotificationType type) {
    switch (type) {
      case NotificationType.likePost:
        return 'le dio "Me gusta" a tu publicación.';
      case NotificationType.commentPost:
        return 'comentó tu publicación.';
      case NotificationType.newMessage:
        return 'te envió un mensaje directo.';
      case NotificationType.newStory:
        return 'publicó una nueva historia.';
      default:
        return 'interactuó contigo.';
    }
  }
}
