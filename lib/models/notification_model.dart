// ============================================================
// NOTIFICATION MODEL
// ============================================================

enum NotificationType {
  likePost,
  commentPost,
  newStory,
  newMessage,
  unknown
}

class SocialNotification {
  final String id;
  final String recipientId;
  final String actorId;
  final NotificationType type;
  final String? entityId;
  final String? entityType;
  final bool isRead;
  final DateTime createdAt;

  // Enriquecidos por la vista
  final String? actorName;
  final String? actorAvatarUrl;
  final String? entityPreviewUrl;

  SocialNotification({
    required this.id,
    required this.recipientId,
    required this.actorId,
    required this.type,
    this.entityId,
    this.entityType,
    this.isRead = false,
    required this.createdAt,
    this.actorName,
    this.actorAvatarUrl,
    this.entityPreviewUrl,
  });

  factory SocialNotification.fromJson(Map<String, dynamic> json) {
    return SocialNotification(
      id: json['id'] as String,
      recipientId: json['recipient_id'] as String,
      actorId: json['actor_id'] as String,
      type: _parseType(json['type'] as String?),
      entityId: json['entity_id'] as String?,
      entityType: json['entity_type'] as String?,
      isRead: json['is_read'] as bool? ?? false,
      createdAt: DateTime.parse(json['created_at']).toLocal(),
      actorName: json['actor_name'] as String?,
      actorAvatarUrl: json['actor_avatar_url'] as String?,
      entityPreviewUrl: json['entity_preview_url'] as String?,
    );
  }

  static NotificationType _parseType(String? typeStr) {
    switch (typeStr) {
      case 'like_post':
        return NotificationType.likePost;
      case 'comment_post':
        return NotificationType.commentPost;
      case 'new_story':
        return NotificationType.newStory;
      case 'new_message':
        return NotificationType.newMessage;
      default:
        return NotificationType.unknown;
    }
  }

  String getDisplayText() {
    final name = actorName ?? 'Alguien';
    switch (type) {
      case NotificationType.likePost:
        return '$name ha reaccionado a tu publicación.';
      case NotificationType.commentPost:
        return '$name ha comentado tu publicación.';
      case NotificationType.newStory:
        return '$name ha publicado una nueva historia.';
      case NotificationType.newMessage:
        return '$name te ha enviado un mensaje.';
      default:
        return 'Tienes una nueva notificación.';
    }
  }
}
