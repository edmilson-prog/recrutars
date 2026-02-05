/**
 * RBAC Service — Interface
 * PRD-066: Service Layer Pattern
 *
 * Manages roles, permissions, groups, overrides, and audit logs.
 */

import type {
  Role,
  Permission,
  PermissionGroup,
  UserPermissionOverride,
  PermissionAuditLog,
  PermissionResolution,
} from '@/types/rbac';

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface CreatePermissionGroupData {
  name: string;
  description: string;
  permissionCodes: string[];
  memberUserIds?: string[];
}

export interface IRBACService {
  /** List all roles. */
  getRoles(): Promise<Role[]>;

  /** Get a single role by ID. */
  getRole(id: string): Promise<Role | null>;

  /** List all permissions. */
  getPermissions(): Promise<Permission[]>;

  /** List all permission groups. */
  getPermissionGroups(): Promise<PermissionGroup[]>;

  /** List permission overrides for a specific user. */
  getUserPermissionOverrides(userId: string): Promise<UserPermissionOverride[]>;

  /** List audit logs with optional filters. */
  getAuditLogs(filters?: AuditLogFilters): Promise<PermissionAuditLog[]>;

  /** Assign a role to a user. */
  assignRole(userId: string, roleId: string): Promise<void>;

  /** Grant a specific permission to a user. */
  grantPermission(userId: string, code: string, reason: string): Promise<void>;

  /** Deny a specific permission for a user. */
  denyPermission(userId: string, code: string, reason: string): Promise<void>;

  /** Create a new permission group. */
  createPermissionGroup(data: CreatePermissionGroupData): Promise<PermissionGroup>;

  /** Resolve all effective permissions for a user. */
  resolvePermissions(userId: string): Promise<PermissionResolution[]>;
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let _instance: IRBACService | null = null;

export async function getRBACService(): Promise<IRBACService> {
  if (_instance) return _instance;

  const { SupabaseRBACService } = await import('./rbacService.supabase');
  _instance = new SupabaseRBACService();
  return _instance;
}
