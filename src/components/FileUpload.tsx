import { useState, useRef } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { storageService, STORAGE_LIMITS, UploadResult } from '../lib/storageService';

interface FileUploadProps {
  bucketType: 'avatars' | 'portfolios' | 'documents' | 'projectPhotos' | 'jobRequestPhotos';
  userId?: string;
  contractId?: string;
  onUploadComplete?: (result: UploadResult) => void;
  onUploadError?: (error: string) => void;
  currentImageUrl?: string;
  label?: string;
  accept?: string;
}

export default function FileUpload({
  bucketType,
  userId,
  contractId,
  onUploadComplete,
  onUploadError,
  currentImageUrl,
  label = 'Choisir un fichier',
  accept,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const limits = STORAGE_LIMITS[bucketType];

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setSuccess(false);

    if (!storageService.validateFileSize(file, limits.maxSize)) {
      const errorMsg = `Le fichier est trop volumineux. Taille maximale: ${limits.maxSize}MB`;
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      return;
    }

    if (!storageService.validateFileType(file, limits.allowedTypes)) {
      const errorMsg = 'Type de fichier non supporté';
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
      return;
    }

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }

    setUploading(true);

    try {
      let result: UploadResult;

      switch (bucketType) {
        case 'avatars':
          if (!userId) throw new Error('User ID requis pour avatar');
          result = await storageService.uploadAvatar(userId, file);
          break;
        case 'portfolios':
          if (!userId) throw new Error('User ID requis pour portfolio');
          result = await storageService.uploadPortfolioImage(userId, file);
          break;
        case 'documents':
          if (!userId) throw new Error('User ID requis pour document');
          result = await storageService.uploadDocument(userId, file);
          break;
        case 'projectPhotos':
          if (!contractId) throw new Error('Contract ID requis pour photo projet');
          result = await storageService.uploadProjectPhoto(contractId, file);
          break;
        case 'jobRequestPhotos':
          if (!userId) throw new Error('User ID requis pour photo demande');
          result = await storageService.uploadJobRequestPhoto(userId, file);
          break;
        default:
          throw new Error('Type de bucket invalide');
      }

      if (result.success) {
        setSuccess(true);
        if (onUploadComplete) onUploadComplete(result);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        setError(result.error || 'Erreur lors de l\'upload');
        if (onUploadError) onUploadError(result.error || 'Erreur');
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur lors de l\'upload';
      setError(errorMsg);
      if (onUploadError) onUploadError(errorMsg);
    } finally {
      setUploading(false);
    }
  };

  const handleRemovePreview = () => {
    setPreview(null);
    setError(null);
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        <span className="text-xs text-gray-500">
          Max {limits.maxSize}MB
        </span>
      </div>

      {preview ? (
        <div className="relative">
          <img
            src={preview}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
          />
          <button
            onClick={handleRemovePreview}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white p-2 rounded-full shadow-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          {success && (
            <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-full text-sm flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Uploadé
            </div>
          )}
        </div>
      ) : (
        <div className="relative">
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            accept={accept || limits.allowedTypes.join(',')}
            disabled={uploading}
            className="hidden"
            id={`file-upload-${bucketType}`}
          />
          <label
            htmlFor={`file-upload-${bucketType}`}
            className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all ${
              uploading
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-blue-500 hover:bg-gray-50'
            }`}
          >
            {uploading ? (
              <>
                <Loader className="w-12 h-12 text-blue-600 animate-spin mb-3" />
                <p className="text-sm text-blue-600 font-medium">Upload en cours...</p>
              </>
            ) : (
              <>
                <Upload className="w-12 h-12 text-gray-400 mb-3" />
                <p className="text-sm text-gray-600 font-medium mb-1">
                  Cliquez pour uploader
                </p>
                <p className="text-xs text-gray-500">
                  {limits.allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
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

      {success && !preview && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 flex items-start gap-2">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-green-700">Fichier uploadé avec succès!</p>
        </div>
      )}
    </div>
  );
}
