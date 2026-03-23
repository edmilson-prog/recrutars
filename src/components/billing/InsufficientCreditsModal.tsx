/**
 * InsufficientCreditsModal Component
 * Displayed when a company tries to send a test invitation without available credits
 */

import { useNavigate } from 'react-router-dom';
import { AlertTriangle, CreditCard } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface InsufficientCreditsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  balance: number;
}

export function InsufficientCreditsModal({
  open,
  onOpenChange,
  balance,
}: InsufficientCreditsModalProps) {
  const navigate = useNavigate();

  const handleBuyCredits = (e: React.MouseEvent) => {
    // Prevent AlertDialogAction auto-close from interfering with navigation
    e.preventDefault();
    onOpenChange(false);
    navigate('/empresa/pacotes');
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/40">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <AlertDialogTitle className="text-lg">
              Créditos insuficientes
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription className="mt-2">
            Você não possui créditos de teste disponíveis para enviar este convite.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {/* Balance box */}
        <div
          className={cn(
            'flex items-center justify-between rounded-lg border p-4 mt-2',
            balance === 0
              ? 'bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800'
              : 'bg-muted/50 border-border',
          )}
        >
          <span className="text-sm text-muted-foreground">Seu saldo atual:</span>
          <span
            className={cn(
              'text-lg font-bold',
              balance === 0
                ? 'text-red-600 dark:text-red-400'
                : 'text-foreground',
            )}
          >
            {balance} {balance === 1 ? 'crédito' : 'créditos'}
          </span>
        </div>

        <AlertDialogFooter className="mt-4 flex-col gap-2 sm:flex-row">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <Button
            onClick={handleBuyCredits}
            className="gap-2 bg-cyan-600 hover:bg-cyan-700 text-white"
          >
            <CreditCard className="w-4 h-4" />
            Comprar Créditos
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
