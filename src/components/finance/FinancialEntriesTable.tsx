/**
 * FinancialEntriesTable — view A (Tabela, default).
 *
 * Header sticky, rodapé de totais, e a linha atrasada em 4 sinais (spec §9):
 * régua vermelha (border-left), tint de fundo (4% light / 7% dark — várias
 * atrasadas seguidas formam uma faixa visível de longe), badge "Atrasado" com
 * ícone, e a data de vencimento em fin-expense. Colunas forma/competência
 * escondem abaixo de lg; valores em tabular-nums nos tokens de natureza.
 */

import { MoreHorizontal, CheckCircle2, Ban, Pencil } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { formatBRL, formatDateBR } from '@/lib/formatters';
import { getEffectiveStatus } from '@/lib/finance/entryStatus';
import {
  EFFECTIVE_STATUS_META, PAYMENT_METHOD_LABELS, TYPE_META,
  formatSignedBRL, formatCompetencePeriod,
} from '@/lib/finance/entryDisplay';
import type { FinancialEntry } from '@/types/finance';

interface FinancialEntriesTableProps {
  entries: FinancialEntry[];
  isLoading?: boolean;
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onRowClick: (id: string) => void;
  onMarkPaid: (id: string) => void;
  onCancel: (id: string) => void;
}

export function FinancialEntriesTable({
  entries, isLoading, selectedIds, onToggleSelect, onToggleAll, onRowClick, onMarkPaid, onCancel,
}: FinancialEntriesTableProps) {
  const active = entries.filter((e) => e.status !== 'canceled');
  const allSelected = entries.length > 0 && selectedIds.length === entries.length;

  const totalIncome = active.filter((e) => e.type === 'income').reduce((s, e) => s + e.amount, 0);
  const totalExpense = active.filter((e) => e.type === 'expense').reduce((s, e) => s + e.amount, 0);
  const balance = totalIncome - totalExpense;
  const canceledCount = entries.length - active.length;

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-card">
          <TableRow>
            <TableHead className="w-12">
              <Checkbox checked={allSelected} onCheckedChange={onToggleAll} aria-label="Selecionar todos" />
            </TableHead>
            <TableHead>Descrição</TableHead>
            <TableHead className="hidden md:table-cell">Categoria</TableHead>
            <TableHead className="hidden lg:table-cell">Forma</TableHead>
            <TableHead className="hidden lg:table-cell">Competência</TableHead>
            <TableHead>Vencimento</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Valor</TableHead>
            <TableHead className="w-12 text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading && (
            <TableRow>
              <TableCell colSpan={9} className="py-8">
                <Skeleton className="h-5 w-full" />
              </TableCell>
            </TableRow>
          )}
          {!isLoading && entries.length === 0 && (
            <TableRow>
              <TableCell colSpan={9} className="py-12 text-center text-muted-foreground">
                Nenhum lançamento encontrado com os filtros aplicados.
              </TableCell>
            </TableRow>
          )}
          {!isLoading && entries.map((entry) => {
            const effective = getEffectiveStatus(entry);
            const statusMeta = EFFECTIVE_STATUS_META[effective];
            const StatusIcon = statusMeta.icon;
            const isSelected = selectedIds.includes(entry.id);
            const isLate = effective === 'overdue';
            return (
              <TableRow
                key={entry.id}
                data-state={isSelected ? 'selected' : undefined}
                className={cn(
                  'cursor-pointer',
                  isLate &&
                    'border-l-2 border-l-destructive bg-destructive/[0.04] hover:bg-destructive/[0.06] dark:bg-destructive/[0.07] dark:hover:bg-destructive/[0.1]',
                )}
                onClick={() => onRowClick(entry.id)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => onToggleSelect(entry.id)}
                    aria-label={`Selecionar ${entry.description}`}
                  />
                </TableCell>
                <TableCell>
                  <div className="min-w-0">
                    <div className="truncate font-medium text-foreground">{entry.description}</div>
                    {entry.counterpartyName && (
                      <div className="truncate text-xs text-muted-foreground">{entry.counterpartyName}</div>
                    )}
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <span className="text-sm text-muted-foreground">{entry.categoryName ?? '—'}</span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm text-muted-foreground">
                    {entry.paymentMethod ? PAYMENT_METHOD_LABELS[entry.paymentMethod] : '—'}
                  </span>
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <span className="text-sm tabular-nums text-muted-foreground">{formatCompetencePeriod(entry.competenceDate)}</span>
                </TableCell>
                <TableCell>
                  <span className={cn('text-sm tabular-nums', isLate && 'font-medium text-fin-expense')}>
                    {formatDateBR(entry.dueDate)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={cn('gap-1 border-0 text-xs font-medium', statusMeta.className)}>
                    <StatusIcon className="h-3 w-3" />{statusMeta.label}
                  </Badge>
                </TableCell>
                <TableCell className={cn('text-right font-semibold tabular-nums', TYPE_META[entry.type].amountClass)}>
                  {formatSignedBRL(entry.type, entry.amount)}
                </TableCell>
                <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Ações</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {entry.status === 'pending' && (
                        <DropdownMenuItem onClick={() => onMarkPaid(entry.id)}>
                          <CheckCircle2 className="mr-2 h-4 w-4 text-success" /> Marcar como pago
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem asChild>
                        <Link to={`/admin/financeiro/lancamentos/${entry.id}`}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar
                        </Link>
                      </DropdownMenuItem>
                      {entry.status !== 'canceled' && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive" onClick={() => onCancel(entry.id)}>
                            <Ban className="mr-2 h-4 w-4" /> Cancelar
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        {!isLoading && entries.length > 0 && (
          <tfoot className="sticky bottom-0 border-t-2 border-border bg-muted/50 backdrop-blur">
            <tr>
              <td colSpan={6} className="px-4 py-2.5 text-xs text-muted-foreground">
                {entries.length} lançamento{entries.length > 1 ? 's' : ''}
                {canceledCount > 0 && ` · ${canceledCount} cancelado${canceledCount > 1 ? 's' : ''} não somado${canceledCount > 1 ? 's' : ''}`}
                {' · '}
                <span className="text-fin-income">entradas + {formatBRL(totalIncome)}</span>
                {' · '}
                <span className="text-fin-expense">saídas − {formatBRL(totalExpense)}</span>
              </td>
              <td colSpan={2} className="px-4 py-2.5 text-right text-sm font-bold tabular-nums">
                <span className={balance >= 0 ? 'text-fin-income' : 'text-fin-expense'}>
                  {balance >= 0 ? '+ ' : '− '}{formatBRL(Math.abs(balance))}
                </span>
              </td>
              <td />
            </tr>
          </tfoot>
        )}
      </Table>
    </div>
  );
}
