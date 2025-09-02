export interface UploadedPhoto {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
  type: string;
  uploadedAt: number;
}

export interface AlbumPhoto extends UploadedPhoto {
  sortedAt?: number;
}

export interface Album {
  id: string;
  name: string;
  icon: string;
  photos: AlbumPhoto[];
}

export type AlbumType = 'favorites' | 'archive' | 'all' | 'recent';

const STORAGE_KEY = 'sortit_photos';
const ALBUMS_KEY = 'sortit_albums';

export class PhotoStorage {
  static async savePhotos(photos: UploadedPhoto[]): Promise<boolean> {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(photos));
      return true;
    } catch (error) {
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
  }

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
      { id: 'favorites', name: 'Favorites', icon: '❤️', photos: [] },
      { id: 'archive', name: 'Archive', icon: '📁', photos: [] },
      { id: 'all', name: 'All Photos', icon: '📷', photos: [] },
      { id: 'recent', name: 'Recent', icon: '🕒', photos: [] },
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