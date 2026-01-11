import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';

class FindArtisansScreen extends StatefulWidget {
  const FindArtisansScreen({super.key});

  @override
  State<FindArtisansScreen> createState() => _FindArtisansScreenState();
}

class _FindArtisansScreenState extends State<FindArtisansScreen> {
  List<Map<String, dynamic>> artisans = [];
  bool isLoading = true;
  String? selectedCategory;

  final List<Map<String, dynamic>> categories = [
    {'value': null, 'label': 'Tous'},
    {'value': 'plomberie', 'label': 'Plomberie'},
    {'value': 'electricite', 'label': 'Électricité'},
    {'value': 'menuiserie', 'label': 'Menuiserie'},
    {'value': 'maconnerie', 'label': 'Maçonnerie'},
    {'value': 'peinture', 'label': 'Peinture'},
  ];

  @override
  void initState() {
    super.initState();
    _loadArtisans();
  }

  Future<void> _loadArtisans() async {
    setState(() => isLoading = true);

    try {
      var query = Supabase.instance.client
          .from('artisans')
          .select()
          .eq('is_verified', true);

      if (selectedCategory != null) {
        query = query.contains('metier', [selectedCategory]);
      }

      final response = await query;

      setState(() {
        artisans = List<Map<String, dynamic>>.from(response);
        isLoading = false;
      });
    } catch (e) {
      setState(() => isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Erreur: $e')),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Trouver un Artisan'),
        backgroundColor: Theme.of(context).primaryColor,
        foregroundColor: Colors.white,
      ),
      body: Column(
        children: [
          Container(
            padding: const EdgeInsets.all(16.0),
            color: Colors.white,
            child: DropdownButtonFormField<String>(
              value: selectedCategory,
              decoration: const InputDecoration(
                labelText: 'Filtrer par catégorie',
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.filter_list),
              ),
              items: categories.map((cat) {
                return DropdownMenuItem(
                  value: cat['value'],
                  child: Text(cat['label']),
                );
              }).toList(),
              onChanged: (value) {
                setState(() => selectedCategory = value);
                _loadArtisans();
              },
            ),
          ),
          Expanded(
            child: isLoading
                ? const Center(child: CircularProgressIndicator())
                : artisans.isEmpty
                    ? Center(
                        child: Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(
                              Icons.search_off,
                              size: 80,
                              color: Colors.grey[400],
                            ),
                            const SizedBox(height: 16),
                            Text(
                              'Aucun artisan trouvé',
                              style: TextStyle(
                                fontSize: 18,
                                color: Colors.grey[600],
                              ),
                            ),
                          ],
                        ),
                      )
                    : RefreshIndicator(
                        onRefresh: _loadArtisans,
                        child: ListView.builder(
                          padding: const EdgeInsets.all(16.0),
                          itemCount: artisans.length,
                          itemBuilder: (context, index) {
                            final artisan = artisans[index];
                            final metiers = artisan['metier'] is List
                                ? (artisan['metier'] as List).join(', ')
                                : artisan['metier'] ?? 'Non spécifié';

                            return Card(
                              margin: const EdgeInsets.only(bottom: 12),
                              elevation: 2,
                              child: InkWell(
                                onTap: () {},
                                child: Padding(
                                  padding: const EdgeInsets.all(16.0),
                                  child: Row(
                                    children: [
                                      CircleAvatar(
                                        radius: 30,
                                        backgroundColor: Theme.of(context)
                                            .primaryColor
                                            .withOpacity(0.1),
                                        child: Icon(
                                          Icons.person,
                                          size: 30,
                                          color: Theme.of(context).primaryColor,
                                        ),
                                      ),
                                      const SizedBox(width: 16),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Text(
                                              artisan['nom_complet'] ?? 'N/A',
                                              style: const TextStyle(
                                                fontSize: 18,
                                                fontWeight: FontWeight.bold,
                                              ),
                                            ),
                                            const SizedBox(height: 4),
                                            Text(
                                              metiers,
                                              style: TextStyle(
                                                color: Colors.grey[600],
                                              ),
                                            ),
                                            const SizedBox(height: 8),
                                            Row(
                                              children: [
                                                Icon(
                                                  Icons.star,
                                                  size: 16,
                                                  color: Colors.amber,
                                                ),
                                                const SizedBox(width: 4),
                                                Text(
                                                  '${artisan['note_moyenne'] ?? 0}/5',
                                                  style: TextStyle(
                                                    color: Colors.grey[600],
                                                  ),
                                                ),
                                                const SizedBox(width: 16),
                                                Icon(
                                                  Icons.location_on,
                                                  size: 16,
                                                  color: Colors.grey[600],
                                                ),
                                                const SizedBox(width: 4),
                                                Text(
                                                  artisan['ville'] ??
                                                      'Non spécifié',
                                                  style: TextStyle(
                                                    color: Colors.grey[600],
                                                  ),
                                                ),
                                              ],
                                            ),
                                          ],
                                        ),
                                      ),
                                      const Icon(Icons.arrow_forward_ios),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
