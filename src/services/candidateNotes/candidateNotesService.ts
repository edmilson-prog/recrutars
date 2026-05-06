import type {
  CandidateNote,
  NoteHistoryEntry,
  CreateCandidateNoteInput,
  UpdateNoteInput,
} from './types';
import { createCandidateNotesService } from './candidateNotesService.supabase';

export interface CandidateNotesService {
  list(
    candidateId: string,
    companyId: string,
    opts?: { includeDeleted?: boolean },
  ): Promise<CandidateNote[]>;
  listHistory(noteId: string): Promise<NoteHistoryEntry[]>;
  create(input: CreateCandidateNoteInput): Promise<CandidateNote>;
  update(input: UpdateNoteInput): Promise<CandidateNote>;
  softDelete(noteId: string): Promise<void>;
  restore(noteId: string): Promise<CandidateNote>;
}

let _instance: CandidateNotesService | null = null;

export function getCandidateNotesService(): CandidateNotesService {
  if (!_instance) {
    _instance = createCandidateNotesService();
  }
  return _instance;
}
