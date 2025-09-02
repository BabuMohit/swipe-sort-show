import { useState, useEffect } from 'react';
import { PhotoCard } from './PhotoCard';
import { ActionButtons } from './ActionButtons';
import { ProgressIndicator } from './ProgressIndicator';
import { StatsPanel } from './StatsPanel';
import { PhotoUpload } from './PhotoUpload';
import { AlbumView } from './AlbumView';
import { Button } from './ui/button';
import { usePhotoSorting } from '@/hooks/usePhotoSorting';
import { useToast } from '@/hooks/use-toast';
import { PhotoStorage, UploadedPhoto } from '@/lib/photoStorage';
import { FolderOpen, Image, Settings, Smartphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { SwipeSettings } from './SwipeSettings';
import { InstallGuide } from './InstallGuide';

export function SortItApp() {
  const [showStats, setShowStats] = useState(false);
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  const [showAlbums, setShowAlbums] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Transform photos for the sorting hook
  const photoData = photos.map(photo => ({
    id: photo.id,
    dataUrl: photo.dataUrl,
    name: photo.name,
  }));
  
  const {
    currentPhoto,
    currentIndex,
    isComplete,
    isAnimating,
    stats,
    history,
    performAction,
    undo,
    reset,
  } = usePhotoSorting(photoData);

  // Load photos on mount
  useEffect(() => {
    try {
      const savedPhotos = PhotoStorage.getPhotos();
      setPhotos(savedPhotos);
      // Update album data when photos change
      PhotoStorage.updateAllPhotosAlbum();
    } catch (error) {
      toast({
        title: "Storage Error",
        description: "Failed to load photos from storage",
        variant: "destructive",
        duration: 3000,
      });
    }
  }, [toast]);

  const handlePhotosUploaded = async (uploadedPhotos: UploadedPhoto[]) => {
    try {
      await PhotoStorage.savePhotos(uploadedPhotos);
      setPhotos(uploadedPhotos);
      PhotoStorage.updateAllPhotosAlbum();
      toast({
        title: "Photos uploaded",
        description: `${uploadedPhotos.length} photos imported successfully`,
        duration: 2000,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to save uploaded photos";
      toast({
        title: "Upload Error",
        description: errorMessage,
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleSwipeLeft = () => {
    try {
      const originalPhoto = photos.find(p => p.id === currentPhoto.id);
      performAction('left', originalPhoto);
      const settings = PhotoStorage.getUserSettings();
      const album = PhotoStorage.getAlbums().find(a => a.id === settings.swipeMappings.left);
      toast({
        title: "Photo sorted",
        description: `Moved to ${album?.name || 'Album'}`,
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sort photo",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleSwipeRight = () => {
    try {
      const originalPhoto = photos.find(p => p.id === currentPhoto.id);
      performAction('right', originalPhoto);
      const settings = PhotoStorage.getUserSettings();
      const album = PhotoStorage.getAlbums().find(a => a.id === settings.swipeMappings.right);
      toast({
        title: "Photo sorted",
        description: `Moved to ${album?.name || 'Album'}`,
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sort photo",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleSwipeUp = () => {
    try {
      const originalPhoto = photos.find(p => p.id === currentPhoto.id);
      performAction('up', originalPhoto);
      const settings = PhotoStorage.getUserSettings();
      const album = PhotoStorage.getAlbums().find(a => a.id === settings.swipeMappings.up);
      toast({
        title: "Photo sorted",
        description: `Moved to ${album?.name || 'Album'}`,
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sort photo",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleSwipeDown = () => {
    try {
      const originalPhoto = photos.find(p => p.id === currentPhoto.id);
      performAction('down', originalPhoto);
      const settings = PhotoStorage.getUserSettings();
      const album = PhotoStorage.getAlbums().find(a => a.id === settings.swipeMappings.down);
      toast({
        title: "Photo sorted",
        description: `Moved to ${album?.name || 'Album'}`,
        duration: 1500,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sort photo",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    
    undo();
    toast({
      title: "Action undone",
      description: "Last action has been undone",
      duration: 1500,
    });
  };

  const handleReset = () => {
    reset();
    setShowStats(false);
    toast({
      title: "Session reset",
      description: "Starting over with new session",
      duration: 1500,
    });
  };

  // Show album view
  if (showAlbums) {
    return <AlbumView onBackToSorting={() => setShowAlbums(false)} />;
  }

  // Show upload screen if no photos
  if (photos.length === 0) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Sort It
            </h1>
            <p className="text-muted-foreground">
              Import your photos to start sorting
            </p>
          </div>
          
          <PhotoUpload 
            onPhotosUploaded={handlePhotosUploaded}
            existingPhotos={photos}
          />
        </div>
      </div>
    );
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col items-center justify-center">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
              Session Complete! 🎉
            </h1>
            <p className="text-muted-foreground">
              You've sorted all {stats.total} photos
            </p>
          </div>
          
            <StatsPanel 
              kept={stats.kept}
              discarded={stats.discarded}
              total={stats.total}
            />
            
            <div className="bg-gradient-card rounded-lg p-3 text-center">
              <p className="text-sm text-muted-foreground">
                {photos.length} photos in collection
              </p>
            </div>
          
          <div className="space-y-3">
            <Button 
              onClick={handleReset}
              className="w-full min-h-[44px] bg-gradient-primary border-0 text-primary-foreground shadow-action hover:shadow-elevated"
              size="lg"
            >
              Sort Again
            </Button>
            
            <Button
              variant="outline"
              onClick={() => setPhotos([])}
              className="w-full min-h-[44px]"
              size="lg"
            >
              📷 Import New Photos
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowInstallGuide(true)}
              className="w-full min-h-[48px]"
              size="lg"
            >
              <Smartphone className="w-4 h-4 mr-2" />
              Get Mobile App
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => navigate('/gallery')}
              className="w-full min-h-[44px]"
              size="lg"
            >
              <Image className="w-4 h-4 mr-2" />
              View Gallery
            </Button>

            <Button 
              variant="outline"
              onClick={() => setShowAlbums(true)}
              className="w-full min-h-[44px]"
              size="lg"
            >
              <FolderOpen className="w-4 h-4 mr-2" />
              View Albums
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => setShowStats(!showStats)}
              className="w-full min-h-[44px]"
              size="lg"
            >
              {showStats ? 'Hide' : 'Show'} Detailed Stats
            </Button>
          </div>
          
          {showStats && (
            <div className="bg-gradient-card rounded-xl p-4 shadow-card animate-bounce-in">
              <h3 className="font-semibold mb-3">Session History</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {history.map((action, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center text-sm p-2 bg-secondary rounded-lg"
                  >
                    <span className="truncate flex-1 mr-2" title={action.photoName}>
                      {action.photoName || `Photo ${index + 1}`}
                    </span>
                    <span className={action.action === 'keep' ? 'text-keep' : 'text-discard'}>
                      {action.action === 'keep' ? '❤️ Kept' : '❌ Discarded'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-sm border-b border-border">
        <div className="max-w-md mx-auto p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Sort It
            </h1>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleUndo}
                disabled={history.length === 0 || isAnimating}
                className="min-h-[44px] px-3"
              >
                ↶ Undo
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(true)}
                className="min-h-[48px] px-3"
                aria-label="Open settings"
              >
                <Settings className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/gallery')}
                className="min-h-[48px] px-3"
                aria-label="Open gallery"
              >
                <Image className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAlbums(true)}
                className="min-h-[48px] px-3"
                aria-label="Open albums"
              >
                <FolderOpen className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowStats(!showStats)}
                className="min-h-[48px] px-3"
                aria-label="Toggle statistics"
              >
                📊
              </Button>
            </div>
          </div>
          
          <ProgressIndicator 
            current={currentIndex}
            total={stats.total}
          />
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Photo {currentIndex + 1} of {photos.length}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto p-4 pb-8">
        <div className="space-y-6">
          {/* Stats Panel */}
          {showStats && (
            <StatsPanel 
              kept={stats.kept}
              discarded={stats.discarded}
              total={stats.total}
              className="animate-bounce-in"
            />
          )}
          
          {/* Photo Card */}
          <div className="relative min-h-[500px] flex items-center justify-center">
            {currentPhoto && (
              <PhotoCard
                image={currentPhoto.dataUrl}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
                onSwipeUp={handleSwipeUp}
                onSwipeDown={handleSwipeDown}
                className="animate-bounce-in"
              />
            )}
          </div>
          
          {/* Action Buttons */}
          <ActionButtons
            onDiscard={handleSwipeLeft}
            onKeep={handleSwipeRight}
            disabled={isAnimating}
          />
          
          {/* Instructions */}
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <p>Swipe in any direction to sort photos</p>
            <p>Or use the buttons below</p>
          </div>
        </div>
      </main>
      
      {/* Settings Modals */}
      <SwipeSettings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        albums={PhotoStorage.getAlbums()}
      />
      
      <InstallGuide
        isOpen={showInstallGuide}
        onClose={() => setShowInstallGuide(false)}
      />
    </div>
  );
}