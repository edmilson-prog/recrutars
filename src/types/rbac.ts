/**
 * Types for RBAC (Role-Based Access Control)
 * PRD-061: Sistema RBAC "Guardian"
 */

export interface Role {
  id: string;
  name: string;
  slug: string;
  type: 'system' | 'admin' | 'company';
  level: number;
  description: string;
  isSystem: boolean;
  permissions: string[];
  createdAt: string;
}

export interface Permission {
  id: string;
  code: string; // formato 'resource:action' ex: 'users:read'
  resource: string;
  action: string;
  displayName: string;
  description: string;
  category: string;
}

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  permissionCodes: string[];
  memberUserIds: string[];
  createdAt: string;
}

export interface UserPermissionOverride {
  id: string;
  userId: string;
  permissionCode: string;
  type: 'grant' | 'deny';
  reason: string;
  grantedBy: string;
  createdAt: string;
}

export interface ImpersonationSession {
  id: string;
  adminId: string;
  targetUserId: string;
  targetUserType: 'admin' | 'company' | 'candidate';
  startedAt: string;
  expiresAt: string;
  endedAt?: string;
  reason: string;
}

export type AuditAction =
  | 'role_assigned'
  | 'role_removed'
  | 'permission_granted'
  | 'permission_denied'
  | 'permission_removed'
  | 'group_created'
  | 'group_updated'
  | 'group_deleted'
  | 'group_member_added'
  | 'group_member_removed'
  | 'user_created'
  | 'user_updated'
  | 'user_status_changed'
  | 'user_deleted'
  | 'impersonation_started'
  | 'impersonation_ended'
  | 'login'
  | 'logout'
  | 'password_changed'
  | 'plan_changed';

export interface PermissionAuditLog {
  id: string;
  action: AuditAction;
  targetUserId?: string;
  targetUserName?: string;
  targetRoleId?: string;
  targetGroupId?: string;
  permissionCode?: string;
  oldValue?: string;
  newValue?: string;
  performedBy: string;
  performedByName: string;
  performedAt: string;
  details?: string;
}

export type UserStatus = 'active' | 'inactive' | 'suspended' | 'pending';

/** Resultado da resolução de permissão */
export interface PermissionResolution {
  code: string;
  granted: boolean;
  source: 'override' | 'group' | 'role' | 'default';
  detail?: string;
}

/** Passo na cadeia de resolução de permissão */
export interface PermissionChainStep {
  step: string;
  source: string;
  result: boolean;
  detail: string;
}

/** Explicação completa da resolução de permissão */
export interface PermissionExplanation {
  code: string;
  granted: boolean;
  chain: PermissionChainStep[];
}
