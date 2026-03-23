/**
 * Invitation Manager
 * Orquestrador: KPIs + Filtros + Tabela + Bulk Actions + Detail Sheet
 */

import { useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { InvitationManagerKPIs } from './InvitationManagerKPIs';
import { InvitationManagerFilters } from './InvitationManagerFilters';
import { InvitationTable } from './InvitationTable';
import { InvitationBulkActionBar } from './InvitationBulkActionBar';
import { InvitationDetailSheet } from './InvitationDetailSheet';
import {
  useCompanyInvitations,
  useResendInvitation,
  useCancelInvitation,
  useExtendDeadline,
  useUpdateRecipient,
  useBulkCancelInvitations,
  useBulkResendInvitations,
} from '@/hooks/useInvitationManagerQuery';
import { useAuth } from '@/contexts/AuthContext';
import { useRealtimeInvitations } from '@/hooks/useRealtimeInvitations';
import type { InvitationManagerFilters as FiltersType } from '@/types/companyTest';

const DEFAULT_PAGE_SIZE = 25;

export function InvitationManager() {
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id;

  // Realtime: atualiza lista/KPIs/timeline quando status muda no banco
  useRealtimeInvitations(companyId);

  // State
  const [filters, setFilters] = useState<FiltersType>({
    page: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    sortBy: 'sentAt',
    sortDir: 'desc',
  });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [detailId, setDetailId] = useState<string | null>(null);

  // Data
  const { data, isLoading } = useCompanyInvitations(companyId, filters);
  const invitations = data?.invitations ?? [];
  const total = data?.total ?? 0;

  // Mutations
  const resendMutation = useResendInvitation();
  const cancelMutation = useCancelInvitation();
  const extendMutation = useExtendDeadline();
  const updateRecipientMutation = useUpdateRecipient();
  const bulkCancelMutation = useBulkCancelInvitations();
  const bulkResendMutation = useBulkResendInvitations();

  // Detail invitation
  const detailInvitation = useMemo(
    () => invitations.find(inv => inv.id === detailId) ?? null,
    [invitations, detailId]
  );

  // Handlers
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
      if (invitations.every(inv => prev.has(inv.id))) {
        return new Set();
      }
      return new Set(invitations.map(inv => inv.id));
    });
  }, [invitations]);

  const handleSort = useCallback((sortBy: FiltersType['sortBy']) => {
    setFilters(prev => ({
      ...prev,
      sortBy,
      sortDir: prev.sortBy === sortBy && prev.sortDir === 'desc' ? 'asc' : 'desc',
      page: 1,
    }));
  }, []);

  const handleResend = useCallback((id: string) => {
    resendMutation.mutate(id);
  }, [resendMutation]);

  const handleCancel = useCallback(async (id: string) => {
    await cancelMutation.mutateAsync(id);
  }, [cancelMutation]);

  const handleExtendDeadline = useCallback(async (id: string, newExpiresAt: string) => {
    await extendMutation.mutateAsync({ invitationId: id, newExpiresAt });
  }, [extendMutation]);

  const handleUpdateRecipient = useCallback(async (id: string, name?: string, email?: string) => {
    await updateRecipientMutation.mutateAsync({ invitationId: id, candidateName: name, candidateEmail: email });
  }, [updateRecipientMutation]);

  const handleBulkResend = useCallback(async () => {
    const ids = Array.from(selectedIds);
    await bulkResendMutation.mutateAsync(ids);
    setSelectedIds(new Set());
  }, [selectedIds, bulkResendMutation]);

  const handleBulkCancel = useCallback(async () => {
    const ids = Array.from(selectedIds);
    await bulkCancelMutation.mutateAsync(ids);
    setSelectedIds(new Set());
  }, [selectedIds, bulkCancelMutation]);

  // Pagination
  const totalPages = Math.ceil(total / (filters.pageSize ?? DEFAULT_PAGE_SIZE));
  const currentPage = filters.page ?? 1;

  return (
    <div className="space-y-4">
      {/* KPIs */}
      <InvitationManagerKPIs />

      {/* Filters */}
      <InvitationManagerFilters
        filters={filters}
        onChange={(newFilters) => {
          setFilters(newFilters);
          setSelectedIds(new Set());
        }}
      />

      {/* Table */}
      <InvitationTable
        invitations={invitations}
        total={total}
        isLoading={isLoading}
        selectedIds={selectedIds}
        onToggleSelect={handleToggleSelect}
        onToggleSelectAll={handleToggleSelectAll}
        onRowClick={setDetailId}
        onResend={handleResend}
        onCancel={(id) => { handleCancel(id); }}
        onExtendDeadline={(id) => setDetailId(id)}
        onEditRecipient={(id) => setDetailId(id)}
        filters={filters}
        onSort={handleSort}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage <= 1}
            onClick={() => setFilters(prev => ({ ...prev, page: (prev.page ?? 1) - 1 }))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-muted-foreground">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={currentPage >= totalPages}
            onClick={() => setFilters(prev => ({ ...prev, page: (prev.page ?? 1) + 1 }))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Bulk Action Bar */}
      <InvitationBulkActionBar
        selectedCount={selectedIds.size}
        onBulkResend={handleBulkResend}
        onBulkCancel={handleBulkCancel}
        onClearSelection={() => setSelectedIds(new Set())}
      />

      {/* Detail Sheet */}
      <InvitationDetailSheet
        invitation={detailInvitation}
        open={!!detailId}
        onClose={() => setDetailId(null)}
        onResend={handleResend}
        onCancel={handleCancel}
        onExtendDeadline={handleExtendDeadline}
        onUpdateRecipient={handleUpdateRecipient}
      />
    </div>
  );
}
