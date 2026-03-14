/**
 * RBAC Context Provider
 * PRD-061: Sistema RBAC "Guardian"
 */

import React, { createContext, useContext, useMemo, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { hasPermission, getEffectivePermissions, configureRBAC } from '@/lib/rbac';
import { supabase } from '@/lib/supabase';
import { useImpersonation } from '@/hooks/useImpersonation';
import { useRoles, usePermissionGroups, useUserPermissionOverrides } from '@/hooks/useRBACQuery';
import type { PermissionResolution, ImpersonationSession } from '@/types/rbac';

interface RBACContextType {
  can: (code: string) => boolean;
  canAny: (codes: string[]) => boolean;
  effectivePermissions: PermissionResolution[];
  isImpersonating: boolean;
  impersonationSession: ImpersonationSession | null;
  startImpersonation: (targetUserId: string, targetUserRoleId: string | undefined, targetUserType: string, reason: string) => Promise<{ success: boolean; error?: string }>;
  stopImpersonation: () => void;
  impersonationRemainingTime: () => number;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

const noopImpersonation = {
  session: null as ImpersonationSession | null,
  isImpersonating: false,
  startImpersonation: () => ({ success: false, error: 'Not authenticated' }) as { success: boolean; error?: string },
  stopImpersonation: () => {},
  remainingTime: () => 0,
};

export function RBACProvider({ children }: { children: ReactNode }) {
  const {
    realUser,
    user,
    activateImpersonation,
    deactivateImpersonation,
  } = useAuth();

  // For RBAC, always use the real admin user (not the impersonated target)
  const rbacUser = realUser || user;
  const userId = rbacUser?.id || '';
  const isAdmin = rbacUser?.type === 'admin';

  // Only load impersonation for admin users (avoids loading all profiles)
  const impersonation = useImpersonation(isAdmin ? userId : '', isAdmin ? rbacUser?.roleId : undefined);
  const {
    session: impersonationSession,
    isImpersonating,
    startImpersonation: rawStartImpersonation,
    stopImpersonation: rawStopImpersonation,
    remainingTime: impersonationRemainingTime,
  } = isAdmin ? impersonation : noopImpersonation;

  // Fetch RBAC data via service layer (roles/permissions are open SELECT, lightweight)
  const { data: roles = [] } = useRoles();
  const { data: groups = [] } = usePermissionGroups();
  const { data: overrides = [] } = useUserPermissionOverrides(userId);

  // Configure RBAC engine when data is available — always use real admin user
  useEffect(() => {
    if (roles.length === 0) return;

    const rolePermissions: Record<string, string[]> = {};
    for (const role of roles) {
      rolePermissions[role.slug] = role.permissions ?? [];
    }

    configureRBAC({
      users: rbacUser ? [{ id: rbacUser.id, roleId: rbacUser.roleId, groupIds: rbacUser.groupIds }] : [],
      roles,
      rolePermissions,
      groups,
      overrides,
    });
  }, [rbacUser, roles, groups, overrides]);

  // Bridge: validate via useImpersonation, then activate overlay in AuthContext
  const startImpersonation = useCallback(async (
    targetUserId: string,
    targetUserRoleId: string | undefined,
    targetUserType: string,
    reason: string,
  ): Promise<{ success: boolean; error?: string }> => {
    // Step 1: Validate role levels via useImpersonation hook
    const result = rawStartImpersonation(targetUserId, targetUserRoleId, targetUserType, reason);
    if (!result.success) return result;

    // Step 2: Activate AuthContext overlay (loads target user data)
    try {
      await activateImpersonation(targetUserId);

      // Log impersonation in audit trail (fire-and-forget)
      supabase.rpc('log_rbac_audit', {
        p_action: 'impersonation_started',
        p_target_user_id: targetUserId,
        p_details: reason,
      }).then();

      return { success: true };
    } catch (err) {
      // Rollback session if AuthContext activation fails
      rawStopImpersonation();
      return { success: false, error: err instanceof Error ? err.message : 'Falha ao carregar dados do usuario' };
    }
  }, [rawStartImpersonation, activateImpersonation, rawStopImpersonation]);

  // Bridge: deactivate both session metadata and AuthContext overlay
  const stopImpersonation = useCallback(() => {
    rawStopImpersonation();
    deactivateImpersonation();
  }, [rawStopImpersonation, deactivateImpersonation]);

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
