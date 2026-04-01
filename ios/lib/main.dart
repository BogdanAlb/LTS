import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'screens/list_screen.dart';
import 'screens/settings_screen.dart';
import 'services/sync_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await SyncService.instance.init();
  runApp(const LtsApp());
}

class LtsApp extends StatelessWidget {
  const LtsApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'LTS Reparatur',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1565C0),
          brightness: Brightness.light,
        ),
        useMaterial3: true,
        cardTheme: const CardThemeData(
          elevation: 2,
          margin: EdgeInsets.symmetric(horizontal: 12, vertical: 6),
        ),
        inputDecorationTheme: const InputDecorationTheme(
          border: OutlineInputBorder(),
          isDense: true,
          contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 10),
        ),
      ),
      initialRoute: '/',
      routes: {
        '/': (_) => const ListScreen(),
        '/settings': (_) => const SettingsScreen(),
      },
    );
  }
}
