/**
 * Audit Log Filters
 * PRD-054: Filtros do log
 */

import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import type { AuditAction } from '@/types/companyTest';

interface AuditLogFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  actionFilter: AuditAction | 'all';
  onActionFilterChange: (value: AuditAction | 'all') => void;
  resourceFilter: string;
  onResourceFilterChange: (value: string) => void;
}

export function AuditLogFilters({
  search, onSearchChange,
  actionFilter, onActionFilterChange,
  resourceFilter, onResourceFilterChange,
}: AuditLogFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por recurso ou usuário..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <Select value={actionFilter} onValueChange={(v) => onActionFilterChange(v as any)}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Tipo de ação" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as ações</SelectItem>
          <SelectItem value="test_created">Teste criado</SelectItem>
          <SelectItem value="test_activated">Teste ativado</SelectItem>
          <SelectItem value="test_closed">Teste encerrado</SelectItem>
          <SelectItem value="invite_sent">Convite enviado</SelectItem>
          <SelectItem value="result_viewed">Resultado visualizado</SelectItem>
          <SelectItem value="result_compared">Resultados comparados</SelectItem>
          <SelectItem value="shortlist_added">Adicionado shortlist</SelectItem>
          <SelectItem value="pdf_downloaded">PDF baixado</SelectItem>
          <SelectItem value="excel_downloaded">Excel baixado</SelectItem>
          <SelectItem value="lgpd_report_generated">Relatório LGPD</SelectItem>
        </SelectContent>
      </Select>
      <Select value={resourceFilter} onValueChange={onResourceFilterChange}>
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Recurso" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos</SelectItem>
          <SelectItem value="test">Testes</SelectItem>
          <SelectItem value="invitation">Convites</SelectItem>
          <SelectItem value="result">Resultados</SelectItem>
          <SelectItem value="report">Relatórios</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
