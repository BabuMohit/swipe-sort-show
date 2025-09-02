import { useState, useCallback } from 'react';
import { Button } from './ui/button';
import { useToast } from '@/hooks/use-toast';
import { PhotoStorage, UploadedPhoto } from '@/lib/photoStorage';
import { Camera, Upload } from 'lucide-react';

interface CameraPhotoProps {
  onPhotoCaptured: (photos: UploadedPhoto[]) => void;
}

export function CameraPhoto({ onPhotoCaptured }: CameraPhotoProps) {
  const [isCapturing, setIsCapturing] = useState(false);
  const { toast } = useToast();

  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          toast({
            title: "Notifications enabled",
            description: "You'll receive updates about your photo sessions",
            duration: 2000,
          });
        }
      } catch (error) {
        console.error('Failed to request notification permission:', error);
      }
    }
  }, [toast]);

  const showNotification = useCallback((title: string, body: string) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, {
          body,
          icon: '/manifest-icon-192.png',
          badge: '/manifest-icon-192.png',
          tag: 'sort-it-notification'
        });
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    }
  }, []);

  const capturePhoto = useCallback(async () => {
    try {
      setIsCapturing(true);
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      // Create video element to capture frame
      const video = document.createElement('video');
      video.srcObject = stream;
      video.play();

      // Wait for video to be ready
      await new Promise((resolve) => {
        video.onloadedmetadata = resolve;
      });

      // Create canvas to capture frame
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        
        // Convert to data URL
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        
        // Create photo object
        const photo: UploadedPhoto = {
          id: `camera_${Date.now()}`,
          name: `Camera_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.jpg`,
          dataUrl,
          size: dataUrl.length,
          type: 'image/jpeg',
          uploadedAt: Date.now(),
        };

        // Save to storage
        const existingPhotos = PhotoStorage.getPhotos();
        const updatedPhotos = [...existingPhotos, photo];
        await PhotoStorage.savePhotos(updatedPhotos);
        PhotoStorage.updateAllPhotosAlbum();

        // Stop camera stream
        stream.getTracks().forEach(track => track.stop());
        
        // Show notification
        showNotification('Photo Captured', 'New photo added to your collection');
        
        // Callback with all photos
        onPhotoCaptured(updatedPhotos);
        
        toast({
          title: "Photo captured",
          description: "Photo saved to your collection",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Camera capture failed:', error);
      toast({
        title: "Camera Error",
        description: "Failed to access camera. Please check permissions.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsCapturing(false);
    }
  }, [onPhotoCaptured, toast, showNotification]);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    try {
      const newPhotos = await PhotoStorage.processFiles(files);
      if (newPhotos.length === 0) {
        toast({
          title: "No new photos",
          description: "All selected photos already exist in your collection",
          duration: 2000,
        });
        return;
      }

      const existingPhotos = PhotoStorage.getPhotos();
      const updatedPhotos = [...existingPhotos, ...newPhotos];
      await PhotoStorage.savePhotos(updatedPhotos);
      PhotoStorage.updateAllPhotosAlbum();

      // Request notification permission and show notification
      await requestNotificationPermission();
      showNotification('Photos Imported', `${newPhotos.length} new photos added to your collection`);

      onPhotoCaptured(updatedPhotos);
      
      toast({
        title: "Photos imported",
        description: `${newPhotos.length} photos added successfully`,
        duration: 2000,
      });
    } catch (error) {
      console.error('Upload failed:', error);
      toast({
        title: "Upload Error",
        description: "Failed to process uploaded photos",
        variant: "destructive",
        duration: 3000,
      });
    }

    // Reset input
    event.target.value = '';
  }, [onPhotoCaptured, toast, requestNotificationPermission, showNotification]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Button
          onClick={capturePhoto}
          disabled={isCapturing}
          className="w-full min-h-[56px] bg-gradient-primary border-0 text-primary-foreground shadow-action hover:shadow-elevated"
          size="lg"
        >
          <Camera className="w-5 h-5 mr-2" />
          {isCapturing ? 'Capturing...' : 'Take Photo'}
        </Button>

        <label className="cursor-pointer">
          <Button
            asChild
            variant="outline"
            className="w-full min-h-[56px]"
            size="lg"
          >
            <span>
              <Upload className="w-5 h-5 mr-2" />
              Import Photos
            </span>
          </Button>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
            aria-label="Upload photos from device"
          />
        </label>
      </div>
    </div>
  );
}