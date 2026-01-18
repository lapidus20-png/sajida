import 'package:flutter/material.dart';
import '../services/review_service.dart';

class ReviewWidget extends StatefulWidget {
  final String artisanId;
  final String? jobId;
  final String? clientId;
  final bool canSubmitReview;

  const ReviewWidget({
    Key? key,
    required this.artisanId,
    this.jobId,
    this.clientId,
    this.canSubmitReview = false,
  }) : super(key: key);

  @override
  State<ReviewWidget> createState() => _ReviewWidgetState();
}

class _ReviewWidgetState extends State<ReviewWidget> {
  final _reviewService = ReviewService();
  final _commentController = TextEditingController();
  List<Map<String, dynamic>> _reviews = [];
  Map<String, dynamic> _stats = {};
  bool _loading = true;
  int _selectedRating = 5;

  @override
  void initState() {
    super.initState();
    _loadReviews();
  }

  Future<void> _loadReviews() async {
    final reviews = await _reviewService.getArtisanReviews(widget.artisanId);
    final stats = await _reviewService.getArtisanRatingStats(widget.artisanId);

    setState(() {
      _reviews = reviews;
      _stats = stats;
      _loading = false;
    });
  }

  Future<void> _submitReview() async {
    if (widget.jobId == null || widget.clientId == null) return;

    final comment = _commentController.text.trim();
    if (comment.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez ajouter un commentaire'),
          backgroundColor: Colors.orange,
        ),
      );
      return;
    }

    final success = await _reviewService.submitReview(
      jobId: widget.jobId!,
      clientId: widget.clientId!,
      artisanId: widget.artisanId,
      rating: _selectedRating,
      comment: comment,
    );

    if (success) {
      _commentController.clear();
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Avis soumis avec succès'),
          backgroundColor: Colors.green,
        ),
      );
      _loadReviews();
      Navigator.pop(context);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Erreur lors de la soumission'),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  void _showSubmitReviewDialog() {
    showDialog(
      context: context,
      builder: (context) => StatefulBuilder(
        builder: (context, setState) => AlertDialog(
          title: const Text('Donner votre avis'),
          content: SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Note:'),
                const SizedBox(height: 8),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: List.generate(5, (index) {
                    return IconButton(
                      icon: Icon(
                        index < _selectedRating ? Icons.star : Icons.star_border,
                        color: Colors.amber,
                        size: 32,
                      ),
                      onPressed: () {
                        setState(() {
                          _selectedRating = index + 1;
                        });
                      },
                    );
                  }),
                ),
                const SizedBox(height: 16),
                const Text('Commentaire:'),
                const SizedBox(height: 8),
                TextField(
                  controller: _commentController,
                  decoration: const InputDecoration(
                    hintText: 'Partagez votre expérience...',
                    border: OutlineInputBorder(),
                  ),
                  maxLines: 4,
                ),
              ],
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Annuler'),
            ),
            ElevatedButton(
              onPressed: _submitReview,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
              ),
              child: const Text('Soumettre'),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStarRating(double rating) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(5, (index) {
        return Icon(
          index < rating.floor() ? Icons.star : Icons.star_border,
          color: Colors.amber,
          size: 20,
        );
      }),
    );
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const Center(child: CircularProgressIndicator());
    }

    final avgRating = _stats['average'] ?? 0.0;
    final totalReviews = _stats['total'] ?? 0;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Rating summary
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Column(
                  children: [
                    Text(
                      avgRating.toStringAsFixed(1),
                      style: const TextStyle(
                        fontSize: 48,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    _buildStarRating(avgRating),
                    const SizedBox(height: 4),
                    Text(
                      '$totalReviews avis',
                      style: const TextStyle(color: Colors.grey),
                    ),
                  ],
                ),
                const SizedBox(width: 32),
                Expanded(
                  child: Column(
                    children: List.generate(5, (index) {
                      final star = 5 - index;
                      final distribution = _stats['distribution'] as Map? ?? {};
                      final count = distribution[star] ?? 0;
                      final percentage = totalReviews > 0 ? (count / totalReviews) : 0.0;

                      return Row(
                        children: [
                          Text('$star'),
                          const Icon(Icons.star, size: 16, color: Colors.amber),
                          const SizedBox(width: 8),
                          Expanded(
                            child: LinearProgressIndicator(
                              value: percentage,
                              backgroundColor: Colors.grey[200],
                              valueColor: const AlwaysStoppedAnimation<Color>(Colors.amber),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text('$count'),
                        ],
                      );
                    }),
                  ),
                ),
              ],
            ),
          ),
        ),
        const SizedBox(height: 16),

        // Submit review button
        if (widget.canSubmitReview) ...[
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _showSubmitReviewDialog,
              icon: const Icon(Icons.rate_review),
              label: const Text('Donner votre avis'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
            ),
          ),
          const SizedBox(height: 16),
        ],

        // Reviews list
        const Text(
          'Avis des clients',
          style: TextStyle(
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 12),

        if (_reviews.isEmpty)
          const Center(
            child: Padding(
              padding: EdgeInsets.all(32.0),
              child: Text(
                'Aucun avis pour le moment',
                style: TextStyle(color: Colors.grey),
              ),
            ),
          )
        else
          ListView.builder(
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            itemCount: _reviews.length,
            itemBuilder: (context, index) {
              final review = _reviews[index];

              return Card(
                margin: const EdgeInsets.only(bottom: 12),
                child: Padding(
                  padding: const EdgeInsets.all(16.0),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          _buildStarRating(review['rating'].toDouble()),
                          Text(
                            DateTime.parse(review['created_at'])
                                .toString()
                                .split(' ')[0],
                            style: const TextStyle(
                              fontSize: 12,
                              color: Colors.grey,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 8),
                      Text(
                        review['comment'] ?? '',
                        style: const TextStyle(fontSize: 14),
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Client',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[600],
                          fontStyle: FontStyle.italic,
                        ),
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
      ],
    );
  }
}
