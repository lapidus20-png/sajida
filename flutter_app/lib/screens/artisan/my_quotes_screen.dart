import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class MyQuotesListScreen extends StatefulWidget {
  const MyQuotesListScreen({Key? key}) : super(key: key);

  @override
  State<MyQuotesListScreen> createState() => _MyQuotesListScreenState();
}

class _MyQuotesListScreenState extends State<MyQuotesListScreen> {
  final _supabase = Supabase.instance.client;
  List<Map<String, dynamic>> _quotes = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadQuotes();
  }

  Future<void> _loadQuotes() async {
    setState(() {
      _loading = true;
    });

    try {
      final userId = _supabase.auth.currentUser?.id;
      if (userId == null) return;

      final artisan = await _supabase
          .from('artisans')
          .select()
          .eq('user_id', userId)
          .maybeSingle();

      if (artisan == null) {
        setState(() {
          _loading = false;
        });
        return;
      }

      final quotes = await _supabase
          .from('quotes')
          .select('*, job:job_requests(*)')
          .eq('artisan_id', artisan['id'])
          .order('created_at', ascending: false);

      setState(() {
        _quotes = List<Map<String, dynamic>>.from(quotes);
        _loading = false;
      });
    } catch (e) {
      print('Error loading quotes: $e');
      setState(() {
        _loading = false;
      });
    }
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'accepte':
        return Colors.green;
      case 'refuse':
        return Colors.red;
      case 'en_attente':
      default:
        return Colors.orange;
    }
  }

  String _getStatusLabel(String? status) {
    switch (status) {
      case 'accepte':
        return 'Accepté';
      case 'refuse':
        return 'Refusé';
      case 'en_attente':
      default:
        return 'En attente';
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_quotes.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.receipt_long, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            const Text(
              'Aucun devis',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            const Text(
              'Vos devis apparaîtront ici',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _quotes.length,
      itemBuilder: (context, index) {
        final quote = _quotes[index];
        final job = quote['job'] as Map<String, dynamic>?;

        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Expanded(
                      child: Text(
                        job?['titre'] ?? 'Sans titre',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 6,
                      ),
                      decoration: BoxDecoration(
                        color: _getStatusColor(quote['statut']).withOpacity(0.2),
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(
                          color: _getStatusColor(quote['statut']),
                        ),
                      ),
                      child: Text(
                        _getStatusLabel(quote['statut']),
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                          color: _getStatusColor(quote['statut']),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Row(
                  children: [
                    const Icon(Icons.attach_money, size: 18, color: Colors.green),
                    const SizedBox(width: 4),
                    Text(
                      'Montant: ${quote['montant']} FCFA',
                      style: const TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 8),
                Row(
                  children: [
                    const Icon(Icons.calendar_today, size: 18, color: Colors.blue),
                    const SizedBox(width: 4),
                    Text(
                      'Délai: ${quote['delai_jours']} jours',
                      style: const TextStyle(fontSize: 14),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
                Text(
                  quote['description'] ?? '',
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey[600],
                  ),
                  maxLines: 3,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 12),
                Text(
                  'Envoyé le ${DateTime.parse(quote['created_at']).toString().split('.')[0]}',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey[500],
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
  }
}
