import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Album, AlbumPhoto, PhotoStorage } from '@/lib/photoStorage';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft } from 'lucide-react';

interface AlbumViewProps {
  onBackToSorting: () => void;
}

export function AlbumView({ onBackToSorting }: AlbumViewProps) {
  const [albums, setAlbums] = useState<Album[]>(PhotoStorage.getAlbums());
  const [activeAlbum, setActiveAlbum] = useState<string>('favorites');
  const { toast } = useToast();

  const handleRemovePhoto = (albumId: string, photoId: string) => {
    PhotoStorage.removePhotoFromAlbum(albumId, photoId);
    setAlbums(PhotoStorage.getAlbums());
    toast({
      title: "Photo removed",
      description: "Photo removed from album",
      duration: 1500,
    });
  };

  const currentAlbum = albums.find(a => a.id === activeAlbum);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToSorting}
                className="min-h-[44px] px-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sorting
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Albums
              </h1>
            </div>
          </div>

          {/* Album Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {albums.map((album) => (
              <Button
                key={album.id}
                variant={activeAlbum === album.id ? "default" : "outline"}
                size="sm"
                onClick={() => setActiveAlbum(album.id)}
                className="min-h-[44px] px-4 whitespace-nowrap relative"
              >
                <span className="mr-2">{album.icon}</span>
                {album.name}
                {album.photos.length > 0 && (
                  <Badge 
                    variant="secondary" 
                    className="ml-2 text-xs min-w-[20px] h-5"
                  >
                    {album.photos.length}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Album Content */}
      <main className="max-w-4xl mx-auto p-4">
        {currentAlbum && (
          <div className="space-y-4">
            <div className="text-center">
              <h2 className="text-xl font-semibold flex items-center justify-center gap-2">
                <span>{currentAlbum.icon}</span>
                {currentAlbum.name}
              </h2>
              <p className="text-muted-foreground">
                {currentAlbum.photos.length} photos
              </p>
            </div>

            {currentAlbum.photos.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">{currentAlbum.icon}</div>
                <p className="text-muted-foreground">No photos in this album yet</p>
                {activeAlbum === 'favorites' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Swipe right during sorting to add photos here
                  </p>
                )}
                {activeAlbum === 'archive' && (
                  <p className="text-sm text-muted-foreground mt-2">
                    Swipe left during sorting to add photos here
                  </p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:gap-4">
                {currentAlbum.photos.map((photo) => (
                  <PhotoThumbnail
                    key={photo.id}
                    photo={photo}
                    albumId={currentAlbum.id}
                    onRemove={handleRemovePhoto}
                    canRemove={activeAlbum === 'favorites' || activeAlbum === 'archive'}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

interface PhotoThumbnailProps {
  photo: AlbumPhoto;
  albumId: string;
  onRemove: (albumId: string, photoId: string) => void;
  canRemove: boolean;
}

function PhotoThumbnail({ photo, albumId, onRemove, canRemove }: PhotoThumbnailProps) {
  const [showRemove, setShowRemove] = useState(false);

  const handleLongPress = () => {
    if (canRemove) {
      setShowRemove(true);
    }
  };

  const handleRemove = () => {
    onRemove(albumId, photo.id);
    setShowRemove(false);
  };

  return (
    <div 
      className="relative aspect-square bg-secondary rounded-lg overflow-hidden group cursor-pointer"
      onContextMenu={(e) => {
        e.preventDefault();
        handleLongPress();
      }}
      onTouchStart={() => {
        setTimeout(handleLongPress, 500);
      }}
      onClick={() => setShowRemove(false)}
    >
      <img
        src={photo.dataUrl}
        alt={photo.name}
        className="w-full h-full object-cover transition-transform group-hover:scale-105"
        loading="lazy"
      />
      
      {showRemove && canRemove && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="min-h-[36px]"
          >
            Remove
          </Button>
        </div>
      )}
      
      {canRemove && (
        <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="destructive"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleRemove();
            }}
            className="w-6 h-6 p-0 text-xs"
          >
            ×
          </Button>
        </div>
      )}
    </div>
  );
}