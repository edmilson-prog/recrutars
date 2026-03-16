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
    // Sync name/email to auth.users via Edge Function (before updating profiles)
    if (updates.name !== undefined || updates.email !== undefined) {
      const { data: session } = await supabase.auth.getSession();
      const adminId = session?.session?.user?.id;

      const { data: fnResult, error: fnError } = await supabase.functions.invoke(
        'admin-update-user',
        {
          body: {
            user_id: id,
            email: updates.email ?? undefined,
            name: updates.name ?? undefined,
            admin_id: adminId,
          },
        },
      );

      if (fnError) {
        throw new Error(`Failed to sync auth user: ${fnError.message}`);
      }

      if (fnResult && !fnResult.success) {
        throw new Error(`Failed to sync auth user: ${fnResult.error ?? 'Unknown error'}`);
      }
    }

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

    const userId = result.userId;

    // Persist candidate-specific profile data
    if (data.type === 'candidate' && data.candidateProfile) {
      const cp = data.candidateProfile;
      const updates: Record<string, unknown> = {};
      if (cp.cpf) updates.cpf = cp.cpf;
      if (cp.dateOfBirth) updates.date_of_birth = cp.dateOfBirth;
      if (cp.gender) updates.gender = cp.gender;
      if (cp.maritalStatus) updates.marital_status = cp.maritalStatus;
      if (cp.nationality) updates.nationality = cp.nationality;
      if (cp.state) updates.state = cp.state;
      if (cp.city) updates.city = cp.city;

      if (Object.keys(updates).length > 0) {
        // If all personal profile fields are filled, skip onboarding step
        if (cp.cpf && cp.dateOfBirth && cp.gender && cp.maritalStatus && cp.state && cp.city) {
          updates.onboarding_step = 'professional_profile';
        }

        await supabase
          .from('candidates')
          .update(updates)
          .eq('profile_id', userId);
      }
    }

    // Persist company-specific profile data
    if (data.type === 'company' && data.companyProfile) {
      const co = data.companyProfile;
      const updates: Record<string, unknown> = {};
      if (co.cnpj) updates.cnpj = co.cnpj;
      if (co.razaoSocial) updates.razao_social = co.razaoSocial;
      if (co.nomeFantasia) updates.nome_fantasia = co.nomeFantasia;
      if (co.cep) updates.cep = co.cep;
      if (co.logradouro) updates.logradouro = co.logradouro;
      if (co.numero) updates.numero = co.numero;
      if (co.complemento) updates.complemento = co.complemento;
      if (co.bairro) updates.bairro = co.bairro;
      if (co.city) updates.city = co.city;
      if (co.state) updates.state = co.state;
      if (co.industry) updates.industry = co.industry;
      if (co.size) updates.size = co.size;
      if (co.website) updates.website = co.website;
      if (co.linkedin) updates.linkedin = co.linkedin;

      if (Object.keys(updates).length > 0) {
        await supabase
          .from('companies')
          .update(updates)
          .eq('profile_id', userId);
      }
    }

    return { userId };
  }

  // -----------------------------------------------------------------------
  // Password management (admin only, via Edge Function)
  // -----------------------------------------------------------------------

  async setUserPassword(userId: string, password: string, adminId: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('admin-manage-password', {
      body: { action: 'set_password', user_id: userId, password, admin_id: adminId },
    });
    if (error) throw new Error(error.message ?? 'Erro ao redefinir senha');
    if (data?.error) throw new Error(data.error);
  }

  async sendPasswordResetEmail(userId: string, adminId: string): Promise<void> {
    const { data, error } = await supabase.functions.invoke('admin-manage-password', {
      body: { action: 'send_reset_email', user_id: userId, admin_id: adminId },
    });
    if (error) throw new Error(error.message ?? 'Erro ao enviar email de redefinição');
    if (data?.error) throw new Error(data.error);
  }
}
