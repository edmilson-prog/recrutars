/**
 * RegenerateConfirmDialog — Confirmação antes de consumir nova cota.
 *
 * Padrão do projeto: AlertDialog com e.preventDefault() no Action para handler async.
 */

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import type { AIMatchQuotaStatus } from '@/types/aiMatch';

interface RegenerateConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  quota: AIMatchQuotaStatus | undefined;
  onConfirm: () => Promise<void>;
}

export function RegenerateConfirmDialog({
  open,
  onOpenChange,
  quota,
  onConfirm,
}: RegenerateConfirmDialogProps) {
  const [busy, setBusy] = useState(false);

  const handleConfirm = async (e: React.MouseEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } finally {
      setBusy(false);
    }
  };

  const remainingAfter = quota
    ? quota.unlimited
      ? '∞'
      : Math.max(quota.remaining - 1, 0)
    : '?';

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Regenerar análise IA?</AlertDialogTitle>
          <AlertDialogDescription>
            Isso irá consumir 1 análise. Você já utilizou {quota?.used ?? '?'} de {quota?.unlimited ? '∞' : quota?.total ?? '?'} este mês.
            Após regeneração, ainda restarão {remainingAfter} análises.
            <br /><br />
            A análise atual será substituída pela nova.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={busy}>
            {busy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Gerando…
              </>
            ) : (
              'Confirmar e regenerar'
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
