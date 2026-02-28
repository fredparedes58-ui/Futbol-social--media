// ============================================================
// SOCIAL SERVICE
// ============================================================
// Servicio para gestionar posts del feed social
// ============================================================

import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/social_post_model.dart';
import '../models/social_post_comment_model.dart';

class SocialService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // ============================================================
  // OBTENER FEED DEL EQUIPO
  // ============================================================

  /// Obtiene el feed de posts del equipo con paginación
  /// [scope] puede ser 'team' o 'school'
  Future<List<SocialPost>> getTeamFeed({
    required String teamId,
    String scope = 'team', // 'team' o 'school'
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final response = await _supabase.rpc(
        'get_team_social_feed',
        params: {
          'p_team_id': teamId,
          'p_scope': scope,
          'p_limit': limit,
          'p_offset': offset,
        },
      );

      if (response == null) {
        return [];
      }

      final List<dynamic> data = response as List<dynamic>;
      return data.map((json) => SocialPost.fromJson(json)).toList();
    } catch (e) {
      debugPrint('❌ Error obteniendo feed social: $e');
      rethrow;
    }
  }

  /// Obtiene el feed público del club (scope school)
  Future<List<SocialPost>> getSchoolFeed({
    int limit = 20,
    int offset = 0,
  }) async {
    try {
      final response = await _supabase.rpc(
        'get_school_social_feed',
        params: {
          'p_limit': limit,
          'p_offset': offset,
        },
      );

      if (response == null) {
        return [];
      }

      final List<dynamic> data = response as List<dynamic>;
      return data.map((json) => SocialPost.fromJson(json)).toList();
    } catch (e) {
      debugPrint('❌ Error obteniendo feed del club: $e');
      rethrow;
    }
  }

  /// Stream en tiempo real del feed del equipo
  Stream<List<SocialPost>> streamTeamFeed({
    required String teamId,
    String scope = 'team',
  }) {
    return _supabase
        .from('social_posts')
        .stream(primaryKey: ['id'])
        .order('created_at', ascending: false)
        .map((data) {
          return (data as List)
              .where((json) {
                final postTeamId = json['team_id'] as String?;
                final postScope = json['scope'] as String?;
                return postTeamId == teamId && postScope == scope;
              })
              .map((json) => SocialPost.fromJson(json))
              .toList();
        });
  }

  /// Stream en tiempo real del feed público del club
  Stream<List<SocialPost>> streamSchoolFeed() {
    return _supabase
        .from('social_posts')
        .stream(primaryKey: ['id'])
        .order('created_at', ascending: false)
        .map((data) {
          return (data as List)
              .where((json) {
                final postScope = json['scope'] as String?;
                return postScope == 'school';
              })
              .map((json) => SocialPost.fromJson(json))
              .toList();
        });
  }

  // ============================================================
  // CREAR POST
  // ============================================================

  /// Crea un nuevo post en el feed social
  Future<SocialPost> createPost({
    required CreateSocialPostDto postDto,
  }) async {
    try {
      final response = await _supabase
          .from('social_posts')
          .insert(postDto.toJson())
          .select()
          .single();

      return SocialPost.fromJson(response);
    } catch (e) {
      debugPrint('❌ Error creando post: $e');
      rethrow;
    }
  }

  // ============================================================
  // ACTUALIZAR POST
  // ============================================================

  /// Actualiza el texto de un post existente
  Future<void> updatePostText({
    required String postId,
    required String newText,
  }) async {
    try {
      await _supabase
          .from('social_posts')
          .update({'content_text': newText})
          .eq('id', postId);
    } catch (e) {
      debugPrint('❌ Error actualizando post: $e');
      rethrow;
    }
  }

  /// Fijar/desfijar un post
  Future<void> togglePinPost({
    required String postId,
    required bool isPinned,
  }) async {
    try {
      await _supabase
          .from('social_posts')
          .update({'is_pinned': isPinned})
          .eq('id', postId);
    } catch (e) {
      debugPrint('❌ Error fijando/desfijando post: $e');
      rethrow;
    }
  }

  // ============================================================
  // ELIMINAR POST
  // ============================================================

  /// Elimina un post del feed
  Future<void> deletePost({required String postId}) async {
    try {
      await _supabase.from('social_posts').delete().eq('id', postId);
    } catch (e) {
      debugPrint('❌ Error eliminando post: $e');
      rethrow;
    }
  }

  // ============================================================
  // LIKES
  // ============================================================

  /// Da like a un post
  Future<void> likePost({
    required String postId,
    required String userId,
  }) async {
    try {
      await _supabase.from('social_post_likes').insert({
        'post_id': postId,
        'user_id': userId,
      });
    } catch (e) {
      // Si ya existe el like, ignorar el error (UNIQUE constraint)
      if (!e.toString().contains('unique')) {
        debugPrint('❌ Error dando like: $e');
        rethrow;
      }
    }
  }

  /// Quita el like de un post
  Future<void> unlikePost({
    required String postId,
    required String userId,
  }) async {
    try {
      await _supabase
          .from('social_post_likes')
          .delete()
          .eq('post_id', postId)
          .eq('user_id', userId);
    } catch (e) {
      debugPrint('❌ Error quitando like: $e');
      rethrow;
    }
  }

  /// Verifica si el usuario actual ha dado like a un post
  Future<bool> isPostLikedByUser({
    required String postId,
    required String userId,
  }) async {
    try {
      final response = await _supabase
          .from('social_post_likes')
          .select()
          .eq('post_id', postId)
          .eq('user_id', userId)
          .maybeSingle();

      return response != null;
    } catch (e) {
      debugPrint('❌ Error verificando like: $e');
      return false;
    }
  }

  /// Toggle like (dar o quitar like automáticamente)
  Future<bool> toggleLike({
    required String postId,
    required String userId,
  }) async {
    try {
      final isLiked = await isPostLikedByUser(postId: postId, userId: userId);

      if (isLiked) {
        await unlikePost(postId: postId, userId: userId);
        return false; // Ya no tiene like
      } else {
        await likePost(postId: postId, userId: userId);
        return true; // Ahora tiene like
      }
    } catch (e) {
      debugPrint('❌ Error haciendo toggle de like: $e');
      rethrow;
    }
  }

  // ============================================================
  // OBTENER UN POST INDIVIDUAL
  // ============================================================

  /// Obtiene un post específico por ID
  Future<SocialPost?> getPostById({required String postId}) async {
    try {
      final response = await _supabase
          .from('social_posts')
          .select()
          .eq('id', postId)
          .maybeSingle();

      if (response == null) {
        return null;
      }

      return SocialPost.fromJson(response);
    } catch (e) {
      debugPrint('❌ Error obteniendo post: $e');
      return null;
    }
  }

  // ============================================================
  // ESTADÍSTICAS
  // ============================================================

  /// Obtiene el total de posts del equipo
  Future<int> getTeamPostsCount({required String teamId}) async {
    try {
      final response = await _supabase
          .from('social_posts')
          .select()
          .eq('team_id', teamId)
          .count();

      return response.count;
    } catch (e) {
      debugPrint('❌ Error obteniendo conteo de posts: $e');
      return 0;
    }
  }

  /// Obtiene los posts más populares del equipo (por likes)
  Future<List<SocialPost>> getTopPostsByLikes({
    required String teamId,
    int limit = 10,
  }) async {
    try {
      final response = await _supabase
          .from('social_posts')
          .select()
          .eq('team_id', teamId)
          .order('likes_count', ascending: false)
          .limit(limit);

      return (response as List)
          .map((json) => SocialPost.fromJson(json))
          .toList();
    } catch (e) {
      debugPrint('❌ Error obteniendo posts populares: $e');
      return [];
    }
  }

  // ============================================================
  // COMENTARIOS
  // ============================================================
  
  /// Stream en tiempo real de los comentarios de un post
  Stream<List<SocialPostComment>> streamPostComments(String postId) {
    return _supabase
        .from('social_comments_detailed')
        .stream(primaryKey: ['id'])
        .eq('post_id', postId)
        .order('created_at', ascending: true)
        .map((data) => data.map((json) => SocialPostComment.fromJson(json)).toList());
  }

  /// Añadir un nuevo comentario a un post
  Future<void> addComment({
    required String postId,
    required String content,
  }) async {
    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) throw Exception("Usuario no autenticado");

      await _supabase.from('social_post_comments').insert({
        'post_id': postId,
        'user_id': userId,
        'content': content,
      });
    } catch (e) {
      debugPrint('❌ Error añadiendo comentario: $e');
      rethrow;
    }
  }

  /// Eliminar un comentario propio
  Future<void> deleteComment(String commentId) async {
    try {
      await _supabase.from('social_post_comments').delete().eq('id', commentId);
    } catch (e) {
      debugPrint('❌ Error eliminando comentario: $e');
      rethrow;
    }
  }

  // ============================================================
  // HISTORIAS (STORIES)
  // ============================================================

  /// Obtiene las historias activas agrupadas por usuario
  Future<List<UserStoryGroup>> getActiveStories(String teamId) async {
    try {
      final response = await _supabase
          .from('active_social_stories_detailed')
          .select()
          .eq('team_id', teamId)
          .order('created_at', ascending: true);
          
      final List<dynamic> data = response as List<dynamic>;
      final stories = data.map((json) => SocialStory.fromJson(json)).toList();
      
      // Agrupar por usuario
      final Map<String, UserStoryGroup> grouped = {};
      
      for (var story in stories) {
        if (!grouped.containsKey(story.userId)) {
          grouped[story.userId] = UserStoryGroup(
            userId: story.userId,
            authorName: story.authorName ?? 'Usuario',
            authorAvatarUrl: story.authorAvatarUrl ?? 'assets/images/default_avatar.png',
            stories: [],
          );
        }
        grouped[story.userId]!.stories.add(story);
      }
      
      // Convertir a lista y ordenar: mis historias primero (si tengo) o luego alfabeticamente
      final list = grouped.values.toList();
      final myUserId = _supabase.auth.currentUser?.id;
      
      list.sort((a, b) {
        if (a.userId == myUserId) return -1;
        if (b.userId == myUserId) return 1;
        return 0; // Podríamos ordenar por la fecha del último story
      });
      
      return list;
    } catch (e) {
      debugPrint('❌ Error obteniendo stories activas: $e');
      return [];
    }
  }

  /// Crea una nueva historia
  Future<void> createStory({
    required String teamId,
    required String mediaUrl,
    required MediaType mediaType,
    int durationSeconds = 5,
  }) async {
    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) throw Exception("Usuario no autenticado");

      await _supabase.from('social_stories').insert({
        'team_id': teamId,
        'user_id': userId,
        'media_url': mediaUrl,
        'media_type': mediaType == MediaType.image ? 'image' : 'video',
        'duration_seconds': durationSeconds,
      });
    } catch (e) {
      debugPrint('❌ Error creando historia: $e');
      rethrow;
    }
  }

  // ============================================================
  // PERFIL DE USUARIO
  // ============================================================

  /// Obtiene los posts creados por un usuario específico (para su galería de perfil)
  Future<List<SocialPost>> getUserPosts({
    required String userId,
    int limit = 50,
    int offset = 0,
  }) async {
    try {
      final response = await _supabase.rpc(
        'get_team_social_feed', // Reusamos esta función base, pero filtramos luego
        params: {
          'p_team_id': '00000000-0000-0000-0000-000000000000', // Pasamos dummy, la vista subyacente igual trae data si rls lo permite
          'p_scope': 'team',
          'p_limit': 1000, // Forzamos un limite alto para filtrar en memoria temporalmente 
          'p_offset': 0,
        },
      );
      
      // NOTA: Lo ideal sería un `get_user_posts` RPC dedicado. 
      // Por simplicidad para el prototipo, consultamos directo la vista si tenemos permisos
      final directResponse = await _supabase
          .from('social_posts_detailed')
          .select()
          .eq('user_id', userId)
          .order('created_at', ascending: false)
          .range(offset, offset + limit - 1);

      final List<dynamic> data = directResponse as List<dynamic>;
      return data.map((json) => SocialPost.fromJson(json)).toList();
    } catch (e) {
      debugPrint('❌ Error obteniendo posts del usuario: $e');
      return [];
    }
  }
}
