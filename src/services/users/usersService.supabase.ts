/**
 * Users Service — Supabase Implementation
 * PRD-066: Service Layer Pattern
 *
 * Reads/writes the `profiles` table via the Supabase client
 * and converts rows with profileRowToUser.
 */

import { supabase } from '@/lib/supabase';
import { profileRowToUser } from '@/lib/supabaseConverters';
import type { User } from '@/types/user';
import type { UserStatus } from '@/types/rbac';
import type { PaginatedResult, PaginationConfig, SortConfig } from '../types';
import type { UserFilters, IUsersService, CreateUserData } from './usersService';

// Map camelCase sort fields to snake_case DB columns
const SORT_FIELD_MAP: Record<string, string> = {
  name: 'name',
  email: 'email',
  type: 'type',
  status: 'status',
  createdAt: 'created_at',
  lastAccessAt: 'last_access_at',
  roleId: 'role_id',
};

export class UsersServiceSupabase implements IUsersService {
  // -----------------------------------------------------------------------
  // List with filters, pagination and sorting
  // -----------------------------------------------------------------------

  async getUsers(
    filters?: UserFilters,
    pagination?: PaginationConfig,
    sort?: SortConfig,
  ): Promise<PaginatedResult<User>> {
    let query = supabase.from('profiles').select('*', { count: 'exact' });

    // --- Filters -----------------------------------------------------------

    if (filters?.type) {
      query = query.eq('type', filters.type);
    }

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      const term = `%${filters.search}%`;
      query = query.or(`name.ilike.${term},email.ilike.${term}`);
    }

    if (filters?.roleId) {
      query = query.eq('role_id', filters.roleId);
    }

    // --- Sorting -----------------------------------------------------------

    if (sort) {
      const column = SORT_FIELD_MAP[sort.field] ?? sort.field;
      query = query.order(column, { ascending: sort.direction === 'asc' });
    } else {
      query = query.order('created_at', { ascending: false });
    }

    // --- Pagination --------------------------------------------------------

    const page = pagination?.page ?? 1;
    const pageSize = pagination?.pageSize ?? 20;
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);

    // --- Execute -----------------------------------------------------------

    const { data, count, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch users: ${error.message}`);
    }

    const total = count ?? 0;
    const users = (data ?? []).map(profileRowToUser);

    return {
      data: users,
      total,
      page,
      pageSize,
      hasMore: from + pageSize < total,
    };
  }

  // -----------------------------------------------------------------------
  // Single record by id
  // -----------------------------------------------------------------------

  async getUser(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch user: ${error.message}`);
    }

    return data ? profileRowToUser(data) : null;
  }

  // -----------------------------------------------------------------------
  // Update
  // -----------------------------------------------------------------------

  async updateUser(
    id: string,
    updates: Partial<User>,
  ): Promise<User> {
    // Convert camelCase updates to snake_case DB columns
    const dbUpdates: Record<string, unknown> = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;
    if (updates.type !== undefined) dbUpdates.type = updates.type;
    if (updates.roleId !== undefined) dbUpdates.role_id = updates.roleId;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.lastAccessAt !== undefined) dbUpdates.last_access_at = updates.lastAccessAt;
    if (updates.groupIds !== undefined) dbUpdates.group_ids = updates.groupIds;

    const { data, error } = await supabase
      .from('profiles')
      .update(dbUpdates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update user: ${error.message}`);
    }

    return profileRowToUser(data);
  }

  // -----------------------------------------------------------------------
  // Update status (convenience)
  // -----------------------------------------------------------------------

  async updateUserStatus(id: string, status: UserStatus): Promise<User> {
    return this.updateUser(id, { status });
  }

  async createUser(data: CreateUserData): Promise<{ userId: string }> {
    const { data: result, error } = await supabase.functions.invoke('admin-create-user', {
      body: data,
    });
    if (error) throw new Error(error.message ?? 'Erro ao criar usuario');
    if (result?.error) throw new Error(result.error);
    return { userId: result.userId };
  }
}
