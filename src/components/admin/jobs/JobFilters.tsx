/**
 * JobFilters Component
 * PRD-058: Filtros avancados para listagem de vagas
 */

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface JobFiltersProps {
  filters: {
    status?: string;
    moderationStatus?: string;
    company?: string;
    area?: string;
    location?: string;
    search?: string;
    isHighlighted?: boolean;
  };
  onFilterChange: (filters: Record<string, unknown>) => void;
  companies: string[];
  areas: string[];
  locations: string[];
}

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativa' },
  { value: 'pending', label: 'Pendente' },
  { value: 'rejected', label: 'Rejeitada' },
  { value: 'correction', label: 'Correcao Solicitada' },
  { value: 'finalized', label: 'Finalizada' },
];

const MODERATION_OPTIONS = [
  { value: 'pending', label: 'Pendente' },
  { value: 'approved', label: 'Aprovada' },
  { value: 'rejected', label: 'Rejeitada' },
  { value: 'correction_requested', label: 'Correcao Solicitada' },
];

export function JobFilters({ filters, onFilterChange, companies, areas, locations }: JobFiltersProps) {
  const updateFilter = (key: string, value: string | boolean | undefined) => {
    onFilterChange({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    onFilterChange({});
  };

  const hasActiveFilters = Object.values(filters).some(
    (v) => v !== undefined && v !== '' && v !== false
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-semibold text-foreground">Filtros</Label>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-xs">
            <X className="w-3 h-3 mr-1" />
            Limpar filtros
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Busca</Label>
          <Input
            placeholder="Titulo ou empresa..."
            value={filters.search || ''}
            onChange={(e) => updateFilter('search', e.target.value || undefined)}
            className="h-9"
          />
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Status</Label>
          <Select
            value={filters.status || ''}
            onValueChange={(v) => updateFilter('status', v || undefined)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Moderacao</Label>
          <Select
            value={filters.moderationStatus || ''}
            onValueChange={(v) => updateFilter('moderationStatus', v || undefined)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              {MODERATION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Empresa</Label>
          <Select
            value={filters.company || ''}
            onValueChange={(v) => updateFilter('company', v || undefined)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              {companies.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Area</Label>
          <Select
            value={filters.area || ''}
            onValueChange={(v) => updateFilter('area', v || undefined)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              {areas.map((a) => (
                <SelectItem key={a} value={a}>{a}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Localidade</Label>
          <Select
            value={filters.location || ''}
            onValueChange={(v) => updateFilter('location', v || undefined)}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todas</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l} value={l}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label className="text-xs text-muted-foreground mb-1 block">Destaque</Label>
          <Select
            value={filters.isHighlighted === true ? 'yes' : filters.isHighlighted === false ? 'no' : ''}
            onValueChange={(v) => {
              if (v === 'yes') updateFilter('isHighlighted', true);
              else if (v === 'no') updateFilter('isHighlighted', false);
              else updateFilter('isHighlighted', undefined);
            }}
          >
            <SelectTrigger className="h-9">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">Todos</SelectItem>
              <SelectItem value="yes">Destacadas</SelectItem>
              <SelectItem value="no">Sem destaque</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
