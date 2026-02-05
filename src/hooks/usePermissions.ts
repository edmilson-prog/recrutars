/**
 * Hook de Permissões RBAC
 * PRD-061: Sistema RBAC "Guardian"
 *
 * Depende do RBACProvider ter configurado o engine via configureRBAC().
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, getEffectivePermissions, isRBACConfigured } from '@/lib/rbac';
import type { PermissionResolution } from '@/types/rbac';

export function usePermissions() {
  const { user } = useAuth();
  const userId = user?.id || '';

  const can = (code: string): boolean => {
    if (!userId || !isRBACConfigured()) return false;
    return hasPermission(userId, code);
  };

  const canAny = (codes: string[]): boolean => {
    if (!userId || !isRBACConfigured()) return false;
    return codes.some(code => hasPermission(userId, code));
  };

  const canAll = (codes: string[]): boolean => {
    if (!userId || !isRBACConfigured()) return false;
    return codes.every(code => hasPermission(userId, code));
  };

  const effectivePermissions: PermissionResolution[] = useMemo(() => {
    if (!userId || !isRBACConfigured()) return [];
    return getEffectivePermissions(userId);
  }, [userId]);

  return {
    can,
    canAny,
    canAll,
    effectivePermissions,
    userId,
  };
}

/**
 * Hook que redireciona se o usuário não tem a permissão necessária
 */
export function useRequirePermission(code: string) {
  const { can } = usePermissions();
  const hasAccess = can(code);

  return { hasAccess };
}
