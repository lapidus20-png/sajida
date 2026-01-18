import 'dart:io';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:image_picker/image_picker.dart';
import 'package:file_picker/file_picker.dart';

class StorageService {
  final _supabase = Supabase.instance.client;
  final _imagePicker = ImagePicker();

  // Upload job photos
  Future<String?> uploadJobPhoto(String jobId, File file) async {
    try {
      final fileName = '${DateTime.now().millisecondsSinceEpoch}_${file.path.split('/').last}';
      final path = 'job-photos/$jobId/$fileName';

      await _supabase.storage.from('job-photos').upload(path, file);

      final url = _supabase.storage.from('job-photos').getPublicUrl(path);
      return url;
    } catch (e) {
      print('Error uploading job photo: $e');
      return null;
    }
  }

  // Upload multiple job photos
  Future<List<String>> uploadMultipleJobPhotos(String jobId, List<File> files) async {
    final urls = <String>[];
    for (final file in files) {
      final url = await uploadJobPhoto(jobId, file);
      if (url != null) urls.add(url);
    }
    return urls;
  }

  // Upload document (PDF, images)
  Future<String?> uploadDocument(String userId, File file) async {
    try {
      final fileName = '${DateTime.now().millisecondsSinceEpoch}_${file.path.split('/').last}';
      final path = 'documents/$userId/$fileName';

      await _supabase.storage.from('documents').upload(path, file);

      final url = _supabase.storage.from('documents').getPublicUrl(path);
      return url;
    } catch (e) {
      print('Error uploading document: $e');
      return null;
    }
  }

  // Upload portfolio image
  Future<String?> uploadPortfolioImage(String artisanId, File file) async {
    try {
      final fileName = '${DateTime.now().millisecondsSinceEpoch}_${file.path.split('/').last}';
      final path = 'portfolios/$artisanId/$fileName';

      await _supabase.storage.from('portfolios').upload(path, file);

      final url = _supabase.storage.from('portfolios').getPublicUrl(path);
      return url;
    } catch (e) {
      print('Error uploading portfolio image: $e');
      return null;
    }
  }

  // Delete file from storage
  Future<bool> deleteFile(String bucket, String path) async {
    try {
      await _supabase.storage.from(bucket).remove([path]);
      return true;
    } catch (e) {
      print('Error deleting file: $e');
      return false;
    }
  }

  // Pick image from gallery
  Future<File?> pickImageFromGallery() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (image != null) {
        return File(image.path);
      }
      return null;
    } catch (e) {
      print('Error picking image: $e');
      return null;
    }
  }

  // Pick multiple images
  Future<List<File>> pickMultipleImages({int maxImages = 5}) async {
    try {
      final List<XFile> images = await _imagePicker.pickMultiImage(
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      final files = images.take(maxImages).map((xFile) => File(xFile.path)).toList();
      return files;
    } catch (e) {
      print('Error picking multiple images: $e');
      return [];
    }
  }

  // Pick image from camera
  Future<File?> takePhoto() async {
    try {
      final XFile? photo = await _imagePicker.pickImage(
        source: ImageSource.camera,
        maxWidth: 1920,
        maxHeight: 1080,
        imageQuality: 85,
      );

      if (photo != null) {
        return File(photo.path);
      }
      return null;
    } catch (e) {
      print('Error taking photo: $e');
      return null;
    }
  }

  // Pick document (PDF, etc)
  Future<File?> pickDocument() async {
    try {
      FilePickerResult? result = await FilePicker.platform.pickFiles(
        type: FileType.custom,
        allowedExtensions: ['pdf', 'jpg', 'jpeg', 'png'],
      );

      if (result != null && result.files.single.path != null) {
        return File(result.files.single.path!);
      }
      return null;
    } catch (e) {
      print('Error picking document: $e');
      return null;
    }
  }

  // Get file size in MB
  double getFileSizeInMB(File file) {
    final bytes = file.lengthSync();
    return bytes / (1024 * 1024);
  }

  // Validate file size (max 10MB)
  bool isFileSizeValid(File file, {double maxSizeMB = 10.0}) {
    return getFileSizeInMB(file) <= maxSizeMB;
  }
}
