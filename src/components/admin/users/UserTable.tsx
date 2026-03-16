/**
 * UserTable Component
 * PRD-061: Tabela de usuários com seleção e ações
 * Sort + Resize: Ordenação dinâmica por coluna e colunas redimensionáveis
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  MoreHorizontal, Eye, Edit, Ban, CheckCircle, Trash2,
  ArrowUpDown, ArrowUp, ArrowDown,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatRelativeDate } from '@/lib/formatters';
import { useRoles } from '@/hooks/useRBACQuery';
import { Skeleton } from '@/components/ui/skeleton';
import type { User } from '@/types';
import type { Role } from '@/types/rbac';

interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

interface UserTableProps {
  users: User[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onStatusChange: (userId: string, status: 'active' | 'inactive' | 'suspended') => void;
  sortConfig: SortConfig | null;
  onSort: (field: string) => void;
}

const typeLabels: Record<string, { label: string; className: string }> = {
  admin: { label: 'Admin', className: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  company: { label: 'Empresa', className: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  candidate: { label: 'Candidato', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
};

const statusLabels: Record<string, { label: string; className: string }> = {
  active: { label: 'Ativo', className: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
  inactive: { label: 'Inativo', className: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300' },
  suspended: { label: 'Suspenso', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  pending: { label: 'Pendente', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
};

interface ColumnDef {
  key: string;
  label: string;
  sortField?: string;
  minWidth: number;
  defaultWidth: number;
  fixed?: boolean;
  hiddenClass?: string;
}

const columns: ColumnDef[] = [
  { key: 'checkbox', label: '', minWidth: 48, defaultWidth: 48, fixed: true },
  { key: 'user', label: 'Usuário', sortField: 'name', minWidth: 200, defaultWidth: 280 },
  { key: 'type', label: 'Tipo', sortField: 'type', minWidth: 100, defaultWidth: 120, hiddenClass: 'hidden md:table-cell' },
  { key: 'role', label: 'Papel', sortField: 'roleId', minWidth: 120, defaultWidth: 140, hiddenClass: 'hidden lg:table-cell' },
  { key: 'status', label: 'Status', sortField: 'status', minWidth: 100, defaultWidth: 120, hiddenClass: 'hidden md:table-cell' },
  { key: 'plan', label: 'Plano', minWidth: 100, defaultWidth: 100, hiddenClass: 'hidden xl:table-cell' },
  { key: 'lastAccess', label: 'Último Acesso', sortField: 'lastAccessAt', minWidth: 140, defaultWidth: 160, hiddenClass: 'hidden lg:table-cell' },
  { key: 'actions', label: 'Ações', minWidth: 48, defaultWidth: 48, fixed: true },
];

function getRoleName(roleId: string | undefined, roles: Role[]): string {
  if (!roleId) return '-';
  const role = roles.find(r => r.id === roleId);
  return role?.name || '-';
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function SortIcon({ field, sortConfig }: { field: string; sortConfig: SortConfig | null }) {
  const isActive = sortConfig?.field === field;
  if (isActive && sortConfig.direction === 'asc') {
    return <ArrowUp className="h-3.5 w-3.5 shrink-0 text-primary opacity-100 transition-opacity duration-150" />;
  }
  if (isActive && sortConfig.direction === 'desc') {
    return <ArrowDown className="h-3.5 w-3.5 shrink-0 text-primary opacity-100 transition-opacity duration-150" />;
  }
  return <ArrowUpDown className="h-3.5 w-3.5 shrink-0 opacity-40 group-hover/header:opacity-70 transition-opacity duration-150" />;
}

export function UserTable({
  users,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onStatusChange,
  sortConfig,
  onSort,
}: UserTableProps) {
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const allSelected = users.length > 0 && selectedIds.length === users.length;

  // Column resize state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = {};
    columns.forEach(col => { widths[col.key] = col.defaultWidth; });
    return widths;
  });
  const resizeRef = useRef<{
    columnKey: string;
    startX: number;
    startWidth: number;
  } | null>(null);
  const tableRef = useRef<HTMLTableElement>(null);

  const handleResizeStart = useCallback((e: React.PointerEvent, columnKey: string) => {
    e.preventDefault();
    e.stopPropagation();
    const col = columns.find(c => c.key === columnKey);
    if (!col || col.fixed) return;

    resizeRef.current = {
      columnKey,
      startX: e.clientX,
      startWidth: columnWidths[columnKey],
    };

    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  }, [columnWidths]);

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      if (!resizeRef.current) return;
      const { columnKey, startX, startWidth } = resizeRef.current;
      const col = columns.find(c => c.key === columnKey);
      if (!col) return;
      const diff = e.clientX - startX;
      const newWidth = Math.max(col.minWidth, startWidth + diff);
      setColumnWidths(prev => ({ ...prev, [columnKey]: newWidth }));
    };

    const handlePointerUp = () => {
      if (!resizeRef.current) return;
      resizeRef.current = null;
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };

    document.addEventListener('pointermove', handlePointerMove);
    document.addEventListener('pointerup', handlePointerUp);
    return () => {
      document.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

  return (
    <Table ref={tableRef} style={{ tableLayout: 'fixed' }}>
      <TableHeader>
        <TableRow>
          {columns.map((col) => {
            const isSortable = !!col.sortField;
            const isActive = sortConfig?.field === col.sortField;
            const ariaSort = isActive
              ? sortConfig?.direction === 'asc' ? 'ascending' : 'descending'
              : 'none';

            return (
              <TableHead
                key={col.key}
                className={cn(
                  'group/header relative select-none transition-colors duration-150',
                  col.hiddenClass,
                  isSortable && 'cursor-pointer hover:bg-muted/30',
                )}
                style={{ width: columnWidths[col.key] }}
                aria-sort={isSortable ? ariaSort : undefined}
              >
                {col.key === 'checkbox' ? (
                  <Checkbox
                    checked={allSelected}
                    onCheckedChange={onToggleAll}
                    aria-label="Selecionar todos"
                  />
                ) : isSortable ? (
                  <button
                    type="button"
                    className={cn(
                      'inline-flex items-center gap-1 w-full h-full text-left font-medium',
                      'text-muted-foreground hover:text-foreground transition-colors duration-150',
                      'focus-visible:outline-none focus-visible:text-foreground',
                      isActive && 'text-foreground',
                    )}
                    onClick={() => onSort(col.sortField!)}
                    aria-label={`Ordenar por ${col.label}${isActive ? `, atualmente ${sortConfig?.direction === 'asc' ? 'ascendente' : 'descendente'}` : ''}`}
                  >
                    <span className="truncate">{col.label}</span>
                    <SortIcon field={col.sortField!} sortConfig={sortConfig} />
                  </button>
                ) : (
                  <span>{col.label}</span>
                )}

                {/* Resize handle */}
                {!col.fixed && (
                  <div
                    className={cn(
                      'absolute right-0 top-0 bottom-0 z-10 w-1.5 cursor-col-resize',
                      'after:content-[""] after:absolute after:inset-y-1 after:right-0.5 after:w-0.5 after:rounded-full',
                      'after:bg-border after:opacity-0 after:transition-opacity after:duration-150',
                      'group-hover/header:after:opacity-50 hover:after:opacity-100 hover:after:bg-primary',
                    )}
                    onPointerDown={(e) => handleResizeStart(e, col.key)}
                  />
                )}
              </TableHead>
            );
          })}
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
              Nenhum usuário encontrado com os filtros aplicados.
            </TableCell>
          </TableRow>
        )}
        {users.map((user) => {
          const typeInfo = typeLabels[user.type] || { label: user.type, className: '' };
          const status = user.status || 'active';
          const statusInfo = statusLabels[status] || statusLabels.active;
          const isSelected = selectedIds.includes(user.id);

          return (
            <TableRow key={user.id} data-state={isSelected ? 'selected' : undefined}>
              <TableCell>
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => onToggleSelect(user.id)}
                  aria-label={`Selecionar ${user.name}`}
                />
              </TableCell>
              <TableCell>
                <Link
                  to={`/admin/usuarios/${user.id}`}
                  className="flex items-center gap-3 hover:underline"
                >
                  <Avatar className="h-8 w-8">
                    {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                    <AvatarFallback className="text-xs bg-primary/10 text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <div className="font-medium text-foreground truncate uppercase">{user.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{user.email}</div>
                  </div>
                </Link>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline" className={cn('text-xs font-medium border-0', typeInfo.className)}>
                  {typeInfo.label}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                {rolesLoading ? (
                  <Skeleton className="h-4 w-20" />
                ) : (
                  <span className="text-sm text-muted-foreground">{getRoleName(user.roleId, roles)}</span>
                )}
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline" className={cn('text-xs font-medium border-0', statusInfo.className)}>
                  {statusInfo.label}
                </Badge>
              </TableCell>
              <TableCell className="hidden xl:table-cell">
                <span className="text-sm text-muted-foreground">-</span>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="text-sm text-muted-foreground">
                  {user.lastAccessAt ? formatRelativeDate(user.lastAccessAt) : 'Nunca fez login'}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Ações</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={`/admin/usuarios/${user.id}`}>
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={`/admin/usuarios/${user.id}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Editar
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {status !== 'active' && (
                      <DropdownMenuItem onClick={() => onStatusChange(user.id, 'active')}>
                        <CheckCircle className="w-4 h-4 mr-2 text-emerald-600" />
                        Ativar
                      </DropdownMenuItem>
                    )}
                    {status !== 'inactive' && (
                      <DropdownMenuItem onClick={() => onStatusChange(user.id, 'inactive')}>
                        <Ban className="w-4 h-4 mr-2 text-gray-600" />
                        Desativar
                      </DropdownMenuItem>
                    )}
                    {status !== 'suspended' && (
                      <DropdownMenuItem onClick={() => onStatusChange(user.id, 'suspended')}>
                        <Ban className="w-4 h-4 mr-2 text-red-600" />
                        Suspender
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Trash2 className="w-4 h-4 mr-2" />
                      Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
