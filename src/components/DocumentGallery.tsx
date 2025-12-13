import { useState, useEffect, useRef } from 'react';
import { Upload, Download, X, Image as ImageIcon, FileText, Trash2, Eye } from 'lucide-react';
import { storageService, UploadResult } from '../lib/storageService';
import { supabase } from '../lib/supabase';

interface UploadedFile {
  id: string;
  name: string;
  url: string;
  path: string;
  type: string;
  size: number;
  uploadedAt: Date;
}

interface DocumentGalleryProps {
  userId: string;
  jobRequestId?: string;
}

export default function DocumentGallery({ userId, jobRequestId }: DocumentGalleryProps) {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);
  const [uploadProgress, setUploadProgress] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadFiles();
    setupPasteHandler();
  }, [userId, jobRequestId]);

  const loadFiles = async () => {
    try {
      const { data, error } = await supabase
        .from('client_documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setFiles(data.map(doc => ({
          id: doc.id,
          name: doc.file_name,
          url: doc.file_url,
          path: doc.file_path,
          type: doc.file_type,
          size: doc.file_size,
          uploadedAt: new Date(doc.created_at),
        })));
      }
    } catch (error) {
      console.error('Error loading files:', error);
    }
  };

  const setupPasteHandler = () => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        e.preventDefault();
        await handleFileUpload(files);
      }
    };

    document.addEventListener('paste', handlePaste);
    return () => document.removeEventListener('paste', handlePaste);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      await handleFileUpload(droppedFiles);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      await handleFileUpload(Array.from(selectedFiles));
    }
  };

  const handleFileUpload = async (filesToUpload: File[]) => {
    setUploading(true);
    const progressList: string[] = [];

    for (const file of filesToUpload) {
      try {
        progressList.push(`Uploading ${file.name}...`);
        setUploadProgress([...progressList]);

        const result = await storageService.uploadDocument(userId, file);

        if (result.success && result.url && result.path) {
          const { error } = await supabase
            .from('client_documents')
            .insert({
              user_id: userId,
              job_request_id: jobRequestId,
              file_name: file.name,
              file_url: result.url,
              file_path: result.path,
              file_type: file.type,
              file_size: file.size,
            });

          if (error) throw error;

          progressList[progressList.length - 1] = `✓ ${file.name} uploaded`;
        } else {
          progressList[progressList.length - 1] = `✗ ${file.name} failed`;
        }
      } catch (error) {
        console.error('Upload error:', error);
        progressList[progressList.length - 1] = `✗ ${file.name} failed`;
      }

      setUploadProgress([...progressList]);
    }

    setTimeout(() => {
      setUploadProgress([]);
      setUploading(false);
      loadFiles();
    }, 2000);
  };

  const handleDelete = async (file: UploadedFile) => {
    if (!confirm(`Supprimer ${file.name}?`)) return;

    try {
      await storageService.deleteFile('documents', file.path);

      const { error } = await supabase
        .from('client_documents')
        .delete()
        .eq('id', file.id);

      if (error) throw error;

      setFiles(files.filter(f => f.id !== file.id));
      setSelectedFile(null);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleDownload = async (file: UploadedFile) => {
    try {
      const response = await fetch(file.url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  const isImage = (type: string) => type.startsWith('image/');
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Mes Documents et Photos</h3>
            <p className="text-sm text-gray-600 mt-1">
              Glissez, collez (Ctrl+V) ou sélectionnez des fichiers
            </p>
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4" />
            Choisir des fichiers
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx"
          onChange={handleFileSelect}
          className="hidden"
        />

        <div
          ref={dropZoneRef}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-700 font-medium mb-1">
            Glissez vos fichiers ici
          </p>
          <p className="text-sm text-gray-500">
            ou utilisez Ctrl+V pour coller des images
          </p>
          <p className="text-xs text-gray-400 mt-2">
            PNG, JPG, PDF jusqu'à 10MB
          </p>
        </div>

        {uploadProgress.length > 0 && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4">
            {uploadProgress.map((progress, index) => (
              <p key={index} className="text-sm text-blue-700 mb-1">
                {progress}
              </p>
            ))}
          </div>
        )}
      </div>

      {files.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="font-semibold text-gray-900 mb-4">
            Fichiers uploadés ({files.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map(file => (
              <div
                key={file.id}
                className="group relative border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-all cursor-pointer"
                onClick={() => setSelectedFile(file)}
              >
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {isImage(file.type) ? (
                    <img
                      src={file.url}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FileText className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-900 truncate font-medium">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownload(file);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded shadow-lg"
                    title="Télécharger"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(file);
                    }}
                    className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded shadow-lg"
                    title="Supprimer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedFile(null)}
        >
          <div
            className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="font-semibold text-gray-900">{selectedFile.name}</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(selectedFile)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1"
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </button>
                <button
                  onClick={() => setSelectedFile(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            <div className="p-4">
              {isImage(selectedFile.type) ? (
                <img
                  src={selectedFile.url}
                  alt={selectedFile.name}
                  className="w-full h-auto rounded"
                />
              ) : (
                <div className="text-center py-12">
                  <FileText className="w-20 h-20 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">
                    Aperçu non disponible pour ce type de fichier
                  </p>
                  <button
                    onClick={() => handleDownload(selectedFile)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg inline-flex items-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Télécharger le fichier
                  </button>
                </div>
              )}
              <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
                <p><strong>Taille:</strong> {formatFileSize(selectedFile.size)}</p>
                <p><strong>Type:</strong> {selectedFile.type}</p>
                <p><strong>Uploadé:</strong> {selectedFile.uploadedAt.toLocaleString('fr-FR')}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
