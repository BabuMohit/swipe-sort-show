import { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Checkbox } from './ui/checkbox';
import { PhotoDetailModal } from './PhotoDetailModal';
import { PhotoStorage, AlbumPhoto, Album } from '@/lib/photoStorage';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Search, Filter, CheckSquare, Square, Share, Trash2, FolderOpen } from 'lucide-react';

interface GalleryViewProps {
  onBackToSorting: () => void;
}

export function GalleryView({ onBackToSorting }: GalleryViewProps) {
  const [photos, setPhotos] = useState<AlbumPhoto[]>([]);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAlbum, setSelectedAlbum] = useState('all');
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [selectMode, setSelectMode] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<AlbumPhoto | null>(null);
  const [displayedPhotos, setDisplayedPhotos] = useState<AlbumPhoto[]>([]);
  const [page, setPage] = useState(1);
  const { toast } = useToast();

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Load data
  useEffect(() => {
    const loadData = () => {
      try {
        const allPhotos = PhotoStorage.getPhotos();
        const albumData = PhotoStorage.getAlbums();
        
        setPhotos(allPhotos.map(photo => ({ ...photo, sortedAt: photo.uploadedAt })));
        setAlbums(albumData);
      } catch (error) {
        toast({
          title: "Load Error",
          description: "Failed to load gallery data",
          variant: "destructive",
          duration: 3000,
        });
      }
    };

    loadData();
  }, [toast]);

  // Filter photos based on search and album
  const filteredPhotos = useMemo(() => {
    let filtered = photos;

    // Filter by album
    if (selectedAlbum !== 'all') {
      const album = albums.find(a => a.id === selectedAlbum);
      if (album) {
        filtered = album.photos;
      }
    }

    // Filter by search query
    if (debouncedSearch) {
      const query = debouncedSearch.toLowerCase();
      filtered = filtered.filter(photo => 
        photo.name.toLowerCase().includes(query) ||
        new Date(photo.uploadedAt).toISOString().slice(0, 10).includes(query)
      );
    }

    return filtered.sort((a, b) => (b.sortedAt || b.uploadedAt) - (a.sortedAt || a.uploadedAt));
  }, [photos, albums, selectedAlbum, debouncedSearch]);

  // Infinite scroll implementation
  useEffect(() => {
    const photosPerPage = 20;
    const endIndex = page * photosPerPage;
    setDisplayedPhotos(filteredPhotos.slice(0, endIndex));
  }, [filteredPhotos, page]);

  // Scroll handler for infinite scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 1000) {
        setPage(prev => prev + 1);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedAlbum]);

  const handlePhotoLongPress = useCallback((photoId: string) => {
    if (!selectMode) {
      setSelectMode(true);
      setSelectedPhotos(new Set([photoId]));
    }
  }, [selectMode]);

  const handlePhotoSelect = useCallback((photoId: string) => {
    if (!selectMode) return;
    
    setSelectedPhotos(prev => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  }, [selectMode]);

  const handleSelectAll = useCallback(() => {
    if (selectedPhotos.size === displayedPhotos.length) {
      setSelectedPhotos(new Set());
    } else {
      setSelectedPhotos(new Set(displayedPhotos.map(p => p.id)));
    }
  }, [selectedPhotos.size, displayedPhotos]);

  const handleBatchDelete = useCallback(async () => {
    try {
      const currentPhotos = PhotoStorage.getPhotos();
      const remainingPhotos = currentPhotos.filter(p => !selectedPhotos.has(p.id));
      
      await PhotoStorage.savePhotos(remainingPhotos);
      PhotoStorage.updateAllPhotosAlbum();
      
      // Update local state
      setPhotos(remainingPhotos.map(photo => ({ ...photo, sortedAt: photo.uploadedAt })));
      setSelectedPhotos(new Set());
      setSelectMode(false);
      
      toast({
        title: "Photos deleted",
        description: `${selectedPhotos.size} photos deleted successfully`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Failed to delete selected photos",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [selectedPhotos, toast]);

  const handleBatchShare = useCallback(async () => {
    try {
      const photosToShare = displayedPhotos.filter(p => selectedPhotos.has(p.id));
      
      if (navigator.share) {
        // Convert photos to files for sharing
        const files = await Promise.all(
          photosToShare.map(async (photo) => {
            const response = await fetch(photo.dataUrl);
            const blob = await response.blob();
            return new File([blob], photo.name, { type: photo.type });
          })
        );

        if (navigator.canShare?.({ files })) {
          await navigator.share({
            title: `${selectedPhotos.size} photos`,
            text: `Sharing ${selectedPhotos.size} photos from Sort It`,
            files
          });
        } else {
          throw new Error('Sharing not supported');
        }
      } else {
        throw new Error('Web Share API not available');
      }
    } catch (error) {
      toast({
        title: "Share failed",
        description: "Unable to share selected photos",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [selectedPhotos, displayedPhotos, toast]);

  const handleMoveToAlbum = useCallback((albumId: string) => {
    try {
      const photosToMove = displayedPhotos.filter(p => selectedPhotos.has(p.id));
      
      photosToMove.forEach(photo => {
        PhotoStorage.addPhotoToAlbum(albumId, photo);
      });
      
      setSelectedPhotos(new Set());
      setSelectMode(false);
      
      const albumName = albums.find(a => a.id === albumId)?.name || 'album';
      toast({
        title: "Photos moved",
        description: `${selectedPhotos.size} photos moved to ${albumName}`,
        duration: 2000,
      });
    } catch (error) {
      toast({
        title: "Move failed",
        description: "Failed to move photos to album",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [selectedPhotos, displayedPhotos, albums, toast]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-6xl mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onBackToSorting}
                className="min-h-[48px] px-3"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Sorting
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Gallery
              </h1>
            </div>

            {selectMode && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectMode(false)}
                  className="min-h-[48px]"
                >
                  Cancel
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedPhotos.size} selected
                </span>
              </div>
            )}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search by name or date (YYYY-MM-DD)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 min-h-[48px]"
              />
            </div>
            
            <Select value={selectedAlbum} onValueChange={setSelectedAlbum}>
              <SelectTrigger className="w-full sm:w-48 min-h-[48px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Photos</SelectItem>
                {albums.map(album => (
                  <SelectItem key={album.id} value={album.id}>
                    {album.icon} {album.name} ({album.photos.length})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Batch Actions */}
          {selectMode && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleSelectAll}
                className="min-h-[48px]"
              >
                {selectedPhotos.size === displayedPhotos.length ? (
                  <CheckSquare className="w-4 h-4 mr-2" />
                ) : (
                  <Square className="w-4 h-4 mr-2" />
                )}
                Select All
              </Button>
              
              {selectedPhotos.size > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBatchShare}
                    className="min-h-[48px]"
                  >
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  
                  <Select onValueChange={handleMoveToAlbum}>
                    <SelectTrigger className="w-40 min-h-[48px]">
                      <FolderOpen className="w-4 h-4 mr-2" />
                      <SelectValue placeholder="Move to..." />
                    </SelectTrigger>
                    <SelectContent>
                      {albums.filter(a => a.id !== 'all').map(album => (
                        <SelectItem key={album.id} value={album.id}>
                          {album.icon} {album.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleBatchDelete}
                    className="min-h-[48px]"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      {/* Gallery Grid */}
      <main className="max-w-6xl mx-auto p-4">
        {displayedPhotos.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📷</div>
            <p className="text-muted-foreground">No photos found</p>
            {searchQuery && (
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your search or filter
              </p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
            {displayedPhotos.map((photo) => (
              <PhotoThumbnail
                key={photo.id}
                photo={photo}
                isSelected={selectedPhotos.has(photo.id)}
                selectMode={selectMode}
                onLongPress={handlePhotoLongPress}
                onSelect={handlePhotoSelect}
                onTap={(photo) => !selectMode && setSelectedPhoto(photo)}
              />
            ))}
          </div>
        )}

        {/* Loading indicator */}
        {displayedPhotos.length < filteredPhotos.length && (
          <div className="text-center py-8">
            <div className="text-muted-foreground">Loading more photos...</div>
          </div>
        )}
      </main>

      {/* Photo Detail Modal */}
      <PhotoDetailModal
        photo={selectedPhoto}
        isOpen={!!selectedPhoto}
        onClose={() => setSelectedPhoto(null)}
      />
    </div>
  );
}

interface PhotoThumbnailProps {
  photo: AlbumPhoto;
  isSelected: boolean;
  selectMode: boolean;
  onLongPress: (photoId: string) => void;
  onSelect: (photoId: string) => void;
  onTap: (photo: AlbumPhoto) => void;
}

function PhotoThumbnail({ photo, isSelected, selectMode, onLongPress, onSelect, onTap }: PhotoThumbnailProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    const timer = setTimeout(() => onLongPress(photo.id), 500);
    setLongPressTimer(timer);
  };

  const handleTouchEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer);
      setLongPressTimer(null);
    }
  };

  const handleClick = () => {
    if (selectMode) {
      onSelect(photo.id);
    } else {
      onTap(photo);
    }
  };

  return (
    <div
      className={`relative aspect-square bg-secondary rounded-lg overflow-hidden cursor-pointer transition-all duration-200 ${
        selectMode && isSelected ? 'ring-2 ring-primary scale-95' : 'hover:scale-105'
      }`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
      onClick={handleClick}
      onContextMenu={(e) => {
        e.preventDefault();
        onLongPress(photo.id);
      }}
    >
      {/* Selection checkbox */}
      {selectMode && (
        <div className="absolute top-2 right-2 z-10">
          <Checkbox
            checked={isSelected}
            className="bg-white border-2 border-gray-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
        </div>
      )}

      {/* Loading skeleton */}
      {!imageLoaded && (
        <div className="absolute inset-0 bg-secondary animate-pulse" />
      )}

      {/* Image */}
      <img
        src={photo.dataUrl}
        alt={photo.name}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          imageLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        onLoad={() => setImageLoaded(true)}
        loading="lazy"
      />

      {/* Photo name overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
        <p className="text-white text-xs truncate" title={photo.name}>
          {photo.name}
        </p>
      </div>
    </div>
  );
}