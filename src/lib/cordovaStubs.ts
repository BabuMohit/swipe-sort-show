// Cordova Plugin Stubs for Median.co PWA-to-Native Conversion

// Device Album Access Plugin
interface DeviceAlbum {
  id: string;
  name: string;
  type: 'camera' | 'screenshots' | 'downloads' | 'custom';
  count: number;
}

interface DevicePhoto {
  id: string;
  name: string;
  path: string;
  dateAdded: number;
  size: number;
  mimeType: string;
  albumId: string;
}

interface AlbumPlugin {
  getAlbums(): Promise<DeviceAlbum[]>;
  getPhotos(albumId?: string): Promise<DevicePhoto[]>;
  getPhotoData(photoId: string): Promise<string>; // Returns base64 data URL
  deletePhoto(photoId: string): Promise<boolean>;
  movePhoto(photoId: string, targetAlbumId: string): Promise<boolean>;
}

// Camera Plugin
interface CameraPlugin {
  getPicture(options: any): Promise<string>;
  cleanup(): Promise<void>;
}

// File System Plugin
interface FilePlugin {
  readAsDataURL(path: string): Promise<string>;
  writeFile(path: string, data: string): Promise<boolean>;
  deleteFile(path: string): Promise<boolean>;
  createDirectory(path: string): Promise<boolean>;
}

// Device Information Plugin
interface DevicePlugin {
  platform: string;
  version: string;
  model: string;
  available: boolean;
}

// Notification Plugin
interface NotificationPlugin {
  requestPermission(): Promise<string>;
  schedule(options: any): Promise<void>;
  cancel(id: string): Promise<void>;
}

// Extend Navigator interface for Cordova plugins
declare global {
  interface Navigator {
    album?: AlbumPlugin;
    camera?: CameraPlugin;
    file?: FilePlugin;
    device?: DevicePlugin;
    notification?: NotificationPlugin;
  }

  interface Window {
    cordova?: {
      plugins: {
        album: AlbumPlugin;
        camera: CameraPlugin;
        file: FilePlugin;
        device: DevicePlugin;
        notification: NotificationPlugin;
      };
    };
  }
}

// PWA Fallback Implementations
export const CordovaStubs = {
  // Initialize stubs for PWA environment
  init() {
    if (typeof window !== 'undefined' && !window.cordova) {
      // Album Plugin Stub
      if (!navigator.album) {
        (navigator as any).album = {
          async getAlbums(): Promise<DeviceAlbum[]> {
            console.log('PWA: Album plugin not available, returning empty albums');
            return [];
          },
          async getPhotos(albumId?: string): Promise<DevicePhoto[]> {
            console.log('PWA: Album plugin not available, returning empty photos');
            return [];
          },
          async getPhotoData(photoId: string): Promise<string> {
            console.log('PWA: Album plugin not available, cannot get photo data');
            return '';
          },
          async deletePhoto(photoId: string): Promise<boolean> {
            console.log('PWA: Album plugin not available, cannot delete photo');
            return false;
          },
          async movePhoto(photoId: string, targetAlbumId: string): Promise<boolean> {
            console.log('PWA: Album plugin not available, cannot move photo');
            return false;
          }
        };
      }

      // Camera Plugin Stub
      if (!navigator.camera) {
        (navigator as any).camera = {
          async getPicture(options: any): Promise<string> {
            console.log('PWA: Camera plugin not available, using getUserMedia');
            // Fall back to getUserMedia
            try {
              const stream = await navigator.mediaDevices.getUserMedia({ video: true });
              const video = document.createElement('video');
              video.srcObject = stream;
              video.play();
              
              return new Promise((resolve) => {
                video.onloadedmetadata = () => {
                  const canvas = document.createElement('canvas');
                  const context = canvas.getContext('2d');
                  canvas.width = video.videoWidth;
                  canvas.height = video.videoHeight;
                  context?.drawImage(video, 0, 0);
                  stream.getTracks().forEach(track => track.stop());
                  resolve(canvas.toDataURL('image/jpeg'));
                };
              });
            } catch (error) {
              throw new Error('Camera not available in PWA mode');
            }
          },
          async cleanup(): Promise<void> {
            console.log('PWA: Camera cleanup not needed');
          }
        };
      }

      // Device Plugin Stub
      if (!navigator.device) {
        (navigator as any).device = {
          platform: 'browser',
          version: navigator.userAgent,
          model: 'PWA',
          available: false
        };
      }

      // Notification Plugin Stub
      if (!navigator.notification) {
        (navigator as any).notification = {
          async requestPermission(): Promise<string> {
            if ('Notification' in window) {
              return await Notification.requestPermission();
            }
            return 'denied';
          },
          async schedule(options: any): Promise<void> {
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification(options.title, {
                body: options.text,
                icon: options.icon
              });
            }
          },
          async cancel(id: string): Promise<void> {
            console.log('PWA: Cannot cancel notification:', id);
          }
        };
      }
    }
  },

  // Check if running in native app
  isNative(): boolean {
    return !!(window.cordova || (navigator as any).album);
  },

  // Get platform information
  getPlatform(): string {
    if (this.isNative()) {
      return navigator.device?.platform || 'unknown';
    }
    return 'pwa';
  }
};

// Auto-initialize stubs
if (typeof window !== 'undefined') {
  CordovaStubs.init();
}