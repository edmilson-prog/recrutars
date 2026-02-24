/**
 * RBAC Service — Supabase Implementation
 * PRD-066: Service Layer Pattern
 */

import { supabase } from '@/lib/supabase';
import type {
  Role,
  Permission,
  PermissionGroup,
  UserPermissionOverride,
  PermissionAuditLog,
  PermissionResolution,
} from '@/types/rbac';
import type {
  IRBACService,
  AuditLogFilters,
  CreatePermissionGroupData,
  UpdatePermissionGroupData,
  CreateRoleData,
  UpdateRoleData,
} from './rbacService';

export class SupabaseRBACService implements IRBACService {
  async getRoles(): Promise<Role[]> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('level', { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as Role[];
  }

  async getRole(id: string): Promise<Role | null> {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return (data as unknown as Role) ?? null;
  }

  async getPermissions(): Promise<Permission[]> {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('category');

    if (error) throw error;
    return (data ?? []) as unknown as Permission[];
  }

  async getPermissionGroups(): Promise<PermissionGroup[]> {
    const { data, error } = await supabase
      .from('permission_groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as PermissionGroup[];
  }

  async getUserPermissionOverrides(userId: string): Promise<UserPermissionOverride[]> {
    const { data, error } = await supabase
      .from('user_permission_overrides')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data ?? []) as unknown as UserPermissionOverride[];
  }

  async getAuditLogs(filters?: AuditLogFilters): Promise<PermissionAuditLog[]> {
    let query = supabase
      .from('permission_audit_logs')
      .select('*')
      .order('performed_at', { ascending: false });

    if (filters?.userId) {
      query = query.or(
        `target_user_id.eq.${filters.userId},performed_by.eq.${filters.userId}`,
      );
    }
    if (filters?.action) {
      query = query.eq('action', filters.action);
    }
    if (filters?.dateFrom) {
      query = query.gte('performed_at', filters.dateFrom);
    }
    if (filters?.dateTo) {
      query = query.lte('performed_at', filters.dateTo);
    }

    const { data, error } = await query;
    if (error) throw error;
    return (data ?? []).map(row => ({
      id: row.id,
      action: row.action,
      targetUserId: row.target_user_id,
      targetUserName: row.target_user_name,
      targetRoleId: row.target_role_id,
      targetGroupId: row.target_group_id,
      permissionCode: row.permission_code,
      oldValue: row.old_value,
      newValue: row.new_value,
      performedBy: row.performed_by,
      performedByName: row.performed_by_name,
      performedAt: row.performed_at,
      details: row.details,
    })) as PermissionAuditLog[];
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({ role_id: roleId })
      .eq('id', userId);

    if (error) throw error;
  }

  async grantPermission(userId: string, code: string, reason: string): Promise<void> {
    const { error } = await supabase.from('user_permission_overrides').insert({
      user_id: userId,
      permission_code: code,
      type: 'grant',
      reason,
      granted_by: (await supabase.auth.getUser()).data.user?.id ?? 'system',
    });

    if (error) throw error;
  }

  async denyPermission(userId: string, code: string, reason: string): Promise<void> {
    const { error } = await supabase.from('user_permission_overrides').insert({
      user_id: userId,
      permission_code: code,
      type: 'deny',
      reason,
      granted_by: (await supabase.auth.getUser()).data.user?.id ?? 'system',
    });

    if (error) throw error;
  }

  async createPermissionGroup(data: CreatePermissionGroupData): Promise<PermissionGroup> {
    const { data: row, error } = await supabase
      .from('permission_groups')
      .insert({
        name: data.name,
        description: data.description,
        permission_codes: data.permissionCodes,
        member_user_ids: data.memberUserIds ?? [],
      })
      .select()
      .single();

    if (error) throw error;
    return row as unknown as PermissionGroup;
  }

  async updatePermissionGroup(id: string, data: UpdatePermissionGroupData): Promise<PermissionGroup> {
    const dbUpdates: Record<string, unknown> = {};
    if (data.name !== undefined) dbUpdates.name = data.name;
    if (data.description !== undefined) dbUpdates.description = data.description;
    if (data.permissionCodes !== undefined) dbUpdates.permission_codes = data.permissionCodes;
    if (data.memberUserIds !== undefined) dbUpdates.member_user_ids = data.memberUserIds;

    const { data: row, error } = await supabase
      .from('permission_groups')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return row as unknown as PermissionGroup;
  }

  async deletePermissionGroup(id: string): Promise<void> {
    const { error } = await supabase
      .from('permission_groups')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async createRole(data: CreateRoleData): Promise<Role> {
    const { data: row, error } = await supabase
      .from('roles')
      .insert({
        name: data.name,
        slug: data.slug,
        type: data.type,
        level: data.level,
        description: data.description,
        is_system: false,
        permissions: data.permissions,
      })
      .select()
      .single();

    if (error) throw error;
    return row as unknown as Role;
  }

  async updateRole(id: string, data: UpdateRoleData): Promise<Role> {
    const dbUpdates: Record<string, unknown> = {};
    if (data.name !== undefined) dbUpdates.name = data.name;
    if (data.slug !== undefined) dbUpdates.slug = data.slug;
    if (data.type !== undefined) dbUpdates.type = data.type;
    if (data.level !== undefined) dbUpdates.level = data.level;
    if (data.description !== undefined) dbUpdates.description = data.description;
    if (data.permissions !== undefined) dbUpdates.permissions = data.permissions;

    const { data: row, error } = await supabase
      .from('roles')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return row as unknown as Role;
  }

  async deleteRole(id: string): Promise<void> {
    const { error } = await supabase
      .from('roles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async removePermissionOverride(id: string): Promise<void> {
    const { error } = await supabase
      .from('user_permission_overrides')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async resolvePermissions(userId: string): Promise<PermissionResolution[]> {
    // Uses the client-side RBAC engine (rbac.ts) which is already configured
    // by RBACProvider with roles, groups, and overrides data.
    const { getEffectivePermissions, isRBACConfigured } = await import('@/lib/rbac');

    if (!isRBACConfigured()) {
      return [];
    }

    return getEffectivePermissions(userId);
  }
}
