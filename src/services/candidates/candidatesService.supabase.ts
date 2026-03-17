/**
 * Candidates Service — Supabase Implementation
 * PRD-066: Service Layer Pattern
 *
 * Reads/writes the `candidates` table via the Supabase client
 * and converts rows with candidateRowToCandidate.
 */

import { supabase } from '@/lib/supabase';
import { toTitleCase } from '@/lib/utils';
import { candidateRowToCandidate } from '@/lib/supabaseConverters';
import type { Candidate } from '@/types/candidate';
import type { PaginatedResult, PaginationConfig, SortConfig } from '../types';
import type { CandidateFilters, ICandidatesService } from './candidatesService';

// Map camelCase sort fields to snake_case DB columns
const SORT_FIELD_MAP: Record<string, string> = {
  name: 'name',
  email: 'email',
  title: 'title',
  location: 'location',
  experience: 'experience_years',
  profileCompletion: 'profile_completion',
  createdAt: 'created_at',
  status: 'status',
  plan: 'plan',
};

export class CandidatesServiceSupabase implements ICandidatesService {
  // -----------------------------------------------------------------------
  // List with filters, pagination and sorting
  // -----------------------------------------------------------------------

  async getCandidates(
    filters?: CandidateFilters,
    pagination?: PaginationConfig,
    sort?: SortConfig,
  ): Promise<PaginatedResult<Candidate>> {
    let query = supabase.from('candidates').select('*', { count: 'exact' });

    // --- Filters -----------------------------------------------------------

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.search) {
      const term = `%${filters.search}%`;
      query = query.or(`name.ilike.${term},email.ilike.${term},title.ilike.${term}`);
    }

    if (filters?.skills && filters.skills.length > 0) {
      // overlaps: candidate must have at least one of the requested skills
      query = query.overlaps('skills', filters.skills);
    }

    if (filters?.location) {
      query = query.ilike('location', `%${filters.location}%`);
    }

    if (filters?.hasTest !== undefined) {
      query = query.eq('has_test', filters.hasTest);
    }

    if (filters?.plan) {
      query = query.eq('plan', filters.plan);
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
      throw new Error(`Failed to fetch candidates: ${error.message}`);
    }

    const total = count ?? 0;
    const candidates = (data ?? []).map(candidateRowToCandidate);

    return {
      data: candidates,
      total,
      page,
      pageSize,
      hasMore: from + pageSize < total,
    };
  }

  // -----------------------------------------------------------------------
  // Single record by id
  // -----------------------------------------------------------------------

  async getCandidate(id: string): Promise<Candidate | null> {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch candidate: ${error.message}`);
    }

    return data ? candidateRowToCandidate(data) : null;
  }

  // -----------------------------------------------------------------------
  // Single record by profile (user) id
  // -----------------------------------------------------------------------

  async getCandidateByProfileId(profileId: string): Promise<Candidate | null> {
    const { data, error } = await supabase
      .from('candidates')
      .select('*')
      .eq('profile_id', profileId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch candidate by profile: ${error.message}`);
    }

    return data ? candidateRowToCandidate(data) : null;
  }

  // -----------------------------------------------------------------------
  // Update
  // -----------------------------------------------------------------------

  async updateCandidate(
    id: string,
    updates: Partial<Candidate>,
  ): Promise<Candidate> {
    // Convert camelCase updates to snake_case DB columns
    const dbUpdates: Record<string, unknown> = {};

    if (updates.name !== undefined) dbUpdates.name = updates.name.toUpperCase().trim();
    if (updates.email !== undefined) dbUpdates.email = updates.email;
    if (updates.avatar !== undefined) dbUpdates.avatar_url = updates.avatar;
    if (updates.title !== undefined) dbUpdates.title = toTitleCase(updates.title);
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.experience !== undefined) dbUpdates.experience_years = updates.experience;
    if (updates.education !== undefined) dbUpdates.education = updates.education;
    if (updates.skills !== undefined) dbUpdates.skills = updates.skills;
    if (updates.salary !== undefined) {
      dbUpdates.salary_min = updates.salary.min;
      dbUpdates.salary_max = updates.salary.max;
    }
    if (updates.availability !== undefined) dbUpdates.availability = updates.availability;
    if (updates.profileCompletion !== undefined) dbUpdates.profile_completion = updates.profileCompletion;
    if (updates.hasTest !== undefined) dbUpdates.has_test = updates.hasTest;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.deactivatedAt !== undefined) dbUpdates.deactivated_at = updates.deactivatedAt;
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;
    if (updates.linkedin !== undefined) dbUpdates.linkedin = updates.linkedin;
    if (updates.about !== undefined) dbUpdates.about = updates.about;
    if (updates.plan !== undefined) dbUpdates.plan = updates.plan;
    if (updates.dateOfBirth !== undefined) dbUpdates.date_of_birth = updates.dateOfBirth;
    if (updates.visibility !== undefined) {
      dbUpdates.visibility_mode = updates.visibility.mode;
      dbUpdates.anonymous_id = updates.visibility.anonymousId;
    }
    // Campos de perfil consolidado
    if (updates.displayName !== undefined) dbUpdates.display_name = updates.displayName.toUpperCase().trim();
    if (updates.city !== undefined) dbUpdates.city = updates.city;
    if (updates.state !== undefined) dbUpdates.state = updates.state;
    if (updates.openToRelocation !== undefined) dbUpdates.open_to_relocation = updates.openToRelocation;
    // Preferências de Vagas
    if (updates.preferredSectors !== undefined) dbUpdates.preferred_sectors = updates.preferredSectors;
    if (updates.preferredRoles !== undefined) dbUpdates.preferred_roles = updates.preferredRoles;
    if (updates.workModel !== undefined) dbUpdates.work_model = updates.workModel;
    if (updates.contractType !== undefined) dbUpdates.contract_type = updates.contractType;
    if (updates.salaryNegotiable !== undefined) dbUpdates.salary_negotiable = updates.salaryNegotiable;
    // Privacidade
    if (updates.showSalaryExpectation !== undefined) dbUpdates.show_salary_expectation = updates.showSalaryExpectation;
    if (updates.resumeVisibility !== undefined) dbUpdates.resume_visibility = updates.resumeVisibility;
    // PRD-083: Onboarding
    if (updates.onboardingStep !== undefined) dbUpdates.onboarding_step = updates.onboardingStep;
    if (updates.gender !== undefined) dbUpdates.gender = updates.gender;
    if (updates.maritalStatus !== undefined) dbUpdates.marital_status = updates.maritalStatus;
    if (updates.nationality !== undefined) dbUpdates.nationality = updates.nationality;
    if (updates.termsAcceptedAt !== undefined) dbUpdates.terms_accepted_at = updates.termsAcceptedAt;
    if (updates.privacyAcceptedAt !== undefined) dbUpdates.privacy_accepted_at = updates.privacyAcceptedAt;
    if (updates.lgpdConsentAt !== undefined) dbUpdates.lgpd_consent_at = updates.lgpdConsentAt;
    if (updates.cpf !== undefined) dbUpdates.cpf = updates.cpf;
    if (updates.visibilityLocked !== undefined) dbUpdates.visibility_locked = updates.visibilityLocked;

    const { data, error } = await supabase
      .from('candidates')
      .update(dbUpdates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      throw new Error(`Failed to update candidate: ${error.message}`);
    }

    return candidateRowToCandidate(data);
  }
}
