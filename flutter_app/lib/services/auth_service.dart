import 'package:flutter/foundation.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class AuthService extends ChangeNotifier {
  final SupabaseClient _supabase = Supabase.instance.client;

  User? get currentUser => _supabase.auth.currentUser;
  bool get isAuthenticated => currentUser != null;

  String? _userRole;
  String? get userRole => _userRole;

  Map<String, dynamic>? _userProfile;
  Map<String, dynamic>? get userProfile => _userProfile;

  AuthService() {
    _loadUserProfile();
  }

  Future<void> _loadUserProfile() async {
    if (!isAuthenticated) return;

    try {
      final response = await _supabase
          .from('users')
          .select()
          .eq('id', currentUser!.id)
          .maybeSingle();

      if (response != null) {
        _userProfile = response;
        _userRole = response['role'] as String?;
        notifyListeners();
      }
    } catch (e) {
      debugPrint('Error loading user profile: $e');
    }
  }

  Future<String?> signUp({
    required String email,
    required String password,
    required String fullName,
    required String telephone,
    required String role,
  }) async {
    try {
      final response = await _supabase.auth.signUp(
        email: email,
        password: password,
      );

      if (response.user != null) {
        await _supabase.from('users').insert({
          'id': response.user!.id,
          'email': email,
          'nom_complet': fullName,
          'telephone': telephone,
          'role': role,
        });

        await _loadUserProfile();
        return null;
      }

      return 'Signup failed';
    } catch (e) {
      return e.toString();
    }
  }

  Future<String?> signIn({
    required String email,
    required String password,
  }) async {
    try {
      await _supabase.auth.signInWithPassword(
        email: email,
        password: password,
      );

      await _loadUserProfile();
      return null;
    } catch (e) {
      return e.toString();
    }
  }

  Future<void> signOut() async {
    await _supabase.auth.signOut();
    _userProfile = null;
    _userRole = null;
    notifyListeners();
  }
}
