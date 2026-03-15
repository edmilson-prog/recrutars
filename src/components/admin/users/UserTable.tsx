/**
 * UserTable Component
 * PRD-061: Tabela de usuarios com selecao e acoes
 */

import { Link } from 'react-router-dom';
import { MoreHorizontal, Eye, Edit, Ban, CheckCircle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

interface UserTableProps {
  users: User[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onStatusChange: (userId: string, status: 'active' | 'inactive' | 'suspended') => void;
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

export function UserTable({
  users,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onStatusChange,
}: UserTableProps) {
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const allSelected = users.length > 0 && selectedIds.length === users.length;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected}
              onCheckedChange={onToggleAll}
              aria-label="Selecionar todos"
            />
          </TableHead>
          <TableHead>Usuario</TableHead>
          <TableHead className="hidden md:table-cell">Tipo</TableHead>
          <TableHead className="hidden lg:table-cell">Papel</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead className="hidden xl:table-cell">Plano</TableHead>
          <TableHead className="hidden lg:table-cell">Ultimo Acesso</TableHead>
          <TableHead className="w-12">Acoes</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 && (
          <TableRow>
            <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
              Nenhum usuario encontrado com os filtros aplicados.
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
                  {user.lastAccessAt ? formatRelativeDate(user.lastAccessAt) : '-'}
                </span>
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Acoes</span>
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
