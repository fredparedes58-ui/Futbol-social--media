/// ============================================================
/// MODELO: SocialPostComment
/// ============================================================
/// Representa un comentario en una publicación social
/// ============================================================
library;

class SocialPostComment {
  final String id;
  final String postId;
  final String userId;
  final String content;
  final DateTime createdAt;

  // Campos adicionales desde la vista detallada
  final String? authorName;
  final String? authorRole;
  final String? authorAvatarUrl;

  SocialPostComment({
    required this.id,
    required this.postId,
    required this.userId,
    required this.content,
    required this.createdAt,
    this.authorName,
    this.authorRole,
    this.authorAvatarUrl,
  });

  factory SocialPostComment.fromJson(Map<String, dynamic> json) {
    return SocialPostComment(
      id: json['id'] as String,
      postId: json['post_id'] as String,
      userId: json['user_id'] as String,
      content: json['content'] as String,
      createdAt: DateTime.parse(json['created_at'] as String),
      authorName: json['author_name'] as String?,
      authorRole: json['author_role'] as String?,
      authorAvatarUrl: json['author_avatar_url'] as String?, // Although it's not explicitly in the view above, it can be if we join. Using fallback below.
    );
  }

  /// Obtiene el tiempo relativo (ej: "hace 5 min")
  String getRelativeTime() {
    final now = DateTime.now();
    final difference = now.difference(createdAt);

    if (difference.inDays > 7) {
      return '${createdAt.day}/${createdAt.month}/${createdAt.year}';
    } else if (difference.inDays > 0) {
      return '${difference.inDays}d';
    } else if (difference.inHours > 0) {
      return '${difference.inHours}h';
    } else if (difference.inMinutes > 0) {
      return '${difference.inMinutes}m';
    } else {
      return 'ahora';
    }
  }
}
