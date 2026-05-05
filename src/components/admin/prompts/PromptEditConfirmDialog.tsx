/**
 * PromptEditConfirmDialog — dialog de dupla confirmação para salvar alterações
 * em um prompt de IA. Mostra o diff completo entre o valor anterior e o novo,
 * exige digitação literal da palavra "CONFIRMAR" para habilitar o botão de
 * salvamento.
 */

import { useEffect, useState } from 'react';
import { AlertTriangle, Loader2, Save } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PromptDiffView } from './PromptDiffView';

const CONFIRMATION_KEYWORD = 'CONFIRMAR';

interface PromptEditConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fieldName: string;
  previousValue: string;
  newValue: string;
  onConfirm: () => void | Promise<void>;
  saving?: boolean;
}

export function PromptEditConfirmDialog({
  open,
  onOpenChange,
  fieldName,
  previousValue,
  newValue,
  onConfirm,
  saving = false,
}: PromptEditConfirmDialogProps) {
  const [keyword, setKeyword] = useState('');

  useEffect(() => {
    if (!open) setKeyword('');
  }, [open]);

  const isMatch = keyword.trim().toUpperCase() === CONFIRMATION_KEYWORD;
  const noChanges = previousValue === newValue;

  return (
    <Dialog open={open} onOpenChange={(o) => !saving && onOpenChange(o)}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            Confirmar alteração de prompt
          </DialogTitle>
          <DialogDescription>
            Você está prestes a sobrescrever o prompt
            {' '}<span className="font-semibold text-foreground">{fieldName}</span>.
            A mudança entra em vigor imediatamente para todas as próximas análises geradas.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto -mx-6 px-6 space-y-4">
          {noChanges ? (
            <div className="rounded-md border border-dashed border-border bg-muted/40 p-4 text-sm text-muted-foreground">
              O texto novo é idêntico ao salvo atualmente — nada para confirmar.
            </div>
          ) : (
            <>
              <PromptDiffView before={previousValue} after={newValue} />

              <div className="space-y-2 rounded-md border border-amber-300/50 bg-amber-50 dark:bg-amber-950/20 p-3">
                <Label htmlFor="confirm-keyword" className="text-sm font-medium">
                  Para prosseguir, digite a palavra{' '}
                  <span className="font-mono font-semibold text-amber-700 dark:text-amber-400">
                    {CONFIRMATION_KEYWORD}
                  </span>
                </Label>
                <Input
                  id="confirm-keyword"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={CONFIRMATION_KEYWORD}
                  autoComplete="off"
                  autoFocus
                  disabled={saving}
                  className="font-mono"
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={() => void onConfirm()}
            disabled={!isMatch || noChanges || saving}
            className="gap-2"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Salvar definitivamente
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
