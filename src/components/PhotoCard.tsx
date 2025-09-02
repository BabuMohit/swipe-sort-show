import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface PhotoCardProps {
  image: string;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  className?: string;
}

export function PhotoCard({ image, onSwipeLeft, onSwipeRight, className }: PhotoCardProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [transform, setTransform] = useState({ x: 0, y: 0, rotation: 0 });
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const startPositionRef = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    const touch = e.touches[0];
    startPositionRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const touch = e.touches[0];
    const deltaX = touch.clientX - startPositionRef.current.x;
    const deltaY = touch.clientY - startPositionRef.current.y;
    
    const rotation = deltaX * 0.1; // Subtle rotation based on horizontal movement
    
    setTransform({ x: deltaX, y: deltaY, rotation });
    
    // Visual feedback for swipe direction
    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    
    const swipeThreshold = 150;
    
    if (Math.abs(transform.x) > swipeThreshold) {
      // Trigger swipe animation
      if (transform.x > 0) {
        setTransform({ x: window.innerWidth, y: transform.y, rotation: 15 });
        setTimeout(onSwipeRight, 300);
      } else {
        setTransform({ x: -window.innerWidth, y: transform.y, rotation: -15 });
        setTimeout(onSwipeLeft, 300);
      }
    } else {
      // Snap back to center
      setTransform({ x: 0, y: 0, rotation: 0 });
      setSwipeDirection(null);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startPositionRef.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - startPositionRef.current.x;
    const deltaY = e.clientY - startPositionRef.current.y;
    
    const rotation = deltaX * 0.1;
    
    setTransform({ x: deltaX, y: deltaY, rotation });
    
    if (Math.abs(deltaX) > 50) {
      setSwipeDirection(deltaX > 0 ? 'right' : 'left');
    } else {
      setSwipeDirection(null);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    
    const swipeThreshold = 150;
    
    if (Math.abs(transform.x) > swipeThreshold) {
      if (transform.x > 0) {
        setTransform({ x: window.innerWidth, y: transform.y, rotation: 15 });
        setTimeout(onSwipeRight, 300);
      } else {
        setTransform({ x: -window.innerWidth, y: transform.y, rotation: -15 });
        setTimeout(onSwipeLeft, 300);
      }
    } else {
      setTransform({ x: 0, y: 0, rotation: 0 });
      setSwipeDirection(null);
    }
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div
      ref={cardRef}
      className={cn(
        "relative w-full max-w-sm mx-auto bg-gradient-card rounded-2xl shadow-elevated overflow-hidden",
        "select-none cursor-grab active:cursor-grabbing",
        "transition-transform duration-300 ease-out",
        swipeDirection === 'right' && "ring-4 ring-keep/30",
        swipeDirection === 'left' && "ring-4 ring-discard/30",
        className
      )}
      style={{
        transform: `translate(${transform.x}px, ${transform.y}px) rotate(${transform.rotation}deg)`,
        transition: isDragging ? 'none' : 'var(--transition-smooth)',
      }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
    >
      <div className="aspect-[4/5] relative">
        <img
          src={image}
          alt="Photo to sort"
          className="w-full h-full object-cover"
          draggable={false}
        />
        
        {/* Swipe indicators */}
        {swipeDirection === 'right' && (
          <div className="absolute inset-0 bg-keep/20 flex items-center justify-center">
            <div className="bg-keep text-keep-foreground rounded-full p-4 animate-pulse-keep">
              <span className="text-4xl">❤️</span>
            </div>
          </div>
        )}
        
        {swipeDirection === 'left' && (
          <div className="absolute inset-0 bg-discard/20 flex items-center justify-center">
            <div className="bg-discard text-discard-foreground rounded-full p-4 animate-pulse-discard">
              <span className="text-4xl">❌</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Card info overlay */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
        <p className="text-white text-sm opacity-75">Swipe to sort</p>
      </div>
    </div>
  );
}