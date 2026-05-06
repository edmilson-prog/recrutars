// src/components/empresa/notes/NoteHistoryModal.tsx
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NoteHistoryEntry } from '@/types/notes';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ACTION_META: Record<
  NoteHistoryEntry['action'],
  { label: string; icon: typeof Plus; tone: string }
> = {
  created: { label: 'Criada', icon: Plus, tone: 'text-green-700 bg-green-50 border-green-200' },
  updated: { label: 'Editada', icon: Pencil, tone: 'text-blue-700 bg-blue-50 border-blue-200' },
  deleted: { label: 'Excluída', icon: Trash2, tone: 'text-red-700 bg-red-50 border-red-200' },
  restored: { label: 'Restaurada', icon: RotateCcw, tone: 'text-amber-700 bg-amber-50 border-amber-200' },
};

interface NoteHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  history: NoteHistoryEntry[] | undefined;
  isLoading: boolean;
}

export function NoteHistoryModal({
  open,
  onOpenChange,
  history,
  isLoading,
}: NoteHistoryModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Histórico da nota</DialogTitle>
          <DialogDescription>
            Todas as alterações registradas, da mais recente para a mais antiga.
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : !history || history.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            Sem histórico disponível.
          </p>
        ) : (
          <ol className="relative border-l border-border pl-6 space-y-6 mt-4">
            {history.map((entry) => {
              const meta = ACTION_META[entry.action];
              const Icon = meta.icon;
              return (
                <li key={entry.id} className="relative">
                  <span
                    className={cn(
                      'absolute -left-9 flex h-6 w-6 items-center justify-center rounded-full border',
                      meta.tone,
                    )}
                  >
                    <Icon className="h-3 w-3" />
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className={meta.tone}>
                      {meta.label}
                    </Badge>
                    <span className="text-sm font-medium">
                      {entry.actorName ?? 'Usuário'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(entry.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </span>
                  </div>
                  {entry.action === 'updated' && (
                    <div className="mt-2 grid gap-2 text-sm">
                      <div className="rounded border border-red-200 bg-red-50 p-2">
                        <div className="text-xs font-semibold text-red-700 mb-1">Antes</div>
                        <div className="whitespace-pre-wrap text-foreground/80">
                          {entry.previousContent}
                        </div>
                      </div>
                      <div className="rounded border border-green-200 bg-green-50 p-2">
                        <div className="text-xs font-semibold text-green-700 mb-1">Depois</div>
                        <div className="whitespace-pre-wrap text-foreground/80">
                          {entry.newContent}
                        </div>
                      </div>
                    </div>
                  )}
                  {entry.action === 'deleted' && entry.previousContent && (
                    <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-sm">
                      <div className="text-xs font-semibold text-red-700 mb-1">Conteúdo excluído</div>
                      <div className="whitespace-pre-wrap text-foreground/80">
                        {entry.previousContent}
                      </div>
                    </div>
                  )}
                  {(entry.action === 'created' || entry.action === 'restored') && entry.newContent && (
                    <div className="mt-2 rounded border bg-muted/40 p-2 text-sm whitespace-pre-wrap">
                      {entry.newContent}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}
      </DialogContent>
    </Dialog>
  );
}
