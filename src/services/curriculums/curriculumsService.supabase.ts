/**
 * Curriculums Service — Supabase Implementation
 * PRD-066: Service Layer Pattern
 *
 * Queries the `curriculums` table with joins on sub-entity tables:
 *   curriculum_experiences, curriculum_education,
 *   curriculum_skills, curriculum_courses
 *
 * Converts snake_case DB columns to camelCase domain types.
 */

import { supabase } from '@/lib/supabase';
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
    name: row.name as string,
    isDefault: row.is_default as boolean,
    isArchived: row.is_archived as boolean,
    title: row.title as string,
    location: row.location as string,
    phone: (row.phone as string) || undefined,
    email: row.email as string,
    linkedin: (row.linkedin as string) || undefined,
    about: (row.about as string) || undefined,
    availability: row.availability as string,
    salary: {
      min: Number(row.salary_min) || 0,
      max: Number(row.salary_max) || 0,
    },
    experiences,
    education,
    skills,
    courses,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
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
  async getCurriculums(candidateId: string): Promise<Curriculum[]> {
    const { data, error } = await supabase
      .from('curriculums')
      .select(CURRICULUM_SELECT)
      .eq('candidate_id', candidateId)
      .order('is_default', { ascending: false })
      .order('updated_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch curriculums: ${error.message}`);
    }

    return (data ?? []).map((row) => rowToCurriculum(row as Record<string, unknown>));
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

  async createCurriculum(
    input: Omit<Curriculum, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Curriculum> {
    // If this is set as default, unset previous default for this candidate
    if (input.isDefault) {
      await this.unsetDefaults(input.candidateId);
    }

    // 1. Insert the main curriculum row
    const { data: curriculumRow, error: curriculumError } = await supabase
      .from('curriculums')
      .insert({
        candidate_id: input.candidateId,
        name: input.name,
        is_default: input.isDefault,
        is_archived: input.isArchived,
        title: input.title,
        location: input.location,
        phone: input.phone ?? null,
        email: input.email,
        linkedin: input.linkedin ?? null,
        about: input.about ?? null,
        availability: input.availability,
        salary_min: input.salary.min,
        salary_max: input.salary.max,
      })
      .select()
      .single();

    if (curriculumError) {
      throw new Error(`Failed to create curriculum: ${curriculumError.message}`);
    }

    const curriculumId = curriculumRow.id as string;

    // 2. Insert sub-entities in parallel
    await Promise.all([
      this.insertExperiences(curriculumId, input.experiences),
      this.insertEducation(curriculumId, input.education),
      this.insertSkills(curriculumId, input.skills),
      this.insertCourses(curriculumId, input.courses),
    ]);

    // 3. Fetch the full curriculum with sub-entities
    const result = await this.getCurriculum(curriculumId);
    if (!result) {
      throw new Error('Failed to fetch created curriculum');
    }
    return result;
  }

  async updateCurriculum(id: string, updates: Partial<Curriculum>): Promise<Curriculum> {
    // If setting as default, unset previous default for this candidate
    if (updates.isDefault) {
      // Fetch the current curriculum to get candidateId
      const existing = await this.getCurriculum(id);
      if (!existing) {
        throw new Error(`Curriculum not found: ${id}`);
      }
      await this.unsetDefaults(existing.candidateId, id);
    }

    // 1. Update main curriculum fields
    const mainUpdates: Record<string, unknown> = {};

    if (updates.name !== undefined) mainUpdates.name = updates.name;
    if (updates.isDefault !== undefined) mainUpdates.is_default = updates.isDefault;
    if (updates.isArchived !== undefined) mainUpdates.is_archived = updates.isArchived;
    if (updates.title !== undefined) mainUpdates.title = updates.title;
    if (updates.location !== undefined) mainUpdates.location = updates.location;
    if (updates.phone !== undefined) mainUpdates.phone = updates.phone;
    if (updates.email !== undefined) mainUpdates.email = updates.email;
    if (updates.linkedin !== undefined) mainUpdates.linkedin = updates.linkedin;
    if (updates.about !== undefined) mainUpdates.about = updates.about;
    if (updates.availability !== undefined) mainUpdates.availability = updates.availability;
    if (updates.salary !== undefined) {
      mainUpdates.salary_min = updates.salary.min;
      mainUpdates.salary_max = updates.salary.max;
    }

    if (Object.keys(mainUpdates).length > 0) {
      const { error } = await supabase
        .from('curriculums')
        .update(mainUpdates)
        .eq('id', id);

      if (error) {
        throw new Error(`Failed to update curriculum: ${error.message}`);
      }
    }

    // 2. Replace sub-entities if provided (delete + re-insert)
    const subOps: Promise<void>[] = [];

    if (updates.experiences !== undefined) {
      subOps.push(this.replaceExperiences(id, updates.experiences));
    }
    if (updates.education !== undefined) {
      subOps.push(this.replaceEducation(id, updates.education));
    }
    if (updates.skills !== undefined) {
      subOps.push(this.replaceSkills(id, updates.skills));
    }
    if (updates.courses !== undefined) {
      subOps.push(this.replaceCourses(id, updates.courses));
    }

    if (subOps.length > 0) {
      await Promise.all(subOps);
    }

    // 3. Return updated curriculum
    const result = await this.getCurriculum(id);
    if (!result) {
      throw new Error(`Curriculum not found after update: ${id}`);
    }
    return result;
  }

  async deleteCurriculum(id: string): Promise<void> {
    // Sub-entities will be cascade-deleted via FK constraints
    const { error } = await supabase.from('curriculums').delete().eq('id', id);

    if (error) {
      throw new Error(`Failed to delete curriculum: ${error.message}`);
    }
  }

  async setDefault(candidateId: string, curriculumId: string): Promise<void> {
    // Unset all defaults for this candidate
    await this.unsetDefaults(candidateId);

    // Set the new default
    const { error } = await supabase
      .from('curriculums')
      .update({ is_default: true })
      .eq('id', curriculumId)
      .eq('candidate_id', candidateId);

    if (error) {
      throw new Error(`Failed to set default curriculum: ${error.message}`);
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers — sub-entity management
  // ---------------------------------------------------------------------------

  private async unsetDefaults(candidateId: string, excludeId?: string): Promise<void> {
    let query = supabase
      .from('curriculums')
      .update({ is_default: false })
      .eq('candidate_id', candidateId)
      .eq('is_default', true);

    if (excludeId) {
      query = query.neq('id', excludeId);
    }

    const { error } = await query;
    if (error) {
      throw new Error(`Failed to unset default curriculums: ${error.message}`);
    }
  }

  // ---- Experiences ----

  private async insertExperiences(
    curriculumId: string,
    experiences: ExperienceWithCurrent[],
  ): Promise<void> {
    if (experiences.length === 0) return;

    const rows = experiences.map((exp, index) => ({
      curriculum_id: curriculumId,
      company: exp.company,
      role: exp.role,
      start_date: exp.startDate,
      end_date: exp.endDate ?? null,
      is_current: exp.current,
      description: exp.description,
      sort_order: index,
    }));

    const { error } = await supabase.from('curriculum_experiences').insert(rows);
    if (error) {
      throw new Error(`Failed to insert experiences: ${error.message}`);
    }
  }

  private async replaceExperiences(
    curriculumId: string,
    experiences: ExperienceWithCurrent[],
  ): Promise<void> {
    const { error: delError } = await supabase
      .from('curriculum_experiences')
      .delete()
      .eq('curriculum_id', curriculumId);
    if (delError) {
      throw new Error(`Failed to delete experiences: ${delError.message}`);
    }
    await this.insertExperiences(curriculumId, experiences);
  }

  // ---- Education ----

  private async insertEducation(
    curriculumId: string,
    education: EducationWithStatus[],
  ): Promise<void> {
    if (education.length === 0) return;

    const rows = education.map((edu, index) => ({
      curriculum_id: curriculumId,
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field,
      start_year: edu.startYear,
      end_year: edu.endYear ?? null,
      status: edu.status,
      sort_order: index,
    }));

    const { error } = await supabase.from('curriculum_education').insert(rows);
    if (error) {
      throw new Error(`Failed to insert education: ${error.message}`);
    }
  }

  private async replaceEducation(
    curriculumId: string,
    education: EducationWithStatus[],
  ): Promise<void> {
    const { error: delError } = await supabase
      .from('curriculum_education')
      .delete()
      .eq('curriculum_id', curriculumId);
    if (delError) {
      throw new Error(`Failed to delete education: ${delError.message}`);
    }
    await this.insertEducation(curriculumId, education);
  }

  // ---- Skills ----

  private async insertSkills(
    curriculumId: string,
    skills: SkillWithLevel[],
  ): Promise<void> {
    if (skills.length === 0) return;

    const rows = skills.map((skill) => ({
      curriculum_id: curriculumId,
      name: skill.name,
      level: skill.level,
      type: skill.type,
    }));

    const { error } = await supabase.from('curriculum_skills').insert(rows);
    if (error) {
      throw new Error(`Failed to insert skills: ${error.message}`);
    }
  }

  private async replaceSkills(
    curriculumId: string,
    skills: SkillWithLevel[],
  ): Promise<void> {
    const { error: delError } = await supabase
      .from('curriculum_skills')
      .delete()
      .eq('curriculum_id', curriculumId);
    if (delError) {
      throw new Error(`Failed to delete skills: ${delError.message}`);
    }
    await this.insertSkills(curriculumId, skills);
  }

  // ---- Courses ----

  private async insertCourses(
    curriculumId: string,
    courses: Course[],
  ): Promise<void> {
    if (courses.length === 0) return;

    const rows = courses.map((course) => ({
      curriculum_id: curriculumId,
      name: course.name,
      institution: course.institution,
      year: course.year,
      hours: course.hours ?? null,
      certificate_type: course.certificateType ?? null,
      certificate_url: course.certificateUrl ?? null,
    }));

    const { error } = await supabase.from('curriculum_courses').insert(rows);
    if (error) {
      throw new Error(`Failed to insert courses: ${error.message}`);
    }
  }

  private async replaceCourses(
    curriculumId: string,
    courses: Course[],
  ): Promise<void> {
    const { error: delError } = await supabase
      .from('curriculum_courses')
      .delete()
      .eq('curriculum_id', curriculumId);
    if (delError) {
      throw new Error(`Failed to delete courses: ${delError.message}`);
    }
    await this.insertCourses(curriculumId, courses);
  }
}
