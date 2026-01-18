import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'constants/app_constants.dart';
import 'screens/auth/auth_screen.dart';
import 'screens/client/client_home_screen.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();

  await Supabase.initialize(
    url: 'https://fldkqlardekarhibnyyx.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsZGtxbGFyZGVrYXJoaWJueXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNzg3OTksImV4cCI6MjA3NzY1NDc5OX0.Tx3px0qD74K_6p6OCbT_InyOZZ5mb3i48XY-IHfrUXY',
  );

  runApp(const BuilderHubApp());
}

class BuilderHubApp extends StatelessWidget {
  const BuilderHubApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConstants.appName,
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      home: const AuthWrapper(),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    return StreamBuilder<AuthState>(
      stream: Supabase.instance.client.auth.onAuthStateChange,
      builder: (context, snapshot) {
        if (snapshot.connectionState == ConnectionState.waiting) {
          return const Scaffold(
            body: Center(
              child: CircularProgressIndicator(
                color: AppConstants.primaryRed,
              ),
            ),
          );
        }

        final session = snapshot.hasData ? snapshot.data!.session : null;

        if (session != null) {
          return const ClientHomeScreen();
        }

        return const AuthScreen();
      },
    );
  }
}
