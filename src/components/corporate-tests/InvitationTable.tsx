/**
 * Invitation Table
 * Tabela de convites com colunas, checkboxes, sort e row click
 */

import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, RefreshCw, XCircle, CalendarPlus, Pencil, Mail, Link2, MessageSquare, ArrowUpDown, Send, Eye } from 'lucide-react';
import { InvitationStatusBadge } from './InvitationStatusBadge';
import { InvitationProgressDots } from './InvitationProgressDots';
import type { TestInvitation, InvitationManagerFilters } from '@/types/companyTest';

interface InvitationTableProps {
  invitations: TestInvitation[];
  total: number;
  isLoading: boolean;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onRowClick: (id: string) => void;
  onResend: (id: string) => void;
  onCancel: (id: string) => void;
  onExtendDeadline: (id: string) => void;
  onEditRecipient: (id: string) => void;
  filters: InvitationManagerFilters;
  onSort: (sortBy: InvitationManagerFilters['sortBy']) => void;
}

const methodIcons: Record<string, typeof Mail> = {
  email: Mail,
  internal: MessageSquare,
  public_link: Link2,
};

const methodLabels: Record<string, string> = {
  email: 'Email',
  internal: 'Da base',
  public_link: 'Link',
};

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return 'Hoje';
  if (diffDays === 1) return 'Ontem';
  if (diffDays < 7) return `${diffDays}d atrás`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}sem atrás`;
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function getTimeRemaining(expiresAt: string): { label: string; urgent: boolean } {
  const now = new Date();
  const expires = new Date(expiresAt);
  const diffMs = expires.getTime() - now.getTime();

  if (diffMs <= 0) return { label: 'Expirado', urgent: true };

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 7) return { label: `${diffDays}d`, urgent: false };
  if (diffDays >= 1) return { label: `${diffDays}d ${diffHours % 24}h`, urgent: diffDays <= 2 };
  return { label: `${diffHours}h`, urgent: true };
}

function canResend(status: string): boolean {
  return ['sent', 'viewed', 'expired'].includes(status);
}

function canCancel(status: string): boolean {
  return ['sent', 'viewed', 'started'].includes(status);
}

function canExtend(status: string): boolean {
  return ['sent', 'viewed', 'started'].includes(status);
}

function canEdit(status: string): boolean {
  return ['sent', 'viewed'].includes(status);
}

export function InvitationTable({
  invitations,
  total,
  isLoading,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onRowClick,
  onResend,
  onCancel,
  onExtendDeadline,
  onEditRecipient,
  filters,
  onSort,
}: InvitationTableProps) {
  const allSelected = invitations.length > 0 && invitations.every(inv => selectedIds.has(inv.id));
  const someSelected = invitations.some(inv => selectedIds.has(inv.id)) && !allSelected;

  const SortButton = ({ field, children }: { field: InvitationManagerFilters['sortBy']; children: React.ReactNode }) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={(e) => { e.stopPropagation(); onSort(field); }}
      className="h-auto p-0 font-medium text-xs hover:bg-transparent gap-1"
    >
      {children}
      <ArrowUpDown className="h-3 w-3 text-muted-foreground" />
    </Button>
  );

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" />
        ))}
      </div>
    );
  }

  if (invitations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <Send className="h-12 w-12 text-muted-foreground/30 mb-4" />
        <p className="text-lg font-medium text-muted-foreground">Nenhum convite encontrado</p>
        <p className="text-sm text-muted-foreground/70 mt-1">
          Envie convites pela aba "Enviar" para começar
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Desktop Table */}
      <div className="hidden md:block rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-10">
                <Checkbox
                  checked={allSelected ? true : someSelected ? 'indeterminate' : false}
                  onCheckedChange={() => onToggleSelectAll()}
                  aria-label="Selecionar todos os convites"
                />
              </TableHead>
              <TableHead>
                <SortButton field="candidateName">Colaborador</SortButton>
              </TableHead>
              <TableHead className="w-[130px]">
                <SortButton field="status">Status</SortButton>
              </TableHead>
              <TableHead className="w-[70px]">Canal</TableHead>
              <TableHead className="w-[90px]">Progresso</TableHead>
              <TableHead className="w-[100px]">
                <SortButton field="sentAt">Enviado</SortButton>
              </TableHead>
              <TableHead className="w-[100px]">
                <SortButton field="expiresAt">Expira</SortButton>
              </TableHead>
              <TableHead className="w-[50px]" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {invitations.map((inv) => {
              const MethodIcon = methodIcons[inv.method] ?? Mail;
              const remaining = getTimeRemaining(inv.expiresAt);

              return (
                <TableRow
                  key={inv.id}
                  className="cursor-pointer"
                  onClick={() => onRowClick(inv.id)}
                >
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.has(inv.id)}
                      onCheckedChange={() => onToggleSelect(inv.id)}
                      aria-label={`Selecionar ${inv.candidateName}`}
                    />
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium text-sm truncate max-w-[200px]">{inv.candidateName}</p>
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">{inv.candidateEmail}</p>
                      {inv.testName && (
                        <p className="text-[10px] text-muted-foreground/60 truncate max-w-[200px]">{inv.testName}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <InvitationStatusBadge status={inv.status} />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1" title={methodLabels[inv.method]}>
                      <MethodIcon className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <InvitationProgressDots status={inv.status} />
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {formatRelativeDate(inv.sentAt)}
                  </TableCell>
                  <TableCell className={`text-xs ${remaining.urgent ? 'text-red-500 font-medium' : 'text-muted-foreground'}`}>
                    {remaining.label}
                  </TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Ações</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onRowClick(inv.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalhes
                        </DropdownMenuItem>
                        {(canResend(inv.status) || canExtend(inv.status) || canEdit(inv.status) || canCancel(inv.status)) && (
                          <DropdownMenuSeparator />
                        )}
                        {canResend(inv.status) && (
                          <DropdownMenuItem onClick={() => onResend(inv.id)}>
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Reenviar
                          </DropdownMenuItem>
                        )}
                        {canExtend(inv.status) && (
                          <DropdownMenuItem onClick={() => onExtendDeadline(inv.id)}>
                            <CalendarPlus className="h-4 w-4 mr-2" />
                            Estender prazo
                          </DropdownMenuItem>
                        )}
                        {canEdit(inv.status) && (
                          <DropdownMenuItem onClick={() => onEditRecipient(inv.id)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar destinatário
                          </DropdownMenuItem>
                        )}
                        {canCancel(inv.status) && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onCancel(inv.id)}
                              className="text-destructive focus:text-destructive"
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancelar convite
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
        </Table>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden space-y-2">
        {invitations.map((inv) => {
          const MethodIcon = methodIcons[inv.method] ?? Mail;
          const remaining = getTimeRemaining(inv.expiresAt);

          return (
            <div
              key={inv.id}
              className="rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => onRowClick(inv.id)}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-start gap-2 min-w-0">
                  <Checkbox
                    checked={selectedIds.has(inv.id)}
                    onCheckedChange={() => onToggleSelect(inv.id)}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{inv.candidateName}</p>
                    <p className="text-xs text-muted-foreground truncate">{inv.candidateEmail}</p>
                  </div>
                </div>
                <InvitationStatusBadge status={inv.status} showIcon={false} />
              </div>
              <div className="flex items-center justify-between mt-2 pl-8">
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MethodIcon className="h-3 w-3" />
                    {methodLabels[inv.method]}
                  </span>
                  <span>{formatRelativeDate(inv.sentAt)}</span>
                  <span className={remaining.urgent ? 'text-red-500' : ''}>
                    {remaining.label}
                  </span>
                </div>
                <InvitationProgressDots status={inv.status} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
        <span>
          {total} convite{total !== 1 ? 's' : ''} no total
        </span>
        {total > (filters.pageSize ?? 25) && (
          <span>
            Página {filters.page ?? 1} de {Math.ceil(total / (filters.pageSize ?? 25))}
          </span>
        )}
      </div>
    </div>
  );
}
