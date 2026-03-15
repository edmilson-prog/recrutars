/**
 * SimulatorBanner Component
 * PRD-062: Feature Flags "Switch"
 *
 * Fixed top banner displayed when simulation mode is active.
 */

import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SimulatorBannerProps {
  isSimulating: boolean;
  onStop: () => void;
}

export function SimulatorBanner({ isSimulating, onStop }: SimulatorBannerProps) {
  if (!isSimulating) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-yellow-500 text-yellow-950 py-2 px-4 flex items-center justify-center gap-3 shadow-lg">
      <AlertTriangle className="w-5 h-5 flex-shrink-0" />
      <span className="font-bold text-sm uppercase tracking-wider">
        Modo Simulação Ativo
      </span>
      <span className="text-sm hidden sm:inline">
        — Os resultados exibidos não refletem o ambiente de produção
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={onStop}
        className="ml-4 bg-yellow-600 hover:bg-yellow-700 text-white border-yellow-700 h-7 text-xs"
      >
        <X className="w-3 h-3 mr-1" />
        Parar
      </Button>
    </div>
  );
}
