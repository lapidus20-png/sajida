import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../services/auth_service.dart';
import 'client/client_dashboard.dart';
import 'artisan/artisan_dashboard.dart';
import 'admin/admin_dashboard.dart';

class MainNavigation extends StatelessWidget {
  const MainNavigation({super.key});

  @override
  Widget build(BuildContext context) {
    final authService = context.watch<AuthService>();
    final role = authService.userRole;

    if (role == null) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    switch (role) {
      case 'client':
        return const ClientDashboard();
      case 'artisan':
        return const ArtisanDashboard();
      case 'admin':
        return const AdminDashboard();
      default:
        return Scaffold(
          body: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Text('Rôle non reconnu'),
                ElevatedButton(
                  onPressed: () => authService.signOut(),
                  child: const Text('Se déconnecter'),
                ),
              ],
            ),
          ),
        );
    }
  }
}
