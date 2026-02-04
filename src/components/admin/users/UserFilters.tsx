/**
 * UserFilters Component
 * PRD-061: Filtros avancados para listagem de usuarios
 */

import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { mockRoles } from '@/data/rbacData';
import type { UserStatus } from '@/types/rbac';
import type { UserType } from '@/types/user';

export interface UserFiltersState {
  types: UserType[];
  statuses: UserStatus[];
  roleId: string;
  plan: string;
  dateFrom: string;
  dateTo: string;
}

interface UserFiltersProps {
  filters: UserFiltersState;
  onChange: (filters: UserFiltersState) => void;
  onClear: () => void;
}

const userTypes: { value: UserType; label: string }[] = [
  { value: 'admin', label: 'Administrador' },
  { value: 'company', label: 'Empresa' },
  { value: 'candidate', label: 'Candidato' },
];

const userStatuses: { value: UserStatus; label: string }[] = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'suspended', label: 'Suspenso' },
  { value: 'pending', label: 'Pendente' },
];

const planOptions = [
  'Essencial',
  'Profissional',
  'Destaque Maximo',
  'Essencial Empresas',
  'Selecao Inteligente',
  'Recrutamento Premium',
];

export function UserFilters({ filters, onChange, onClear }: UserFiltersProps) {
  const toggleType = (type: UserType) => {
    const updated = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    onChange({ ...filters, types: updated });
  };

  const toggleStatus = (status: UserStatus) => {
    const updated = filters.statuses.includes(status)
      ? filters.statuses.filter(s => s !== status)
      : [...filters.statuses, status];
    onChange({ ...filters, statuses: updated });
  };

  const activeFiltersCount =
    filters.types.length +
    filters.statuses.length +
    (filters.roleId ? 1 : 0) +
    (filters.plan ? 1 : 0) +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Filtros</h3>
        {activeFiltersCount > 0 && (
          <Button variant="ghost" size="sm" onClick={onClear} className="text-xs">
            <X className="w-3 h-3 mr-1" />
            Limpar ({activeFiltersCount})
          </Button>
        )}
      </div>

      {/* Tipo de usuario */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Tipo de Usuario</Label>
        {userTypes.map(({ value, label }) => (
          <div key={value} className="flex items-center gap-2">
            <Checkbox
              id={`type-${value}`}
              checked={filters.types.includes(value)}
              onCheckedChange={() => toggleType(value)}
            />
            <label htmlFor={`type-${value}`} className="text-sm cursor-pointer">
              {label}
            </label>
          </div>
        ))}
      </div>

      <Separator />

      {/* Status */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Status</Label>
        {userStatuses.map(({ value, label }) => (
          <div key={value} className="flex items-center gap-2">
            <Checkbox
              id={`status-${value}`}
              checked={filters.statuses.includes(value)}
              onCheckedChange={() => toggleStatus(value)}
            />
            <label htmlFor={`status-${value}`} className="text-sm cursor-pointer">
              {label}
            </label>
          </div>
        ))}
      </div>

      <Separator />

      {/* Papel */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Papel</Label>
        <Select
          value={filters.roleId}
          onValueChange={(value) => onChange({ ...filters, roleId: value === '_all' ? '' : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os papeis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos os papeis</SelectItem>
            {mockRoles.map(role => (
              <SelectItem key={role.id} value={role.id}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Plano */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Plano</Label>
        <Select
          value={filters.plan}
          onValueChange={(value) => onChange({ ...filters, plan: value === '_all' ? '' : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Todos os planos" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_all">Todos os planos</SelectItem>
            {planOptions.map(plan => (
              <SelectItem key={plan} value={plan}>
                {plan}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Periodo */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Periodo de Cadastro</Label>
        <div className="space-y-2">
          <div>
            <label className="text-xs text-muted-foreground">De</label>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => onChange({ ...filters, dateFrom: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Ate</label>
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => onChange({ ...filters, dateTo: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
