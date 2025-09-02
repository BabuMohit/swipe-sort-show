export interface SwipeMapping {
  up: string;
  down: string;
  left: string;
  right: string;
}

export const DEFAULT_SWIPE_MAPPINGS: SwipeMapping = {
  up: 'favorites',
  down: 'archive',
  left: 'archive',
  right: 'favorites'
};

export interface UserSettings {
  swipeMappings: SwipeMapping;
  enableNotifications: boolean;
  autoBackup: boolean;
}

export interface SystemAlbum {
  id: string;
  name: string;
  type: 'system' | 'custom';
  photos: AlbumPhoto[];
}

// Extend existing interfaces
export interface UploadedPhoto {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
  type: string;
  uploadedAt: number;
  source?: 'camera' | 'upload' | 'system';
  systemPath?: string;
}

export interface AlbumPhoto extends UploadedPhoto {
  sortedAt?: number;
}

export interface Album {
  id: string;
  name: string;
  icon: string;
  photos: AlbumPhoto[];
  type?: 'system' | 'custom';
}

export type AlbumType = 'favorites' | 'archive' | 'all' | 'recent' | 'camera' | 'screenshots' | 'videos';

const STORAGE_KEY = 'sortit_photos';
const ALBUMS_KEY = 'sortit_albums';
const SETTINGS_KEY = 'sortit_settings';

export class PhotoStorage {
  static async savePhotos(photos: UploadedPhoto[]): Promise<boolean> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
      return true;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        throw new Error('Storage quota exceeded. Please delete some photos or clear cache.');
      }
      console.error('Failed to save photos:', error);
      throw new Error('Failed to save photos. Storage may be full or unavailable.');
    }
  }

  static getPhotos(): UploadedPhoto[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      // Validate structure
      if (!Array.isArray(parsed)) return [];
      
      return parsed.filter(photo => 
        photo && 
        typeof photo.id === 'string' &&
        typeof photo.name === 'string' &&
        typeof photo.dataUrl === 'string' &&
        typeof photo.size === 'number' &&
        typeof photo.uploadedAt === 'number'
      );
    } catch (error) {
      console.error('Failed to load photos:', error);
      return [];
    }
  }

  static clearPhotos(): void {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(ALBUMS_KEY);
    localStorage.removeItem(SETTINGS_KEY);
  }

  // Settings Management
  static getUserSettings(): UserSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (!stored) return this.getDefaultSettings();
      
      const parsed = JSON.parse(stored);
      // Validate structure
      if (!parsed || typeof parsed !== 'object') return this.getDefaultSettings();
      
      return {
        swipeMappings: this.validateSwipeMappings(parsed.swipeMappings) ? 
          parsed.swipeMappings : DEFAULT_SWIPE_MAPPINGS,
        enableNotifications: typeof parsed.enableNotifications === 'boolean' ? 
          parsed.enableNotifications : true,
        autoBackup: typeof parsed.autoBackup === 'boolean' ? 
          parsed.autoBackup : false
      };
    } catch (error) {
      console.error('Failed to load user settings:', error);
      return this.getDefaultSettings();
    }
  }

  static saveUserSettings(settings: UserSettings): boolean {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
      return true;
    } catch (error) {
      console.error('Failed to save user settings:', error);
      throw new Error('Failed to save settings. Storage may be full.');
    }
  }

  private static getDefaultSettings(): UserSettings {
    return {
      swipeMappings: DEFAULT_SWIPE_MAPPINGS,
      enableNotifications: true,
      autoBackup: false
    };
  }

  private static validateSwipeMappings(mappings: any): boolean {
    if (!mappings || typeof mappings !== 'object') return false;
    const directions = ['up', 'down', 'left', 'right'];
    return directions.every(dir => 
      typeof mappings[dir] === 'string' && mappings[dir].length > 0
    );
  }

  // Album Management
  static getAlbums(): Album[] {
    try {
      const stored = localStorage.getItem(ALBUMS_KEY);
      if (!stored) return this.getDefaultAlbums();
      
      const parsed = JSON.parse(stored);
      // Validate structure
      if (!Array.isArray(parsed)) return this.getDefaultAlbums();
      
      return parsed.filter(album => 
        album && 
        typeof album.id === 'string' &&
        typeof album.name === 'string' &&
        Array.isArray(album.photos)
      );
    } catch (error) {
      console.error('Failed to load albums:', error);
      return this.getDefaultAlbums();
    }
  }

  static saveAlbums(albums: Album[]): boolean {
    try {
      localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums));
      return true;
    } catch (error) {
      console.error('Failed to save albums:', error);
      throw new Error('Failed to save albums. Storage may be full or unavailable.');
    }
  }

  private static getDefaultAlbums(): Album[] {
    return [
      { id: 'favorites', name: 'Favorites', icon: '❤️', photos: [], type: 'custom' },
      { id: 'archive', name: 'Archive', icon: '📁', photos: [], type: 'custom' },
      { id: 'all', name: 'All Photos', icon: '📷', photos: [], type: 'system' },
      { id: 'recent', name: 'Recent', icon: '🕒', photos: [], type: 'system' },
      { id: 'camera', name: 'Camera', icon: '📸', photos: [], type: 'system' },
      { id: 'screenshots', name: 'Screenshots', icon: '📱', photos: [], type: 'system' },
      { id: 'videos', name: 'Videos', icon: '🎥', photos: [], type: 'system' },
    ];
  }

  static addPhotoToAlbum(albumId: string, photo: AlbumPhoto): boolean {
    try {
      const albums = this.getAlbums();
      const album = albums.find(a => a.id === albumId);
      
      if (album) {
        // Remove photo if it already exists to avoid duplicates
        album.photos = album.photos.filter(p => p.id !== photo.id);
        album.photos.unshift({ ...photo, sortedAt: Date.now() });
        return this.saveAlbums(albums);
      }
      return false;
    } catch (error) {
      console.error(`Failed to add photo to album ${albumId}:`, error);
      throw new Error(`Failed to add photo to ${albumId} album.`);
    }
  }

  static removePhotoFromAlbum(albumId: string, photoId: string): boolean {
    try {
      const albums = this.getAlbums();
      const album = albums.find(a => a.id === albumId);
      
      if (album) {
        album.photos = album.photos.filter(p => p.id !== photoId);
        return this.saveAlbums(albums);
      }
      return false;
    } catch (error) {
      console.error(`Failed to remove photo from album ${albumId}:`, error);
      throw new Error(`Failed to remove photo from ${albumId} album.`);
    }
  }

  static updateAllPhotosAlbum(): boolean {
    try {
      const photos = this.getPhotos();
      const albums = this.getAlbums();
      const allPhotosAlbum = albums.find(a => a.id === 'all');
      const recentAlbum = albums.find(a => a.id === 'recent');
      
      if (allPhotosAlbum) {
        allPhotosAlbum.photos = photos.map(photo => ({
          ...photo,
          sortedAt: photo.uploadedAt,
        }));
      }
      
      if (recentAlbum) {
        // Recent shows last 20 photos by upload time
        const recentPhotos = photos
          .sort((a, b) => b.uploadedAt - a.uploadedAt)
          .slice(0, 20)
          .map(photo => ({
            ...photo,
            sortedAt: photo.uploadedAt,
          }));
        recentAlbum.photos = recentPhotos;
      }
      
      return this.saveAlbums(albums);
    } catch (error) {
      console.error('Failed to update album data:', error);
      throw new Error('Failed to update album data.');
    }
  }

  // System Album Integration
  static async scanDeviceAlbums(): Promise<UploadedPhoto[]> {
    try {
      // PWA stub - in Median.co this will use native plugins
      if (window.navigator && (window.navigator as any).album) {
        return await (window.navigator as any).album.getPhotos();
      }
      
      // File System Access API for modern browsers
      if ('showDirectoryPicker' in window) {
        return await this.scanWithFileSystemAPI();
      }
      
      return [];
    } catch (error) {
      console.error('Failed to scan device albums:', error);
      return [];
    }
  }

  private static async scanWithFileSystemAPI(): Promise<UploadedPhoto[]> {
    try {
      // This would require user permission
      // For now, return empty array as it needs user interaction
      return [];
    } catch (error) {
      return [];
    }
  }

  static async processFiles(files: FileList): Promise<UploadedPhoto[]> {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    const processedPhotos: UploadedPhoto[] = [];
    const existingPhotos = this.getPhotos();
    const existingNames = new Set(existingPhotos.map(p => p.name));
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!validTypes.includes(file.type)) {
        continue; // Skip invalid types
      }
      
      if (file.size > maxSize) {
        continue; // Skip large files
      }
      
      // Skip duplicate file names
      if (existingNames.has(file.name)) {
        continue;
      }
      
      const dataUrl = await this.fileToDataUrl(file);
      
      processedPhotos.push({
        id: `${Date.now()}_${i}`,
        name: file.name,
        dataUrl,
        size: file.size,
        type: file.type,
        uploadedAt: Date.now(),
        source: 'upload'
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