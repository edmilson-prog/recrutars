/**
 * Test List
 * PRD-052: Lista filtrável de testes
 * Sub-abas: Ativos (draft/active/closed) | Arquivados
 */

import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { TestCard } from './TestCard';
import { useCompanyTests } from '@/hooks/useCompanyTestsQuery';
import { useAuth } from '@/contexts/AuthContext';
import type { CompanyTestStatus } from '@/types/companyTest';

export function TestList() {
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id;
  const { data: tests, isLoading } = useCompanyTests(companyId);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<CompanyTestStatus | 'all'>('active');
  const [subTab, setSubTab] = useState<'active' | 'archived'>('active');

  // Counters for sub-tabs
  const activeCount = (tests ?? []).filter(t => t.status !== 'archived').length;
  const archivedCount = (tests ?? []).filter(t => t.status === 'archived').length;

  const filtered = useMemo(() => {
    return (tests ?? []).filter((test) => {
      // Sub-tab filter
      if (subTab === 'archived') {
        if (test.status !== 'archived') return false;
      } else {
        if (test.status === 'archived') return false;
        // Status dropdown filter (only in active sub-tab)
        if (statusFilter !== 'all' && test.status !== statusFilter) return false;
      }
      // Search filter
      const matchesSearch =
        test.name.toLowerCase().includes(search.toLowerCase()) ||
        (test.jobTitle?.toLowerCase().includes(search.toLowerCase()) ?? false);
      return matchesSearch;
    }).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [tests, search, statusFilter, subTab]);

  const handleSubTabChange = (value: string) => {
    setSubTab(value as 'active' | 'archived');
    setStatusFilter('active');
    setSearch('');
  };

  return (
    <div className="space-y-4">
      {/* Sub-tabs: Ativos | Arquivados */}
      <Tabs value={subTab} onValueChange={handleSubTabChange}>
        <TabsList className="bg-transparent border-b border-border rounded-none h-auto p-0 justify-start gap-6 w-full">
          <TabsTrigger
            value="active"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-2 text-sm font-medium"
          >
            Ativos ({activeCount})
          </TabsTrigger>
          <TabsTrigger
            value="archived"
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-secondary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-1 pb-2 text-sm font-medium"
          >
            Arquivados ({archivedCount})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Search + Status filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou vaga..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        {subTab === 'active' && (
          <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CompanyTestStatus | 'all')}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="draft">Rascunho</SelectItem>
              <SelectItem value="active">Ativo</SelectItem>
              <SelectItem value="closed">Encerrado</SelectItem>
            </SelectContent>
          </Select>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {subTab === 'archived'
              ? 'Nenhum teste arquivado encontrado.'
              : 'Nenhum teste encontrado.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((test) => (
            <TestCard key={test.id} test={test} />
          ))}
        </div>
      )}
    </div>
  );
}
