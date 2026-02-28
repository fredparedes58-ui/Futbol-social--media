import 'dart:io';
import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../models/chat_channel_model.dart';
import '../models/chat_message_model.dart';
import '../services/chat_service.dart';
import 'package:timeago/timeago.dart' as timeago;

class ChatRoomScreen extends StatefulWidget {
  final ChatChannel channel;

  const ChatRoomScreen({Key? key, required this.channel}) : super(key: key);

  @override
  State<ChatRoomScreen> createState() => _ChatRoomScreenState();
}

class _ChatRoomScreenState extends State<ChatRoomScreen> {
  final ChatService _chatService = ChatService();
  final TextEditingController _messageController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  
  String get _currentUserId => Supabase.instance.client.auth.currentUser?.id ?? '';

  @override
  void dispose() {
    _messageController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _sendMessage() async {
    final text = _messageController.text.trim();
    if (text.isEmpty) return;
    
    _messageController.clear();
    
    // Si es un chat privado, debemos determinar quién es el otro participante
    String? recipientId;
    if (widget.channel.type == ChatChannelType.private) {
       recipientId = (widget.channel.participant1Id == _currentUserId) 
           ? widget.channel.participant2Id 
           : widget.channel.participant1Id;
    }

    try {
      await _chatService.sendMessage(
        channelId: widget.channel.id, 
        content: text,
        isPrivate: widget.channel.type == ChatChannelType.private,
        recipientId: recipientId,
      );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
           SnackBar(content: Text('Error al enviar: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21), // Elite App Background
      appBar: AppBar(
        title: Row(
          children: [
            CircleAvatar(
              backgroundColor: Colors.cyan.withOpacity(0.2),
              radius: 18,
              child: Icon(
                widget.channel.type == ChatChannelType.private ? Icons.person : Icons.group,
                color: Colors.cyan,
                size: 20,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                widget.channel.name,
                style: GoogleFonts.oswald(
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1.0,
                  fontSize: 20,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
        backgroundColor: const Color(0xFF1D1E33),
        elevation: 2,
      ),
      body: Column(
        children: [
          Expanded(
            child: StreamBuilder<List<ChatMessage>>(
              stream: _chatService.getChannelMessagesStream(widget.channel.id),
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator(color: Colors.cyan));
                }

                if (snapshot.hasError) {
                  return Center(
                    child: Text('Error: ${snapshot.error}', style: const TextStyle(color: Colors.redAccent)),
                  );
                }

                final messages = snapshot.data ?? [];

                if (messages.isEmpty) {
                  return Center(
                    child: Text(
                      'No hay mensajes aún.\n¡Sé el primero en escribir!',
                      textAlign: TextAlign.center,
                      style: GoogleFonts.roboto(color: Colors.grey, fontSize: 16),
                    ),
                  );
                }

                // Renderizamos la lista invertida porque el stream viene ordenado DESC
                return ListView.builder(
                  controller: _scrollController,
                  reverse: true,
                  padding: const EdgeInsets.all(12),
                  itemCount: messages.length,
                  itemBuilder: (context, index) {
                    final message = messages[index];
                    final isMe = message.userId == _currentUserId;
                    
                    // Lógica sencilla de agrupación visual si el mensaje anterior es del mismo usuario
                    final bool showAvatar = index == messages.length - 1 || 
                        messages[index + 1].userId != message.userId;

                    return _ChatBubble(
                      message: message,
                      isMe: isMe,
                      showAvatar: showAvatar,
                    );
                  },
                );
              },
            ),
          ),
          
          // Área de Input (WhatsApp style)
          _buildMessageInputArea(),
        ],
      ),
    );
  }

  Widget _buildMessageInputArea() {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 10),
      decoration: BoxDecoration(
        color: const Color(0xFF1D1E33), // Color panel Elite
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.2),
            blurRadius: 10,
            offset: const Offset(0, -3),
          )
        ]
      ),
      child: SafeArea(
        child: Row(
          children: [
            // Botón de adjuntos
            IconButton(
              icon: const Icon(Icons.attach_file, color: Colors.grey),
              onPressed: () {
                // TODO: Implement media upload
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(content: Text('Subida de archivos próximamente')),
                );
              },
            ),
            
            // Text Field
            Expanded(
              child: Container(
                decoration: BoxDecoration(
                  color: const Color(0xFF0A0E21),
                  borderRadius: BorderRadius.circular(24),
                  border: Border.all(color: Colors.grey.withOpacity(0.3)),
                ),
                child: TextField(
                  controller: _messageController,
                  style: const TextStyle(color: Colors.white),
                  maxLines: 4,
                  minLines: 1,
                  decoration: const InputDecoration(
                    hintText: 'Escribe un mensaje...',
                    hintStyle: TextStyle(color: Colors.grey),
                    border: InputBorder.none,
                    contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                  ),
                ),
              ),
            ),
            
            const SizedBox(width: 8),
            
            // Botón Enviar / Microfono circular
            GestureDetector(
              onTap: _sendMessage,
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: const BoxDecoration(
                  color: Colors.cyan,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.send, color: Colors.black, size: 20),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _ChatBubble extends StatelessWidget {
  final ChatMessage message;
  final bool isMe;
  final bool showAvatar;

  const _ChatBubble({
    required this.message,
    required this.isMe,
    required this.showAvatar,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: EdgeInsets.only(
        top: showAvatar ? 12 : 2, 
        bottom: 2, 
        left: isMe ? 50 : 0, 
        right: isMe ? 0 : 50
      ),
      child: Row(
        mainAxisAlignment: isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe && showAvatar) ...[
            CircleAvatar(
              radius: 14,
              backgroundColor: Colors.cyan.withOpacity(0.2),
              backgroundImage: message.userAvatarUrl != null ? NetworkImage(message.userAvatarUrl!) : null,
              child: message.userAvatarUrl == null 
                  ? Text(
                      message.userName?.substring(0, 1).toUpperCase() ?? 'U', 
                      style: const TextStyle(color: Colors.cyan, fontSize: 12)
                    ) 
                  : null,
            ),
            const SizedBox(width: 8),
          ] else if (!isMe && !showAvatar) ...[
            const SizedBox(width: 36), // Espaciador si no mostramos el avatar
          ],

          // Burbuja
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
              decoration: BoxDecoration(
                color: isMe ? Colors.cyan.withOpacity(0.9) : const Color(0xFF2D2E42),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(16),
                  topRight: const Radius.circular(16),
                  bottomLeft: Radius.circular(isMe || !showAvatar ? 16 : 0),
                  bottomRight: Radius.circular(!isMe || !showAvatar ? 16 : 0),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.1),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  )
                ]
              ),
              child: Column(
                crossAxisAlignment: isMe ? CrossAxisAlignment.end : CrossAxisAlignment.start,
                children: [
                   if (!isMe && showAvatar && message.userName != null)
                    Padding(
                      padding: const EdgeInsets.only(bottom: 4),
                      child: Text(
                        message.userName!,
                        style: TextStyle(
                          color: Colors.cyanAccent,
                          fontWeight: FontWeight.bold,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  Text(
                    message.content,
                    style: TextStyle(
                      color: isMe ? Colors.black87 : Colors.white,
                      fontSize: 16,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text(
                        _formatTime(message.createdAt),
                        style: TextStyle(
                          color: isMe ? Colors.black54 : Colors.grey,
                          fontSize: 10,
                        ),
                      ),
                      if (isMe) ...[
                        const SizedBox(width: 4),
                        const Icon(Icons.done_all, size: 12, color: Colors.black54), // Simulacion de read receipt
                      ]
                    ],
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _formatTime(DateTime time) {
    return '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}';
  }
}
