import { supabase } from '@/lib/supabase';
import type {
  CandidateNote,
  NoteHistoryEntry,
  CreateCandidateNoteInput,
  UpdateNoteInput,
} from './types';
import type { CandidateNotesService } from './candidateNotesService';

interface RawCandidateNote {
  id: string;
  candidate_id: string;
  company_id: string;
  author_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  deleted_at: string | null;
  deleted_by: string | null;
  author?: { name: string | null; avatar_url: string | null } | null;
}

interface RawNoteHistory {
  id: string;
  note_id: string;
  action: 'created' | 'updated' | 'deleted' | 'restored';
  actor_id: string;
  previous_content: string | null;
  new_content: string | null;
  created_at: string;
  actor?: { name: string | null } | null;
}

function mapNote(row: RawCandidateNote): CandidateNote {
  return {
    id: row.id,
    candidateId: row.candidate_id,
    companyId: row.company_id,
    authorId: row.author_id,
    authorName: row.author?.name ?? undefined,
    authorAvatar: row.author?.avatar_url ?? null,
    content: row.content,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    isDeleted: row.is_deleted,
    deletedAt: row.deleted_at,
    deletedBy: row.deleted_by,
  };
}

function mapHistory(row: RawNoteHistory): NoteHistoryEntry {
  return {
    id: row.id,
    noteId: row.note_id,
    action: row.action,
    actorId: row.actor_id,
    actorName: row.actor?.name ?? undefined,
    previousContent: row.previous_content,
    newContent: row.new_content,
    createdAt: row.created_at,
  };
}

export function createCandidateNotesService(): CandidateNotesService {
  return {
    async list(candidateId, companyId, opts) {
      let query = supabase
        .from('candidate_notes')
        .select(`
          *,
          author:profiles!candidate_notes_author_id_fkey(name, avatar_url)
        `)
        .eq('candidate_id', candidateId)
        .eq('company_id', companyId)
        .order('created_at', { ascending: false });

      if (!opts?.includeDeleted) {
        query = query.eq('is_deleted', false);
      }

      const { data, error } = await query;
      if (error) throw error;
      return (data as unknown as RawCandidateNote[]).map(mapNote);
    },

    async listHistory(noteId) {
      const { data, error } = await supabase
        .from('candidate_notes_history')
        .select(`
          *,
          actor:profiles!candidate_notes_history_actor_id_fkey(name)
        `)
        .eq('note_id', noteId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as unknown as RawNoteHistory[]).map(mapHistory);
    },

    async create(input) {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('candidate_notes')
        .insert({
          candidate_id: input.candidateId,
          company_id: input.companyId,
          author_id: userId,
          content: input.content,
        })
        .select(`
          *,
          author:profiles!candidate_notes_author_id_fkey(name, avatar_url)
        `)
        .single();
      if (error) throw error;
      return mapNote(data as unknown as RawCandidateNote);
    },

    async update(input) {
      const { data, error } = await supabase
        .from('candidate_notes')
        .update({ content: input.content })
        .eq('id', input.noteId)
        .select(`
          *,
          author:profiles!candidate_notes_author_id_fkey(name, avatar_url)
        `)
        .single();
      if (error) throw error;
      return mapNote(data as unknown as RawCandidateNote);
    },

    async softDelete(noteId) {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      const { error, data } = await supabase
        .from('candidate_notes')
        .update({
          is_deleted: true,
          deleted_at: new Date().toISOString(),
          deleted_by: userId,
        })
        .eq('id', noteId)
        .select('id');
      if (error) throw error;
      if (!data || data.length === 0) {
        throw new Error('Nota não encontrada ou sem permissão');
      }
    },

    async restore(noteId) {
      const { data, error } = await supabase
        .from('candidate_notes')
        .update({
          is_deleted: false,
          deleted_at: null,
          deleted_by: null,
        })
        .eq('id', noteId)
        .select(`
          *,
          author:profiles!candidate_notes_author_id_fkey(name, avatar_url)
        `)
        .single();
      if (error) throw error;
      return mapNote(data as unknown as RawCandidateNote);
    },
  };
}
