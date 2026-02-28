import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../models/social_story_model.dart';
import 'package:video_player/video_player.dart';

class StoryViewScreen extends StatefulWidget {
  final UserStoryGroup storyGroup;
  final List<UserStoryGroup> allGroups;

  const StoryViewScreen({
    super.key,
    required this.storyGroup,
    required this.allGroups,
  });

  @override
  State<StoryViewScreen> createState() => _StoryViewScreenState();
}

class _StoryViewScreenState extends State<StoryViewScreen>
    with SingleTickerProviderStateMixin {
  late PageController _pageController;
  late AnimationController _animationController;
  VideoPlayerController? _videoController;

  int _currentGroupIndex = 0;
  int _currentStoryIndex = 0;

  @override
  void initState() {
    super.initState();
    _currentGroupIndex = widget.allGroups.indexOf(widget.storyGroup);
    // Manejo de error si no se encuentra
    if (_currentGroupIndex == -1) _currentGroupIndex = 0;

    _pageController = PageController();
    _animationController = AnimationController(vsync: this);

    _animationController.addStatusListener((status) {
      if (status == AnimationStatus.completed) {
        _nextStory();
      }
    });

    _loadStory();
  }

  @override
  void dispose() {
    _pageController.dispose();
    _animationController.dispose();
    _videoController?.dispose();
    super.dispose();
  }

  Future<void> _loadStory() async {
    _animationController.stop();
    _animationController.reset();

    final currentStory = _getCurrentStory();

    if (currentStory.mediaType == MediaType.video) {
      _videoController?.dispose();
      _videoController = VideoPlayerController.networkUrl(Uri.parse(currentStory.mediaUrl));
      
      try {
        await _videoController!.initialize();
        setState(() {});
        _animationController.duration = _videoController!.value.duration;
        _videoController!.play();
        _animationController.forward();
      } catch (e) {
        debugPrint('Error loading video story: $e');
        _fallbackToNext();
      }
    } else {
      // Imagen
      _videoController?.dispose();
      _videoController = null;
      _animationController.duration = Duration(seconds: currentStory.durationSeconds);
      _animationController.forward();
      setState(() {});
    }
  }

  void _fallbackToNext() {
    Future.delayed(const Duration(seconds: 1), () {
      if (mounted) _nextStory();
    });
  }

  SocialStory _getCurrentStory() {
    return widget.allGroups[_currentGroupIndex].stories[_currentStoryIndex];
  }

  void _nextStory() {
    if (_currentStoryIndex < widget.allGroups[_currentGroupIndex].stories.length - 1) {
      // Siguiente historia en este grupo
      setState(() {
        _currentStoryIndex++;
      });
      _loadStory();
    } else {
      // Siguiente grupo de historias
      if (_currentGroupIndex < widget.allGroups.length - 1) {
        setState(() {
          _currentGroupIndex++;
          _currentStoryIndex = 0;
        });
        _loadStory();
      } else {
        // Se acabaron todos los grupos
        Navigator.of(context).pop();
      }
    }
  }

  void _previousStory() {
    if (_currentStoryIndex > 0) {
      // Historia anterior en este grupo
      setState(() {
        _currentStoryIndex--;
      });
      _loadStory();
    } else {
      // Grupo anterior
      if (_currentGroupIndex > 0) {
        setState(() {
          _currentGroupIndex--;
          _currentStoryIndex = widget.allGroups[_currentGroupIndex].stories.length - 1;
        });
        _loadStory();
      } else {
        // Estaba en la primera historia de todas
        _loadStory(); // Reiniciamos la animación actual
      }
    }
  }

  void _onTapDown(TapDownDetails details) {
    final double screenWidth = MediaQuery.of(context).size.width;
    final double dx = details.globalPosition.dx;

    // Si toca el 30% izquierdo, retrocede. Si toca el 70% derecho, avanza.
    if (dx < screenWidth * 0.3) {
      _previousStory();
    } else {
      _nextStory();
    }
  }

  void _onLongPressStart(LongPressStartDetails details) {
    _animationController.stop();
    _videoController?.pause();
  }

  void _onLongPressEnd(LongPressEndDetails details) {
    _animationController.forward();
    _videoController?.play();
  }

  @override
  Widget build(BuildContext context) {
    final currentGroup = widget.allGroups[_currentGroupIndex];
    final currentStory = _getCurrentStory();

    return Scaffold(
      backgroundColor: Colors.black,
      body: GestureDetector(
        onTapDown: _onTapDown,
        onLongPressStart: _onLongPressStart,
        onLongPressEnd: _onLongPressEnd,
        // Deslizar hacia abajo para cerrar
        onVerticalDragUpdate: (details) {
          if (details.primaryDelta! > 10) {
            Navigator.of(context).pop();
          }
        },
        child: Stack(
          children: [
            // MEDIA (Imagen o Video)
            Positioned.fill(
              child: currentStory.mediaType == MediaType.video
                  ? _buildVideoPlayer()
                  : _buildImageView(currentStory.mediaUrl),
            ),

            // BARRA DE PROGRESO (Arriba)
            Positioned(
              top: 50,
              left: 10,
              right: 10,
              child: Row(
                children: currentGroup.stories.asMap().entries.map((entry) {
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2.0),
                      child: AnimatedBuilder(
                        animation: _animationController,
                        builder: (context, child) {
                          return LinearProgressIndicator(
                            value: _getProgressValue(entry.key),
                            backgroundColor: Colors.white.withValues(alpha: 0.3),
                            valueColor: const AlwaysStoppedAnimation<Color>(Colors.white),
                            minHeight: 2,
                          );
                        },
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            // HEADER (Logo + Nombre + Tiempo + Cerrar)
            Positioned(
              top: 65,
              left: 10,
              right: 10,
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 18,
                    backgroundImage: CachedNetworkImageProvider(currentGroup.authorAvatarUrl),
                    backgroundColor: Colors.grey.shade900,
                  ),
                  const SizedBox(width: 10),
                  Text(
                    currentGroup.authorName,
                    style: GoogleFonts.roboto(
                      color: Colors.white,
                      fontSize: 14,
                      fontWeight: FontWeight.bold,
                      shadows: [
                        const Shadow(color: Colors.black45, blurRadius: 4, offset: Offset(1, 1))
                      ],
                    ),
                  ),
                  const Spacer(),
                  IconButton(
                    icon: const Icon(Icons.close, color: Colors.white, size: 28),
                    onPressed: () => Navigator.of(context).pop(),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildImageView(String url) {
    return CachedNetworkImage(
      imageUrl: url,
      fit: BoxFit.cover,
      placeholder: (context, url) => const Center(
        child: CircularProgressIndicator(color: Colors.white),
      ),
      errorWidget: (context, url, error) => const Center(
        child: Icon(Icons.error, color: Colors.white, size: 50),
      ),
    );
  }

  Widget _buildVideoPlayer() {
    if (_videoController != null && _videoController!.value.isInitialized) {
      return FittedBox(
        fit: BoxFit.cover,
        child: SizedBox(
          width: _videoController!.value.size.width,
          height: _videoController!.value.size.height,
          child: VideoPlayer(_videoController!),
        ),
      );
    } else {
      return const Center(
        child: CircularProgressIndicator(color: Colors.white),
      );
    }
  }

  double _getProgressValue(int index) {
    if (index < _currentStoryIndex) {
      return 1.0; // Ya vista
    } else if (index == _currentStoryIndex) {
      return _animationController.value; // Viendo actualmente
    } else {
      return 0.0; // Aún no vista
    }
  }
}
