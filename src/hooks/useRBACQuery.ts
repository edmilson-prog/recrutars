/**
 * RBAC Query Hooks
 * PRD-066: Service Layer — React Query integration for RBAC module
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRBACService } from '@/services/rbac/rbacService';
import type { AuditLogFilters, CreatePermissionGroupData } from '@/services/rbac/rbacService';

const ROLES_KEY = 'rbac-roles';
const PERMISSIONS_KEY = 'rbac-permissions';
const GROUPS_KEY = 'rbac-groups';
const OVERRIDES_KEY = 'rbac-overrides';
const AUDIT_KEY = 'rbac-audit';
const RESOLVED_KEY = 'rbac-resolved';

// ---------------------------------------------------------------------------
// Roles
// ---------------------------------------------------------------------------

export function useRoles() {
  return useQuery({
    queryKey: [ROLES_KEY],
    queryFn: async () => {
      const svc = await getRBACService();
      return svc.getRoles();
    },
  });
}

export function useRole(id: string | undefined) {
  return useQuery({
    queryKey: [ROLES_KEY, id],
    queryFn: async () => {
      if (!id) return null;
      const svc = await getRBACService();
      return svc.getRole(id);
    },
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Permissions
// ---------------------------------------------------------------------------

export function usePermissions() {
  return useQuery({
    queryKey: [PERMISSIONS_KEY],
    queryFn: async () => {
      const svc = await getRBACService();
      return svc.getPermissions();
    },
  });
}

export function usePermissionGroups() {
  return useQuery({
    queryKey: [GROUPS_KEY],
    queryFn: async () => {
      const svc = await getRBACService();
      return svc.getPermissionGroups();
    },
  });
}

export function useUserPermissionOverrides(userId: string | undefined) {
  return useQuery({
    queryKey: [OVERRIDES_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];
      const svc = await getRBACService();
      return svc.getUserPermissionOverrides(userId);
    },
    enabled: !!userId,
  });
}

// ---------------------------------------------------------------------------
// Audit Logs
// ---------------------------------------------------------------------------

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: [AUDIT_KEY, filters],
    queryFn: async () => {
      const svc = await getRBACService();
      return svc.getAuditLogs(filters);
    },
  });
}

// ---------------------------------------------------------------------------
// Resolved Permissions
// ---------------------------------------------------------------------------

export function useResolvedPermissions(userId: string | undefined) {
  return useQuery({
    queryKey: [RESOLVED_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];
      const svc = await getRBACService();
      return svc.resolvePermissions(userId);
    },
    enabled: !!userId,
  });
}

// ---------------------------------------------------------------------------
// Mutations
// ---------------------------------------------------------------------------

export function useAssignRole() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, roleId }: { userId: string; roleId: string }) => {
      const svc = await getRBACService();
      return svc.assignRole(userId, roleId);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [ROLES_KEY] });
      qc.invalidateQueries({ queryKey: [AUDIT_KEY] });
      qc.invalidateQueries({ queryKey: [RESOLVED_KEY] });
    },
  });
}

export function useGrantPermission() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      code,
      reason,
    }: {
      userId: string;
      code: string;
      reason: string;
    }) => {
      const svc = await getRBACService();
      return svc.grantPermission(userId, code, reason);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [OVERRIDES_KEY] });
      qc.invalidateQueries({ queryKey: [AUDIT_KEY] });
      qc.invalidateQueries({ queryKey: [RESOLVED_KEY] });
    },
  });
}

export function useDenyPermission() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      code,
      reason,
    }: {
      userId: string;
      code: string;
      reason: string;
    }) => {
      const svc = await getRBACService();
      return svc.denyPermission(userId, code, reason);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [OVERRIDES_KEY] });
      qc.invalidateQueries({ queryKey: [AUDIT_KEY] });
      qc.invalidateQueries({ queryKey: [RESOLVED_KEY] });
    },
  });
}

export function useCreatePermissionGroup() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePermissionGroupData) => {
      const svc = await getRBACService();
      return svc.createPermissionGroup(data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [GROUPS_KEY] });
      qc.invalidateQueries({ queryKey: [AUDIT_KEY] });
    },
  });
}
