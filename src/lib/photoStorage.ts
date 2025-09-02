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
    localStorage.removeItem(ALBUMS_KEY);
  }

  // Album Management
  static getAlbums(): Album[] {
    try {
      const stored = localStorage.getItem(ALBUMS_KEY);
      const albums = stored ? JSON.parse(stored) : this.getDefaultAlbums();
      return albums;
    } catch (error) {
      console.error('Failed to load albums:', error);
      return this.getDefaultAlbums();
    }
  }

  static saveAlbums(albums: Album[]): void {
    try {
      localStorage.setItem(ALBUMS_KEY, JSON.stringify(albums));
    } catch (error) {
      console.error('Failed to save albums:', error);
      throw new Error('Storage full or unavailable');
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

  static addPhotoToAlbum(albumId: string, photo: AlbumPhoto): void {
    const albums = this.getAlbums();
    const album = albums.find(a => a.id === albumId);
    
    if (album) {
      // Remove photo if it already exists to avoid duplicates
      album.photos = album.photos.filter(p => p.id !== photo.id);
      album.photos.unshift({ ...photo, sortedAt: Date.now() });
      this.saveAlbums(albums);
    }
  }

  static removePhotoFromAlbum(albumId: string, photoId: string): void {
    const albums = this.getAlbums();
    const album = albums.find(a => a.id === albumId);
    
    if (album) {
      album.photos = album.photos.filter(p => p.id !== photoId);
      this.saveAlbums(albums);
    }
  }

  static updateAllPhotosAlbum(): void {
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
      // Recent shows last 50 photos by upload time
      const recentPhotos = photos
        .sort((a, b) => b.uploadedAt - a.uploadedAt)
        .slice(0, 50)
        .map(photo => ({
          ...photo,
          sortedAt: photo.uploadedAt,
        }));
      recentAlbum.photos = recentPhotos;
    }
    
    this.saveAlbums(albums);
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