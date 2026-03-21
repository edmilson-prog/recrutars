/**
 * Invitation Bulk Action Bar
 * Toolbar flutuante para ações em lote (cancelar/reenviar)
 */

import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { RefreshCw, XCircle, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface InvitationBulkActionBarProps {
  selectedCount: number;
  onBulkResend: () => Promise<void>;
  onBulkCancel: () => Promise<void>;
  onClearSelection: () => void;
}

export function InvitationBulkActionBar({
  selectedCount,
  onBulkResend,
  onBulkCancel,
  onClearSelection,
}: InvitationBulkActionBarProps) {
  const [isResending, setIsResending] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  if (selectedCount === 0) return null;

  const handleResend = async () => {
    setIsResending(true);
    try {
      await onBulkResend();
    } finally {
      setIsResending(false);
    }
  };

  const handleCancel = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsCancelling(true);
    try {
      await onBulkCancel();
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-primary/10 border border-primary/30 backdrop-blur-md rounded-lg px-5 py-3 shadow-lg"
      role="toolbar"
      aria-label="Ações em lote"
    >
      <span className="text-sm font-medium">
        {selectedCount} selecionado{selectedCount > 1 ? 's' : ''}
      </span>

      <div className="h-4 w-px bg-border" />

      <Button
        variant="outline"
        size="sm"
        onClick={handleResend}
        disabled={isResending || isCancelling}
        className="gap-1.5"
      >
        {isResending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
        Reenviar
      </Button>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="destructive"
            size="sm"
            disabled={isResending || isCancelling}
            className="gap-1.5"
          >
            {isCancelling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <XCircle className="h-3.5 w-3.5" />}
            Cancelar
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancelar {selectedCount} convite{selectedCount > 1 ? 's' : ''}?</AlertDialogTitle>
            <AlertDialogDescription>
              Os convites selecionados serão revogados e os links deixarão de funcionar.
              Créditos de convites não iniciados serão reembolsados automaticamente.
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Manter convites</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancel}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Cancelar convites
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="h-4 w-px bg-border" />

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearSelection}
        className="text-xs text-muted-foreground"
      >
        Limpar seleção
      </Button>
    </div>
  );
}
