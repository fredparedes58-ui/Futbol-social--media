import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import '../models/chat_channel_model.dart';
import '../services/chat_service.dart';
import 'chat_room_screen.dart';
import 'package:timeago/timeago.dart' as timeago;

class ChatInboxScreen extends StatefulWidget {
  const ChatInboxScreen({Key? key}) : super(key: key);

  @override
  State<ChatInboxScreen> createState() => _ChatInboxScreenState();
}

class _ChatInboxScreenState extends State<ChatInboxScreen> {
  final ChatService _chatService = ChatService();

  @override
  void initState() {
    super.initState();
    timeago.setLocaleMessages('es', timeago.EsMessages());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E21), // Elite App Background
      appBar: AppBar(
        title: Text(
          'MENSAJES',
          style: GoogleFonts.oswald(
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
          ),
        ),
        backgroundColor: const Color(0xFF0A0E21),
        elevation: 0,
        actions: [
          IconButton(
            icon: const Icon(Icons.people_outline, color: Colors.white),
            onPressed: () {
              // TODO: Implement new chat creation screen to select another parent
              ScaffoldMessenger.of(context).showSnackBar(
                const SnackBar(content: Text('Crear nuevo chat (Próximamente)')),
              );
            },
          )
        ],
      ),
      body: StreamBuilder<List<ChatChannel>>(
        stream: _chatService.getUserChannelsStream(),
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator(color: Colors.cyan));
          }

          if (snapshot.hasError) {
            return Center(
              child: Text(
                'Error al cargar chats: ${snapshot.error}',
                style: const TextStyle(color: Colors.redAccent),
              ),
            );
          }

          final channels = snapshot.data ?? [];

          if (channels.isEmpty) {
            return Center(
              child: Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.chat_bubble_outline, size: 60, color: Colors.grey.withOpacity(0.5)),
                  const SizedBox(height: 16),
                  Text(
                    'No tienes conversaciones aún',
                    style: GoogleFonts.roboto(color: Colors.grey, fontSize: 16),
                  ),
                ],
              ),
            );
          }

          return ListView.builder(
            itemCount: channels.length,
            itemBuilder: (context, index) {
              final channel = channels[index];
              return _buildChannelItem(channel);
            },
          );
        },
      ),
    );
  }

  Widget _buildChannelItem(ChatChannel channel) {
    // Determinar la información visual del canal asumiendo que es general o privado
    IconData leadingIcon = Icons.group;
    Color iconColor = Colors.cyan;
    String subtitle = 'Toque para entrar al chat';
    
    if (channel.type == ChatChannelType.private) {
      leadingIcon = Icons.person;
      iconColor = Colors.deepOrange;
    } else if (channel.type == ChatChannelType.announcement) {
      leadingIcon = Icons.campaign;
      iconColor = Colors.greenAccent;
    }

    return Card(
      color: const Color(0xFF1D1E33),
      margin: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
        leading: CircleAvatar(
          backgroundColor: iconColor.withOpacity(0.2),
          child: Icon(leadingIcon, color: iconColor),
        ),
        title: Text(
          channel.name,
          style: GoogleFonts.roboto(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            fontSize: 16,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: GoogleFonts.roboto(
            color: Colors.grey,
            fontSize: 14,
          ),
        ),
        trailing: Text(
          timeago.format(channel.updatedAt ?? channel.createdAt, locale: 'es'),
          style: GoogleFonts.roboto(
            color: Colors.grey,
            fontSize: 12,
          ),
        ),
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(
              builder: (context) => ChatRoomScreen(channel: channel),
            ),
          );
        },
      ),
    );
  }
}
