import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../widgets/review_widget.dart';

class ReviewListScreen extends StatefulWidget {
  final String userId;
  final bool isClient;

  const ReviewListScreen({
    Key? key,
    required this.userId,
    this.isClient = false,
  }) : super(key: key);

  @override
  State<ReviewListScreen> createState() => _ReviewListScreenState();
}

class _ReviewListScreenState extends State<ReviewListScreen> {
  final _supabase = Supabase.instance.client;
  List<Map<String, dynamic>> _completedJobs = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadCompletedJobs();
  }

  Future<void> _loadCompletedJobs() async {
    setState(() {
      _loading = true;
    });

    try {
      final jobs = await _supabase
          .from('job_requests')
          .select('*, selected_artisan:artisans!selected_artisan_id(*)')
          .eq('client_id', widget.userId)
          .eq('statut', 'terminee')
          .order('created_at', ascending: false);

      setState(() {
        _completedJobs = List<Map<String, dynamic>>.from(jobs);
        _loading = false;
      });
    } catch (e) {
      print('Error loading completed jobs: $e');
      setState(() {
        _loading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_completedJobs.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.star_border, size: 64, color: Colors.grey[400]),
            const SizedBox(height: 16),
            const Text(
              'Aucun travail terminé',
              style: TextStyle(fontSize: 16, color: Colors.grey),
            ),
            const SizedBox(height: 8),
            const Text(
              'Vos avis apparaîtront ici',
              style: TextStyle(fontSize: 14, color: Colors.grey),
            ),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _completedJobs.length,
      itemBuilder: (context, index) {
        final job = _completedJobs[index];
        final artisan = job['selected_artisan'];

        return Card(
          margin: const EdgeInsets.only(bottom: 16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              ListTile(
                leading: CircleAvatar(
                  backgroundColor: Colors.blue,
                  child: Text(
                    artisan?['nom']?[0]?.toUpperCase() ?? 'A',
                    style: const TextStyle(color: Colors.white),
                  ),
                ),
                title: Text(
                  job['titre'] ?? 'Sans titre',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
                subtitle: Text(
                  'Artisan: ${artisan?['nom'] ?? 'Non assigné'} ${artisan?['prenom'] ?? ''}',
                ),
              ),
              const Divider(),
              if (artisan != null)
                Padding(
                  padding: const EdgeInsets.all(16),
                  child: ReviewWidget(
                    artisanId: artisan['id'],
                    jobId: job['id'],
                    clientId: widget.userId,
                    canSubmitReview: true,
                  ),
                ),
            ],
          ),
        );
      },
    );
  }
}
