/**
 * Hook de Impersonation (PRD-071 Migration)
 *
 * Backward-compatible wrapper that uses service layer hooks (useUsers, useRoles)
 * instead of directly importing mockUsers and mockRoles.
 */

import { useState, useCallback } from 'react';
import { useUsers } from './useUsersQuery';
import { useRoles } from './useRBACQuery';
import type { ImpersonationSession } from '@/types/rbac';
import type { User } from '@/types/user';
import type { Role } from '@/types/rbac';

const IMPERSONATION_DURATION_MS = 60 * 60 * 1000; // 1 hora

export function useImpersonation(currentUserId: string) {
  const [session, setSession] = useState<ImpersonationSession | null>(null);
  const [originalUserId, setOriginalUserId] = useState<string | null>(null);

  // Fetch users and roles via service layer
  const { data: usersResult } = useUsers();
  const { data: roles = [] } = useRoles();

  const users: User[] = usersResult?.data ?? [];

  const getUserLevel = (userId: string): number => {
    const user = users.find(u => u.id === userId);
    if (!user?.roleId) return 0;
    const role = roles.find((r: Role) => r.id === user.roleId);
    return role?.level || 0;
  };

  const startImpersonation = useCallback((targetUserId: string, reason: string): { success: boolean; error?: string } => {
    const currentLevel = getUserLevel(currentUserId);
    const targetLevel = getUserLevel(targetUserId);
    const targetUser = users.find(u => u.id === targetUserId);

    if (!targetUser) {
      return { success: false, error: 'Usuario nao encontrado' };
    }

    // Nao pode impersonar super_admin
    const targetRole = roles.find((r: Role) => r.id === targetUser.roleId);
    if (targetRole?.slug === 'super_admin') {
      return { success: false, error: 'Nao e possivel visualizar como Super Admin' };
    }

    // Nao pode impersonar usuario de nivel igual ou superior
    if (targetLevel >= currentLevel) {
      return { success: false, error: 'Nao e possivel visualizar como usuario de mesmo nivel ou superior' };
    }

    const now = new Date();
    const newSession: ImpersonationSession = {
      id: `imp-${Date.now()}`,
      adminId: currentUserId,
      targetUserId,
      targetUserType: targetUser.type,
      startedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + IMPERSONATION_DURATION_MS).toISOString(),
      reason,
    };

    setOriginalUserId(currentUserId);
    setSession(newSession);

    return { success: true };
  }, [currentUserId, users, roles]);

  const stopImpersonation = useCallback(() => {
    if (session) {
      setSession({
        ...session,
        endedAt: new Date().toISOString(),
      });
    }
    setTimeout(() => {
      setSession(null);
      setOriginalUserId(null);
    }, 100);
  }, [session]);

  const isImpersonating = session !== null && !session.endedAt;

  const remainingTime = (): number => {
    if (!session || session.endedAt) return 0;
    const expiresAt = new Date(session.expiresAt).getTime();
    const now = Date.now();
    return Math.max(0, expiresAt - now);
  };

  return {
    session,
    originalUserId,
    isImpersonating,
    startImpersonation,
    stopImpersonation,
    remainingTime,
  };
}
