/**
 * PromptHistorySheet — Sheet lateral com timeline de alterações de um prompt
 * específico em settings_history. Permite restaurar versões anteriores
 * (pré-popula o textarea — o admin precisa passar de novo pelo fluxo de
 * dupla confirmação para salvar).
 */

import { useState } from 'react';
import { Calendar, History, Loader2, RotateCcw, User } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useSettingsHistoryByField, type SettingsHistoryEntry } from '@/hooks/useSettingsHistoryByField';
import { PromptDiffView } from './PromptDiffView';

interface PromptHistorySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  panel: string;
  categoryKey: string;
  subcategoryKey: string;
  fieldKey: string;
  fieldName: string;
  /** Chamado ao clicar em "Restaurar esta versão" — recebe o valor anterior. */
  onRestoreVersion: (value: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function asString(value: unknown): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return '';
  return String(value);
}

interface HistoryEntryProps {
  entry: SettingsHistoryEntry;
  onRestore: (value: string) => void;
}

function HistoryEntry({ entry, onRestore }: HistoryEntryProps) {
  const [expanded, setExpanded] = useState(false);
  const previous = asString(entry.previousValue);
  const next = asString(entry.newValue);

  return (
    <div className="rounded-lg border bg-card p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          <span>{formatDate(entry.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="font-medium">{entry.changedByName}</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setExpanded((e) => !e)}
        >
          {expanded ? 'Ocultar diff' : 'Ver diff'}
        </Button>
        <Button
          variant="secondary"
          size="sm"
          className="gap-1.5"
          onClick={() => onRestore(previous)}
          disabled={!previous}
          title={previous ? 'Pré-popula o editor com a versão anterior a esta alteração' : 'Sem versão anterior'}
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Restaurar versão anterior
        </Button>
      </div>

      {expanded && (
        <PromptDiffView before={previous} after={next} />
      )}
    </div>
  );
}

export function PromptHistorySheet({
  open,
  onOpenChange,
  panel,
  categoryKey,
  subcategoryKey,
  fieldKey,
  fieldName,
  onRestoreVersion,
}: PromptHistorySheetProps) {
  const { data: history, isLoading, error } = useSettingsHistoryByField({
    panel,
    categoryKey,
    subcategoryKey,
    fieldKey,
    enabled: open,
  });

  const handleRestore = (value: string) => {
    onRestoreVersion(value);
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de alterações
          </SheetTitle>
          <SheetDescription>
            <span className="font-medium text-foreground">{fieldName}</span>
            <br />
            Cada entrada mostra quem editou, quando e o diff completo. Clique em
            "Restaurar versão anterior" para carregar o texto antigo no editor —
            ele só será gravado após passar pelo fluxo de confirmação.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 mt-4 -mx-6">
          <ScrollArea className="h-[calc(100vh-180px)] px-6">
            {isLoading && (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                Carregando histórico...
              </div>
            )}

            {error && (
              <div className="rounded-md border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                Falha ao carregar histórico: {(error as Error).message}
              </div>
            )}

            {!isLoading && !error && (history?.length ?? 0) === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground text-sm">
                <History className="h-12 w-12 mb-3 opacity-40" />
                <p>Nenhuma alteração registrada para este prompt.</p>
                <p className="text-xs mt-1">As edições futuras aparecerão aqui em ordem cronológica.</p>
              </div>
            )}

            <div className="space-y-3 pb-6">
              {history?.map((entry) => (
                <HistoryEntry key={entry.id} entry={entry} onRestore={handleRestore} />
              ))}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
