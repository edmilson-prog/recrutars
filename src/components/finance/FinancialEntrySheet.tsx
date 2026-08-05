/**
 * FinancialEntrySheet — painel de detalhe compartilhado pelas views Tabela e
 * Fluxo (a view Foco, PR C, tem seu próprio painel e não abre este Sheet).
 * Mostra todos os campos, anexos (signed URL sob demanda), timeline e as ações
 * "Marcar como pago" / "Cancelar".
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ExternalLink, Loader2, CheckCircle2, Ban, Pencil, Paperclip,
} from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { formatDateBR } from '@/lib/formatters';
import {
  EFFECTIVE_STATUS_META, PAYMENT_METHOD_LABELS, TYPE_META,
  formatSignedBRL, formatCompetencePeriod,
} from '@/lib/finance/entryDisplay';
import { getEffectiveStatus } from '@/lib/finance/entryStatus';
import { todayISO } from '@/lib/finance/status';
import { useFinancialEntry, useMarkEntryPaid, useCancelEntry } from '@/hooks/useFinancialEntriesQuery';
import { getFinanceService } from '@/services/finance/financeService';
import type { FinancialEntry } from '@/types/finance';

interface FinancialEntrySheetProps {
  entryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-0.5">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-medium text-foreground">{children}</div>
    </div>
  );
}

export function FinancialEntrySheet({ entryId, open, onOpenChange }: FinancialEntrySheetProps) {
  const navigate = useNavigate();
  const { data: entry, isLoading } = useFinancialEntry(entryId ?? '');
  const markPaid = useMarkEntryPaid();
  const cancelEntry = useCancelEntry();
  const [openingPath, setOpeningPath] = useState<string | null>(null);

  const handleOpenAttachment = async (storagePath: string) => {
    setOpeningPath(storagePath);
    try {
      const svc = await getFinanceService();
      const url = await svc.getAttachmentSignedUrl(storagePath);
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch {
      toast.error('Não foi possível abrir o anexo.');
    } finally {
      setOpeningPath(null);
    }
  };

  const handleMarkPaid = async (e: FinancialEntry) => {
    try {
      // Data LOCAL (todayISO), não toISOString() UTC — ver lib/finance/status.
      await markPaid.mutateAsync({ id: e.id, paidDate: todayISO(), paymentMethod: e.paymentMethod });
      toast.success('Lançamento marcado como pago.');
    } catch {
      toast.error('Erro ao marcar como pago.');
    }
  };

  const handleCancel = async (e: FinancialEntry) => {
    try {
      await cancelEntry.mutateAsync(e.id);
      toast.success('Lançamento cancelado.');
    } catch {
      toast.error('Erro ao cancelar lançamento.');
    }
  };

  const effective = entry ? getEffectiveStatus(entry) : null;
  const statusMeta = effective ? EFFECTIVE_STATUS_META[effective] : null;
  const StatusIcon = statusMeta?.icon;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
        {isLoading || !entry ? (
          <div className="flex h-full items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
        ) : (
          <>
            <SheetHeader className="space-y-3 text-left">
              <div className="flex items-center gap-2">
                {statusMeta && StatusIcon && (
                  <Badge variant="outline" className={`gap-1 border-0 ${statusMeta.className}`}>
                    <StatusIcon className="h-3 w-3" />{statusMeta.label}
                  </Badge>
                )}
                <Badge variant="outline" className="border-0 bg-muted text-muted-foreground">
                  {TYPE_META[entry.type].label}
                </Badge>
              </div>
              <SheetTitle className="text-lg">{entry.description}</SheetTitle>
              <div className={`text-2xl font-bold tabular-nums ${TYPE_META[entry.type].amountClass}`}>
                {formatSignedBRL(entry.type, entry.amount)}
              </div>
            </SheetHeader>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <Field label="Categoria">{entry.categoryName ?? '—'}</Field>
              <Field label="Contraparte">{entry.counterpartyName ?? '—'}</Field>
              <Field label="Forma de pagamento">{entry.paymentMethod ? PAYMENT_METHOD_LABELS[entry.paymentMethod] : '—'}</Field>
              <Field label="Competência">{formatCompetencePeriod(entry.competenceDate)}</Field>
              <Field label="Vencimento">{formatDateBR(entry.dueDate)}</Field>
              <Field label="Pagamento">{entry.paidDate ? formatDateBR(entry.paidDate) : '—'}</Field>
              {entry.installmentTotal && entry.installmentTotal > 1 && (
                <Field label="Parcela">{entry.installmentNumber}/{entry.installmentTotal}</Field>
              )}
            </div>

            {entry.notes && (
              <>
                <Separator className="my-4" />
                <Field label="Observações">{entry.notes}</Field>
              </>
            )}

            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Paperclip className="h-3.5 w-3.5" /> Anexos
              </div>
              {(entry.attachments?.length ?? 0) === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum anexo.</p>
              ) : (
                <ul className="space-y-1.5">
                  {entry.attachments!.map((att) => (
                    <li key={att.id}>
                      <button
                        type="button"
                        onClick={() => handleOpenAttachment(att.storagePath)}
                        disabled={openingPath === att.storagePath}
                        className="flex w-full items-center gap-2 rounded-md border border-border p-2 text-left text-sm hover:bg-muted/50 disabled:opacity-60"
                      >
                        <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="flex-1 truncate">{att.fileName}</span>
                        {openingPath === att.storagePath
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Separator className="my-4" />
            <div className="space-y-2">
              <div className="text-xs font-medium text-muted-foreground">Linha do tempo</div>
              <ol className="space-y-2 text-sm">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                  Criado em {formatDateBR(entry.createdAt)}
                </li>
                {entry.paidDate && (
                  <li className="flex items-center gap-2 text-success">
                    <span className="h-1.5 w-1.5 rounded-full bg-success" />
                    Pago em {formatDateBR(entry.paidDate)}
                  </li>
                )}
                {effective === 'overdue' && (
                  <li className="flex items-center gap-2 text-fin-expense">
                    <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
                    Vencido desde {formatDateBR(entry.dueDate)}
                  </li>
                )}
              </ol>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              {entry.status === 'pending' && (
                <Button onClick={() => handleMarkPaid(entry)} disabled={markPaid.isPending} className="gap-2">
                  {markPaid.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Marcar como pago
                </Button>
              )}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 gap-2"
                  onClick={() => navigate(`/admin/financeiro/lancamentos/${entry.id}`)}
                >
                  <Pencil className="h-4 w-4" /> Editar
                </Button>
                {entry.status !== 'canceled' && (
                  <Button
                    variant="outline"
                    className="flex-1 gap-2 text-destructive hover:text-destructive"
                    onClick={() => handleCancel(entry)}
                    disabled={cancelEntry.isPending}
                  >
                    {cancelEntry.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Ban className="h-4 w-4" />}
                    Cancelar
                  </Button>
                )}
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
