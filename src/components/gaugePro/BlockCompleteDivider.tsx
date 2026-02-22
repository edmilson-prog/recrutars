import { CheckCircle2 } from 'lucide-react';
import { DIMENSION_SHORT_NAMES } from '@/types/gaugePro';
import type { GaugeProDimension } from '@/types/gaugePro';

interface BlockCompleteDividerProps {
  completedDimension: GaugeProDimension;
  nextDimension: GaugeProDimension;
  completedBlockNumber: number;
  totalBlocks: number;
}

export function BlockCompleteDivider({
  completedDimension,
  nextDimension,
  completedBlockNumber,
  totalBlocks,
}: BlockCompleteDividerProps) {
  return (
    <div className="flex items-center justify-center min-h-[60vh] animate-in fade-in duration-500">
      <div className="text-center space-y-5 max-w-sm mx-auto">
        {/* Checkmark icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9 text-emerald-500" />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-emerald-400">Bloco Completo!</h2>
          <p className="text-sm text-muted-foreground">
            Dimensão: {DIMENSION_SHORT_NAMES[completedDimension]}
          </p>
        </div>

        {/* Divider */}
        <div className="border-t border-border mx-8" />

        {/* Next block info */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">
            Próximo bloco
          </p>
          <p className="text-lg font-semibold text-cyan-400">
            {DIMENSION_SHORT_NAMES[nextDimension]}
          </p>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-center gap-2 pt-2">
          {Array.from({ length: totalBlocks }, (_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i < completedBlockNumber
                  ? 'bg-emerald-400'
                  : 'bg-muted'
              }`}
            />
          ))}
          <span className="text-xs text-muted-foreground ml-1">
            {completedBlockNumber}/{totalBlocks}
          </span>
        </div>
      </div>
    </div>
  );
}
