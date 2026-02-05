/**
 * EffectivePermissions Component
 * PRD-061: Visualizacao da cadeia de resolucao de permissoes
 */

import { Shield, ShieldCheck, ShieldX, ArrowRight, Users, UserCog, ShieldAlert, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useRoles, usePermissions, usePermissionGroups, useUserPermissionOverrides } from '@/hooks/useRBACQuery';
import type { User } from '@/types';
import type { Role, Permission, PermissionGroup, UserPermissionOverride } from '@/types/rbac';

interface EffectivePermissionsProps {
  user: User;
}

interface ResolvedPermission {
  code: string;
  displayName: string;
  category: string;
  granted: boolean;
  source: 'role' | 'group' | 'override';
  sourceName: string;
}

function resolvePermissions(
  user: User,
  roles: Role[],
  allPermissions: Permission[],
  groups: PermissionGroup[],
  overrides: UserPermissionOverride[],
): ResolvedPermission[] {
  const resolved: Map<string, ResolvedPermission> = new Map();

  // 1. Role permissions (base)
  const role = roles.find(r => r.id === user.roleId);
  if (role) {
    const rolePerms = role.permissions.includes('*')
      ? allPermissions.map(p => p.code)
      : role.permissions;

    for (const code of rolePerms) {
      const perm = allPermissions.find(p => p.code === code);
      if (perm) {
        resolved.set(code, {
          code,
          displayName: perm.displayName,
          category: perm.category,
          granted: true,
          source: 'role',
          sourceName: role.name,
        });
      }
    }
  }

  // 2. Group permissions (additive)
  const userGroups = groups.filter(g => g.memberUserIds.includes(user.id));
  for (const group of userGroups) {
    for (const code of group.permissionCodes) {
      const perm = allPermissions.find(p => p.code === code);
      if (perm && !resolved.has(code)) {
        resolved.set(code, {
          code,
          displayName: perm.displayName,
          category: perm.category,
          granted: true,
          source: 'group',
          sourceName: group.name,
        });
      }
    }
  }

  // 3. Overrides (highest priority)
  for (const override of overrides) {
    const perm = allPermissions.find(p => p.code === override.permissionCode);
    if (perm) {
      resolved.set(override.permissionCode, {
        code: override.permissionCode,
        displayName: perm.displayName,
        category: perm.category,
        granted: override.type === 'grant',
        source: 'override',
        sourceName: override.type === 'grant' ? 'Override (Conceder)' : 'Override (Negar)',
      });
    }
  }

  return Array.from(resolved.values()).sort((a, b) => a.category.localeCompare(b.category));
}

function getSourceIcon(source: string) {
  switch (source) {
    case 'role': return UserCog;
    case 'group': return Users;
    case 'override': return ShieldAlert;
    default: return Shield;
  }
}

export function EffectivePermissions({ user }: EffectivePermissionsProps) {
  const { data: roles = [], isLoading: rolesLoading } = useRoles();
  const { data: allPermissions = [], isLoading: permsLoading } = usePermissions();
  const { data: groups = [], isLoading: groupsLoading } = usePermissionGroups();
  const { data: overrides = [], isLoading: overridesLoading } = useUserPermissionOverrides(user.id);

  const isLoading = rolesLoading || permsLoading || groupsLoading || overridesLoading;

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-8 justify-center text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Calculando permissoes efetivas...</span>
      </div>
    );
  }

  const permissions = resolvePermissions(user, roles, allPermissions, groups, overrides);

  // Group by category
  const byCategory = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, ResolvedPermission[]>);

  const grantedCount = permissions.filter(p => p.granted).length;
  const deniedCount = permissions.filter(p => !p.granted).length;

  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <span className="text-sm font-medium">{grantedCount} concedidas</span>
        </div>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <ShieldX className="w-5 h-5 text-red-600" />
          <span className="text-sm font-medium">{deniedCount} negadas</span>
        </div>
      </div>

      {/* Chain explanation */}
      <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900/30">
        <h4 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
          Cadeia de Resolucao
        </h4>
        <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-400">
          <Badge variant="outline" className="text-xs">1. Papel</Badge>
          <ArrowRight className="w-3 h-3" />
          <Badge variant="outline" className="text-xs">2. Grupos</Badge>
          <ArrowRight className="w-3 h-3" />
          <Badge variant="outline" className="text-xs">3. Overrides</Badge>
        </div>
        <p className="text-xs text-blue-600 dark:text-blue-500 mt-2">
          Overrides possuem a maior prioridade e podem conceder ou negar permissoes individuais.
        </p>
      </div>

      {/* Permissions by category */}
      {Object.entries(byCategory).map(([category, perms]) => (
        <div key={category}>
          <h4 className="text-sm font-semibold text-foreground mb-3">{category}</h4>
          <div className="space-y-2">
            {perms.map((perm) => {
              const SourceIcon = getSourceIcon(perm.source);
              return (
                <div
                  key={perm.code}
                  className={cn(
                    'flex items-center justify-between p-3 rounded-lg border',
                    perm.granted
                      ? 'bg-emerald-50 dark:bg-emerald-950/10 border-emerald-200 dark:border-emerald-900/30'
                      : 'bg-red-50 dark:bg-red-950/10 border-red-200 dark:border-red-900/30'
                  )}
                >
                  <div className="flex items-center gap-3">
                    {perm.granted ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <ShieldX className="w-4 h-4 text-red-600" />
                    )}
                    <div>
                      <div className="text-sm font-medium">{perm.displayName}</div>
                      <div className="text-xs text-muted-foreground font-mono">{perm.code}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SourceIcon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{perm.sourceName}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {permissions.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <Shield className="w-10 h-10 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Nenhuma permissao atribuida a este usuario.</p>
        </div>
      )}
    </div>
  );
}
