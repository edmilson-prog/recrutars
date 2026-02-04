/**
 * Hook de Impersonation
 * PRD-061: Sistema RBAC "Guardian"
 */

import { useState, useCallback } from 'react';
import { mockUsers } from '@/data/mockData';
import { mockRoles } from '@/data/rbacData';
import type { ImpersonationSession } from '@/types/rbac';

const IMPERSONATION_DURATION_MS = 60 * 60 * 1000; // 1 hora

export function useImpersonation(currentUserId: string) {
  const [session, setSession] = useState<ImpersonationSession | null>(null);
  const [originalUserId, setOriginalUserId] = useState<string | null>(null);

  const getUserLevel = (userId: string): number => {
    const user = mockUsers.find(u => u.id === userId);
    if (!user?.roleId) return 0;
    const role = mockRoles.find(r => r.id === user.roleId);
    return role?.level || 0;
  };

  const startImpersonation = useCallback((targetUserId: string, reason: string): { success: boolean; error?: string } => {
    const currentLevel = getUserLevel(currentUserId);
    const targetLevel = getUserLevel(targetUserId);
    const targetUser = mockUsers.find(u => u.id === targetUserId);

    if (!targetUser) {
      return { success: false, error: 'Usuário não encontrado' };
    }

    // Não pode impersonar super_admin
    const targetRole = mockRoles.find(r => r.id === targetUser.roleId);
    if (targetRole?.slug === 'super_admin') {
      return { success: false, error: 'Não é possível visualizar como Super Admin' };
    }

    // Não pode impersonar usuário de nível igual ou superior
    if (targetLevel >= currentLevel) {
      return { success: false, error: 'Não é possível visualizar como usuário de mesmo nível ou superior' };
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
  }, [currentUserId]);

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
