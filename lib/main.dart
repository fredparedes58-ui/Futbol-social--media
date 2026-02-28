import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';

import 'package:myapp/auth/auth_gate.dart';
import 'package:myapp/config/app_config.dart';
import 'package:myapp/theme/theme.dart';
import 'package:myapp/services/push_notification_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Cargar variables de entorno desde .env
  await dotenv.load(fileName: ".env");
  
  // Inicializar Supabase (100% sin Firebase)
  await Supabase.initialize(
    url: AppConfig.supabaseUrl,
    anonKey: AppConfig.supabaseAnonKey,
    realtimeClientOptions: const RealtimeClientOptions(
      eventsPerSecond: 10,
    ),
  );

  // Inicializar notificaciones locales (sin Firebase)
  await PushNotificationService().initialize();
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Futbol AI',
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.light, // Fondo blanco en toda la app
      home: const AuthGate(),
      debugShowCheckedModeBanner: false,
    );
  }
}
