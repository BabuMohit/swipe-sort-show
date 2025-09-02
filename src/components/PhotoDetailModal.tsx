import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { PhotoEditor } from './PhotoEditor';
import { AlbumPhoto, PhotoStorage } from '@/lib/photoStorage';
import { X, Share, Calendar, HardDrive, FileText, Edit, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import JSZip from 'jszip';

interface PhotoDetailModalProps {
  photo: AlbumPhoto | null;
  isOpen: boolean;
  onClose: () => void;
  onPhotoUpdated?: (updatedPhoto: AlbumPhoto) => void;
}

export function PhotoDetailModal({ photo, isOpen, onClose, onPhotoUpdated }: PhotoDetailModalProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && photo) {
      setImageLoaded(false);
    }
  }, [isOpen, photo]);

  const handleShare = async () => {
    if (!photo) return;

    try {
      // Convert data URL to blob for sharing
      const response = await fetch(photo.dataUrl);
      const blob = await response.blob();
      const file = new File([blob], photo.name, { type: photo.type });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({
          title: photo.name,
          text: `Check out this photo: ${photo.name}`,
          files: [file]
        });
      } else {
        // Fallback: create download link
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = photo.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "Downloaded",
          description: "Photo downloaded to your device",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error('Share/download failed:', error);
      toast({
        title: "Action failed",
        description: "Unable to share or download photo",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleEditSave = async (editedDataUrl: string) => {
    if (!photo) return;

    try {
      const updatedPhoto = { ...photo, dataUrl: editedDataUrl };
      
      // Update in storage
      const photos = PhotoStorage.getPhotos();
      const updatedPhotos = photos.map(p => p.id === photo.id ? updatedPhoto : p);
      await PhotoStorage.savePhotos(updatedPhotos);
      PhotoStorage.updateAllPhotosAlbum();
      
      // Update albums
      const albums = PhotoStorage.getAlbums();
      albums.forEach(album => {
        album.photos = album.photos.map(p => p.id === photo.id ? updatedPhoto : p);
      });
      PhotoStorage.saveAlbums(albums);

      setShowEditor(false);
      onPhotoUpdated?.(updatedPhoto);
      
      toast({
        title: "Photo updated",
        description: "Your edits have been saved",
        duration: 2000,
      });
    } catch (error) {
      console.error('Failed to save edited photo:', error);
      toast({
        title: "Save Error",
        description: "Failed to save photo edits",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!photo) return null;

  if (showEditor) {
    return (
      <PhotoEditor
        imageDataUrl={photo.dataUrl}
        onSave={handleEditSave}
        onCancel={() => setShowEditor(false)}
      />
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full max-h-[90vh] overflow-y-auto p-0">
        <div className="relative">
          {/* Close button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="absolute top-2 right-2 z-10 bg-black/20 text-white hover:bg-black/40 rounded-full w-10 h-10 p-0"
          >
            <X className="w-4 h-4" />
          </Button>

          {/* Image */}
          <div className="relative bg-black">
            {!imageLoaded && (
              <div className="aspect-video bg-secondary animate-pulse flex items-center justify-center">
                <div className="text-muted-foreground">Loading...</div>
              </div>
            )}
            <img
              src={photo.dataUrl}
              alt={photo.name}
              className={`w-full h-auto max-h-[60vh] object-contain ${!imageLoaded ? 'hidden' : ''}`}
              onLoad={() => setImageLoaded(true)}
            />
          </div>

          {/* Photo metadata */}
          <div className="p-6 space-y-4">
            <DialogHeader>
              <DialogTitle className="text-xl truncate" title={photo.name}>
                {photo.name}
              </DialogTitle>
            </DialogHeader>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Type:</span>
                  <Badge variant="outline">{photo.type}</Badge>
                </div>

                <div className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Size:</span>
                  <span className="text-sm">{formatFileSize(photo.size)}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Uploaded:</span>
                  <span className="text-sm">{formatDate(photo.uploadedAt)}</span>
                </div>

                {photo.sortedAt && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Sorted:</span>
                    <span className="text-sm">{formatDate(photo.sortedAt)}</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  onClick={handleShare}
                  className="w-full min-h-[48px] justify-start"
                  variant="outline"
                  aria-label="Share or download photo"
                >
                  <Share className="w-4 h-4 mr-2" />
                  Share Photo
                </Button>
                
                <Button
                  onClick={() => setShowEditor(true)}
                  className="w-full min-h-[48px] justify-start"
                  variant="outline"
                  aria-label="Edit photo"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Photo
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}