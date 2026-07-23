/**
 * FinancialBulkActionBar — toolbar flutuante de ações em massa.
 * Marcar como pago (em lote) e Cancelar (em lote, com confirmação).
 */

import { useState } from 'react';
import { CheckCircle2, Ban, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface FinancialBulkActionBarProps {
  selectedCount: number;
  onBulkMarkPaid: () => Promise<void>;
  onBulkCancel: () => Promise<void>;
  onClearSelection: () => void;
}

export function FinancialBulkActionBar({
  selectedCount, onBulkMarkPaid, onBulkCancel, onClearSelection,
}: FinancialBulkActionBarProps) {
  const [isPaying, setIsPaying] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (selectedCount === 0) return null;

  const handlePay = async () => {
    setIsPaying(true);
    try { await onBulkMarkPaid(); } finally { setIsPaying(false); }
  };

  // AlertDialogAction fecha o dialog ao clicar; para async, preventDefault e
  // deixar a barra desmontar sozinha quando a seleção zerar (ver memória RLS).
  const handleCancel = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCancelling(true);
    try { await onBulkCancel(); } finally { setIsCancelling(false); }
  };

  return (
    <div
      className="fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-3 rounded-lg border border-primary/30 bg-popover px-5 py-3 shadow-lg"
      role="toolbar"
      aria-label="Ações em lote"
    >
      <span className="text-sm font-medium" aria-live="polite">
        {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
      </span>
      <div className="h-4 w-px bg-border" />
      <Button variant="outline" size="sm" onClick={handlePay} disabled={isPaying || isCancelling} className="gap-1.5">
        {isPaying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
        Marcar como pago
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="destructive" size="sm" disabled={isPaying || isCancelling} className="gap-1.5">
            {isCancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Ban className="h-3.5 w-3.5" />}
            Cancelar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar {selectedCount} lançamento{selectedCount > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              Os lançamentos selecionados serão marcados como cancelados e deixarão de contar no fluxo de caixa.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancelar lançamentos
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="h-4 w-px bg-border" />
      <Button variant="ghost" size="sm" onClick={onClearSelection} className="text-xs text-muted-foreground">
        Limpar seleção
      </Button>
    </div>
  );
}
