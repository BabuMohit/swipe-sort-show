import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ActionButtonsProps {
  onDiscard: () => void;
  onKeep: () => void;
  disabled?: boolean;
  className?: string;
}

export function ActionButtons({ onDiscard, onKeep, disabled = false, className }: ActionButtonsProps) {
  return (
    <div className={cn("flex gap-4 justify-center", className)}>
      <Button
        variant="outline"
        size="lg"
        onClick={onDiscard}
        disabled={disabled}
        className={cn(
          "min-h-[44px] px-8 bg-gradient-discard border-0 text-discard-foreground",
          "hover:scale-105 transition-transform duration-200",
          "shadow-action hover:shadow-elevated",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="mr-2 text-lg">❌</span>
        Pass
      </Button>
      
      <Button
        variant="outline"
        size="lg"
        onClick={onKeep}
        disabled={disabled}
        className={cn(
          "min-h-[44px] px-8 bg-gradient-keep border-0 text-keep-foreground",
          "hover:scale-105 transition-transform duration-200",
          "shadow-action hover:shadow-elevated",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <span className="mr-2 text-lg">❤️</span>
        Keep
      </Button>
    </div>
  );
}