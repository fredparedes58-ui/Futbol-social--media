import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:image_picker/image_picker.dart';
import 'package:video_player/video_player.dart';
import '../services/highlight_service.dart';

class CreateHighlightScreen extends StatefulWidget {
  final String teamId;

  const CreateHighlightScreen({super.key, required this.teamId});

  @override
  State<CreateHighlightScreen> createState() => _CreateHighlightScreenState();
}

class _CreateHighlightScreenState extends State<CreateHighlightScreen> {
  final HighlightService _highlightService = HighlightService();
  final TextEditingController _descController = TextEditingController();

  File? _selectedVideo;
  VideoPlayerController? _videoController;
  bool _isUploading = false;

  @override
  void dispose() {
    _descController.dispose();
    _videoController?.dispose();
    super.dispose();
  }

  Future<void> _pickVideo(ImageSource source) async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickVideo(
      source: source,
      maxDuration: const Duration(seconds: 60),
    );

    if (pickedFile != null) {
      if (_videoController != null) {
        await _videoController!.dispose();
      }

      final file = File(pickedFile.path);
      final controller = VideoPlayerController.file(file);

      setState(() {
        _selectedVideo = file;
        _videoController = controller;
      });

      await controller.initialize();
      controller.setLooping(true);
      controller.play();
      setState(() {});
    }
  }

  Future<void> _uploadHighlight() async {
    if (_selectedVideo == null) return;

    setState(() => _isUploading = true);

    try {
      await _highlightService.createHighlight(
        teamId: widget.teamId,
        videoFile: _selectedVideo!,
        description: _descController.text.trim(),
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('¡Highlight publicado con éxito! 🎉'),
            backgroundColor: Colors.purple,
          ),
        );
        Navigator.pop(context, true); // Retorna recarga al feed
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Error al publicar: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _isUploading = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        title: Text('Nuevo Highlight', style: GoogleFonts.oswald(color: Colors.white)),
        backgroundColor: Colors.black,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
        actions: [
          if (_selectedVideo != null && !_isUploading)
            TextButton(
              onPressed: _uploadHighlight,
              child: Text(
                'Publicar',
                style: GoogleFonts.roboto(
                  color: Theme.of(context).primaryColor,
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
        ],
      ),
      body: Stack(
        children: [
          if (_selectedVideo == null)
            Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.video_library_outlined, size: 80, color: Colors.white.withValues(alpha: 0.3)),
                  const SizedBox(height: 20),
                  Text(
                    'Sube un video de tu mejor jugada',
                    style: GoogleFonts.roboto(color: Colors.white70, fontSize: 16),
                  ),
                  const SizedBox(height: 40),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _buildSourceButton(
                        icon: Icons.camera_alt,
                        label: 'Cámara',
                        color: Colors.purpleAccent,
                        onTap: () => _pickVideo(ImageSource.camera),
                      ),
                      const SizedBox(width: 40),
                      _buildSourceButton(
                        icon: Icons.photo_library,
                        label: 'Galería',
                        color: Colors.blueAccent,
                        onTap: () => _pickVideo(ImageSource.gallery),
                      ),
                    ],
                  )
                ],
              ),
            )
          else
            Column(
              children: [
                Expanded(
                  child: Container(
                    width: double.infinity,
                    color: Colors.black,
                    child: _videoController != null && _videoController!.value.isInitialized
                        ? AspectRatio(
                            aspectRatio: _videoController!.value.aspectRatio,
                            child: VideoPlayer(_videoController!),
                          )
                        : const Center(child: CircularProgressIndicator(color: Colors.white)),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(16),
                  color: const Color(0xFF1D1E33),
                  child: Column(
                    children: [
                      TextField(
                        controller: _descController,
                        style: const TextStyle(color: Colors.white),
                        maxLength: 150,
                        decoration: InputDecoration(
                          hintText: 'Describe la jugada...',
                          hintStyle: const TextStyle(color: Colors.white54),
                          border: InputBorder.none,
                          counterStyle: const TextStyle(color: Colors.white30),
                        ),
                      ),
                      const SizedBox(height: 16),
                      SizedBox(
                        width: double.infinity,
                        height: 50,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: Theme.of(context).primaryColor,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          onPressed: _isUploading ? null : _uploadHighlight,
                          child: _isUploading
                              ? const CircularProgressIndicator(color: Colors.white)
                              : Text(
                                  'COMPARTIR',
                                  style: GoogleFonts.oswald(
                                      fontSize: 18, color: Colors.black, fontWeight: FontWeight.bold),
                                ),
                        ),
                      ),
                      const SizedBox(height: 20),
                    ],
                  ),
                )
              ],
            ),
            
            if (_isUploading)
               Positioned.fill(
                 child: Container(
                   color: Colors.black87,
                   child: const Center(
                     child: Column(
                       mainAxisSize: MainAxisSize.min,
                       children: [
                         CircularProgressIndicator(color: Colors.purpleAccent),
                         SizedBox(height: 16),
                         Text('Procesando video...', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold))
                       ],
                     ),
                   ),
                 ),
               ),
        ],
      ),
    );
  }

  Widget _buildSourceButton({required IconData icon, required String label, required Color color, required VoidCallback onTap}) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.2),
              shape: BoxShape.circle,
              border: Border.all(color: color, width: 2),
            ),
            child: Icon(icon, color: color, size: 32),
          ),
          const SizedBox(height: 12),
          Text(label, style: GoogleFonts.roboto(color: Colors.white, fontWeight: FontWeight.w500)),
        ],
      ),
    );
  }
}
