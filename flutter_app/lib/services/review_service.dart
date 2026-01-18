import 'package:supabase_flutter/supabase_flutter.dart';

class ReviewService {
  final _supabase = Supabase.instance.client;

  // Submit review
  Future<bool> submitReview({
    required String jobId,
    required String clientId,
    required String artisanId,
    required int rating,
    required String comment,
  }) async {
    try {
      // Insert review
      await _supabase.from('reviews').insert({
        'job_id': jobId,
        'client_id': clientId,
        'artisan_id': artisanId,
        'rating': rating,
        'comment': comment,
      });

      // Update artisan average rating
      await _updateArtisanRating(artisanId);

      return true;
    } catch (e) {
      print('Error submitting review: $e');
      return false;
    }
  }

  // Update artisan average rating
  Future<void> _updateArtisanRating(String artisanId) async {
    try {
      final reviews = await _supabase
          .from('reviews')
          .select('rating')
          .eq('artisan_id', artisanId);

      if (reviews.isEmpty) return;

      final totalRating = reviews.fold<int>(
        0,
        (sum, review) => sum + (review['rating'] as int),
      );

      final averageRating = totalRating / reviews.length;

      await _supabase
          .from('artisans')
          .update({'note_moyenne': averageRating})
          .eq('id', artisanId);
    } catch (e) {
      print('Error updating artisan rating: $e');
    }
  }

  // Get reviews for artisan
  Future<List<Map<String, dynamic>>> getArtisanReviews(String artisanId) async {
    try {
      final response = await _supabase
          .from('reviews')
          .select('*, client:users!client_id(email), job:job_requests(titre)')
          .eq('artisan_id', artisanId)
          .order('created_at', ascending: false);

      return List<Map<String, dynamic>>.from(response);
    } catch (e) {
      print('Error getting artisan reviews: $e');
      return [];
    }
  }

  // Get review for specific job
  Future<Map<String, dynamic>?> getJobReview(String jobId) async {
    try {
      final response = await _supabase
          .from('reviews')
          .select()
          .eq('job_id', jobId)
          .maybeSingle();

      return response;
    } catch (e) {
      print('Error getting job review: $e');
      return null;
    }
  }

  // Check if client has already reviewed a job
  Future<bool> hasReviewed(String jobId, String clientId) async {
    try {
      final response = await _supabase
          .from('reviews')
          .select()
          .eq('job_id', jobId)
          .eq('client_id', clientId)
          .maybeSingle();

      return response != null;
    } catch (e) {
      print('Error checking review status: $e');
      return false;
    }
  }

  // Get artisan rating statistics
  Future<Map<String, dynamic>> getArtisanRatingStats(String artisanId) async {
    try {
      final reviews = await _supabase
          .from('reviews')
          .select('rating')
          .eq('artisan_id', artisanId);

      if (reviews.isEmpty) {
        return {
          'average': 0.0,
          'total': 0,
          'distribution': {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
        };
      }

      final ratings = reviews.map((r) => r['rating'] as int).toList();
      final totalRating = ratings.fold<int>(0, (sum, rating) => sum + rating);
      final average = totalRating / ratings.length;

      final distribution = <int, int>{1: 0, 2: 0, 3: 0, 4: 0, 5: 0};
      for (final rating in ratings) {
        distribution[rating] = (distribution[rating] ?? 0) + 1;
      }

      return {
        'average': average,
        'total': reviews.length,
        'distribution': distribution,
      };
    } catch (e) {
      print('Error getting rating stats: $e');
      return {
        'average': 0.0,
        'total': 0,
        'distribution': {1: 0, 2: 0, 3: 0, 4: 0, 5: 0},
      };
    }
  }

  // Delete review (admin only)
  Future<bool> deleteReview(String reviewId) async {
    try {
      await _supabase.from('reviews').delete().eq('id', reviewId);
      return true;
    } catch (e) {
      print('Error deleting review: $e');
      return false;
    }
  }
}
