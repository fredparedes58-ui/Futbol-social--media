import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/chat_message_model.dart';
import '../models/chat_channel_model.dart';

class ChatService {
  final SupabaseClient _supabase = Supabase.instance.client;

  // Obtener los canales de chat del usuario (Grupos + Privados)
  Stream<List<ChatChannel>> getUserChannelsStream() {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) return Stream.value([]);

    // We query the chat_channels table directly instead of using a view
    // Since RLS policies handle visibility, we can just select all channels 
    // the user has access to.
    return _supabase
        .from('chat_channels')
        .stream(primaryKey: ['id'])
        .order('updated_at', ascending: false)
        .map((data) => data.map((json) => ChatChannel.fromJson(json)).toList());
  }

  // Stream de mensajes para un canal específico
  Stream<List<ChatMessage>> getChannelMessagesStream(String channelId) {
    return _supabase
        .from('chat_messages_detailed')
        .stream(primaryKey: ['id'])
        .eq('channel_id', channelId)
        .order('created_at', ascending: false)
        .map((data) => data.map((json) => ChatMessage.fromJson(json)).toList());
  }

  // Enviar un mensaje estándar
  Future<void> sendMessage({
    required String channelId,
    required String content,
    String? mediaUrl,
    String? mediaType,
    String? recipientId,
    bool isPrivate = false,
  }) async {
    final userId = _supabase.auth.currentUser?.id;
    if (userId == null) throw Exception("Usuario no autenticado");

    await _supabase.from('chat_messages').insert({
      'channel_id': channelId,
      'user_id': userId,
      'content': content,
      'media_url': mediaUrl,
      'media_type': mediaType,
      'recipient_id': recipientId,
      'is_private': isPrivate,
    });

    // Actualizar el timestamp del canal para que suba en la lista
    await _supabase.from('chat_channels').update({
      'updated_at': DateTime.now().toIso8601String(),
    }).eq('id', channelId);
  }

  // Crear o obtener un chat privado con otro padre/admin
  Future<ChatChannel> getOrCreatePrivateChat(String teamId, String otherUserId) async {
    final currentUserId = _supabase.auth.currentUser?.id;
    if (currentUserId == null) throw Exception("Usuario no autenticado");

    // Llama a la funcion RPC en Supabase
    final String channelId = await _supabase.rpc(
      'get_or_create_private_chat',
      params: {
        'p_user1_id': currentUserId,
        'p_user2_id': otherUserId,
        'p_team_id': teamId,
      },
    );

    // Obtener y devolver el modelo del canal recién interactuado
    final response = await _supabase
        .from('chat_channels')
        .select()
        .eq('id', channelId)
        .single();
        
    return ChatChannel.fromJson(response);
  }
}
