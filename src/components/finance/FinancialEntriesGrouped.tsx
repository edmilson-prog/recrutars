/**
 * FinancialEntriesGrouped — view Fluxo (3.8a).
 *
 * Seções por vencimento via bucketForEntry. É view de LEITURA (extrato): sem
 * checkbox e sem menu de ações — clicar numa linha abre o Sheet de detalhe.
 *
 * As seções cobrem TODOS os buckets (spec): além de Atrasados/7d/8-30d, há
 * Futuros, Pagos e Cancelados. Sem "Cancelados" e "Futuros" distintos, um
 * lançamento cancelado ou futuro não pertenceria a faixa nenhuma e sumiria
 * desta view, divergindo da contagem da Tabela. "Pagos" e "Cancelados" nascem
 * recolhidas.
 */

import { cn } from '@/lib/utils';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBRL, formatDateBR } from '@/lib/formatters';
import { bucketForEntry, getEffectiveStatus, type DueBucket } from '@/lib/finance/entryStatus';
import {
  EFFECTIVE_STATUS_META, TYPE_META, formatSignedBRL,
} from '@/lib/finance/entryDisplay';
import type { FinancialEntry } from '@/types/finance';

interface FinancialEntriesGroupedProps {
  entries: FinancialEntry[];
  isLoading?: boolean;
  onRowClick: (id: string) => void;
}

const SECTIONS: Array<{ bucket: DueBucket; title: string; accent: string; collapsed?: boolean }> = [
  { bucket: 'overdue', title: 'Atrasados', accent: 'text-destructive' },
  { bucket: 'due7', title: 'A vencer (7 dias)', accent: 'text-warning' },
  { bucket: 'due8_30', title: 'A vencer (8–30 dias)', accent: 'text-foreground' },
  { bucket: 'future', title: 'Futuros', accent: 'text-muted-foreground' },
  { bucket: 'paid', title: 'Pagos', accent: 'text-success', collapsed: true },
  { bucket: 'canceled', title: 'Cancelados', accent: 'text-muted-foreground', collapsed: true },
];

export function FinancialEntriesGrouped({ entries, isLoading, onRowClick }: FinancialEntriesGroupedProps) {
  if (isLoading) return <Skeleton className="h-40 w-full" />;

  const grouped = new Map<DueBucket, FinancialEntry[]>();
  for (const e of entries) {
    const b = bucketForEntry(e);
    const arr = grouped.get(b) ?? [];
    arr.push(e);
    grouped.set(b, arr);
  }

  // Abertas por padrão: tudo que tem itens, menos as seções recolhidas.
  const defaultOpen = SECTIONS
    .filter((s) => !s.collapsed && (grouped.get(s.bucket)?.length ?? 0) > 0)
    .map((s) => s.bucket);

  return (
    <Accordion type="multiple" defaultValue={defaultOpen} className="space-y-2">
      {SECTIONS.map((section) => {
        const items = grouped.get(section.bucket) ?? [];
        if (items.length === 0) return null;
        // Cancelados não somam no mini-total (coerência com a Tabela e o dashboard).
        const total = items.reduce(
          (s, e) => (e.status === 'canceled' ? s : s + (e.type === 'income' ? e.amount : -e.amount)),
          0,
        );
        return (
          <AccordionItem key={section.bucket} value={section.bucket} className="rounded-lg border border-border px-3">
            <AccordionTrigger className="hover:no-underline">
              <div className="flex flex-1 items-center justify-between pr-3">
                <span className={cn('text-sm font-semibold', section.accent)}>
                  {section.title}
                  <span className="ml-2 text-xs font-normal text-muted-foreground">
                    {items.length} item{items.length > 1 ? 's' : ''}
                  </span>
                </span>
                {section.bucket !== 'canceled' && (
                  <span className={cn('text-sm font-medium tabular-nums', total >= 0 ? 'text-fin-income' : 'text-fin-expense')}>
                    {total >= 0 ? '+ ' : '− '}{formatBRL(Math.abs(total))}
                  </span>
                )}
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <ul className="space-y-1.5 pb-2">
                {items.map((entry) => {
                  const statusMeta = EFFECTIVE_STATUS_META[getEffectiveStatus(entry)];
                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        onClick={() => onRowClick(entry.id)}
                        className="flex w-full min-w-0 items-center gap-3 rounded-md p-2 text-left hover:bg-muted/50"
                      >
                        <div className="w-14 shrink-0 text-xs tabular-nums text-muted-foreground">
                          {formatDateBR(entry.dueDate).slice(0, 5)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-medium text-foreground">{entry.description}</div>
                          {entry.counterpartyName && (
                            <div className="truncate text-xs text-muted-foreground">{entry.counterpartyName}</div>
                          )}
                        </div>
                        <Badge variant="outline" className={cn('border-0 text-[10px]', statusMeta.className)}>{statusMeta.label}</Badge>
                        <span className={cn('shrink-0 text-sm font-semibold tabular-nums', TYPE_META[entry.type].amountClass)}>
                          {formatSignedBRL(entry.type, entry.amount)}
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
