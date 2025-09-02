import { cn } from '@/lib/utils';

interface StatsPanelProps {
  kept: number;
  discarded: number;
  total: number;
  className?: string;
}

export function StatsPanel({ kept, discarded, total, className }: StatsPanelProps) {
  const processed = kept + discarded;
  const keepPercentage = processed > 0 ? (kept / processed) * 100 : 0;
  const discardPercentage = processed > 0 ? (discarded / processed) * 100 : 0;
  
  return (
    <div className={cn("bg-gradient-card rounded-xl p-4 shadow-card", className)}>
      <h3 className="text-lg font-semibold mb-3 text-foreground">Statistics</h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-keep">{kept}</div>
          <div className="text-sm text-muted-foreground">Kept</div>
          <div className="text-xs text-keep">{keepPercentage.toFixed(1)}%</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-discard">{discarded}</div>
          <div className="text-sm text-muted-foreground">Discarded</div>
          <div className="text-xs text-discard">{discardPercentage.toFixed(1)}%</div>
        </div>
      </div>
      
      {processed > 0 && (
        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-gradient-keep rounded-l-full transition-all duration-500"
            style={{ width: `${keepPercentage}%` }}
          />
        </div>
      )}
      
      <div className="mt-2 text-center text-sm text-muted-foreground">
        {processed} of {total} processed
      </div>
    </div>
  );
}