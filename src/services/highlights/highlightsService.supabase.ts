/**
 * Highlights Service — Supabase Implementation
 * PRD-073: Destaques de candidatura customizável
 *
 * Queries the `application_highlights` table.
 * Groups rows by item_type into the ApplicationHighlights shape.
 */

import { supabase } from '@/lib/supabase';
import type { ApplicationHighlights, HighlightItemType } from '@/types/applicationHighlight';
import type { IHighlightsService } from './highlightsService';

export class SupabaseHighlightsService implements IHighlightsService {
  async getHighlights(applicationId: string): Promise<ApplicationHighlights> {
    const { data, error } = await supabase
      .from('application_highlights')
      .select('item_type, item_id')
      .eq('application_id', applicationId);

    if (error) {
      throw new Error(`Failed to fetch highlights: ${error.message}`);
    }

    const result: ApplicationHighlights = {
      experienceIds: [],
      educationIds: [],
      skillIds: [],
      courseIds: [],
    };

    for (const row of data ?? []) {
      const type = row.item_type as HighlightItemType;
      const id = row.item_id as string;
      switch (type) {
        case 'experience':
          result.experienceIds.push(id);
          break;
        case 'education':
          result.educationIds.push(id);
          break;
        case 'skill':
          result.skillIds.push(id);
          break;
        case 'course':
          result.courseIds.push(id);
          break;
      }
    }

    return result;
  }

  async setHighlights(applicationId: string, highlights: ApplicationHighlights): Promise<void> {
    // Delete existing highlights
    const { error: delError } = await supabase
      .from('application_highlights')
      .delete()
      .eq('application_id', applicationId);

    if (delError) {
      throw new Error(`Failed to delete existing highlights: ${delError.message}`);
    }

    // Build rows to insert
    const rows: { application_id: string; item_type: HighlightItemType; item_id: string }[] = [];

    for (const id of highlights.experienceIds) {
      rows.push({ application_id: applicationId, item_type: 'experience', item_id: id });
    }
    for (const id of highlights.educationIds) {
      rows.push({ application_id: applicationId, item_type: 'education', item_id: id });
    }
    for (const id of highlights.skillIds) {
      rows.push({ application_id: applicationId, item_type: 'skill', item_id: id });
    }
    for (const id of highlights.courseIds) {
      rows.push({ application_id: applicationId, item_type: 'course', item_id: id });
    }

    if (rows.length === 0) return;

    const { error: insError } = await supabase
      .from('application_highlights')
      .insert(rows);

    if (insError) {
      throw new Error(`Failed to insert highlights: ${insError.message}`);
    }
  }
}
