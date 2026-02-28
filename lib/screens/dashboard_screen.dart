import 'package:flutter/material.dart';
import 'package:google_fonts/google_fonts.dart';
import 'package:myapp/screens/user_profile_screen.dart';
import 'package:myapp/screens/home_screen.dart';
import 'package:myapp/screens/notifications_screen.dart';
import 'package:myapp/screens/team_chat_screen.dart';
import 'package:myapp/screens/highlights_feed_screen.dart';
import 'package:myapp/screens/liga_hub_screen.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class DashboardScreen extends StatefulWidget {
  final String userRole;
  final String userName;
  const DashboardScreen({
    super.key,
    required this.userRole,
    required this.userName,
  });

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int _selectedIndex = 0;
  String? _userTeamId;
  List<Widget> _screens = [];

  @override
  void initState() {
    super.initState();
    _loadUserTeam();
  }

  Future<void> _loadUserTeam() async {
    try {
      final userId = Supabase.instance.client.auth.currentUser?.id;
      if (userId == null) return;

      final data = await Supabase.instance.client
          .from('team_members')
          .select('team_id')
          .eq('user_id', userId)
          .maybeSingle();

      if (data != null && mounted) {
        setState(() {
          _userTeamId = data['team_id'];
          _buildScreens();
        });
      }
    } catch (e) {
      debugPrint('Error loading team for dashboard: $e');
    }
  }

  void _buildScreens() {
    _screens = [
      const HomeScreen(),
      _userTeamId != null 
          ? HighlightsFeedScreen(teamId: _userTeamId!) 
          : const Center(child: CircularProgressIndicator()),
      NotificationsScreen(),
      TeamChatScreen(userRole: widget.userRole, userName: widget.userName),
      UserProfileScreen(userId: Supabase.instance.client.auth.currentUser?.id ?? ''),
    ];
  }

  void _onItemTapped(int index) {
    setState(() {
      _selectedIndex = index;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: _screens.isEmpty 
          ? const Center(child: CircularProgressIndicator()) 
          : _screens[_selectedIndex],
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: Colors.amber,
        foregroundColor: Colors.black,
        onPressed: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const LigaHubScreen()),
          );
        },
        icon: const Icon(Icons.sports_soccer, size: 22),
        label: Text(
          'LIGA',
          style: GoogleFonts.oswald(fontWeight: FontWeight.bold, fontSize: 14, letterSpacing: 1),
        ),
      ),
      floatingActionButtonLocation: FloatingActionButtonLocation.centerDocked,
      bottomNavigationBar: BottomNavigationBar(
        type: BottomNavigationBarType.fixed, // Asegura que todos los iconos se vean
        backgroundColor: const Color(0xFF1D1E33),
        selectedItemColor: Theme.of(context).primaryColor,
        unselectedItemColor: Colors.white54,
        items: const <BottomNavigationBarItem>[
          BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Inicio'),
          BottomNavigationBarItem(
            icon: Icon(Icons.slow_motion_video), // Icono de Reels
            label: 'Highlights',
          ),
          BottomNavigationBarItem(
            icon: Icon(Icons.notifications),
            label: 'Notificaciones',
          ),
          BottomNavigationBarItem(icon: Icon(Icons.chat), label: 'Chat'),
          BottomNavigationBarItem(
            icon: Icon(Icons.person),
            label: 'Perfil',
          ),
        ],
        currentIndex: _selectedIndex,
        onTap: _onItemTapped,
      ),
    );
  }
}
