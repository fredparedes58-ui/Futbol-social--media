// ============================================================
// SOCIAL FEED SCREEN - Estilo Instagram/Facebook
// ============================================================
// Feed visual para compartir momentos del equipo
// ============================================================

import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/social_post_model.dart';
import '../models/social_story_model.dart';
import '../services/social_service.dart';
import '../services/storage_service.dart';
import 'create_post_screen.dart';
import 'victory_share_screen.dart';
import 'victory_share_screen.dart';
import 'story_view_screen.dart';
import 'dart:async';

class SocialFeedScreen extends StatefulWidget {
  final String teamId;

  const SocialFeedScreen({super.key, required this.teamId});

  @override
  State<SocialFeedScreen> createState() => _SocialFeedScreenState();
}

class _SocialFeedScreenState extends State<SocialFeedScreen> {
  final SocialService _socialService = SocialService();
  final StorageService _storageService = StorageService();
  final ScrollController _scrollController = ScrollController();
  final ImagePicker _imagePicker = ImagePicker();
  List<SocialPost> _posts = [];
  List<UserStoryGroup> _stories = [];
  bool _isLoading = true;
  bool _isLoadingMore = false;
  bool _isUploadingStory = false;
  int _currentPage = 0;
  static const int _pageSize = 20;

  @override
  void initState() {
    super.initState();
    _loadInitialPosts();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >=
        _scrollController.position.maxScrollExtent * 0.9) {
      if (!_isLoadingMore) {
        _loadMorePosts();
      }
    }
  }

  Future<void> _loadInitialPosts() async {
    setState(() => _isLoading = true);
    try {
      final postsFuture = _socialService.getTeamFeed(
        teamId: widget.teamId,
        limit: _pageSize,
        offset: 0,
      );
      
      final storiesFuture = _socialService.getActiveStories(widget.teamId);
      
      final results = await Future.wait([postsFuture, storiesFuture]);
      
      setState(() {
        _posts = results[0] as List<SocialPost>;
        _stories = results[1] as List<UserStoryGroup>;
        _currentPage = 1;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      _showError('Error cargando feed: $e');
    }
  }

  Future<void> _loadMorePosts() async {
    setState(() => _isLoadingMore = true);
    try {
      final newPosts = await _socialService.getTeamFeed(
        teamId: widget.teamId,
        limit: _pageSize,
        offset: _currentPage * _pageSize,
      );
      if (newPosts.isNotEmpty) {
        setState(() {
          _posts.addAll(newPosts);
          _currentPage++;
        });
      }
    } catch (e) {
      _showError('Error cargando más posts: $e');
    } finally {
      setState(() => _isLoadingMore = false);
    }
  }

  Future<void> _refreshFeed() async {
    await _loadInitialPosts();
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }

  Future<void> _navigateToCreatePost() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => CreatePostScreen(teamId: widget.teamId),
      ),
    );

    if (result == true) {
      _refreshFeed();
    }
  }

  Future<void> _navigateToVictoryShare() async {
    // Mostrar selector de fuente (cámara o galería)
    final source = await _showImageSourceDialog();
    if (source == null) return;

    try {
      final XFile? image = await _imagePicker.pickImage(
        source: source,
        maxWidth: 1920,
        maxHeight: 1920,
        imageQuality: 85,
      );

      if (image != null && mounted) {
        final result = await Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => VictoryShareScreen(
              imageFile: File(image.path),
            ),
          ),
        );

        if (result == true) {
          _refreshFeed();
        }
      }
    } catch (e) {
      _showError('Error al seleccionar imagen: $e');
    }
  }

  Future<ImageSource?> _showImageSourceDialog() async {
    return showModalBottomSheet<ImageSource>(
      context: context,
      backgroundColor: const Color(0xFF1D1E33),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 20),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 40,
                height: 4,
                margin: const EdgeInsets.only(bottom: 20),
                decoration: BoxDecoration(
                  color: Theme.of(context).primaryColor.withValues(alpha: 0.3),
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
              ListTile(
                leading: const Icon(Icons.photo_library, color: Colors.blue),
                title: Text(
                  'Galería de Fotos',
                  style: GoogleFonts.roboto(color: Colors.white),
                ),
                onTap: () => Navigator.pop(context, ImageSource.gallery),
              ),
              ListTile(
                leading: const Icon(Icons.camera_alt, color: Colors.green),
                title: Text(
                  'Tomar Foto',
                  style: GoogleFonts.roboto(color: Colors.white),
                ),
                onTap: () => Navigator.pop(context, ImageSource.camera),
              ),
            ],
          ),
        ),
      ),
    );
  }
  
  Future<void> _handleCreateStory() async {
    final source = await _showImageSourceDialog();
    if (source == null) return;
    
    try {
      final XFile? media = await _imagePicker.pickImage(
        source: source,
        maxWidth: 1080,
        maxHeight: 1920,
        imageQuality: 80,
      );

      if (media != null) {
        setState(() => _isUploadingStory = true);
        
        final userId = Supabase.instance.client.auth.currentUser?.id;
        if (userId == null) throw Exception("No autorizado");

        // 1. Subir al storage
        final publicUrl = await _storageService.uploadStoryMedia(File(media.path), userId);
        
        // 2. Insertar en la tabla de historias
        await _socialService.createStory(
          teamId: widget.teamId, 
          mediaUrl: publicUrl, 
          mediaType: MediaType.image,
          durationSeconds: 5,
        );

        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('¡Historia compartida! ✨'), backgroundColor: Colors.purple),
        );
        
        _refreshFeed();
      }
    } catch (e) {
      _showError('Error al subir historia: $e');
    } finally {
      if (mounted) setState(() => _isUploadingStory = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'FÚTBOL SOCIAL',
          style: GoogleFonts.oswald(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
            color: theme.primaryColor,
          ),
        ),
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.add_photo_alternate_outlined),
            onPressed: _navigateToCreatePost,
            tooltip: 'Crear Post',
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _refreshFeed,
              child: CustomScrollView(
                controller: _scrollController,
                physics: const AlwaysScrollableScrollPhysics(),
                slivers: [
                  // STORIERS CAROUSEL
                  SliverToBoxAdapter(
                    child: _buildStoriesCarousel(),
                  ),
                  
                  // DIVIDER
                  if (_posts.isNotEmpty)
                    SliverToBoxAdapter(
                      child: Divider(
                        color: Colors.white.withValues(alpha: 0.1),
                        height: 1,
                        thickness: 1,
                      ),
                    ),
                  
                  // POSTS FEED
                  if (_posts.isEmpty)
                    SliverFillRemaining(
                      hasScrollBody: false,
                      child: _buildEmptyState(),
                    )
                  else
                    SliverList(
                      delegate: SliverChildBuilderDelegate(
                        (context, index) {
                          if (index == _posts.length) {
                            return _isLoadingMore
                              ? const Center(
                                  child: Padding(
                                    padding: EdgeInsets.all(16.0),
                                    child: CircularProgressIndicator(),
                                  ),
                                )
                              : const SizedBox.shrink();
                          }
                          return SocialPostCard(
                            post: _posts[index],
                            onLikeToggle: () => _handleLikeToggle(_posts[index]),
                            onDelete: () => _handleDelete(_posts[index].id),
                          );
                        },
                        childCount: _posts.length + (_isLoadingMore ? 1 : 0),
                      ),
                    ),
                ],
              ),
            ),
      floatingActionButton: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          // Botón Victory Share
          FloatingActionButton(
            heroTag: 'victory_share',
            onPressed: _navigateToVictoryShare,
            backgroundColor: Colors.green,
            child: const Icon(Icons.emoji_events, color: Colors.white),
          ),
          const SizedBox(height: 12),
          // Botón Compartir Normal
          FloatingActionButton.extended(
            heroTag: 'create_post',
            onPressed: _navigateToCreatePost,
            backgroundColor: theme.primaryColor,
            icon: const Icon(Icons.add),
            label: Text(
              'COMPARTIR',
              style: GoogleFonts.roboto(
                fontWeight: FontWeight.bold,
                letterSpacing: 1,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStoriesCarousel() {
    return Container(
      height: 110,
      padding: const EdgeInsets.only(top: 12, bottom: 8),
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        itemCount: _stories.length + 1, // +1 para el botón de "Crear Historia"
        padding: const EdgeInsets.symmetric(horizontal: 12),
        itemBuilder: (context, index) {
          if (index == 0) {
            return _buildCreateStoryButton();
          }
          final group = _stories[index - 1];
          return _buildStoryAvatar(group);
        },
      ),
    );
  }

  Widget _buildCreateStoryButton() {
    return GestureDetector(
      onTap: _isUploadingStory ? null : _handleCreateStory,
      child: Container(
        margin: const EdgeInsets.only(right: 16),
        child: Column(
          children: [
            Stack(
              alignment: Alignment.center,
              children: [
                Stack(
                  alignment: Alignment.bottomRight,
                  children: [
                    Container(
                      width: 65,
                      height: 65,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        border: Border.all(color: Colors.white24, width: 2),
                        color: Theme.of(context).primaryColor.withValues(alpha: 0.2),
                      ),
                      child: const Center(
                        child: Icon(Icons.person, color: Colors.white70, size: 30),
                      ),
                    ),
                    Container(
                      width: 22,
                      height: 22,
                      decoration: BoxDecoration(
                        color: Theme.of(context).primaryColor,
                        shape: BoxShape.circle,
                        border: Border.all(color: const Color(0xFF0A0E21), width: 2),
                      ),
                      child: const Icon(Icons.add, color: Colors.white, size: 16),
                    ),
                  ],
                ),
                if (_isUploadingStory)
                  const CircularProgressIndicator(color: Colors.white),
              ],
            ),
            const SizedBox(height: 6),
            Text(
              _isUploadingStory ? 'Subiendo...' : 'Tu historia',
              style: GoogleFonts.roboto(
                fontSize: 12,
                color: Colors.white70,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStoryAvatar(UserStoryGroup group) {
    // Si tiene historias sin ver, borde con gradiente de instagram
    final hasUnseen = !group.allViewed;
    
    return GestureDetector(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (context) => StoryViewScreen(
              storyGroup: group,
              allGroups: _stories,
            ),
          ),
        );
      },
      child: Container(
        margin: const EdgeInsets.only(right: 16),
        child: Column(
          children: [
            Container(
              width: 65,
              height: 65,
              padding: const EdgeInsets.all(3),
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                gradient: hasUnseen
                    ? const LinearGradient(
                        colors: [Color(0xFF833AB4), Color(0xFFFD1D1D), Color(0xFFFCEA2B)],
                        begin: Alignment.topRight,
                        end: Alignment.bottomLeft,
                      )
                    : null,
                border: hasUnseen 
                    ? null 
                    : Border.all(color: Colors.white24, width: 2),
              ),
              child: Container(
                decoration: const BoxDecoration(
                  shape: BoxShape.circle,
                  color: Color(0xFF0A0E21),
                ),
                padding: const EdgeInsets.all(2),
                child: ClipOval(
                  child: CachedNetworkImage(
                    imageUrl: group.authorAvatarUrl,
                    fit: BoxFit.cover,
                    placeholder: (context, url) => Container(color: Colors.white12),
                    errorWidget: (context, url, error) => Container(
                      color: Colors.white12,
                      child: const Icon(Icons.person, color: Colors.white54),
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              _getShortName(group.authorName),
              style: GoogleFonts.roboto(
                fontSize: 12,
                color: Colors.white,
                fontWeight: hasUnseen ? FontWeight.w600 : FontWeight.normal,
              ),
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  String _getShortName(String fullName) {
    final parts = fullName.split(' ');
    if (parts.isEmpty) return '';
    return parts[0];
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.photo_library_outlined,
            size: 80,
            color: Colors.white.withValues(alpha: 0.3),
          ),
          const SizedBox(height: 16),
          Text(
            'Aún no hay publicaciones',
            style: GoogleFonts.roboto(
              fontSize: 18,
              fontWeight: FontWeight.w600,
              color: Colors.white.withValues(alpha: 0.7),
            ),
          ),
          const SizedBox(height: 8),
          Text(
            '¡Sé el primero en compartir un momento!',
            style: GoogleFonts.roboto(
              fontSize: 14,
              color: Colors.white.withValues(alpha: 0.5),
            ),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: _navigateToCreatePost,
            icon: const Icon(Icons.add_photo_alternate),
            label: const Text('CREAR POST'),
            style: ElevatedButton.styleFrom(
              backgroundColor: Theme.of(context).primaryColor,
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 12),
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _handleLikeToggle(SocialPost post) async {
    final userId = Supabase.instance.client.auth.currentUser?.id;
    if (userId == null) return;

    try {
      final newLikeState = await _socialService.toggleLike(
        postId: post.id,
        userId: userId,
      );

      setState(() {
        final index = _posts.indexWhere((p) => p.id == post.id);
        if (index != -1) {
          _posts[index] = _posts[index].copyWith(
            likesCount: newLikeState
                ? _posts[index].likesCount + 1
                : _posts[index].likesCount - 1,
            isLikedByMe: newLikeState,
          );
        }
      });
    } catch (e) {
      _showError('Error al dar like: $e');
    }
  }

  Future<void> _handleDelete(String postId) async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        backgroundColor: const Color(0xFF1D1E33),
        title: Text(
          '¿Eliminar publicación?',
          style: GoogleFonts.roboto(color: Colors.white),
        ),
        content: Text(
          'Esta acción no se puede deshacer',
          style: GoogleFonts.roboto(color: Colors.white70),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('CANCELAR'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: const Text('ELIMINAR', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );

    if (confirmed == true) {
      try {
        await _socialService.deletePost(postId: postId);
        setState(() {
          _posts.removeWhere((p) => p.id == postId);
        });
      } catch (e) {
        _showError('Error al eliminar: $e');
      }
    }
  }
}

// ============================================================
// SOCIAL POST CARD - Componente individual de post
// ============================================================

class SocialPostCard extends StatelessWidget {
  final SocialPost post;
  final VoidCallback onLikeToggle;
  final VoidCallback onDelete;
  final bool showTeamName; // Mostrar nombre del equipo (para posts del club)

  const SocialPostCard({
    super.key,
    required this.post,
    required this.onLikeToggle,
    required this.onDelete,
    this.showTeamName = false,
  });

  @override
  Widget build(BuildContext context) {
    final currentUserId = Supabase.instance.client.auth.currentUser?.id;
    final isAuthor = currentUserId == post.userId;

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: const Color(0xFF1D1E33),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: Colors.white.withValues(alpha: 0.1),
          width: 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.3),
            blurRadius: 8,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header: Avatar + Nombre + Fecha
          _PostHeader(
            authorName: post.authorName ?? 'Usuario',
            authorRole: post.authorRole ?? 'Miembro',
            relativeTime: post.getRelativeTime(),
            isAuthor: isAuthor,
            onDelete: onDelete,
            teamName: showTeamName ? post.teamName : null,
          ),

          // Media Content (Imagen o Video)
          _PostMedia(post: post),

          // Footer: Likes + Descripción
          _PostFooter(
            post: post,
            onLikeToggle: onLikeToggle,
          ),
        ],
      ),
    );
  }
}

// ============================================================
// POST HEADER - Cabecera del post
// ============================================================

class _PostHeader extends StatelessWidget {
  final String authorName;
  final String authorRole;
  final String relativeTime;
  final bool isAuthor;
  final VoidCallback onDelete;
  final String? teamName; // Nombre del equipo (para posts del club)

  const _PostHeader({
    required this.authorName,
    required this.authorRole,
    required this.relativeTime,
    required this.isAuthor,
    required this.onDelete,
    this.teamName,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(12.0),
      child: Row(
        children: [
          // Avatar circular
          CircleAvatar(
            radius: 20,
            backgroundColor: Theme.of(context).primaryColor.withValues(alpha: 0.2),
            child: Text(
              authorName[0].toUpperCase(),
              style: GoogleFonts.oswald(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Theme.of(context).primaryColor,
              ),
            ),
          ),
          const SizedBox(width: 12),

          // Nombre y rol
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  authorName,
                  style: GoogleFonts.roboto(
                    fontSize: 15,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                  ),
                ),
                Text(
                  teamName != null
                      ? '$authorRole • $teamName • $relativeTime'
                      : '$authorRole • $relativeTime',
                  style: GoogleFonts.roboto(
                    fontSize: 12,
                    color: Colors.white.withValues(alpha: 0.6),
                  ),
                ),
              ],
            ),
          ),

          // Botón de eliminar (solo si es el autor)
          if (isAuthor)
            IconButton(
              icon: const Icon(Icons.delete_outline, size: 20),
              color: Colors.red.withValues(alpha: 0.7),
              onPressed: onDelete,
            ),
        ],
      ),
    );
  }
}

// ============================================================
// POST MEDIA - Contenido multimedia
// ============================================================

class _PostMedia extends StatelessWidget {
  final SocialPost post;

  const _PostMedia({required this.post});

  @override
  Widget build(BuildContext context) {
    if (post.mediaType == MediaType.image) {
      return _buildImageContent();
    } else {
      return _buildVideoThumbnail();
    }
  }

  Widget _buildImageContent() {
    return CachedNetworkImage(
      imageUrl: post.mediaUrl,
      fit: BoxFit.cover,
      width: double.infinity,
      height: 400,
      placeholder: (context, url) => Container(
        height: 400,
        color: Colors.black26,
        child: const Center(
          child: CircularProgressIndicator(),
        ),
      ),
      errorWidget: (context, url, error) => Container(
        height: 400,
        color: Colors.black26,
        child: const Icon(Icons.error_outline, color: Colors.red, size: 50),
      ),
    );
  }

  Widget _buildVideoThumbnail() {
    return Stack(
      alignment: Alignment.center,
      children: [
        // Thumbnail del video
        if (post.thumbnailUrl != null)
          CachedNetworkImage(
            imageUrl: post.thumbnailUrl!,
            fit: BoxFit.cover,
            width: double.infinity,
            height: 400,
            placeholder: (context, url) => Container(
              height: 400,
              color: Colors.black26,
              child: const Center(child: CircularProgressIndicator()),
            ),
            errorWidget: (context, url, error) => Container(
              height: 400,
              color: Colors.black26,
              child: const Icon(Icons.video_library, color: Colors.white54, size: 80),
            ),
          )
        else
          Container(
            height: 400,
            color: Colors.black26,
            child: const Icon(Icons.video_library, color: Colors.white54, size: 80),
          ),

        // Botón de Play
        Container(
          width: 70,
          height: 70,
          decoration: BoxDecoration(
            color: Colors.black.withValues(alpha: 0.6),
            shape: BoxShape.circle,
          ),
          child: const Icon(
            Icons.play_arrow_rounded,
            color: Colors.white,
            size: 50,
          ),
        ),
      ],
    );
  }
}

// ============================================================
// POST FOOTER - Likes y descripción y Comentarios
// ============================================================

class _PostFooter extends StatefulWidget {
  final SocialPost post;
  final VoidCallback onLikeToggle;

  const _PostFooter({
    required this.post,
    required this.onLikeToggle,
  });

  @override
  State<_PostFooter> createState() => _PostFooterState();
}

class _PostFooterState extends State<_PostFooter> {
  final SocialService _socialService = SocialService();

  void _showCommentsBottomSheet(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: const Color(0xFF1D1E33),
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) {
        return DraggableScrollableSheet(
          initialChildSize: 0.6,
          maxChildSize: 0.9,
          minChildSize: 0.4,
          expand: false,
          builder: (_, controller) {
            return _CommentsSheet(
              post: widget.post,
              socialService: _socialService,
              scrollController: controller,
            );
          },
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLiked = widget.post.isLikedByMe ?? false;

    return Padding(
      padding: const EdgeInsets.all(12.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Botones de acción
          Row(
            children: [
              IconButton(
                icon: Icon(
                  isLiked ? Icons.favorite : Icons.favorite_outline,
                  color: isLiked ? Colors.red : Colors.white70,
                ),
                onPressed: widget.onLikeToggle,
              ),
              Text(
                '${widget.post.likesCount}',
                style: GoogleFonts.roboto(
                  fontSize: 16,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                ),
              ),
              const SizedBox(width: 16),
              
              // Botón de Comentarios
              GestureDetector(
                onTap: () => _showCommentsBottomSheet(context),
                child: Row(
                  children: [
                    Icon(
                      Icons.chat_bubble_outline,
                      size: 24,
                      color: Colors.white.withValues(alpha: 0.8),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      '${widget.post.commentsCount}',
                      style: GoogleFonts.roboto(
                        fontSize: 16,
                        color: Colors.white.withValues(alpha: 0.8),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),

          // Descripción del post
          if (widget.post.contentText != null && widget.post.contentText!.isNotEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 8.0, bottom: 4.0),
              child: Text(
                widget.post.contentText!,
                style: GoogleFonts.roboto(
                  fontSize: 14,
                  color: Colors.white.withValues(alpha: 0.9),
                  height: 1.4,
                ),
              ),
            ),
            
            // "Ver comentarios" enlace rápido
            if (widget.post.commentsCount > 0)
              GestureDetector(
                onTap: () => _showCommentsBottomSheet(context),
                child: Padding(
                  padding: const EdgeInsets.only(top: 4.0),
                  child: Text(
                    'Ver los ${widget.post.commentsCount} comentarios',
                    style: GoogleFonts.roboto(
                      color: Colors.grey,
                      fontSize: 13,
                    ),
                  ),
                ),
              ),
        ],
      ),
    );
  }
}

// ============================================================
// COMMENTS SHEET - Componente para la ventana de comentarios
// ============================================================

import '../models/social_post_comment_model.dart';

class _CommentsSheet extends StatefulWidget {
  final SocialPost post;
  final SocialService socialService;
  final ScrollController scrollController;

  const _CommentsSheet({
    required this.post,
    required this.socialService,
    required this.scrollController,
  });

  @override
  State<_CommentsSheet> createState() => _CommentsSheetState();
}

class _CommentsSheetState extends State<_CommentsSheet> {
  final TextEditingController _commentController = TextEditingController();
  bool _isSubmitting = false;

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _submitComment() async {
    final text = _commentController.text.trim();
    if (text.isEmpty) return;

    setState(() => _isSubmitting = true);
    
    try {
      await widget.socialService.addComment(
        postId: widget.post.id, 
        content: text,
      );
      _commentController.clear();
      FocusScope.of(context).unfocus();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al comentar: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSubmitting = false);
    }
  }

  Future<void> _deleteComment(String commentId) async {
    try {
      await widget.socialService.deleteComment(commentId);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al borrar: $e'), backgroundColor: Colors.red),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        // Manija decorativa
        Container(
          width: 40,
          height: 4,
          margin: const EdgeInsets.only(top: 12, bottom: 12),
          decoration: BoxDecoration(
            color: Colors.grey.withOpacity(0.5),
            borderRadius: BorderRadius.circular(2),
          ),
        ),
        Text(
          'Comentarios',
          style: GoogleFonts.oswald(
            fontSize: 18, 
            fontWeight: FontWeight.bold, 
            color: Colors.white,
          ),
        ),
        const Divider(color: Colors.white24, height: 20),
        
        // Lista de Comentarios en Tiempo Real
        Expanded(
          child: StreamBuilder<List<SocialPostComment>>(
            stream: widget.socialService.streamPostComments(widget.post.id),
            builder: (context, snapshot) {
              if (snapshot.connectionState == ConnectionState.waiting) {
                return const Center(child: CircularProgressIndicator(color: Colors.cyan));
              }

              if (snapshot.hasError) {
                return Center(child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Colors.red)));
              }

              final comments = snapshot.data ?? [];

              if (comments.isEmpty) {
                return Center(
                  child: Text(
                    'No hay comentarios aún.\n¡Sé el primero en opinar!',
                    textAlign: TextAlign.center,
                    style: GoogleFonts.roboto(color: Colors.grey),
                  ),
                );
              }

              return ListView.builder(
                controller: widget.scrollController,
                itemCount: comments.length,
                itemBuilder: (context, index) {
                  final comment = comments[index];
                  final isMyComment = comment.userId == Supabase.instance.client.auth.currentUser?.id;

                  return ListTile(
                    leading: CircleAvatar(
                      backgroundColor: Colors.cyan.withOpacity(0.2),
                      backgroundImage: comment.authorAvatarUrl != null ? NetworkImage(comment.authorAvatarUrl!) : null,
                      child: comment.authorAvatarUrl == null 
                          ? Text(comment.authorName?.substring(0, 1).toUpperCase() ?? 'U', style: const TextStyle(color: Colors.cyan)) 
                          : null,
                    ),
                    title: Row(
                      children: [
                        Text(
                          comment.authorName ?? 'Usuario',
                          style: GoogleFonts.roboto(fontWeight: FontWeight.bold, color: Colors.white, fontSize: 13),
                        ),
                        const SizedBox(width: 8),
                        Text(
                          comment.getRelativeTime(),
                          style: GoogleFonts.roboto(color: Colors.grey, fontSize: 11),
                        ),
                      ],
                    ),
                    subtitle: Padding(
                      padding: const EdgeInsets.only(top: 4.0),
                      child: Text(
                        comment.content,
                        style: GoogleFonts.roboto(color: Colors.white70, fontSize: 14),
                      ),
                    ),
                    trailing: isMyComment
                        ? IconButton(
                            icon: const Icon(Icons.close, size: 16, color: Colors.grey),
                            onPressed: () => _deleteComment(comment.id),
                          )
                        : null,
                  );
                },
              );
            },
          ),
        ),
        
        // Input Area
        SafeArea(
          child: Container(
            padding: EdgeInsets.only(
              left: 16, 
              right: 16, 
              top: 10, 
              bottom: MediaQuery.of(context).viewInsets.bottom + 10,
            ),
            decoration: BoxDecoration(
              color: const Color(0xFF0A0E21),
              border: Border(top: BorderSide(color: Colors.white.withOpacity(0.1))),
            ),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _commentController,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Añadir un comentario...',
                      hintStyle: const TextStyle(color: Colors.grey),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(24),
                        borderSide: BorderSide.none,
                      ),
                      filled: true,
                      fillColor: const Color(0xFF1D1E33),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                _isSubmitting
                    ? const Padding(
                        padding: EdgeInsets.all(12.0),
                        child: SizedBox(width: 24, height: 24, child: CircularProgressIndicator(color: Colors.cyan, strokeWidth: 2)),
                      )
                    : IconButton(
                        icon: const Icon(Icons.send, color: Colors.cyan),
                        onPressed: _submitComment,
                      ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}
