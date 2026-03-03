/**
 * Users Service — Interface & Factory
 * PRD-066: Service Layer Pattern
 *
 * Provides CRUD operations for user/profile data with
 * transparent switching between mock and Supabase backends.
 */

import type { User } from '@/types/user';
import type { UserStatus } from '@/types/rbac';
import type { PaginatedResult, PaginationConfig, SortConfig } from '../types';

// ---------------------------------------------------------------------------
// Filters
// ---------------------------------------------------------------------------

export interface UserFilters {
  type?: User['type'];
  status?: UserStatus;
  search?: string;
  roleId?: string;
}

export interface CreateUserData {
  name: string;
  email: string;
  type: 'admin' | 'company' | 'candidate';
  phone?: string;
  password?: string;
  sendInviteEmail?: boolean;
}

// ---------------------------------------------------------------------------
// Service Interface
// ---------------------------------------------------------------------------

export interface IUsersService {
  getUsers(
    filters?: UserFilters,
    pagination?: PaginationConfig,
    sort?: SortConfig,
  ): Promise<PaginatedResult<User>>;

  getUser(id: string): Promise<User | null>;

  updateUser(
    id: string,
    updates: Partial<User>,
  ): Promise<User>;

  updateUserStatus(
    id: string,
    status: UserStatus,
  ): Promise<User>;

  createUser(data: CreateUserData): Promise<{ userId: string }>;
}

// ---------------------------------------------------------------------------
// Singleton Factory
// ---------------------------------------------------------------------------

let _instance: IUsersService | null = null;

export async function getUsersService(): Promise<IUsersService> {
  if (_instance) return _instance;

  const { UsersServiceSupabase } = await import(
    './usersService.supabase'
  );
  _instance = new UsersServiceSupabase();
  return _instance;
}

export function resetUsersService(): void {
  _instance = null;
}
