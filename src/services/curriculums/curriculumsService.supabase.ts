/**
 * Curriculums Service — Supabase Implementation
 * PRD-073: Perfil Profissional Unificado
 *
 * Queries the `curriculums` table (1:1 per candidate) with joins on sub-entity tables:
 *   curriculum_experiences, curriculum_education,
 *   curriculum_skills, curriculum_courses
 *
 * Converts snake_case DB columns to camelCase domain types.
 */

import { supabase } from '@/lib/supabase';
import { toTitleCase } from '@/lib/utils';
import type {
  Curriculum,
  ExperienceWithCurrent,
  EducationWithStatus,
  SkillWithLevel,
  Course,
  EducationStatus,
  SkillLevel,
  SkillType,
  CertificateType,
} from '@/types/curriculum';
import type { ICurriculumsService } from './curriculumsService';

// ---------------------------------------------------------------------------
// Row ↔ Domain mapping helpers
// ---------------------------------------------------------------------------

function rowToExperience(r: Record<string, unknown>): ExperienceWithCurrent {
  return {
    id: r.id as string,
    company: r.company as string,
    role: r.role as string,
    startDate: r.start_date as string,
    endDate: (r.end_date as string) || undefined,
    current: r.is_current as boolean,
    description: r.description as string,
  };
}

function rowToEducation(r: Record<string, unknown>): EducationWithStatus {
  return {
    id: r.id as string,
    institution: r.institution as string,
    degree: r.degree as string,
    field: r.field as string,
    startYear: r.start_year as string,
    endYear: (r.end_year as string) || undefined,
    status: r.status as EducationStatus,
  };
}

function rowToSkill(r: Record<string, unknown>): SkillWithLevel {
  return {
    id: r.id as string,
    name: r.name as string,
    level: r.level as SkillLevel,
    type: r.type as SkillType,
  };
}

function rowToCourse(r: Record<string, unknown>): Course {
  return {
    id: r.id as string,
    name: r.name as string,
    institution: r.institution as string,
    year: r.year as number,
    hours: (r.hours as number) || undefined,
    certificateType: (r.certificate_type as CertificateType) || undefined,
    certificateUrl: (r.certificate_url as string) || undefined,
    certificateFileName: (r.certificate_file_name as string) || undefined,
  };
}

/** Maps a Supabase curriculum row (with joined sub-entities) to the app-level Curriculum type. */
function rowToCurriculum(row: Record<string, unknown>): Curriculum {
  const experiences = Array.isArray(row.curriculum_experiences)
    ? (row.curriculum_experiences as Record<string, unknown>[]).map(rowToExperience)
    : [];
  const education = Array.isArray(row.curriculum_education)
    ? (row.curriculum_education as Record<string, unknown>[]).map(rowToEducation)
    : [];
  const skills = Array.isArray(row.curriculum_skills)
    ? (row.curriculum_skills as Record<string, unknown>[]).map(rowToSkill)
    : [];
  const courses = Array.isArray(row.curriculum_courses)
    ? (row.curriculum_courses as Record<string, unknown>[]).map(rowToCourse)
    : [];

  return {
    id: row.id as string,
    candidateId: row.candidate_id as string,
    name: (row.name as string) || 'Perfil Profissional',
    isDefault: row.is_default as boolean,
    isArchived: row.is_archived as boolean,
    title: row.title as string,
    location: row.location as string,
    city: (row.city as string) || undefined,
    state: (row.state as string) || undefined,
    phone: (row.phone as string) || undefined,
    email: row.email as string,
    linkedin: (row.linkedin as string) || undefined,
    about: (row.about as string) || undefined,
    availability: row.availability as string,
    salary: {
      min: Number(row.salary_min) || 0,
      max: Number(row.salary_max) || 0,
    },
    openToRelocation: (row.open_to_relocation as boolean) || false,
    salaryNegotiable: (row.salary_negotiable as boolean) || false,
    preferredSectors: (row.preferred_sectors as string[]) || [],
    preferredRoles: (row.preferred_roles as string[]) || [],
    workModel: (row.work_model as string[]) || [],
    contractType: (row.contract_type as string[]) || [],
    isFirstJob: (row.is_first_job as boolean) || false,
    educationLevel: (row.education_level as string) || undefined,
    educationLevelStatus: (row.education_level_status as string) || 'completo',
    experiences,
    education,
    skills,
    courses,
    resumePdfUrl: (row.resume_pdf_url as string) || undefined,
    resumePdfName: (row.resume_pdf_name as string) || undefined,
    resumePdfSize: (row.resume_pdf_size as number) || undefined,
    resumePdfUploadedAt: (row.resume_pdf_uploaded_at as string) || undefined,
    presentationVideoUrl: (row.presentation_video_url as string) || undefined,
    presentationVideoType: (row.presentation_video_type as 'upload' | 'external') || undefined,
    presentationVideoName: (row.presentation_video_name as string) || undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

// ---------------------------------------------------------------------------
// Domain -> Row mappers for the replace_curriculum_children RPC payload
// ---------------------------------------------------------------------------

function experienceToRow(exp: ExperienceWithCurrent, index: number) {
  return {
    company: exp.company,
    role: exp.role,
    start_date: exp.startDate,
    end_date: exp.endDate ?? null,
    is_current: exp.current,
    description: exp.description,
    sort_order: index,
  };
}

function educationToRow(edu: EducationWithStatus, index: number) {
  return {
    institution: edu.institution,
    degree: edu.degree,
    field: edu.field,
    start_year: edu.startYear,
    end_year: edu.endYear ?? null,
    status: edu.status,
    sort_order: index,
  };
}

function skillToRow(skill: SkillWithLevel) {
  return {
    name: skill.name,
    level: skill.level,
    type: skill.type,
  };
}

function courseToRow(course: Course) {
  return {
    name: course.name,
    institution: course.institution,
    year: course.year,
    hours: course.hours ?? null,
    certificate_type: course.certificateType ?? null,
    certificate_url: course.certificateUrl ?? null,
    certificate_file_name: course.certificateFileName ?? null,
  };
}

/** The select expression that joins all sub-entity tables. */
const CURRICULUM_SELECT = `
  *,
  curriculum_experiences ( * ),
  curriculum_education ( * ),
  curriculum_skills ( * ),
  curriculum_courses ( * )
`;

// ---------------------------------------------------------------------------
// Implementation
// ---------------------------------------------------------------------------

export class SupabaseCurriculumsService implements ICurriculumsService {
  async getProfile(candidateId: string): Promise<Curriculum | null> {
    const { data, error } = await supabase
      .from('curriculums')
      .select(CURRICULUM_SELECT)
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return data ? rowToCurriculum(data as Record<string, unknown>) : null;
  }

  async getProfileForCompany(candidateId: string): Promise<Curriculum | null> {
    // 1) Parent row from the masked view — NO embeds (embedding children
    //    through a view is unsupported by PostgREST).
    const { data: parent, error: parentError } = await supabase
      .from('curriculums_for_company' as never)
      .select('*')
      .eq('candidate_id', candidateId)
      .maybeSingle();

    if (parentError) {
      throw new Error(`Failed to fetch company profile: ${parentError.message}`);
    }
    if (!parent) return null;

    const parentRow = parent as Record<string, unknown>;
    const curriculumId = parentRow.id as string;

    // 2) Children in separate queries by curriculum_id (their *_select_company
    //    policies remain in place and govern visibility).
    const [expRes, eduRes, skillRes, courseRes] = await Promise.all([
      supabase.from('curriculum_experiences').select('*').eq('curriculum_id', curriculumId).order('sort_order', { ascending: true }),
      supabase.from('curriculum_education').select('*').eq('curriculum_id', curriculumId).order('sort_order', { ascending: true }),
      supabase.from('curriculum_skills').select('*').eq('curriculum_id', curriculumId),
      supabase.from('curriculum_courses').select('*').eq('curriculum_id', curriculumId),
    ]);

    if (expRes.error) throw new Error(`Failed to fetch experiences: ${expRes.error.message}`);
    if (eduRes.error) throw new Error(`Failed to fetch education: ${eduRes.error.message}`);
    if (skillRes.error) throw new Error(`Failed to fetch skills: ${skillRes.error.message}`);
    if (courseRes.error) throw new Error(`Failed to fetch courses: ${courseRes.error.message}`);

    // 3) Assemble manually: reuse rowToCurriculum by injecting children under
    //    the keys it expects (curriculum_experiences, etc.).
    return rowToCurriculum({
      ...parentRow,
      curriculum_experiences: expRes.data ?? [],
      curriculum_education: eduRes.data ?? [],
      curriculum_skills: skillRes.data ?? [],
      curriculum_courses: courseRes.data ?? [],
    });
  }

  async ensureProfile(candidateId: string, initialData?: Partial<Curriculum>): Promise<Curriculum> {
    // Try to fetch existing profile
    const existing = await this.getProfile(candidateId);
    if (existing) return existing;

    // Create a new profile with defaults
    const { data: row, error } = await supabase
      .from('curriculums')
      .insert({
        candidate_id: candidateId,
        name: 'Perfil Profissional',
        is_default: true,
        is_archived: false,
        title: initialData?.title ?? '',
        location: initialData?.location ?? '',
        city: initialData?.city ?? null,
        state: initialData?.state ?? null,
        phone: initialData?.phone ?? null,
        email: initialData?.email ?? '',
        linkedin: initialData?.linkedin ?? null,
        about: initialData?.about ?? null,
        availability: initialData?.availability ?? '',
        salary_min: initialData?.salary?.min ?? 0,
        salary_max: initialData?.salary?.max ?? 0,
        open_to_relocation: initialData?.openToRelocation ?? false,
        salary_negotiable: initialData?.salaryNegotiable ?? false,
        preferred_sectors: initialData?.preferredSectors ?? [],
        preferred_roles: initialData?.preferredRoles ?? [],
        work_model: initialData?.workModel ?? [],
        contract_type: initialData?.contractType ?? [],
        is_first_job: initialData?.isFirstJob ?? false,
        education_level: initialData?.educationLevel ?? null,
        education_level_status: initialData?.educationLevelStatus ?? 'completo',
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create profile: ${error.message}`);
    }

    // Fetch the full profile with sub-entities
    const result = await this.getCurriculum(row.id as string);
    if (!result) {
      throw new Error('Failed to fetch created profile');
    }
    return result;
  }

  async getCurriculum(id: string): Promise<Curriculum | null> {
    const { data, error } = await supabase
      .from('curriculums')
      .select(CURRICULUM_SELECT)
      .eq('id', id)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to fetch curriculum: ${error.message}`);
    }

    return data ? rowToCurriculum(data as Record<string, unknown>) : null;
  }

  async updateCurriculum(id: string, updates: Partial<Curriculum>): Promise<Curriculum> {
    // 1. Update main curriculum fields
    const mainUpdates: Record<string, unknown> = {};

    if (updates.name !== undefined) mainUpdates.name = updates.name;
    if (updates.title !== undefined) mainUpdates.title = toTitleCase(updates.title);
    if (updates.location !== undefined) mainUpdates.location = updates.location;
    if (updates.city !== undefined) mainUpdates.city = updates.city;
    if (updates.state !== undefined) mainUpdates.state = updates.state;
    if (updates.phone !== undefined) mainUpdates.phone = updates.phone;
    if (updates.email !== undefined) mainUpdates.email = updates.email;
    if (updates.linkedin !== undefined) mainUpdates.linkedin = updates.linkedin;
    if (updates.about !== undefined) mainUpdates.about = updates.about;
    if (updates.availability !== undefined) mainUpdates.availability = updates.availability;
    if (updates.openToRelocation !== undefined) mainUpdates.open_to_relocation = updates.openToRelocation;
    if (updates.salaryNegotiable !== undefined) mainUpdates.salary_negotiable = updates.salaryNegotiable;
    if (updates.preferredSectors !== undefined) mainUpdates.preferred_sectors = updates.preferredSectors;
    if (updates.preferredRoles !== undefined) mainUpdates.preferred_roles = updates.preferredRoles;
    if (updates.workModel !== undefined) mainUpdates.work_model = updates.workModel;
    if (updates.contractType !== undefined) mainUpdates.contract_type = updates.contractType;
    if (updates.isFirstJob !== undefined) mainUpdates.is_first_job = updates.isFirstJob;
    if (updates.educationLevel !== undefined) mainUpdates.education_level = updates.educationLevel;
    if (updates.educationLevelStatus !== undefined) mainUpdates.education_level_status = updates.educationLevelStatus;
    if (updates.salary !== undefined) {
      mainUpdates.salary_min = updates.salary.min;
      mainUpdates.salary_max = updates.salary.max;
    }
    if (updates.resumePdfUrl !== undefined) mainUpdates.resume_pdf_url = updates.resumePdfUrl;
    if (updates.resumePdfName !== undefined) mainUpdates.resume_pdf_name = updates.resumePdfName;
    if (updates.resumePdfSize !== undefined) mainUpdates.resume_pdf_size = updates.resumePdfSize;
    if (updates.resumePdfUploadedAt !== undefined) mainUpdates.resume_pdf_uploaded_at = updates.resumePdfUploadedAt;
    if (updates.presentationVideoUrl !== undefined) mainUpdates.presentation_video_url = updates.presentationVideoUrl;
    if (updates.presentationVideoType !== undefined) mainUpdates.presentation_video_type = updates.presentationVideoType;
    if (updates.presentationVideoName !== undefined) mainUpdates.presentation_video_name = updates.presentationVideoName;

    if (Object.keys(mainUpdates).length > 0) {
      const { error } = await supabase
        .from('curriculums')
        .update(mainUpdates)
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to update profile: ${error.message}`);
      }
    }

    // 2. Replace sub-entities atomically via RPC (single transaction).
    //    Client-side DELETE + INSERT pairs could wipe data when the INSERT
    //    failed after the DELETE had already committed.
    const childPayload = {
      p_curriculum_id: id,
      p_experiences:
        updates.experiences !== undefined ? updates.experiences.map(experienceToRow) : null,
      p_education:
        updates.education !== undefined ? updates.education.map(educationToRow) : null,
      p_skills: updates.skills !== undefined ? updates.skills.map(skillToRow) : null,
      p_courses: updates.courses !== undefined ? updates.courses.map(courseToRow) : null,
    };

    if (
      childPayload.p_experiences !== null ||
      childPayload.p_education !== null ||
      childPayload.p_skills !== null ||
      childPayload.p_courses !== null
    ) {
      const { error } = await supabase.rpc('replace_curriculum_children', childPayload);
      if (error) {
        throw new Error(`Failed to update profile sections: ${error.message}`);
      }
    }

    // 3. Sync key fields to candidates table for search/matching
    const result = await this.getCurriculum(id);
    if (!result) {
      throw new Error(`Profile not found after update: ${id}`);
    }

    const candidateSync: Record<string, unknown> = {};
    if (updates.title !== undefined) candidateSync.title = toTitleCase(updates.title);
    if (updates.location !== undefined) candidateSync.location = updates.location;
    if (updates.city !== undefined) candidateSync.city = updates.city;
    if (updates.state !== undefined) candidateSync.state = updates.state;
    if (updates.openToRelocation !== undefined) candidateSync.open_to_relocation = updates.openToRelocation;
    if (updates.linkedin !== undefined) candidateSync.linkedin = updates.linkedin;
    if (updates.about !== undefined) candidateSync.about = updates.about;
    if (updates.salaryNegotiable !== undefined) candidateSync.salary_negotiable = updates.salaryNegotiable;
    if (updates.preferredSectors !== undefined) candidateSync.preferred_sectors = updates.preferredSectors;
    if (updates.preferredRoles !== undefined) candidateSync.preferred_roles = updates.preferredRoles;
    if (updates.workModel !== undefined) candidateSync.work_model = updates.workModel;
    if (updates.contractType !== undefined) candidateSync.contract_type = updates.contractType;
    if (updates.salary !== undefined) {
      candidateSync.salary_min = updates.salary.min;
      candidateSync.salary_max = updates.salary.max;
    }

    if (Object.keys(candidateSync).length > 0) {
      await supabase
        .from('candidates')
        .update(candidateSync)
        .eq('id', result.candidateId);
    }

    // 4. Return updated profile
    return result;
  }
}
