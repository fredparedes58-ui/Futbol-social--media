import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:video_player/video_player.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/highlight_model.dart';
import '../services/highlight_service.dart';
import 'create_highlight_screen.dart'; // Crearemos esto pronto

class HighlightsFeedScreen extends StatefulWidget {
  final String teamId;

  const HighlightsFeedScreen({super.key, required this.teamId});

  @override
  State<HighlightsFeedScreen> createState() => _HighlightsFeedScreenState();
}

class _HighlightsFeedScreenState extends State<HighlightsFeedScreen> {
  final HighlightService _highlightService = HighlightService();
  final PageController _pageController = PageController();

  List<HighlightModel> _highlights = [];
  bool _isLoading = true;
  String? _errorMessage;
  int _currentIndex = 0;

  @override
  void initState() {
    super.initState();
    _loadHighlights();
  }

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _loadHighlights() async {
    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final highlights = await _highlightService.getHighlightsFeed(
        teamId: widget.teamId,
        limit: 10,
      );

      setState(() {
        _highlights = highlights;
        _isLoading = false;
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _isLoading = false;
          _errorMessage = 'Error al cargar Highlights';
        });
      }
    }
  }

  void _onPageChanged(int index) {
    setState(() {
      _currentIndex = index;
    });
    // Si quedan 2 videos, precargar la siguiente página... (Paginación Infinita)
    if (index >= _highlights.length - 2) {
      _loadMoreHighlights();
    }
  }

  Future<void> _loadMoreHighlights() async {
    // Para simplificar, asumiremos que limitamos a 10 + n en el futuro.
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Scaffold(
        backgroundColor: Colors.black,
        body: Center(child: CircularProgressIndicator(color: Colors.white)),
      );
    }

    if (_errorMessage != null) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.error_outline, color: Colors.white54, size: 60),
              const SizedBox(height: 16),
              Text(_errorMessage!, style: const TextStyle(color: Colors.white)),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: _loadHighlights,
                child: const Text('Reintentar'),
              ),
            ],
          ),
        ),
      );
    }

    if (_highlights.isEmpty) {
      return Scaffold(
        backgroundColor: Colors.black,
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.videocam_off_outlined, color: Colors.white54, size: 80),
              const SizedBox(height: 16),
              Text(
                'Aún no hay Highlights',
                style: GoogleFonts.roboto(
                  fontSize: 20,
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                '¡Sé el primero en subir un Reel del equipo!',
                style: GoogleFonts.roboto(color: Colors.white54, fontSize: 16),
              ),
              const SizedBox(height: 24),
              ElevatedButton.icon(
                icon: const Icon(Icons.add, color: Colors.black),
                label: Text('Crear Highlight', style: GoogleFonts.roboto(color: Colors.black, fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Theme.of(context).primaryColor,
                ),
                onPressed: () {
                  Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (context) => CreateHighlightScreen(teamId: widget.teamId),
                    ),
                  ).then((_) => _loadHighlights());
                },
              )
            ],
          ),
        ),
      );
    }

    return Scaffold(
      backgroundColor: Colors.black,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: Text(
          'Highlights',
          style: GoogleFonts.oswald(
            fontSize: 24,
            fontWeight: FontWeight.bold,
            color: Colors.white,
            shadows: const [Shadow(color: Colors.black54, blurRadius: 4, offset: Offset(1, 1))],
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.camera_alt_outlined, color: Colors.white, shadows: [Shadow(color: Colors.black, blurRadius: 4)]),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(
                  builder: (context) => CreateHighlightScreen(teamId: widget.teamId),
                ),
              ).then((_) => _loadHighlights());
            },
          ),
        ],
      ),
      body: PageView.builder(
        controller: _pageController,
        scrollDirection: Axis.vertical,
        itemCount: _highlights.length,
        onPageChanged: _onPageChanged,
        itemBuilder: (context, index) {
          return HighlightVideoPlayer(
            highlight: _highlights[index],
            service: _highlightService,
            isActive: _currentIndex == index,
          );
        },
      ),
    );
  }
}

/// Widget individual que envuelve un `video_player` dentro de la página vertical
class HighlightVideoPlayer extends StatefulWidget {
  final HighlightModel highlight;
  final HighlightService service;
  final bool isActive;

  const HighlightVideoPlayer({
    super.key,
    required this.highlight,
    required this.service,
    required this.isActive,
  });

  @override
  State<HighlightVideoPlayer> createState() => _HighlightVideoPlayerState();
}

class _HighlightVideoPlayerState extends State<HighlightVideoPlayer> {
  late VideoPlayerController _videoController;
  bool _isInit = false;
  late HighlightModel _currentHighlight; // Local copy for UI mutate
  bool _hasLoggedView = false;

  @override
  void initState() {
    super.initState();
    _currentHighlight = widget.highlight;
    _initializeVideo();
  }

  @override
  void didUpdateWidget(HighlightVideoPlayer oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.isActive && !oldWidget.isActive && _isInit) {
      _videoController.play();
      _logViewOnce();
    } else if (!widget.isActive && oldWidget.isActive && _isInit) {
      _videoController.pause();
      _videoController.seekTo(Duration.zero);
    }
  }

  Future<void> _initializeVideo() async {
    try {
      _videoController = VideoPlayerController.networkUrl(Uri.parse(_currentHighlight.videoUrl));
      await _videoController.initialize();
      _videoController.setLooping(true);
      if (mounted) {
        setState(() {
          _isInit = true;
        });
        if (widget.isActive) {
          _videoController.play();
          _logViewOnce();
        }
      }
    } catch (e) {
      debugPrint('Error init video: $e');
    }
  }

  void _logViewOnce() {
    if (!_hasLoggedView) {
      widget.service.logView(_currentHighlight.id);
      _hasLoggedView = true;
    }
  }

  @override
  void dispose() {
    _videoController.dispose();
    super.dispose();
  }

  void _handleLike() async {
    final oldState = _currentHighlight.isLikedByMe;
    final oldLikes = _currentHighlight.likesCount;
    
    // UI Optimista
    setState(() {
      _currentHighlight.isLikedByMe = !oldState;
      _currentHighlight = _currentHighlight.copyWith(
        likesCount: oldState ? oldLikes - 1 : oldLikes + 1,
      );
    });

    try {
      final isNowLiked = await widget.service.toggleLike(_currentHighlight.id);
      // Sincronizar por si falló (es poco probable)
      if (isNowLiked != _currentHighlight.isLikedByMe) {
        setState(() {
          _currentHighlight.isLikedByMe = isNowLiked;
        });
      }
    } catch (e) {
      // Revertir
      setState(() {
         _currentHighlight.isLikedByMe = oldState;
         _currentHighlight = _currentHighlight.copyWith(likesCount: oldLikes);
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      fit: StackFit.expand,
      children: [
        // Reproductor
        GestureDetector(
          onTap: () {
            if (_videoController.value.isPlaying) {
              _videoController.pause();
            } else {
              _videoController.play();
            }
          },
          child: _isInit
              ? FittedBox(
                  fit: BoxFit.cover,
                  child: SizedBox(
                    width: _videoController.value.size.width,
                    height: _videoController.value.size.height,
                    child: VideoPlayer(_videoController),
                  ),
                )
              : Container(
                  color: const Color(0xFF1D1E33),
                  child: const Center(child: CircularProgressIndicator(color: Colors.white)),
                ),
        ),

        // Gradiente Inferior
        Positioned(
          bottom: 0,
          left: 0,
          right: 0,
          height: 250,
          child: Container(
            decoration: const BoxDecoration(
              gradient: LinearGradient(
                colors: [Colors.transparent, Colors.black87],
                begin: Alignment.topCenter,
                end: Alignment.bottomCenter,
              ),
            ),
          ),
        ),

        // Textos (Izquierda)
        Positioned(
          bottom: 30,
          left: 20,
          right: 80,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                '@${_currentHighlight.authorName}',
                style: GoogleFonts.roboto(
                  color: Colors.white,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                  shadows: const [Shadow(color: Colors.black, blurRadius: 2)],
                ),
              ),
              const SizedBox(height: 8),
              if (_currentHighlight.description != null && _currentHighlight.description!.isNotEmpty)
                Text(
                  _currentHighlight.description!,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                  style: GoogleFonts.roboto(
                    color: Colors.white,
                    fontSize: 14,
                    shadows: const [Shadow(color: Colors.black, blurRadius: 2)],
                  ),
                ),
            ],
          ),
        ),

        // Botones (Derecha)
        Positioned(
          bottom: 40,
          right: 16,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              // Avatar
              Container(
                width: 50,
                height: 50,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(color: Colors.white, width: 2),
                ),
                child: ClipOval(
                  child: _currentHighlight.authorAvatarUrl != null
                      ? CachedNetworkImage(
                          imageUrl: _currentHighlight.authorAvatarUrl!,
                          fit: BoxFit.cover,
                        )
                      : Container(color: Colors.grey, child: const Icon(Icons.person, color: Colors.white)),
                ),
              ),
              const SizedBox(height: 24),
              
              // Like
              GestureDetector(
                onTap: _handleLike,
                child: Column(
                  children: [
                    Icon(
                      _currentHighlight.isLikedByMe ? Icons.favorite : Icons.favorite_border,
                      color: _currentHighlight.isLikedByMe ? Colors.red : Colors.white,
                      size: 38,
                      shadows: const [Shadow(color: Colors.black45, blurRadius: 8)],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${_currentHighlight.likesCount}',
                      style: GoogleFonts.roboto(color: Colors.white, fontWeight: FontWeight.bold),
                    )
                  ],
                ),
              ),
              const SizedBox(height: 24),

              // Comentarios (Placeholder visual)
              Column(
                children: [
                  const Icon(
                    Icons.chat_bubble_outline,
                    color: Colors.white,
                    size: 34,
                    shadows: [Shadow(color: Colors.black45, blurRadius: 8)],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'View',
                    style: GoogleFonts.roboto(color: Colors.white, fontWeight: FontWeight.bold),
                  )
                ],
              ),
              const SizedBox(height: 24),
              
              // Share (Placeholder visual)
              const Icon(
                Icons.send,
                color: Colors.white,
                size: 34,
                shadows: [Shadow(color: Colors.black45, blurRadius: 8)],
              ),
            ],
          ),
        ),
      ],
    );
  }
}
