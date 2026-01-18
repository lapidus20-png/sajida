import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../constants/app_constants.dart';
import '../../models/job_categories.dart';
import '../main_navigation.dart';

class AuthScreen extends StatefulWidget {
  const AuthScreen({super.key});

  @override
  State<AuthScreen> createState() => _AuthScreenState();
}

class _AuthScreenState extends State<AuthScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _isLogin = true;
  bool _isLoading = false;
  String _userType = 'client';
  String _error = '';

  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _nomController = TextEditingController();
  final _prenomController = TextEditingController();
  final _telephoneController = TextEditingController();
  final _adresseController = TextEditingController();
  final _villeController = TextEditingController();
  String _selectedMetier = '';

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    _nomController.dispose();
    _prenomController.dispose();
    _telephoneController.dispose();
    _adresseController.dispose();
    _villeController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      final response = await Supabase.instance.client.auth.signInWithPassword(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );

      if (response.session != null && mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const MainNavigation()),
        );
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    if (_userType == 'artisan' && _selectedMetier.isEmpty) {
      setState(() {
        _error = 'Veuillez sélectionner votre métier';
      });
      return;
    }

    setState(() {
      _isLoading = true;
      _error = '';
    });

    try {
      final authResponse = await Supabase.instance.client.auth.signUp(
        email: _emailController.text.trim(),
        password: _passwordController.text,
      );

      if (authResponse.user == null) {
        throw Exception('Impossible de créer le compte');
      }

      final userId = authResponse.user!.id;

      if (_userType == 'artisan') {
        await Supabase.instance.client.from('users').insert({
          'id': userId,
          'email': _emailController.text.trim(),
          'user_type': _userType,
          'telephone': _telephoneController.text.isNotEmpty ? _telephoneController.text : null,
          'adresse': _adresseController.text.isNotEmpty ? _adresseController.text : null,
          'ville': _villeController.text.isNotEmpty ? _villeController.text : null,
        });

        await Supabase.instance.client.from('artisans').insert({
          'user_id': userId,
          'nom': _nomController.text,
          'prenom': _prenomController.text,
          'telephone': _telephoneController.text,
          'email': _emailController.text.trim(),
          'ville': _villeController.text.isNotEmpty ? _villeController.text : '',
          'adresse': _adresseController.text.isNotEmpty ? _adresseController.text : '',
          'metier': [_selectedMetier],
          'disponible': true,
        });
      } else {
        await Supabase.instance.client.from('users').insert({
          'id': userId,
          'email': _emailController.text.trim(),
          'user_type': _userType,
          'telephone': _telephoneController.text.isNotEmpty ? _telephoneController.text : null,
          'adresse': _adresseController.text.isNotEmpty ? _adresseController.text : null,
          'ville': _villeController.text.isNotEmpty ? _villeController.text : null,
        });
      }

      if (mounted) {
        Navigator.of(context).pushReplacement(
          MaterialPageRoute(builder: (_) => const MainNavigation()),
        );
      }
    } catch (e) {
      setState(() {
        _error = e.toString();
      });
      await Supabase.instance.client.auth.signOut();
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Widget _buildBurkinaGradientHeader() {
    return Container(
      height: 160,
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
          stops: [0.0, 0.5, 0.5, 1.0],
          colors: [
            AppConstants.burkinaRed,
            AppConstants.burkinaRed,
            AppConstants.burkinaGreen,
            AppConstants.burkinaGreen,
          ],
        ),
      ),
      child: Stack(
        children: [
          Positioned.fill(
            child: GridView.builder(
              padding: const EdgeInsets.all(12),
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 5,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
              ),
              itemCount: 15,
              itemBuilder: (context, index) {
                final icons = ['⚡', '🔨', '💧', '🌿', '🔧', '🎨'];
                return Container(
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Center(
                    child: Text(
                      icons[index % icons.length],
                      style: const TextStyle(fontSize: 20),
                    ),
                  ),
                );
              },
            ),
          ),
          Center(
            child: Container(
              width: 48,
              height: 48,
              decoration: BoxDecoration(
                color: AppConstants.burkinaYellow,
                borderRadius: BorderRadius.circular(24),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.3),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Icon(
                Icons.star,
                color: AppConstants.burkinaYellow,
                size: 32,
              ),
            ),
          ),
          Positioned(
            bottom: 20,
            left: 0,
            right: 0,
            child: Column(
              children: [
                Text(
                  AppConstants.appName,
                  style: const TextStyle(
                    fontSize: 28,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    shadows: [
                      Shadow(
                        offset: Offset(0, 2),
                        blurRadius: 4,
                        color: Colors.black26,
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  AppConstants.appTagline,
                  style: const TextStyle(
                    fontSize: 14,
                    color: Colors.white,
                    shadows: [
                      Shadow(
                        offset: Offset(0, 1),
                        blurRadius: 2,
                        color: Colors.black26,
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
            colors: [
              Color(0xFFFEF2F2),
              Color(0xFFFFFAEB),
              Color(0xFFF0FDF4),
            ],
          ),
        ),
        child: SafeArea(
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Container(
                constraints: const BoxConstraints(maxWidth: 500),
                child: Card(
                  elevation: 8,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      _buildBurkinaGradientHeader(),
                      Padding(
                        padding: const EdgeInsets.all(24),
                        child: Column(
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: ElevatedButton.icon(
                                    onPressed: () {
                                      setState(() {
                                        _isLogin = true;
                                        _error = '';
                                      });
                                    },
                                    icon: const Icon(Icons.login, size: 18),
                                    label: const Text('Connexion'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: _isLogin
                                          ? AppConstants.primaryRed
                                          : Colors.grey[200],
                                      foregroundColor: _isLogin
                                          ? Colors.white
                                          : Colors.grey[700],
                                      padding: const EdgeInsets.symmetric(vertical: 14),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: ElevatedButton.icon(
                                    onPressed: () {
                                      setState(() {
                                        _isLogin = false;
                                        _error = '';
                                      });
                                    },
                                    icon: const Icon(Icons.person_add, size: 18),
                                    label: const Text('Inscription'),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: !_isLogin
                                          ? AppConstants.primaryGreen
                                          : Colors.grey[200],
                                      foregroundColor: !_isLogin
                                          ? Colors.white
                                          : Colors.grey[700],
                                      padding: const EdgeInsets.symmetric(vertical: 14),
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(12),
                                      ),
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),
                            if (!_isLogin) ...[
                              Container(
                                padding: const EdgeInsets.all(16),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFFFAEB),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: const Color(0xFFFCD34D),
                                  ),
                                ),
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                      'Je suis:',
                                      style: TextStyle(
                                        fontSize: 14,
                                        fontWeight: FontWeight.w600,
                                        color: AppConstants.textPrimary,
                                      ),
                                    ),
                                    const SizedBox(height: 12),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: RadioListTile<String>(
                                            contentPadding: EdgeInsets.zero,
                                            dense: true,
                                            title: const Text(
                                              'Client',
                                              style: TextStyle(fontSize: 14),
                                            ),
                                            value: 'client',
                                            groupValue: _userType,
                                            onChanged: (value) {
                                              setState(() {
                                                _userType = value!;
                                              });
                                            },
                                          ),
                                        ),
                                        Expanded(
                                          child: RadioListTile<String>(
                                            contentPadding: EdgeInsets.zero,
                                            dense: true,
                                            title: const Text(
                                              'Artisan',
                                              style: TextStyle(fontSize: 14),
                                            ),
                                            value: 'artisan',
                                            groupValue: _userType,
                                            onChanged: (value) {
                                              setState(() {
                                                _userType = value!;
                                              });
                                            },
                                          ),
                                        ),
                                      ],
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 16),
                            ],
                            if (_error.isNotEmpty) ...[
                              Container(
                                padding: const EdgeInsets.all(12),
                                decoration: BoxDecoration(
                                  color: const Color(0xFFFEF2F2),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(color: Colors.red.shade200),
                                ),
                                child: Row(
                                  children: [
                                    const Icon(
                                      Icons.error_outline,
                                      color: Colors.red,
                                      size: 20,
                                    ),
                                    const SizedBox(width: 8),
                                    Expanded(
                                      child: Text(
                                        _error,
                                        style: const TextStyle(
                                          color: Colors.red,
                                          fontSize: 13,
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                              const SizedBox(height: 16),
                            ],
                            Form(
                              key: _formKey,
                              child: Column(
                                children: [
                                  TextFormField(
                                    controller: _emailController,
                                    keyboardType: TextInputType.emailAddress,
                                    decoration: const InputDecoration(
                                      labelText: 'Email',
                                      prefixIcon: Icon(Icons.email_outlined),
                                      hintText: 'votre@email.com',
                                    ),
                                    validator: (value) {
                                      if (value == null || value.isEmpty) {
                                        return 'Veuillez entrer votre email';
                                      }
                                      if (!value.contains('@')) {
                                        return 'Email invalide';
                                      }
                                      return null;
                                    },
                                  ),
                                  const SizedBox(height: 16),
                                  TextFormField(
                                    controller: _passwordController,
                                    obscureText: true,
                                    decoration: const InputDecoration(
                                      labelText: 'Mot de passe',
                                      prefixIcon: Icon(Icons.lock_outlined),
                                      hintText: 'Minimum 6 caractères',
                                    ),
                                    validator: (value) {
                                      if (value == null || value.isEmpty) {
                                        return 'Veuillez entrer un mot de passe';
                                      }
                                      if (value.length < 6) {
                                        return 'Minimum 6 caractères';
                                      }
                                      return null;
                                    },
                                  ),
                                  if (!_isLogin) ...[
                                    const SizedBox(height: 16),
                                    Row(
                                      children: [
                                        Expanded(
                                          child: TextFormField(
                                            controller: _nomController,
                                            decoration: const InputDecoration(
                                              labelText: 'Nom',
                                              hintText: 'Votre nom',
                                            ),
                                            validator: _userType == 'artisan'
                                                ? (value) {
                                                    if (value == null || value.isEmpty) {
                                                      return 'Requis';
                                                    }
                                                    return null;
                                                  }
                                                : null,
                                          ),
                                        ),
                                        const SizedBox(width: 12),
                                        Expanded(
                                          child: TextFormField(
                                            controller: _prenomController,
                                            decoration: const InputDecoration(
                                              labelText: 'Prénom',
                                              hintText: 'Votre prénom',
                                            ),
                                            validator: _userType == 'artisan'
                                                ? (value) {
                                                    if (value == null || value.isEmpty) {
                                                      return 'Requis';
                                                    }
                                                    return null;
                                                  }
                                                : null,
                                          ),
                                        ),
                                      ],
                                    ),
                                    const SizedBox(height: 16),
                                    TextFormField(
                                      controller: _telephoneController,
                                      keyboardType: TextInputType.phone,
                                      decoration: const InputDecoration(
                                        labelText: 'Téléphone',
                                        prefixIcon: Icon(Icons.phone_outlined),
                                        hintText: '+226 XXXXXXXX',
                                      ),
                                      validator: (value) {
                                        if (value == null || value.isEmpty) {
                                          return 'Veuillez entrer votre téléphone';
                                        }
                                        return null;
                                      },
                                    ),
                                    if (_userType == 'artisan') ...[
                                      const SizedBox(height: 16),
                                      DropdownButtonFormField<String>(
                                        value: _selectedMetier.isEmpty ? null : _selectedMetier,
                                        decoration: const InputDecoration(
                                          labelText: 'Métier',
                                          hintText: 'Sélectionnez votre métier',
                                        ),
                                        items: jobCategoryGroups
                                            .expand((group) => group.categories)
                                            .map((metier) => DropdownMenuItem(
                                                  value: metier,
                                                  child: Text(metier),
                                                ))
                                            .toList(),
                                        onChanged: (value) {
                                          setState(() {
                                            _selectedMetier = value ?? '';
                                          });
                                        },
                                        validator: (value) {
                                          if (value == null || value.isEmpty) {
                                            return 'Veuillez sélectionner votre métier';
                                          }
                                          return null;
                                        },
                                      ),
                                    ],
                                    const SizedBox(height: 16),
                                    TextFormField(
                                      controller: _adresseController,
                                      decoration: const InputDecoration(
                                        labelText: 'Adresse',
                                        prefixIcon: Icon(Icons.location_on_outlined),
                                        hintText: 'Votre adresse',
                                      ),
                                    ),
                                    const SizedBox(height: 16),
                                    TextFormField(
                                      controller: _villeController,
                                      decoration: const InputDecoration(
                                        labelText: 'Ville',
                                        hintText: 'Ouagadougou, Bobo-Dioulasso...',
                                      ),
                                    ),
                                  ],
                                  const SizedBox(height: 24),
                                  SizedBox(
                                    width: double.infinity,
                                    child: ElevatedButton(
                                      onPressed: _isLoading
                                          ? null
                                          : (_isLogin ? _handleLogin : _handleRegister),
                                      style: ElevatedButton.styleFrom(
                                        backgroundColor: _isLogin
                                            ? AppConstants.primaryRed
                                            : AppConstants.primaryGreen,
                                        foregroundColor: Colors.white,
                                        padding: const EdgeInsets.symmetric(vertical: 16),
                                        shape: RoundedRectangleBorder(
                                          borderRadius: BorderRadius.circular(12),
                                        ),
                                      ),
                                      child: _isLoading
                                          ? const SizedBox(
                                              height: 20,
                                              width: 20,
                                              child: CircularProgressIndicator(
                                                strokeWidth: 2,
                                                valueColor:
                                                    AlwaysStoppedAnimation<Color>(Colors.white),
                                              ),
                                            )
                                          : Text(
                                              _isLogin ? 'Se connecter' : 'Créer mon compte',
                                              style: const TextStyle(
                                                fontSize: 16,
                                                fontWeight: FontWeight.w600,
                                              ),
                                            ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(vertical: 16),
                        child: const Text(
                          'Plateforme sécurisée pour artisans et particuliers',
                          style: TextStyle(
                            fontSize: 12,
                            color: AppConstants.textSecondary,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
