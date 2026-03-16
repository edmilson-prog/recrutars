/**
 * ImpersonationBanner
 * PRD-061: Banner fixo durante sessão de impersonation
 */

import { useState, useEffect } from 'react';
import { Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ImpersonationBannerProps {
  targetName: string;
  targetType: string;
  remainingTimeMs: number;
  onStop: () => void;
}

export function ImpersonationBanner({ targetName, targetType, remainingTimeMs, onStop }: ImpersonationBannerProps) {
  const [remaining, setRemaining] = useState(remainingTimeMs);

  useEffect(() => {
    const interval = setInterval(() => {
      setRemaining(prev => {
        const next = prev - 1000;
        if (next <= 0) {
          onStop();
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [onStop]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const typeLabel = targetType === 'company' ? 'Empresa' : targetType === 'candidate' ? 'Candidato' : 'Admin';

  return (
    <div className="sticky top-0 z-[100] bg-amber-500 text-amber-950 px-4 py-2">
      <div className="max-w-screen-xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Eye className="w-5 h-5" />
          <span className="font-medium text-sm">
            Visualizando como <strong>{targetName}</strong> ({typeLabel})
          </span>
          <span className="text-xs bg-amber-600/30 px-2 py-0.5 rounded-full ml-2">
            {formatTime(remaining)} restantes
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-amber-950 hover:bg-amber-600/30 hover:text-amber-950 gap-1"
          onClick={onStop}
        >
          <X className="w-4 h-4" />
          Encerrar
        </Button>
      </div>
    </div>
  );
}
