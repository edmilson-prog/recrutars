/**
 * FinancialEntries page — lista de lançamentos.
 *
 * Container: carrega dados (paginado/filtrado), mantém filtros + view escolhida
 * (localStorage) + seleção; abre o Sheet de detalhe; expõe ações em massa.
 *
 * No PR A há duas views — Tabela (default) e Fluxo. A view Foco entra no PR C.
 * Filtros seguem o modelo de dois eixos (status + dueWindow): os presets setam
 * o eixo de vencimento, que o serviço traduz em faixas de data.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PageHeader } from '@/components/layout/PageHeader';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { Button } from '@/components/ui/button';
import { FinancialKpiHeader } from '@/components/finance/FinancialKpiHeader';
import { FinancialFilterBar } from '@/components/finance/FinancialFilterBar';
import { FinancialViewSwitcher, type FinancialListView } from '@/components/finance/FinancialViewSwitcher';
import { FinancialEntriesTable } from '@/components/finance/FinancialEntriesTable';
import { FinancialEntriesGrouped } from '@/components/finance/FinancialEntriesGrouped';
import { FinancialEntrySheet } from '@/components/finance/FinancialEntrySheet';
import { FinancialBulkActionBar } from '@/components/finance/FinancialBulkActionBar';
import {
  useFinancialEntries, useMarkEntryPaid, useCancelEntry, useBulkMarkPaid,
} from '@/hooks/useFinancialEntriesQuery';
import { todayISO } from '@/lib/finance/status';
import type { EntryFilters } from '@/types/finance';
import type { PaginationConfig } from '@/services/types';

const VIEW_STORAGE_KEY = 'finance:listView';
const PAGE_SIZE = 50;

function loadView(): FinancialListView {
  const v = typeof window !== 'undefined' ? window.localStorage.getItem(VIEW_STORAGE_KEY) : null;
  // PR A oferece apenas table/flow; 'focus' (PR C) cai no default.
  return v === 'flow' ? 'flow' : 'table';
}

export default function FinancialEntries() {
  const navigate = useNavigate();

  const [view, setView] = useState<FinancialListView>(loadView);
  const [filters, setFilters] = useState<EntryFilters>({ dateField: 'due' });
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sheetId, setSheetId] = useState<string | null>(null);

  const pagination: PaginationConfig = useMemo(() => ({ page, pageSize: PAGE_SIZE }), [page]);
  const { data, isLoading } = useFinancialEntries(filters, pagination);
  const entries = useMemo(() => data?.data ?? [], [data]);

  const markPaid = useMarkEntryPaid();
  const cancelEntry = useCancelEntry();
  const bulkMarkPaid = useBulkMarkPaid();

  useEffect(() => {
    window.localStorage.setItem(VIEW_STORAGE_KEY, view);
  }, [view]);

  // Zera seleção e volta à primeira página quando os filtros mudam.
  useEffect(() => {
    setSelectedIds([]);
    setPage(1);
  }, [filters]);

  // Presets setam o eixo de vencimento (dueWindow); o serviço traduz em datas.
  const handleApplyPreset = useCallback((preset: 'overdue' | 'due7') => {
    setFilters({ dateField: 'due', dueWindow: preset });
  }, []);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) => (prev.length === entries.length ? [] : entries.map((e) => e.id)));
  }, [entries]);

  const handleRowClick = useCallback((id: string) => setSheetId(id), []);

  const handleMarkPaid = useCallback(async (id: string) => {
    try {
      await markPaid.mutateAsync({ id, paidDate: todayISO() });
      toast.success('Lançamento marcado como pago.');
    } catch {
      toast.error('Erro ao marcar como pago.');
    }
  }, [markPaid]);

  const handleCancel = useCallback(async (id: string) => {
    try {
      await cancelEntry.mutateAsync(id);
      toast.success('Lançamento cancelado.');
    } catch {
      toast.error('Erro ao cancelar lançamento.');
    }
  }, [cancelEntry]);

  const handleBulkMarkPaid = useCallback(async () => {
    try {
      const count = await bulkMarkPaid.mutateAsync({ ids: selectedIds, paidDate: todayISO() });
      toast.success(`${count} lançamento${count === 1 ? '' : 's'} marcado${count === 1 ? '' : 's'} como pago.`);
      setSelectedIds([]);
    } catch {
      toast.error('Erro ao marcar lançamentos como pagos.');
    }
  }, [bulkMarkPaid, selectedIds]);

  const handleBulkCancel = useCallback(async () => {
    try {
      for (const id of selectedIds) {
        await cancelEntry.mutateAsync(id);
      }
      toast.success(`${selectedIds.length} lançamento${selectedIds.length === 1 ? '' : 's'} cancelado${selectedIds.length === 1 ? '' : 's'}.`);
      setSelectedIds([]);
    } catch {
      toast.error('Erro ao cancelar lançamentos.');
    }
  }, [cancelEntry, selectedIds]);

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        <PageHeader
          title="Lançamentos"
          description="Receitas e despesas avulsas, contas a pagar e a receber."
          actions={
            <Button onClick={() => navigate('/admin/financeiro/lancamentos/novo')} className="gap-2">
              <Plus className="h-4 w-4" /> Novo lançamento
            </Button>
          }
        />
        <AdminTabNav />

        <FinancialKpiHeader
          entries={entries}
          isLoading={isLoading}
          onSelectOverdue={() => handleApplyPreset('overdue')}
        />

        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex-1">
            <FinancialFilterBar filters={filters} onChange={setFilters} onApplyPreset={handleApplyPreset} />
          </div>
          <FinancialViewSwitcher value={view} onChange={setView} />
        </div>

        {view === 'table' && (
          <FinancialEntriesTable
            entries={entries}
            isLoading={isLoading}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelect}
            onToggleAll={toggleAll}
            onRowClick={handleRowClick}
            onMarkPaid={handleMarkPaid}
            onCancel={handleCancel}
          />
        )}
        {view === 'flow' && (
          <FinancialEntriesGrouped
            entries={entries}
            isLoading={isLoading}
            onRowClick={handleRowClick}
          />
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
              Anterior
            </Button>
            <span className="text-sm tabular-nums text-muted-foreground">{page} / {totalPages}</span>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
              Próxima
            </Button>
          </div>
        )}
      </div>

      <FinancialEntrySheet
        entryId={sheetId}
        open={sheetId !== null}
        onOpenChange={(o) => { if (!o) setSheetId(null); }}
      />

      <FinancialBulkActionBar
        selectedCount={selectedIds.length}
        onBulkMarkPaid={handleBulkMarkPaid}
        onBulkCancel={handleBulkCancel}
        onClearSelection={() => setSelectedIds([])}
      />
    </DashboardLayout>
  );
}
