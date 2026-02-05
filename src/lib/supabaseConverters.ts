/**
 * Supabase Database Row <-> Application Type Converters
 * PRD-063: Fundacao Supabase + Autenticacao
 *
 * Converts between snake_case database rows and camelCase TypeScript interfaces.
 */

import type { Database } from '@/types/database';
import type { User } from '@/types/user';
import type { Candidate } from '@/types/candidate';
import type { Company } from '@/types/company';

type ProfileRow = Database['public']['Tables']['profiles']['Row'];
type CandidateRow = Database['public']['Tables']['candidates']['Row'];
type CompanyRow = Database['public']['Tables']['companies']['Row'];

/**
 * Converts a profiles DB row to the application User interface.
 */
export function profileRowToUser(row: ProfileRow): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    type: row.type,
    avatar: row.avatar_url ?? undefined,
    createdAt: row.created_at,
    roleId: row.role_id ?? undefined,
    status: row.status as User['status'],
    lastAccessAt: row.last_access_at ?? undefined,
    groupIds: row.group_ids,
  };
}

/**
 * Converts a candidates DB row to the application Candidate interface.
 * Note: testResult is NOT stored in this table (managed separately).
 */
export function candidateRowToCandidate(row: CandidateRow): Candidate {
  return {
    id: row.id,
    userId: row.profile_id,
    name: row.name,
    email: row.email,
    avatar: row.avatar_url ?? undefined,
    title: row.title,
    location: row.location,
    experience: row.experience_years,
    education: row.education,
    skills: row.skills,
    salary: {
      min: row.salary_min ?? 0,
      max: row.salary_max ?? 0,
    },
    availability: row.availability,
    profileCompletion: row.profile_completion,
    hasTest: row.has_test,
    status: row.status,
    createdAt: row.created_at,
    deactivatedAt: row.deactivated_at ?? undefined,
    phone: row.phone ?? undefined,
    cpf: (row as CandidateRow & { cpf?: string }).cpf ?? undefined,
    linkedin: row.linkedin ?? undefined,
    about: row.about ?? undefined,
    plan: (row.plan as Candidate['plan']) ?? undefined,
    dateOfBirth: row.date_of_birth ?? undefined,
    visibility: row.visibility_mode
      ? {
          mode: row.visibility_mode,
          anonymousId: row.anonymous_id ?? '',
        }
      : undefined,
    // Campos de perfil consolidado
    displayName: row.display_name ?? undefined,
    city: row.city ?? undefined,
    state: row.state ?? undefined,
    openToRelocation: row.open_to_relocation ?? false,
  };
}

/**
 * Converts a companies DB row to the application Company interface.
 */
export function companyRowToCompany(row: CompanyRow): Company {
  return {
    id: row.id,
    userId: row.profile_id,
    name: row.name,
    cnpj: row.cnpj ?? '',
    logo: row.logo_url ?? undefined,
    industry: row.industry,
    size: row.size,
    location: row.location,
    description: row.description,
    website: row.website ?? undefined,
    linkedin: row.linkedin ?? undefined,
    phone: row.phone ?? undefined,
    city: row.city,
    state: row.state,
    address: row.address ?? undefined,
    activeJobs: row.active_jobs,
    totalCandidates: row.total_candidates,
    status: row.status,
    plan: row.plan as Company['plan'],
    createdAt: row.created_at,
    paymentStatus: row.payment_status as Company['paymentStatus'],
    deactivatedAt: row.deactivated_at ?? undefined,
  };
}
