import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import '../../widgets/file_upload_widget.dart';

class DocumentsScreen extends StatefulWidget {
  final String userId;

  const DocumentsScreen({Key? key, required this.userId}) : super(key: key);

  @override
  State<DocumentsScreen> createState() => _DocumentsScreenState();
}

class _DocumentsScreenState extends State<DocumentsScreen> {
  final _supabase = Supabase.instance.client;
  List<Map<String, dynamic>> _documents = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadDocuments();
  }

  Future<void> _loadDocuments() async {
    setState(() {
      _loading = true;
    });

    try {
      final docs = await _supabase
          .from('client_documents')
          .select()
          .eq('client_id', widget.userId)
          .order('created_at', ascending: false);

      setState(() {
        _documents = List<Map<String, dynamic>>.from(docs);
        _loading = false;
      });
    } catch (e) {
      print('Error loading documents: $e');
      setState(() {
        _loading = false;
      });
    }
  }

  Future<void> _deleteDocument(String docId, String fileUrl) async {
    try {
      // Delete from database
      await _supabase.from('client_documents').delete().eq('id', docId);

      // Optionally delete from storage
      // Extract path from URL and delete
      // await _supabase.storage.from('documents').remove([path]);

      _loadDocuments();

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Document supprimé'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Erreur lors de la suppression'),
            backgroundColor: Colors.red,
          ),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.all(16),
          color: Colors.blue[50],
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Télécharger un document',
                style: TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 16),
              FileUploadWidget(
                maxFiles: 10,
                uploadType: 'document',
                uploadId: widget.userId,
                onFilesUploaded: (urls) async {
                  for (final url in urls) {
                    await _supabase.from('client_documents').insert({
                      'client_id': widget.userId,
                      'file_url': url,
                      'file_name': url.split('/').last,
                      'file_type': url.toLowerCase().endsWith('.pdf')
                          ? 'pdf'
                          : 'image',
                    });
                  }
                  _loadDocuments();
                },
              ),
            ],
          ),
        ),
        const Divider(),
        Expanded(
          child: _loading
              ? const Center(child: CircularProgressIndicator())
              : _documents.isEmpty
                  ? Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(Icons.folder_open,
                              size: 64, color: Colors.grey[400]),
                          const SizedBox(height: 16),
                          const Text(
                            'Aucun document',
                            style: TextStyle(fontSize: 16, color: Colors.grey),
                          ),
                        ],
                      ),
                    )
                  : ListView.builder(
                      padding: const EdgeInsets.all(16),
                      itemCount: _documents.length,
                      itemBuilder: (context, index) {
                        final doc = _documents[index];
                        final isPdf = doc['file_type'] == 'pdf';

                        return Card(
                          margin: const EdgeInsets.only(bottom: 8),
                          child: ListTile(
                            leading: CircleAvatar(
                              backgroundColor:
                                  isPdf ? Colors.red[100] : Colors.blue[100],
                              child: Icon(
                                isPdf ? Icons.picture_as_pdf : Icons.image,
                                color: isPdf ? Colors.red : Colors.blue,
                              ),
                            ),
                            title: Text(
                              doc['file_name'] ?? 'Document',
                              maxLines: 1,
                              overflow: TextOverflow.ellipsis,
                            ),
                            subtitle: Text(
                              DateTime.parse(doc['created_at'])
                                  .toString()
                                  .split('.')[0],
                              style: const TextStyle(fontSize: 12),
                            ),
                            trailing: Row(
                              mainAxisSize: MainAxisSize.min,
                              children: [
                                IconButton(
                                  icon: const Icon(Icons.open_in_new),
                                  onPressed: () {
                                    // Open document (would need url_launcher package)
                                    ScaffoldMessenger.of(context).showSnackBar(
                                      SnackBar(
                                          content:
                                              Text('URL: ${doc['file_url']}')),
                                    );
                                  },
                                ),
                                IconButton(
                                  icon: const Icon(Icons.delete,
                                      color: Colors.red),
                                  onPressed: () async {
                                    final confirm = await showDialog<bool>(
                                      context: context,
                                      builder: (context) => AlertDialog(
                                        title: const Text('Confirmer'),
                                        content: const Text(
                                            'Supprimer ce document?'),
                                        actions: [
                                          TextButton(
                                            onPressed: () =>
                                                Navigator.pop(context, false),
                                            child: const Text('Annuler'),
                                          ),
                                          ElevatedButton(
                                            onPressed: () =>
                                                Navigator.pop(context, true),
                                            style: ElevatedButton.styleFrom(
                                              backgroundColor: Colors.red,
                                            ),
                                            child: const Text('Supprimer'),
                                          ),
                                        ],
                                      ),
                                    );

                                    if (confirm == true) {
                                      _deleteDocument(
                                          doc['id'], doc['file_url']);
                                    }
                                  },
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
        ),
      ],
    );
  }
}
