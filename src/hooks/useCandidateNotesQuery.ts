// src/hooks/useCandidateNotesQuery.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCandidateNotesService } from '@/services/candidateNotes';
import type {
  CandidateNote,
  NoteHistoryEntry,
  CreateCandidateNoteInput,
  UpdateNoteInput,
} from '@/types/notes';
import { toast } from 'sonner';

export const candidateNoteKeys = {
  all: ['candidateNotes'] as const,
  list: (candidateId: string, companyId: string) =>
    [...candidateNoteKeys.all, 'list', candidateId, companyId] as const,
  history: (noteId: string) =>
    [...candidateNoteKeys.all, 'history', noteId] as const,
};

export function useCandidateNotes(
  candidateId: string | undefined,
  companyId: string | undefined,
  opts?: { includeDeleted?: boolean },
) {
  return useQuery<CandidateNote[]>({
    queryKey: candidateNoteKeys.list(candidateId ?? '', companyId ?? ''),
    queryFn: () =>
      getCandidateNotesService().list(candidateId!, companyId!, opts),
    enabled: !!candidateId && !!companyId,
  });
}

export function useCandidateNoteHistory(noteId: string | undefined) {
  return useQuery<NoteHistoryEntry[]>({
    queryKey: candidateNoteKeys.history(noteId ?? ''),
    queryFn: () => getCandidateNotesService().listHistory(noteId!),
    enabled: !!noteId,
  });
}

export function useCreateCandidateNote() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateCandidateNoteInput) =>
      getCandidateNotesService().create(input),
    onSuccess: (note) => {
      qc.invalidateQueries({
        queryKey: candidateNoteKeys.list(note.candidateId, note.companyId),
      });
      toast.success('Nota adicionada');
    },
    onError: (e: Error) => {
      toast.error('Erro ao adicionar nota', { description: e.message });
    },
  });
}

export function useUpdateCandidateNote(candidateId: string, companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateNoteInput) =>
      getCandidateNotesService().update(input),
    onSuccess: (note) => {
      qc.invalidateQueries({
        queryKey: candidateNoteKeys.list(candidateId, companyId),
      });
      qc.invalidateQueries({
        queryKey: candidateNoteKeys.history(note.id),
      });
      toast.success('Nota atualizada');
    },
    onError: (e: Error) => {
      toast.error('Erro ao atualizar nota', { description: e.message });
    },
  });
}

export function useDeleteCandidateNote(candidateId: string, companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) =>
      getCandidateNotesService().softDelete(noteId),
    onSuccess: (_, noteId) => {
      qc.invalidateQueries({
        queryKey: candidateNoteKeys.list(candidateId, companyId),
      });
      qc.invalidateQueries({
        queryKey: candidateNoteKeys.history(noteId),
      });
      toast.success('Nota excluída');
    },
    onError: (e: Error) => {
      toast.error('Erro ao excluir nota', { description: e.message });
    },
  });
}

export function useRestoreCandidateNote(candidateId: string, companyId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (noteId: string) =>
      getCandidateNotesService().restore(noteId),
    onSuccess: (note) => {
      qc.invalidateQueries({
        queryKey: candidateNoteKeys.list(candidateId, companyId),
      });
      qc.invalidateQueries({
        queryKey: candidateNoteKeys.history(note.id),
      });
      toast.success('Nota restaurada');
    },
    onError: (e: Error) => {
      toast.error('Erro ao restaurar nota', { description: e.message });
    },
  });
}
