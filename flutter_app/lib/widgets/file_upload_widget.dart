import 'dart:io';
import 'package:flutter/material.dart';
import '../services/storage_service.dart';

class FileUploadWidget extends StatefulWidget {
  final Function(List<String>) onFilesUploaded;
  final int maxFiles;
  final String uploadType; // 'image', 'document', 'portfolio'
  final String? uploadId; // jobId, userId, artisanId

  const FileUploadWidget({
    Key? key,
    required this.onFilesUploaded,
    this.maxFiles = 5,
    this.uploadType = 'image',
    this.uploadId,
  }) : super(key: key);

  @override
  State<FileUploadWidget> createState() => _FileUploadWidgetState();
}

class _FileUploadWidgetState extends State<FileUploadWidget> {
  final _storageService = StorageService();
  List<File> _selectedFiles = [];
  List<String> _uploadedUrls = [];
  bool _uploading = false;

  Future<void> _pickImages() async {
    final files = await _storageService.pickMultipleImages(
      maxImages: widget.maxFiles - _selectedFiles.length,
    );

    if (files.isNotEmpty) {
      setState(() {
        _selectedFiles.addAll(files);
      });
    }
  }

  Future<void> _takePhoto() async {
    final file = await _storageService.takePhoto();
    if (file != null) {
      setState(() {
        _selectedFiles.add(file);
      });
    }
  }

  Future<void> _pickDocument() async {
    final file = await _storageService.pickDocument();
    if (file != null) {
      setState(() {
        _selectedFiles.add(file);
      });
    }
  }

  void _removeFile(int index) {
    setState(() {
      _selectedFiles.removeAt(index);
    });
  }

  Future<void> _uploadFiles() async {
    if (_selectedFiles.isEmpty || widget.uploadId == null) return;

    setState(() {
      _uploading = true;
    });

    try {
      final urls = <String>[];

      for (final file in _selectedFiles) {
        String? url;

        switch (widget.uploadType) {
          case 'job':
            url = await _storageService.uploadJobPhoto(widget.uploadId!, file);
            break;
          case 'document':
            url = await _storageService.uploadDocument(widget.uploadId!, file);
            break;
          case 'portfolio':
            url = await _storageService.uploadPortfolioImage(widget.uploadId!, file);
            break;
        }

        if (url != null) {
          urls.add(url);
        }
      }

      setState(() {
        _uploadedUrls = urls;
        _selectedFiles.clear();
      });

      widget.onFilesUploaded(urls);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('${urls.length} fichier(s) téléchargé(s)'),
            backgroundColor: Colors.green,
          ),
        );
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
            content: Text('Erreur lors du téléchargement'),
            backgroundColor: Colors.red,
          ),
        );
      }
    } finally {
      setState(() {
        _uploading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Action buttons
        Row(
          children: [
            ElevatedButton.icon(
              onPressed: _selectedFiles.length < widget.maxFiles ? _pickImages : null,
              icon: const Icon(Icons.photo_library, size: 20),
              label: const Text('Galerie'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
              ),
            ),
            const SizedBox(width: 8),
            ElevatedButton.icon(
              onPressed: _selectedFiles.length < widget.maxFiles ? _takePhoto : null,
              icon: const Icon(Icons.camera_alt, size: 20),
              label: const Text('Photo'),
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.blue,
                foregroundColor: Colors.white,
              ),
            ),
            if (widget.uploadType == 'document') ...[
              const SizedBox(width: 8),
              ElevatedButton.icon(
                onPressed: _selectedFiles.length < widget.maxFiles ? _pickDocument : null,
                icon: const Icon(Icons.file_present, size: 20),
                label: const Text('Document'),
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.blue,
                  foregroundColor: Colors.white,
                ),
              ),
            ],
          ],
        ),
        const SizedBox(height: 16),

        // Selected files preview
        if (_selectedFiles.isNotEmpty) ...[
          Text(
            '${_selectedFiles.length}/${widget.maxFiles} fichier(s) sélectionné(s)',
            style: const TextStyle(fontWeight: FontWeight.w500),
          ),
          const SizedBox(height: 8),
          SizedBox(
            height: 100,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              itemCount: _selectedFiles.length,
              itemBuilder: (context, index) {
                return Stack(
                  children: [
                    Container(
                      width: 100,
                      height: 100,
                      margin: const EdgeInsets.only(right: 8),
                      decoration: BoxDecoration(
                        border: Border.all(color: Colors.grey),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: ClipRRect(
                        borderRadius: BorderRadius.circular(8),
                        child: Image.file(
                          _selectedFiles[index],
                          fit: BoxFit.cover,
                        ),
                      ),
                    ),
                    Positioned(
                      top: 4,
                      right: 12,
                      child: GestureDetector(
                        onTap: () => _removeFile(index),
                        child: Container(
                          padding: const EdgeInsets.all(4),
                          decoration: const BoxDecoration(
                            color: Colors.red,
                            shape: BoxShape.circle,
                          ),
                          child: const Icon(
                            Icons.close,
                            color: Colors.white,
                            size: 16,
                          ),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton(
              onPressed: _uploading ? null : _uploadFiles,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                foregroundColor: Colors.white,
                padding: const EdgeInsets.symmetric(vertical: 16),
              ),
              child: _uploading
                  ? const SizedBox(
                      height: 20,
                      width: 20,
                      child: CircularProgressIndicator(
                        strokeWidth: 2,
                        valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                      ),
                    )
                  : const Text('Télécharger les fichiers'),
            ),
          ),
        ],
      ],
    );
  }
}
