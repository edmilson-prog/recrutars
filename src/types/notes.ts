// src/types/notes.ts

export type NoteAction = 'created' | 'updated' | 'deleted' | 'restored';

export interface CandidateNote {
  id: string;
  candidateId: string;
  companyId: string;
  authorId: string;
  authorName?: string;
  authorAvatar?: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string | null;
  deletedBy?: string | null;
}

export interface NoteHistoryEntry {
  id: string;
  noteId: string;
  action: NoteAction;
  actorId: string;
  actorName?: string;
  previousContent?: string | null;
  newContent?: string | null;
  createdAt: string;
}

export interface CreateCandidateNoteInput {
  candidateId: string;
  companyId: string;
  content: string;
}

export interface UpdateNoteInput {
  noteId: string;
  content: string;
}
