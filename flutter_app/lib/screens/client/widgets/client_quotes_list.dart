import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class ClientQuotesList extends StatefulWidget {
  final String jobRequestId;

  const ClientQuotesList({
    super.key,
    required this.jobRequestId,
  });

  @override
  State<ClientQuotesList> createState() => _ClientQuotesListState();
}

class _ClientQuotesListState extends State<ClientQuotesList> {
  List<Map<String, dynamic>> quotes = [];
  bool isLoading = true;
  String? errorMessage;

  @override
  void initState() {
    super.initState();
    _loadQuotes();
  }

  Future<void> _loadQuotes() async {
    try {
      setState(() {
        isLoading = true;
        errorMessage = null;
      });

      final response = await Supabase.instance.client
          .from('quotes')
          .select('''
            *,
            artisan:artisans!quotes_artisan_id_fkey(
              id,
              nom,
              prenom,
              note_moyenne,
              ville
            )
          ''')
          .eq('job_request_id', widget.jobRequestId)
          .order('created_at', ascending: false);

      setState(() {
        quotes = List<Map<String, dynamic>>.from(response);
        isLoading = false;
      });
    } catch (e) {
      setState(() {
        errorMessage = 'Erreur lors du chargement: $e';
        isLoading = false;
      });
    }
  }

  Color _getStatusColor(String? status) {
    switch (status) {
      case 'accepte':
        return Colors.green;
      case 'refuse':
        return Colors.red;
      case 'expire':
        return Colors.grey;
      default:
        return Colors.orange;
    }
  }

  String _getStatusLabel(String? status) {
    switch (status) {
      case 'en_attente':
        return 'En attente';
      case 'accepte':
        return 'Accepté';
      case 'refuse':
        return 'Refusé';
      case 'expire':
        return 'Expiré';
      default:
        return 'Inconnu';
    }
  }

  Future<void> _acceptQuote(String quoteId) async {
    try {
      await Supabase.instance.client
          .from('quotes')
          .update({'statut': 'accepte'})
          .eq('id', quoteId);

      await _loadQuotes();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Devis accepté avec succès'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  Future<void> _refuseQuote(String quoteId) async {
    try {
      await Supabase.instance.client
          .from('quotes')
          .update({'statut': 'refuse'})
          .eq('id', quoteId);

      await _loadQuotes();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Devis refusé'),
            backgroundColor: Colors.orange,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erreur: $e'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (errorMessage != null) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Icon(Icons.error_outline, size: 64, color: Colors.red),
            const SizedBox(height: 16),
            Text(
              errorMessage!,
              textAlign: TextAlign.center,
              style: const TextStyle(color: Colors.red),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: _loadQuotes,
              child: const Text('Réessayer'),
            ),
          ],
        ),
      );
    }

    if (quotes.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.description_outlined, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text(
              'Aucun devis reçu pour le moment',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return RefreshIndicator(
      onRefresh: _loadQuotes,
      child: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: quotes.length,
        itemBuilder: (context, index) {
          final quote = quotes[index];
          final artisan = quote['artisan'] as Map<String, dynamic>?;
          final status = quote['statut'] as String?;
          final isEditable = status == 'en_attente';

          return Card(
            margin: const EdgeInsets.only(bottom: 16),
            elevation: 2,
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '${artisan?['prenom'] ?? ''} ${artisan?['nom'] ?? 'Artisan'}',
                              style: const TextStyle(
                                fontSize: 18,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            if (artisan?['ville'] != null)
                              Text(
                                artisan!['ville'],
                                style: TextStyle(
                                  color: Colors.grey[600],
                                  fontSize: 14,
                                ),
                              ),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 6,
                        ),
                        decoration: BoxDecoration(
                          color: _getStatusColor(status).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(
                          _getStatusLabel(status),
                          style: TextStyle(
                            color: _getStatusColor(status),
                            fontWeight: FontWeight.bold,
                            fontSize: 12,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 24),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text(
                        'Montant total:',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                      Text(
                        '${quote['montant_total'] ?? 0} FCFA',
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.green,
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Acompte:'),
                      Text(
                        '${quote['montant_acompte'] ?? 0} FCFA',
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Délai:'),
                      Text(
                        '${quote['delai_execution'] ?? 0} jours',
                        style: const TextStyle(fontWeight: FontWeight.w500),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  const Text(
                    'Description des travaux:',
                    style: TextStyle(fontWeight: FontWeight.bold),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    quote['description_travaux'] ?? 'Aucune description',
                    style: TextStyle(color: Colors.grey[700]),
                  ),
                  if (quote['conditions_paiement'] != null &&
                      quote['conditions_paiement'].toString().isNotEmpty) ...[
                    const SizedBox(height: 12),
                    const Text(
                      'Conditions de paiement:',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      quote['conditions_paiement'],
                      style: TextStyle(color: Colors.grey[700]),
                    ),
                  ],
                  if (isEditable) ...[
                    const SizedBox(height: 16),
                    Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: () => _refuseQuote(quote['id']),
                            icon: const Icon(Icons.close),
                            label: const Text('Refuser'),
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.red,
                              side: const BorderSide(color: Colors.red),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: ElevatedButton.icon(
                            onPressed: () => _acceptQuote(quote['id']),
                            icon: const Icon(Icons.check),
                            label: const Text('Accepter'),
                            style: ElevatedButton.styleFrom(
                              backgroundColor: Colors.green,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ],
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
