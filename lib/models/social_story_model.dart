// ============================================================
// SOCIAL STORY MODEL
// ============================================================

import 'package:myapp/models/social_post_model.dart';

class SocialStory {
  final String id;
  final String teamId;
  final String userId;
  final String mediaUrl;
  final MediaType mediaType;
  final int durationSeconds;
  final DateTime expiresAt;
  final DateTime createdAt;
  
  // Enriquecidos
  final String? authorName;
  final String? authorRole;
  final String? authorAvatarUrl;

  bool get isViewed => false; // Por ahora, mock para UI

  SocialStory({
    required this.id,
    required this.teamId,
    required this.userId,
    required this.mediaUrl,
    required this.mediaType,
    this.durationSeconds = 5,
    required this.expiresAt,
    required this.createdAt,
    this.authorName,
    this.authorRole,
    this.authorAvatarUrl,
  });

  factory SocialStory.fromJson(Map<String, dynamic> json) {
    return SocialStory(
      id: json['id'] as String,
      teamId: json['team_id'] as String,
      userId: json['user_id'] as String,
      mediaUrl: json['media_url'] as String,
      mediaType: _parseMediaType(json['media_type'] as String?),
      durationSeconds: json['duration_seconds'] as int? ?? 5,
      expiresAt: DateTime.parse(json['expires_at'] as String).toLocal(),
      createdAt: DateTime.parse(json['created_at'] as String).toLocal(),
      authorName: json['author_name'] as String?,
      authorRole: json['author_role'] as String?,
      authorAvatarUrl: json['author_avatar_url'] as String?,
    );
  }

  static MediaType _parseMediaType(String? type) {
    if (type == 'video') return MediaType.video;
    return MediaType.image;
  }
}

/// Helper model for grouping stories by user
class UserStoryGroup {
  final String userId;
  final String authorName;
  final String authorAvatarUrl;
  final List<SocialStory> stories;
  final bool allViewed;

  UserStoryGroup({
    required this.userId,
    required this.authorName,
    required this.authorAvatarUrl,
    required this.stories,
    this.allViewed = false,
  });
}
