import 'package:flutter/foundation.dart';

class HighlightModel {
  final String id;
  final String teamId;
  final String userId;
  final String videoUrl;
  final String? description;
  final int likesCount;
  final int viewsCount;
  final DateTime createdAt;
  
  // Enriquecidos por la vista
  final String authorName;
  final String? authorAvatarUrl;
  final String authorRole;

  // Estado local
  bool isLikedByMe;

  HighlightModel({
    required this.id,
    required this.teamId,
    required this.userId,
    required this.videoUrl,
    this.description,
    required this.likesCount,
    required this.viewsCount,
    required this.createdAt,
    required this.authorName,
    this.authorAvatarUrl,
    required this.authorRole,
    this.isLikedByMe = false,
  });

  factory HighlightModel.fromJson(Map<String, dynamic> json) {
    return HighlightModel(
      id: json['id'] as String,
      teamId: json['team_id'] as String,
      userId: json['user_id'] as String,
      videoUrl: json['video_url'] as String,
      description: json['description'] as String?,
      likesCount: json['likes_count'] as int? ?? 0,
      viewsCount: json['views_count'] as int? ?? 0,
      createdAt: DateTime.parse(json['created_at']).toLocal(),
      authorName: json['author_name'] as String? ?? 'Usuario',
      authorAvatarUrl: json['author_avatar_url'] as String?,
      authorRole: json['author_role'] as String? ?? 'member',
    );
  }

  // Helper para clonar con estado mutado localmente
  HighlightModel copyWith({
    int? likesCount,
    bool? isLikedByMe,
    int? viewsCount,
  }) {
    return HighlightModel(
      id: id,
      teamId: teamId,
      userId: userId,
      videoUrl: videoUrl,
      description: description,
      likesCount: likesCount ?? this.likesCount,
      viewsCount: viewsCount ?? this.viewsCount,
      createdAt: createdAt,
      authorName: authorName,
      authorAvatarUrl: authorAvatarUrl,
      authorRole: authorRole,
      isLikedByMe: isLikedByMe ?? this.isLikedByMe,
    );
  }
}
