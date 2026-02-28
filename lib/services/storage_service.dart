// ============================================================
// STORAGE SERVICE
// ============================================================
// Servicio para subir y recuperar archivos multimedia
// ============================================================

import 'dart:io';
import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:path/path.dart' as p;

class StorageService {
  final SupabaseClient _supabase = Supabase.instance.client;

  /// Sube una imagen al bucekt 'social_media'
  /// Retorna la URL pública de la imagen
  Future<String> uploadSocialImage(File imageFile, String folderPath) async {
    try {
      final String fileName = '${DateTime.now().millisecondsSinceEpoch}_${p.basename(imageFile.path)}';
      final String fullPath = '$folderPath/$fileName';

      // 1. Subir al bucket
      await _supabase.storage.from('social_media').upload(
            fullPath,
            imageFile,
            fileOptions: const FileOptions(cacheControl: '3600', upsert: false),
          );

      // 2. Obtener URL Pública
      final String publicUrl = _supabase.storage.from('social_media').getPublicUrl(fullPath);
      return publicUrl;
    } catch (e) {
      debugPrint('❌ Error al subir imagen a social_media: $e');
      rethrow;
    }
  }

  /// Sube un adjunto al bucket privado 'chat_attachments'
  /// Retorna un signedURL o un publicUrl según las políticas
  Future<String> uploadChatAttachment(File file, String chatId) async {
    try {
      final String fileName = '${DateTime.now().millisecondsSinceEpoch}_${p.basename(file.path)}';
      final String fullPath = '$chatId/$fileName';

      // 1. Subir al bucket
      await _supabase.storage.from('chat_attachments').upload(
            fullPath,
            file,
            fileOptions: const FileOptions(cacheControl: '3600', upsert: false),
          );

      // 2. Como es privado, podríamos generar una URL firmada (expira)
      // O si usamos políticas híbridas, sacamos el Path nativo
      final String signedUrl = await _supabase.storage.from('chat_attachments').createSignedUrl(fullPath, 60 * 60 * 24 * 7); // 1 semana
      return signedUrl;

    } catch (e) {
      debugPrint('❌ Error al subir adjunto de chat: $e');
      rethrow;
    }
  }

  /// Sube un archivo multimedia a la carpeta temporal de Stories
  Future<String> uploadStoryMedia(File file, String userId) async {
    try {
      final String fileName = '${DateTime.now().millisecondsSinceEpoch}_${p.basename(file.path)}';
      final String fullPath = '$userId/$fileName';

      // 1. Subir al bucket publico de stories
      await _supabase.storage.from('stories').upload(
            fullPath,
            file,
            fileOptions: const FileOptions(cacheControl: '3600', upsert: false),
          );

      // 2. Obtener URL Pública
      final String publicUrl = _supabase.storage.from('stories').getPublicUrl(fullPath);
      return publicUrl;
    } catch (e) {
      debugPrint('❌ Error al subir historia a stories: $e');
      rethrow;
    }
  }

  /// Borra un archivo de social_media
  Future<void> deleteSocialImage(String path) async {
    try {
      if (path.isEmpty) return;
      
      // Extraemos el path interno a partir de la URL si es necesario
      // Ej: https://myproject.supabase.co/storage/v1/object/public/social_media/folder/file.jpg
      String internalPath = path;
      if (path.contains('/social_media/')) {
        internalPath = path.split('/social_media/').last;
      }

      await _supabase.storage.from('social_media').remove([internalPath]);
    } catch (e) {
      debugPrint('❌ Error al borrar imagen: $e');
    }
  }
}
