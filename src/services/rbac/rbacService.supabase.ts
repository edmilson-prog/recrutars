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
    return (data ?? []) as unknown as PermissionAuditLog[];
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    const { error } = await supabase
      .from('user_roles')
      .upsert({ user_id: userId, role_id: roleId });

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

  async resolvePermissions(userId: string): Promise<PermissionResolution[]> {
    // In a real implementation, this would call an RPC function on Supabase
    // that computes the effective permission set for the user by evaluating
    // overrides, group memberships, and role assignments.
    const { data, error } = await supabase.rpc('resolve_user_permissions', {
      p_user_id: userId,
    });

    if (error) throw error;
    return (data ?? []) as unknown as PermissionResolution[];
  }
}
