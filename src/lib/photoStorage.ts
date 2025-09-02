export interface UploadedPhoto {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
  type: string;
  uploadedAt: number;
}

const STORAGE_KEY = 'sortit_photos';

export class PhotoStorage {
  static async savePhotos(photos: UploadedPhoto[]): Promise<void> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
    } catch (error) {
      console.error('Failed to save photos:', error);
      throw new Error('Storage full or unavailable');
    }
  }

  static getPhotos(): UploadedPhoto[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load photos:', error);
      return [];
    }
  }

  static clearPhotos(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  static async processFiles(files: FileList): Promise<UploadedPhoto[]> {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const processedPhotos: UploadedPhoto[] = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!validTypes.includes(file.type)) {
        continue; // Skip invalid types
      }
      
      if (file.size > maxSize) {
        continue; // Skip large files
      }
      
      const dataUrl = await this.fileToDataUrl(file);
      
      processedPhotos.push({
        id: `${Date.now()}_${i}`,
        name: file.name,
        dataUrl,
        size: file.size,
        type: file.type,
        uploadedAt: Date.now(),
      });
    }
    
    return processedPhotos;
  }

  private static fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }
}