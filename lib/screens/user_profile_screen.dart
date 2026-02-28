import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/social_post_model.dart';
import '../services/social_service.dart';
import '../widgets/player_card_widget.dart';
import '../widgets/radar_chart_widget.dart';
import 'edit_profile_screen.dart';

class UserProfileScreen extends StatefulWidget {
  final String userId;

  const UserProfileScreen({super.key, required this.userId});

  @override
  State<UserProfileScreen> createState() => _UserProfileScreenState();
}

class _UserProfileScreenState extends State<UserProfileScreen> {
  final SocialService _socialService = SocialService();
  bool _isLoading = true;
  List<SocialPost> _userPosts = [];
  Map<String, dynamic>? _userProfile;

  @override
  void initState() {
    super.initState();
    _loadProfileData();
  }

  Future<void> _loadProfileData() async {
    setState(() => _isLoading = true);
    try {
      // 1. Cargar datos del perfil (nombre, avatar)
      final profileResponse = await Supabase.instance.client
          .from('profiles')
          .select()
          .eq('id', widget.userId)
          .maybeSingle();

      // 2. Cargar posts del usuario para la cuadrícula
      final postsResponse = await _socialService.getUserPosts(
        userId: widget.userId,
        limit: 50,
      );

      setState(() {
        _userProfile = profileResponse;
        _userPosts = postsResponse;
        _isLoading = false;
      });
    } catch (e) {
      debugPrint('Error loading profile: $e');
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error cargando perfil: $e')),
        );
      }
    }
  }

  int get _likesCount {
    // Calculamos el total de likes recibidos sumando los likes de cada post
    return _userPosts.fold(0, (sum, post) => sum + post.likesCount);
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Color(0xFF0A0E21),
        body: Center(child: CircularProgressIndicator(color: Colors.white)),
      );
    }

    final isMe = Supabase.instance.client.auth.currentUser?.id == widget.userId;

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          _userProfile?['full_name'] ?? 'Perfil',
          style: GoogleFonts.oswald(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        centerTitle: true,
        actions: [
          if (isMe)
            IconButton(
              icon: const Icon(Icons.settings, color: Colors.white70),
              onPressed: () async {
                if (_userProfile == null) return;
                final result = await Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (context) => EditProfileScreen(currentProfile: _userProfile!),
                  ),
                );
                if (result == true) {
                  _loadProfileData(); // Recargar datos si hubo cambios
                }
              },
            ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: _loadProfileData,
        child: CustomScrollView(
          physics: const AlwaysScrollableScrollPhysics(),
          slivers: [
            // Sección Superior (Header)
            SliverToBoxAdapter(
              child: _buildProfileHeader(isMe),
            ),

            // Divisor
            SliverToBoxAdapter(
              child: Divider(
                color: Colors.white.withValues(alpha: 0.1),
                height: 30,
              ),
            ),

            // Pestañas (Grid View Icon)
            SliverToBoxAdapter(
              child: Padding(
                padding: const EdgeInsets.only(bottom: 8.0),
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.grid_on,
                      color: Theme.of(context).primaryColor,
                      size: 28,
                    ),
                  ],
                ),
              ),
            ),

            // Galería 3x3
            _userPosts.isEmpty
                ? SliverFillRemaining(child: _buildEmptyState())
                : SliverGrid(
                    gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                      crossAxisCount: 3,
                      crossAxisSpacing: 2,
                      mainAxisSpacing: 2,
                    ),
                    delegate: SliverChildBuilderDelegate(
                      (context, index) {
                        return _buildPostGridItem(_userPosts[index]);
                      },
                      childCount: _userPosts.length,
                    ),
                  ),
          ],
        ),
      ),
    );
  }

  Widget _buildProfileHeader(bool isMe) {
    if (_userProfile == null) return const SizedBox.shrink();

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 10),
      child: Column(
        children: [
          // Sección de Carta + Radar (Lado a Lado)
          Row(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              // La Carta Dorada/Plateada
              PlayerCardWidget(profile: _userProfile!),
              
              const SizedBox(width: 16),
              
              // El Gráfico de Spider a la derecha y Contadores arriba
              Expanded(
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: [
                        _buildStatColumn('Posts', _userPosts.length.toString()),
                        _buildStatColumn('Likes', _likesCount.toString()),
                      ],
                    ),
                    const SizedBox(height: 20),
                    // Radar Chart Animado
                    SizedBox(
                      height: 140,
                      child: RadarChartWidget(
                        pace: _userProfile!['stat_pace'] ?? 50,
                        shooting: _userProfile!['stat_shooting'] ?? 50,
                        passing: _userProfile!['stat_passing'] ?? 50,
                        dribbling: _userProfile!['stat_dribbling'] ?? 50,
                        defending: _userProfile!['stat_defending'] ?? 50,
                        physical: _userProfile!['stat_physical'] ?? 50,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
          
          const SizedBox(height: 24),
          
          // Botón de acción
          if (isMe)
            SizedBox(
              width: double.infinity,
              child: ElevatedButton.icon(
                icon: const Icon(Icons.tune),
                onPressed: () async {
                  final result = await Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => EditProfileScreen(currentProfile: _userProfile!),
                    ),
                  );
                  if (result == true) {
                    _loadProfileData();
                  }
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF1D1E33),
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(8),
                    side: BorderSide(color: Colors.white.withValues(alpha: 0.2)),
                  ),
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                label: const Text('Actualizar Atributos & Perfil',
                    style: TextStyle(fontWeight: FontWeight.bold)),
              ),
            ),
        ],
      ),
    );
  }

  Widget _buildStatColumn(String label, String count) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          count,
          style: GoogleFonts.oswald(
            fontSize: 22,
            fontWeight: FontWeight.bold,
            color: Colors.white,
          ),
        ),
        Text(
          label,
          style: GoogleFonts.roboto(
            fontSize: 13,
            color: Colors.white70,
          ),
        ),
      ],
    );
  }

  Widget _buildPostGridItem(SocialPost post) {
    return GestureDetector(
      onTap: () {
        // Podríamos navegar a un visor de post individual
      },
      child: Stack(
        fit: StackFit.expand,
        children: [
          CachedNetworkImage(
            imageUrl: post.mediaType == MediaType.image 
                        ? post.mediaUrl 
                        : (post.thumbnailUrl ?? post.mediaUrl),
            fit: BoxFit.cover,
            placeholder: (context, url) => Container(color: Colors.white12),
            errorWidget: (context, url, error) => Container(
              color: Colors.white12,
              child: const Icon(Icons.error_outline),
            ),
          ),
          if (post.mediaType == MediaType.video)
            const Positioned(
              top: 5,
              right: 5,
              child: Icon(Icons.play_circle_outline, color: Colors.white, size: 20),
            ),
        ],
      ),
    );
  }

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.camera_alt_outlined, size: 60, color: Colors.white.withValues(alpha: 0.2)),
          const SizedBox(height: 16),
          Text(
            'Aún no hay publicaciones',
            style: GoogleFonts.roboto(fontSize: 18, color: Colors.white54),
          ),
        ],
      ),
    );
  }
}
