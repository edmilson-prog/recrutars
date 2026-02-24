/**
 * Hook de Impersonation (PRD-061)
 *
 * Manages impersonation session metadata, validation, and localStorage persistence.
 * Target user data loading is handled by AuthContext overlay.
 */

import { useState, useCallback, useEffect } from 'react';
import { useRoles } from './useRBACQuery';
import type { ImpersonationSession } from '@/types/rbac';
import type { Role } from '@/types/rbac';

const IMPERSONATION_DURATION_MS = 60 * 60 * 1000; // 1 hora
const STORAGE_KEY = 'recrutars-impersonation-session';

function restoreSession(): ImpersonationSession | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    const parsed: ImpersonationSession = JSON.parse(stored);
    if (parsed.endedAt || new Date(parsed.expiresAt).getTime() < Date.now()) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function useImpersonation(currentUserId: string, currentUserRoleId: string | undefined) {
  const [session, setSession] = useState<ImpersonationSession | null>(restoreSession);
  const [originalUserId, setOriginalUserId] = useState<string | null>(() => {
    const restored = restoreSession();
    return restored?.adminId ?? null;
  });

  const { data: roles = [] } = useRoles();

  // Persist session to localStorage
  useEffect(() => {
    if (session && !session.endedAt) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [session]);

  const getRoleLevel = (roleId: string | undefined): number => {
    if (!roleId) return 0;
    const role = roles.find((r: Role) => r.id === roleId);
    return role?.level || 0;
  };

  const startImpersonation = useCallback((
    targetUserId: string,
    targetUserRoleId: string | undefined,
    targetUserType: string,
    reason: string,
  ): { success: boolean; error?: string } => {
    const currentLevel = getRoleLevel(currentUserRoleId);
    const targetLevel = getRoleLevel(targetUserRoleId);

    // Nao pode impersonar super_admin
    const targetRole = roles.find((r: Role) => r.id === targetUserRoleId);
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
      targetUserType: targetUserType as 'admin' | 'company' | 'candidate',
      startedAt: now.toISOString(),
      expiresAt: new Date(now.getTime() + IMPERSONATION_DURATION_MS).toISOString(),
      reason,
    };

    setOriginalUserId(currentUserId);
    setSession(newSession);

    return { success: true };
  }, [currentUserId, currentUserRoleId, roles]);

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
