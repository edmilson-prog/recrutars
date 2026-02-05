/**
 * RBAC Context Provider
 * PRD-061: Sistema RBAC "Guardian"
 */

import React, { createContext, useContext, useMemo, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, getEffectivePermissions, configureRBAC } from '@/lib/rbac';
import { useImpersonation } from '@/hooks/useImpersonation';
import { useRoles, usePermissionGroups, useUserPermissionOverrides } from '@/hooks/useRBACQuery';
import type { PermissionResolution, ImpersonationSession } from '@/types/rbac';

interface RBACContextType {
  can: (code: string) => boolean;
  canAny: (codes: string[]) => boolean;
  effectivePermissions: PermissionResolution[];
  isImpersonating: boolean;
  impersonationSession: ImpersonationSession | null;
  startImpersonation: (targetUserId: string, reason: string) => { success: boolean; error?: string };
  stopImpersonation: () => void;
  impersonationRemainingTime: () => number;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export function RBACProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const userId = user?.id || '';

  const {
    session: impersonationSession,
    isImpersonating,
    startImpersonation,
    stopImpersonation,
    remainingTime: impersonationRemainingTime,
  } = useImpersonation(userId);

  // Fetch RBAC data via service layer
  const { data: roles = [] } = useRoles();
  const { data: groups = [] } = usePermissionGroups();
  const { data: overrides = [] } = useUserPermissionOverrides(userId);

  // Configure RBAC engine when data is available
  useEffect(() => {
    if (roles.length === 0) return;

    const rolePermissions: Record<string, string[]> = {};
    for (const role of roles) {
      rolePermissions[role.slug] = role.permissions ?? [];
    }

    configureRBAC({
      users: user ? [{ id: user.id, roleId: user.roleId, groupIds: user.groupIds }] : [],
      roles,
      rolePermissions,
      groups,
      overrides,
    });
  }, [user, roles, groups, overrides]);

  const can = (code: string): boolean => {
    if (!userId) return false;
    return hasPermission(userId, code);
  };

  const canAny = (codes: string[]): boolean => {
    if (!userId) return false;
    return codes.some(code => hasPermission(userId, code));
  };

  const effectivePermissions = useMemo(() => {
    if (!userId || roles.length === 0) return [];
    return getEffectivePermissions(userId);
  }, [userId, roles, groups, overrides]);

  return (
    <RBACContext.Provider value={{
      can,
      canAny,
      effectivePermissions,
      isImpersonating,
      impersonationSession,
      startImpersonation,
      stopImpersonation,
      impersonationRemainingTime,
    }}>
      {children}
    </RBACContext.Provider>
  );
}

export function useRBAC() {
  const context = useContext(RBACContext);
  if (context === undefined) {
    throw new Error('useRBAC must be used within a RBACProvider');
  }
  return context;
}
