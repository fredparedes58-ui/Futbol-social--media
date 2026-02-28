import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:cached_network_image/cached_network_image.dart';
import 'package:image_picker/image_picker.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../services/storage_service.dart';

class EditProfileScreen extends StatefulWidget {
  final Map<String, dynamic> currentProfile;

  const EditProfileScreen({super.key, required this.currentProfile});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _bioController;
  
  // STATS NUEVAS
  String _selectedPosition = 'MID';
  double _statPace = 50;
  double _statShooting = 50;
  double _statPassing = 50;
  double _statDribbling = 50;
  double _statDefending = 50;
  double _statPhysical = 50;
  
  File? _newAvatarImage;
  bool _isSaving = false;
  final StorageService _storageService = StorageService();

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.currentProfile['full_name'] ?? '');
    _bioController = TextEditingController(text: widget.currentProfile['bio'] ?? '');
    
    _selectedPosition = widget.currentProfile['position'] ?? 'MID';
    _statPace = (widget.currentProfile['stat_pace'] ?? 50).toDouble();
    _statShooting = (widget.currentProfile['stat_shooting'] ?? 50).toDouble();
    _statPassing = (widget.currentProfile['stat_passing'] ?? 50).toDouble();
    _statDribbling = (widget.currentProfile['stat_dribbling'] ?? 50).toDouble();
    _statDefending = (widget.currentProfile['stat_defending'] ?? 50).toDouble();
    _statPhysical = (widget.currentProfile['stat_physical'] ?? 50).toDouble();
  }

  @override
  void dispose() {
    _nameController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  Future<void> _pickImage() async {
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 800,
      maxHeight: 800,
      imageQuality: 85,
    );

    if (image != null) {
      setState(() {
        _newAvatarImage = File(image.path);
      });
    }
  }

  Future<void> _saveProfile() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() => _isSaving = true);

    try {
      final userId = Supabase.instance.client.auth.currentUser!.id;
      String? avatarUrl = widget.currentProfile['avatar_url'];

      // 1. Si hay nueva imagen, subirla a social_media bucket
      if (_newAvatarImage != null) {
        avatarUrl = await _storageService.uploadSocialImage(_newAvatarImage!, 'avatars/$userId');
      }

      // 2. Actualizar tabla profiles con todos los stats
      await Supabase.instance.client.from('profiles').update({
        'full_name': _nameController.text.trim(),
        'bio': _bioController.text.trim(),
        if (avatarUrl != null) 'avatar_url': avatarUrl,
        'position': _selectedPosition,
        'stat_pace': _statPace.round(),
        'stat_shooting': _statShooting.round(),
        'stat_passing': _statPassing.round(),
        'stat_dribbling': _statDribbling.round(),
        'stat_defending': _statDefending.round(),
        'stat_physical': _statPhysical.round(),
        'updated_at': DateTime.now().toIso8601String(),
      }).eq('id', userId);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Perfil actualizado exitosamente', style: TextStyle(color: Colors.white)), backgroundColor: Colors.green),
        );
        Navigator.pop(context, true); // Retorna true para recargar el perfil
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error al actualizar: $e'), backgroundColor: Colors.red),
        );
      }
    } finally {
      if (mounted) setState(() => _isSaving = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21),
      appBar: AppBar(
        title: Text('Editar Perfil', style: GoogleFonts.oswald(fontWeight: FontWeight.bold, color: Colors.white)),
        backgroundColor: Colors.transparent,
        elevation: 0,
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isSaving
          ? const Center(child: CircularProgressIndicator(color: Colors.white))
          : SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Form(
                key: _formKey,
                child: Column(
                  children: [
                    // Avatar Selector
                    GestureDetector(
                      onTap: _pickImage,
                      child: Stack(
                        alignment: Alignment.bottomRight,
                        children: [
                          Container(
                            width: 120,
                            height: 120,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: Theme.of(context).primaryColor, width: 3),
                              color: const Color(0xFF1D1E33),
                            ),
                            child: ClipOval(
                              child: _newAvatarImage != null
                                  ? Image.file(_newAvatarImage!, fit: BoxFit.cover)
                                  : (widget.currentProfile['avatar_url'] != null
                                      ? CachedNetworkImage(
                                          imageUrl: widget.currentProfile['avatar_url'],
                                          fit: BoxFit.cover,
                                        )
                                      : const Icon(Icons.person, size: 60, color: Colors.white54)),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: Theme.of(context).primaryColor,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(Icons.camera_alt, color: Colors.white, size: 20),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 40),

                    // Nombre
                    TextFormField(
                      controller: _nameController,
                      style: GoogleFonts.roboto(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: 'Nombre Completo',
                        labelStyle: const TextStyle(color: Colors.white70),
                        enabledBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Colors.white30)),
                        focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Theme.of(context).primaryColor)),
                      ),
                      validator: (value) => value == null || value.isEmpty ? 'El nombre es obligatorio' : null,
                    ),
                    const SizedBox(height: 20),

                    // Bio
                    TextFormField(
                      controller: _bioController,
                      style: GoogleFonts.roboto(color: Colors.white),
                      maxLength: 150,
                      decoration: InputDecoration(
                        labelText: 'Biografía (Opcional)',
                        labelStyle: const TextStyle(color: Colors.white70),
                        enabledBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Colors.white30)),
                        focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Theme.of(context).primaryColor)),
                      ),
                    ),
                    // Posición
                    DropdownButtonFormField<String>(
                      value: _selectedPosition,
                      dropdownColor: const Color(0xFF1D1E33),
                      style: GoogleFonts.roboto(color: Colors.white),
                      decoration: InputDecoration(
                        labelText: 'Posición en el Campo',
                        labelStyle: const TextStyle(color: Colors.white70),
                        enabledBorder: const UnderlineInputBorder(borderSide: BorderSide(color: Colors.white30)),
                        focusedBorder: UnderlineInputBorder(borderSide: BorderSide(color: Colors.amber)),
                      ),
                      items: const [
                        DropdownMenuItem(value: 'POR', child: Text('Portero (POR)')),
                        DropdownMenuItem(value: 'DEF', child: Text('Defensa (DEF)')),
                        DropdownMenuItem(value: 'MID', child: Text('Mediocampista (MID)')),
                        DropdownMenuItem(value: 'FWD', child: Text('Delantero (FWD)')),
                      ],
                      onChanged: (val) {
                        if (val != null) setState(() => _selectedPosition = val);
                      },
                    ),
                    const SizedBox(height: 30),

                    // Titulo Atributos
                    Align(
                      alignment: Alignment.centerLeft,
                      child: Text(
                        'Atributos de Jugador',
                        style: GoogleFonts.oswald(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Theme.of(context).primaryColor,
                        ),
                      ),
                    ),
                    const SizedBox(height: 10),

                    // Sliders
                    _buildStatSlider('Ritmo / Velocidad (PAC)', _statPace, (v) => setState(() => _statPace = v)),
                    _buildStatSlider('Tiro (SHO)', _statShooting, (v) => setState(() => _statShooting = v)),
                    _buildStatSlider('Pase (PAS)', _statPassing, (v) => setState(() => _statPassing = v)),
                    _buildStatSlider('Regate (DRI)', _statDribbling, (v) => setState(() => _statDribbling = v)),
                    _buildStatSlider('Defensa (DEF)', _statDefending, (v) => setState(() => _statDefending = v)),
                    _buildStatSlider('Físico (PHY)', _statPhysical, (v) => setState(() => _statPhysical = v)),

                    const SizedBox(height: 40),

                    // Botón Guardar
                    SizedBox(
                      width: double.infinity,
                      height: 50,
                      child: ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Theme.of(context).primaryColor,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: _saveProfile,
                        child: Text(
                          'GUARDAR CAMBIOS',
                          style: GoogleFonts.oswald(fontSize: 18, fontWeight: FontWeight.bold, letterSpacing: 1),
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
    );
  Widget _buildStatSlider(String label, double value, ValueChanged<double> onChanged) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(color: Colors.white70)),
            Text(value.round().toString(), style: GoogleFonts.oswald(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
        SliderTheme(
          data: SliderTheme.of(context).copyWith(
            activeTrackColor: Theme.of(context).primaryColor,
            inactiveTrackColor: Colors.white24,
            thumbColor: Colors.white,
            overlayColor: Theme.of(context).primaryColor.withValues(alpha: 0.2),
            valueIndicatorTextStyle: const TextStyle(color: Colors.black),
          ),
          child: Slider(
            value: value,
            min: 1,
            max: 99,
            divisions: 98,
            label: value.round().toString(),
            onChanged: onChanged,
          ),
        ),
      ],
    );
  }
}
