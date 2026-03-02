/**
 * React Query Hooks — Users
 * PRD-066: Service Layer Pattern
 *
 * Provides data-fetching hooks for user/profile operations,
 * backed by the users service (mock or Supabase).
 */

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query';
import type { User } from '@/types/user';
import type { UserStatus } from '@/types/rbac';
import type { PaginatedResult, PaginationConfig, SortConfig } from '@/services/types';
import {
  getUsersService,
  type UserFilters,
  type CreateUserData,
} from '@/services/users/usersService';

// ---------------------------------------------------------------------------
// Query Keys
// ---------------------------------------------------------------------------

export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters?: UserFilters, pagination?: PaginationConfig, sort?: SortConfig) =>
    [...userKeys.lists(), { filters, pagination, sort }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// ---------------------------------------------------------------------------
// useUsers — paginated list
// ---------------------------------------------------------------------------

export function useUsers(
  filters?: UserFilters,
  pagination?: PaginationConfig,
  sort?: SortConfig,
  options?: Omit<
    UseQueryOptions<PaginatedResult<User>>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<PaginatedResult<User>>({
    queryKey: userKeys.list(filters, pagination, sort),
    queryFn: async () => {
      const service = await getUsersService();
      return service.getUsers(filters, pagination, sort);
    },
    ...options,
  });
}

// ---------------------------------------------------------------------------
// useUser — single by id
// ---------------------------------------------------------------------------

export function useUser(
  id: string,
  options?: Omit<
    UseQueryOptions<User | null>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery<User | null>({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const service = await getUsersService();
      return service.getUser(id);
    },
    enabled: !!id,
    ...options,
  });
}

// ---------------------------------------------------------------------------
// useUpdateUser — mutation
// ---------------------------------------------------------------------------

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      updates,
    }: {
      id: string;
      updates: Partial<User>;
    }) => {
      const service = await getUsersService();
      return service.updateUser(id, updates);
    },
    onSuccess: (updated) => {
      // Update the detail cache for this user
      queryClient.setQueryData(userKeys.detail(updated.id), updated);
      // Invalidate list queries so they refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------------
// useUpdateUserStatus — mutation (convenience)
// ---------------------------------------------------------------------------

export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: UserStatus;
    }) => {
      const service = await getUsersService();
      return service.updateUserStatus(id, status);
    },
    onSuccess: (updated) => {
      // Update the detail cache for this user
      queryClient.setQueryData(userKeys.detail(updated.id), updated);
      // Invalidate list queries so they refetch
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------------
// useCreateUser — mutation (admin only, via Edge Function)
// ---------------------------------------------------------------------------

export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateUserData) => {
      const service = await getUsersService();
      return service.createUser(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}
