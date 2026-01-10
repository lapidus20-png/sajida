import { useState, useRef } from 'react';
import { Upload, X, Image, FileText, Loader, AlertCircle } from 'lucide-react';
import { storageService, UploadResult } from '../lib/storageService';

interface MultiFileUploadProps {
  userId: string;
  onFilesChange: (urls: string[]) => void;
  maxFiles?: number;
  label?: string;
}

export default function MultiFileUpload({
  userId,
  onFilesChange,
  maxFiles = 5,
  label = 'Photos/Documents'
}: MultiFileUploadProps) {
  const [files, setFiles] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    if (selectedFiles.length === 0) return;

    if (files.length + selectedFiles.length > maxFiles) {
      setError(`Vous ne pouvez télécharger que ${maxFiles} fichiers maximum`);
      return;
    }

    setError(null);
    setUploading(true);

    try {
      const uploadPromises = selectedFiles.map(file =>
        storageService.uploadJobRequestPhoto(userId, file)
      );

      const results = await Promise.all(uploadPromises);

      const successfulUploads = results
        .filter((result): result is UploadResult & { url: string } => result.success && !!result.url)
        .map(result => result.url);

      const failedUploads = results.filter(result => !result.success);

      if (failedUploads.length > 0) {
        setError(`${failedUploads.length} fichier(s) n'ont pas pu être téléchargés`);
      }

      if (successfulUploads.length > 0) {
        const newFiles = [...files, ...successfulUploads];
        setFiles(newFiles);
        onFilesChange(newFiles);
      }
    } catch (err) {
      setError('Erreur lors du téléchargement des fichiers');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesChange(newFiles);
  };

  const isImage = (url: string) => {
    return /\.(jpg|jpeg|png|webp)$/i.test(url);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-500">
          {files.length}/{maxFiles} fichiers
        </span>
      </div>

      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
          {files.map((fileUrl, index) => (
            <div key={index} className="relative group">
              {isImage(fileUrl) ? (
                <img
                  src={fileUrl}
                  alt={`Fichier ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-gray-200"
                />
              ) : (
                <div className="w-full h-32 bg-gray-100 rounded-lg border-2 border-gray-200 flex flex-col items-center justify-center">
                  <FileText className="w-8 h-8 text-gray-400 mb-2" />
                  <span className="text-xs text-gray-500">Document</span>
                </div>
              )}
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white p-1.5 rounded-full shadow-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {files.length < maxFiles && (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept="image/jpeg,image/png,image/webp,application/pdf"
            disabled={uploading}
            multiple
            className="hidden"
            id="multi-file-upload"
          />
          <label
            htmlFor="multi-file-upload"
            className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              uploading
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
            }`}
          >
            {uploading ? (
              <>
                <Loader className="w-10 h-10 text-blue-600 animate-spin mb-2" />
                <p className="text-sm text-blue-600 font-medium">Upload en cours...</p>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-8 h-8 text-gray-400" />
                  <Image className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Cliquez pour télécharger
                </p>
                <p className="text-xs text-gray-500">
                  Images (JPG, PNG, WEBP) ou PDF (Max 5MB)
                </p>
              </>
            )}
          </label>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
}
