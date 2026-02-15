/**
 * VersionHistory Component
 * PRD-044: Histórico de versões com busca e filtros
 */

import { forwardRef } from 'react';
import { Search, Filter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { VersionAccordion } from './VersionAccordion';
import type { Version, ReleaseFilter, DateFilter } from '@/types/changelog';

interface VersionHistoryProps {
  versions: Version[];
  filteredVersions: Version[];
  search: string;
  releaseType: ReleaseFilter;
  dateRange: DateFilter;
  onSearchChange: (value: string) => void;
  onReleaseTypeChange: (value: ReleaseFilter) => void;
  onDateRangeChange: (value: DateFilter) => void;
}

export const VersionHistory = forwardRef<HTMLDivElement, VersionHistoryProps>(
  (
    {
      versions,
      filteredVersions,
      search,
      releaseType,
      dateRange,
      onSearchChange,
      onReleaseTypeChange,
      onDateRangeChange,
    },
    ref
  ) => {
    return (
      <Card ref={ref}>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="text-xl">Histórico de Versões</CardTitle>
              <div className="text-sm text-muted-foreground mt-1">
                <Badge variant="secondary" className="font-normal">
                  {filteredVersions.length} de {versions.length} versões
                </Badge>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar versão, funcionalidade..."
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Release type filter */}
            <Select
              value={releaseType}
              onValueChange={(value) => onReleaseTypeChange(value as ReleaseFilter)}
            >
              <SelectTrigger className="w-full sm:w-[140px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="major">Major</SelectItem>
                <SelectItem value="minor">Minor</SelectItem>
                <SelectItem value="patch">Patch</SelectItem>
              </SelectContent>
            </Select>

            {/* Date range filter */}
            <Select
              value={dateRange}
              onValueChange={(value) => onDateRangeChange(value as DateFilter)}
            >
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todo o período</SelectItem>
                <SelectItem value="week">Última semana</SelectItem>
                <SelectItem value="month">Último mês</SelectItem>
                <SelectItem value="3months">Últimos 3 meses</SelectItem>
                <SelectItem value="year">Último ano</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>

        <CardContent>
          {filteredVersions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>Nenhuma versão encontrada com os filtros atuais.</p>
              <p className="text-sm mt-1">Tente ajustar os filtros ou limpar a busca.</p>
            </div>
          ) : (
            <VersionAccordion versions={filteredVersions} />
          )}
        </CardContent>
      </Card>
    );
  }
);

VersionHistory.displayName = 'VersionHistory';
