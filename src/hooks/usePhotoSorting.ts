import { useState, useCallback } from 'react';
import { PhotoStorage, AlbumPhoto } from '@/lib/photoStorage';

export interface SortingAction {
  photoId: string;
  action: 'keep' | 'discard';
  timestamp: number;
  photoName?: string;
}

export interface SortingStats {
  kept: number;
  discarded: number;
  total: number;
  current: number;
}

export function usePhotoSorting(photos: { id: string; dataUrl: string; name: string }[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [history, setHistory] = useState<SortingAction[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);

  const stats: SortingStats = {
    kept: history.filter(action => action.action === 'keep').length,
    discarded: history.filter(action => action.action === 'discard').length,
    total: photos.length,
    current: currentIndex,
  };

  const currentPhoto = photos[currentIndex];
  const isComplete = currentIndex >= photos.length;

  const performAction = useCallback((action: 'keep' | 'discard' | 'up' | 'down' | 'left' | 'right', originalPhoto?: AlbumPhoto) => {
    if (isAnimating || isComplete) return;

    setIsAnimating(true);
    
    // Get user's swipe mappings
    const settings = PhotoStorage.getUserSettings();
    let targetAlbum: string;
    
    // Map swipe direction to album based on user settings
    switch (action) {
      case 'up':
        targetAlbum = settings.swipeMappings.up;
        break;
      case 'down':
        targetAlbum = settings.swipeMappings.down;
        break;
      case 'left':
        targetAlbum = settings.swipeMappings.left;
        break;
      case 'right':
        targetAlbum = settings.swipeMappings.right;
        break;
      case 'keep':
        targetAlbum = 'favorites';
        break;
      case 'discard':
        targetAlbum = 'archive';
        break;
      default:
        targetAlbum = 'favorites';
    }
    
    const newAction: SortingAction = {
      photoId: currentPhoto.id,
      action: action === 'keep' || action === 'right' ? 'keep' : 'discard',
      timestamp: Date.now(),
      photoName: currentPhoto.name,
    };

    setHistory(prev => [...prev, newAction]);
    
    // Save to appropriate album
    try {
      if (originalPhoto) {
        PhotoStorage.addPhotoToAlbum(targetAlbum, originalPhoto);
      }
    } catch (error) {
      console.error('Failed to save to album:', error);
      // Don't block the UI, just log the error
    }
    
    // Simulate animation delay
    setTimeout(() => {
      setCurrentIndex(prev => prev + 1);
      setIsAnimating(false);
    }, 300);
  }, [currentPhoto, isAnimating, isComplete]);

  const undo = useCallback(() => {
    if (history.length === 0 || isAnimating) return;

    setHistory(prev => prev.slice(0, -1));
    setCurrentIndex(prev => Math.max(0, prev - 1));
  }, [history.length, isAnimating]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setHistory([]);
    setIsAnimating(false);
  }, []);

  return {
    currentPhoto,
    currentIndex,
    isComplete,
    isAnimating,
    stats,
    history,
    performAction,
    undo,
    reset,
  };
}