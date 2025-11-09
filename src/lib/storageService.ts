import { supabase } from './supabase';

export interface UploadResult {
  success: boolean;
  url?: string;
  path?: string;
  error?: string;
}

class StorageService {
  async uploadAvatar(userId: string, file: File): Promise<UploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      return {
        success: true,
        url: data.publicUrl,
        path: fileName,
      };
    } catch (error) {
      console.error('Avatar upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'upload',
      };
    }
  }

  async uploadPortfolioImage(userId: string, file: File): Promise<UploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('portfolios')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('portfolios')
        .getPublicUrl(fileName);

      return {
        success: true,
        url: data.publicUrl,
        path: fileName,
      };
    } catch (error) {
      console.error('Portfolio upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'upload',
      };
    }
  }

  async uploadDocument(userId: string, file: File): Promise<UploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);

      return {
        success: true,
        url: data.publicUrl,
        path: fileName,
      };
    } catch (error) {
      console.error('Document upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'upload',
      };
    }
  }

  async uploadProjectPhoto(contractId: string, file: File): Promise<UploadResult> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${contractId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('project-photos')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('project-photos')
        .getPublicUrl(fileName);

      return {
        success: true,
        url: data.publicUrl,
        path: fileName,
      };
    } catch (error) {
      console.error('Project photo upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erreur lors de l\'upload',
      };
    }
  }

  async deleteFile(bucket: string, path: string): Promise<boolean> {
    try {
      const { error } = await supabase.storage
        .from(bucket)
        .remove([path]);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('File deletion error:', error);
      return false;
    }
  }

  async listFiles(bucket: string, folder: string): Promise<string[]> {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .list(folder, {
          limit: 100,
          offset: 0,
          sortBy: { column: 'created_at', order: 'desc' },
        });

      if (error) throw error;
      return data?.map(file => `${folder}/${file.name}`) || [];
    } catch (error) {
      console.error('List files error:', error);
      return [];
    }
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = supabase.storage
      .from(bucket)
      .getPublicUrl(path);

    return data.publicUrl;
  }

  validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  }

  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }
}

export const storageService = new StorageService();

export const STORAGE_LIMITS = {
  avatars: {
    maxSize: 2,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  portfolios: {
    maxSize: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  documents: {
    maxSize: 10,
    allowedTypes: ['application/pdf', 'image/jpeg', 'image/png'],
  },
  projectPhotos: {
    maxSize: 5,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
};
