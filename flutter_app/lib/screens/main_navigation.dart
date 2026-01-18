import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'client/client_dashboard.dart';
import 'artisan/artisan_dashboard.dart';
import 'admin/admin_dashboard.dart';
import 'auth/auth_screen.dart';

class MainNavigation extends StatefulWidget {
  const MainNavigation({super.key});

  @override
  State<MainNavigation> createState() => _MainNavigationState();
}

class _MainNavigationState extends State<MainNavigation> {
  String? _userRole;
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadUserRole();
  }

  Future<void> _loadUserRole() async {
    try {
      final user = Supabase.instance.client.auth.currentUser;
      if (user == null) {
        if (mounted) {
          Navigator.of(context).pushReplacement(
            MaterialPageRoute(builder: (_) => const AuthScreen()),
          );
        }
        return;
      }

      final response = await Supabase.instance.client
          .from('users')
          .select('user_type')
          .eq('id', user.id)
          .maybeSingle();

      if (response != null && mounted) {
        setState(() {
          _userRole = response['user_type'] as String?;
          _loading = false;
        });
      } else if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    } catch (e) {
      if (mounted) {
        setState(() {
          _loading = false;
        });
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Scaffold(
        body: Center(child: CircularProgressIndicator()),
      );
    }

    if (_userRole == null) {
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('Impossible de déterminer votre rôle'),
              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () async {
                  await Supabase.instance.client.auth.signOut();
                  if (mounted) {
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(builder: (_) => const AuthScreen()),
                    );
                  }
                },
                child: const Text('Se déconnecter'),
              ),
            ],
          ),
        ),
      );
    }

    switch (_userRole) {
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
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () async {
                    await Supabase.instance.client.auth.signOut();
                    if (mounted) {
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(builder: (_) => const AuthScreen()),
                      );
                    }
                  },
                  child: const Text('Se déconnecter'),
                ),
              ],
            ),
          ),
        );
    }
  }
}
