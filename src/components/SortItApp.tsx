import { useState } from 'react';
import { PhotoCard } from './PhotoCard';
import { ActionButtons } from './ActionButtons';
import { ProgressIndicator } from './ProgressIndicator';
import { StatsPanel } from './StatsPanel';
import { Button } from './ui/button';
import { usePhotoSorting } from '@/hooks/usePhotoSorting';
import { useToast } from '@/hooks/use-toast';

// Import sample images
import sample1 from '@/assets/sample-1.jpg';
import sample2 from '@/assets/sample-2.jpg';
import sample3 from '@/assets/sample-3.jpg';
import sample4 from '@/assets/sample-4.jpg';
import sample5 from '@/assets/sample-5.jpg';

const SAMPLE_PHOTOS = [sample1, sample2, sample3, sample4, sample5];

export function SortItApp() {
  const [showStats, setShowStats] = useState(false);
  const { toast } = useToast();
  
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
  } = usePhotoSorting(SAMPLE_PHOTOS);

  const handleSwipeLeft = () => {
    performAction('discard');
    toast({
      title: "Photo discarded",
      description: "Swiped left to discard",
      duration: 1500,
    });
  };

  const handleSwipeRight = () => {
    performAction('keep');
    toast({
      title: "Photo kept",
      description: "Swiped right to keep",
      duration: 1500,
    });
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
                    <span>Photo {index + 1}</span>
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
                onClick={() => setShowStats(!showStats)}
                className="min-h-[44px] px-3"
              >
                📊
              </Button>
            </div>
          </div>
          
          <ProgressIndicator 
            current={currentIndex}
            total={stats.total}
          />
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
                image={currentPhoto}
                onSwipeLeft={handleSwipeLeft}
                onSwipeRight={handleSwipeRight}
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
            <p>Swipe left to discard, right to keep</p>
            <p>Or use the buttons below</p>
          </div>
        </div>
      </main>
    </div>
  );
}