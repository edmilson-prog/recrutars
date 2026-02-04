/**
 * PermissionsTab Component
 * PRD-061: Aba de permissoes no detalhe do usuario
 */

import { useState } from 'react';
import { ShieldCheck, Plus, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { mockRoles, mockGroups, mockOverrides, mockPermissions } from '@/data/rbacData';
import { EffectivePermissions } from './EffectivePermissions';
import type { User } from '@/types';

interface PermissionsTabProps {
  user: User;
  onSave: (updates: { roleId?: string; groupIds?: string[] }) => void;
}

export function PermissionsTab({ user, onSave }: PermissionsTabProps) {
  const [selectedRoleId, setSelectedRoleId] = useState(user.roleId || '');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>(user.groupIds || []);
  const [showEffective, setShowEffective] = useState(false);

  const userOverrides = mockOverrides.filter(o => o.userId === user.id);
  const selectedRole = mockRoles.find(r => r.id === selectedRoleId);

  const toggleGroup = (groupId: string) => {
    setSelectedGroupIds(prev =>
      prev.includes(groupId)
        ? prev.filter(id => id !== groupId)
        : [...prev, groupId]
    );
  };

  const handleSave = () => {
    onSave({
      roleId: selectedRoleId || undefined,
      groupIds: selectedGroupIds,
    });
  };

  return (
    <div className="space-y-8">
      {/* Papel / Role */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-semibold">Papel (Role)</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          O papel define o conjunto base de permissoes do usuario.
        </p>

        <div className="max-w-md">
          <Select value={selectedRoleId} onValueChange={setSelectedRoleId}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um papel" />
            </SelectTrigger>
            <SelectContent>
              {mockRoles.map(role => (
                <SelectItem key={role.id} value={role.id}>
                  <div className="flex items-center gap-2">
                    <span>{role.name}</span>
                    {role.isSystem && (
                      <Badge variant="outline" className="text-[10px] px-1 py-0">Sistema</Badge>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {selectedRole && (
            <p className="text-xs text-muted-foreground mt-2">
              {selectedRole.description}
            </p>
          )}
        </div>

        {selectedRole && (
          <div className="p-4 bg-muted/50 rounded-lg">
            <Label className="text-xs font-medium text-muted-foreground mb-2 block">
              Permissoes do papel ({selectedRole.permissions.includes('*') ? 'Todas' : selectedRole.permissions.length})
            </Label>
            <div className="flex flex-wrap gap-1.5">
              {selectedRole.permissions.includes('*') ? (
                <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-0">
                  Acesso Total (*)
                </Badge>
              ) : (
                selectedRole.permissions.map(code => (
                  <Badge key={code} variant="outline" className="text-xs">
                    {code}
                  </Badge>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Grupos */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Grupos de Permissao</h3>
            <p className="text-sm text-muted-foreground">
              Grupos adicionam permissoes extras alem do papel.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {mockGroups.map(group => {
            const isSelected = selectedGroupIds.includes(group.id);
            return (
              <div
                key={group.id}
                className={cn(
                  'flex items-start gap-3 p-4 rounded-lg border transition-colors cursor-pointer',
                  isSelected
                    ? 'bg-primary/5 border-primary/30'
                    : 'bg-card border-border hover:bg-muted/50'
                )}
                onClick={() => toggleGroup(group.id)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => toggleGroup(group.id)}
                  className="mt-0.5"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{group.name}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {group.permissionCodes.length} permissoes
                    </Badge>
                    <Badge variant="outline" className="text-[10px]">
                      {group.memberUserIds.length} membros
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{group.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {group.permissionCodes.slice(0, 5).map(code => (
                      <Badge key={code} variant="secondary" className="text-[10px]">
                        {code}
                      </Badge>
                    ))}
                    {group.permissionCodes.length > 5 && (
                      <Badge variant="secondary" className="text-[10px]">
                        +{group.permissionCodes.length - 5}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Overrides */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Overrides Individuais</h3>
          <p className="text-sm text-muted-foreground">
            Permissoes concedidas ou negadas individualmente para este usuario.
          </p>
        </div>

        {userOverrides.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
            <p className="text-sm">Nenhum override definido.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {userOverrides.map(override => {
              const perm = mockPermissions.find(p => p.code === override.permissionCode);
              return (
                <div
                  key={override.id}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    override.type === 'grant'
                      ? 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30'
                      : 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className={cn(
                        'text-xs border-0',
                        override.type === 'grant'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      )}
                    >
                      {override.type === 'grant' ? 'Conceder' : 'Negar'}
                    </Badge>
                    <div>
                      <span className="text-sm font-medium">{perm?.displayName || override.permissionCode}</span>
                      <span className="text-xs text-muted-foreground ml-2 font-mono">{override.permissionCode}</span>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{override.reason}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Separator />

      {/* Permissoes Efetivas */}
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setShowEffective(!showEffective)}
          className="w-full"
        >
          {showEffective ? 'Ocultar' : 'Mostrar'} Permissoes Efetivas
        </Button>

        {showEffective && (
          <EffectivePermissions
            user={{ ...user, roleId: selectedRoleId, groupIds: selectedGroupIds }}
          />
        )}
      </div>

      {/* Save */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => {
          setSelectedRoleId(user.roleId || '');
          setSelectedGroupIds(user.groupIds || []);
        }}>
          Cancelar
        </Button>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Salvar Permissoes
        </Button>
      </div>
    </div>
  );
}
