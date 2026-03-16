/**
 * EvolutionConnectionStatus
 * Compact connection status indicator for the Evolution API (WhatsApp).
 * Shows a pulsing dot, label, and manual refresh button.
 * Intended for use inside settings forms.
 */

import { RefreshCw } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useWhatsAppConnectionStatus } from '@/hooks/useWhatsAppQuery';

interface EvolutionConnectionStatusProps {
  className?: string;
}

export function EvolutionConnectionStatus({ className }: EvolutionConnectionStatusProps) {
  const { data, isLoading, isRefetching } = useWhatsAppConnectionStatus();
  const queryClient = useQueryClient();

  const isConnected = data?.connected === true;
  const isChecking = isLoading || isRefetching;

  const handleRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['whatsapp', 'connection-status'] });
  };

  let dotClasses: string;
  let label: string;

  if (isChecking) {
    dotClasses = 'bg-gray-400 dark:bg-gray-500';
    label = 'Verificando...';
  } else if (isConnected) {
    dotClasses = 'bg-emerald-500 animate-pulse';
    label = 'Conectado';
  } else {
    dotClasses = 'bg-red-500';
    label = 'Desconectado';
  }

  return (
    <div
      className={cn('flex items-center gap-2', className)}
      role="status"
      aria-live="polite"
      aria-label={`Status da conexão WhatsApp: ${label}`}
    >
      <span
        className={cn('w-2.5 h-2.5 rounded-full shrink-0', dotClasses)}
        aria-hidden="true"
      />
      <span className="text-sm text-muted-foreground">{label}</span>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="h-7 w-7"
        onClick={handleRefresh}
        disabled={isChecking}
        aria-label="Verificar conexão novamente"
      >
        <RefreshCw
          className={cn('w-3.5 h-3.5', isChecking && 'animate-spin')}
          aria-hidden="true"
        />
      </Button>
    </div>
  );
}
