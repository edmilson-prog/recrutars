/**
 * Applications React Query Hooks
 * PRD-066: Service Layer Core
 *
 * Provides React Query hooks for all application operations:
 * listings, details, creation, status updates, notes, and history.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getApplicationsService } from '@/services/applications/applicationsService';
import type { ApplicationFilters } from '@/services/applications/applicationsService';
import type { PaginationConfig, SortConfig } from '@/services/types';
import type { ApplicationStatus } from '@/types';
import type { NoteHistoryEntry, UpdateNoteInput } from '@/types/notes';
import { toast } from 'sonner';

// --- Query Key Factory ---

export const applicationKeys = {
  all: ['applications'] as const,
  lists: () => [...applicationKeys.all, 'list'] as const,
  list: (filters?: ApplicationFilters, pagination?: PaginationConfig, sort?: SortConfig) =>
    [...applicationKeys.lists(), { filters, pagination, sort }] as const,
  details: () => [...applicationKeys.all, 'detail'] as const,
  detail: (id: string) => [...applicationKeys.details(), id] as const,
  byCandidate: (candidateId: string) =>
    [...applicationKeys.all, 'candidate', candidateId] as const,
  byJob: (jobId: string) => [...applicationKeys.all, 'job', jobId] as const,
  notes: (applicationId: string) =>
    [...applicationKeys.all, 'notes', applicationId] as const,
  noteHistory: (noteId: string) =>
    [...applicationKeys.all, 'noteHistory', noteId] as const,
  history: (applicationId: string) =>
    [...applicationKeys.all, 'history', applicationId] as const,
};

// --- Query Hooks ---

export function useApplications(
  filters?: ApplicationFilters,
  pagination?: PaginationConfig,
  sort?: SortConfig,
) {
  return useQuery({
    queryKey: applicationKeys.list(filters, pagination, sort),
    queryFn: async () => {
      const service = await getApplicationsService();
      return service.getApplications(filters, pagination, sort);
    },
  });
}

export function useApplication(id: string) {
  return useQuery({
    queryKey: applicationKeys.detail(id),
    queryFn: async () => {
      const service = await getApplicationsService();
      return service.getApplication(id);
    },
    enabled: !!id,
  });
}

export function useApplicationsByCandidate(candidateId: string) {
  return useQuery({
    queryKey: applicationKeys.byCandidate(candidateId),
    queryFn: async () => {
      const service = await getApplicationsService();
      return service.getApplicationsByCandidate(candidateId);
    },
    enabled: !!candidateId,
  });
}

export function useApplicationsByJob(jobId: string) {
  return useQuery({
    queryKey: applicationKeys.byJob(jobId),
    queryFn: async () => {
      const service = await getApplicationsService();
      return service.getApplicationsByJob(jobId);
    },
    enabled: !!jobId,
  });
}

export function useApplicationNotes(applicationId: string) {
  return useQuery({
    queryKey: applicationKeys.notes(applicationId),
    queryFn: async () => {
      const service = await getApplicationsService();
      return service.getNotes(applicationId);
    },
    enabled: !!applicationId,
  });
}

export function useApplicationHistory(applicationId: string) {
  return useQuery({
    queryKey: applicationKeys.history(applicationId),
    queryFn: async () => {
      const service = await getApplicationsService();
      return service.getHistory(applicationId);
    },
    enabled: !!applicationId,
  });
}

// --- Mutation Hooks ---

export function useCreateApplication() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      jobId: string;
      candidateId: string;
      candidateName: string;
      jobTitle: string;
      companyName: string;
      message?: string;
    }) => {
      const service = await getApplicationsService();
      return service.createApplication(data);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
      // Also invalidate job-specific queries since application count may change
      queryClient.invalidateQueries({
        queryKey: applicationKeys.byJob(variables.jobId),
      });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.byCandidate(variables.candidateId),
      });
    },
  });
}

export function useUpdateApplicationStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      status,
      reason,
    }: {
      id: string;
      status: ApplicationStatus;
      reason?: string;
    }) => {
      const service = await getApplicationsService();
      return service.updateApplicationStatus(id, status, reason);
    },
    onSuccess: () => {
      // A status change can affect any application view — lists, the candidate's
      // byCandidate list (which drives the consent gate and the candidate
      // Applications page), the job's byJob list, detail, and history — so
      // invalidate the whole applications cache.
      queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    },
  });
}

export function useAddApplicationNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      applicationId,
      content,
    }: {
      applicationId: string;
      content: string;
    }) => {
      const service = await getApplicationsService();
      return service.addNote(applicationId, content);
    },
    onSuccess: (_, { applicationId }) => {
      queryClient.invalidateQueries({
        queryKey: applicationKeys.notes(applicationId),
      });
    },
  });
}

export function useApplicationNoteHistory(noteId: string | undefined) {
  return useQuery<NoteHistoryEntry[]>({
    queryKey: applicationKeys.noteHistory(noteId ?? ''),
    queryFn: async () => {
      const service = await getApplicationsService();
      return service.listNoteHistory(noteId!);
    },
    enabled: !!noteId,
  });
}

export function useUpdateApplicationNote(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: UpdateNoteInput) => {
      const service = await getApplicationsService();
      return service.updateNote(input);
    },
    onSuccess: (note) => {
      queryClient.invalidateQueries({
        queryKey: applicationKeys.notes(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.noteHistory(note.id),
      });
      toast.success('Nota atualizada');
    },
    onError: (e: Error) =>
      toast.error('Erro ao atualizar', { description: e.message }),
  });
}

export function useDeleteApplicationNote(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: string) => {
      const service = await getApplicationsService();
      return service.softDeleteNote(noteId);
    },
    onSuccess: (_, noteId) => {
      queryClient.invalidateQueries({
        queryKey: applicationKeys.notes(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.noteHistory(noteId),
      });
      toast.success('Nota excluída');
    },
    onError: (e: Error) =>
      toast.error('Erro ao excluir', { description: e.message }),
  });
}

export function useRestoreApplicationNote(applicationId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (noteId: string) => {
      const service = await getApplicationsService();
      return service.restoreNote(noteId);
    },
    onSuccess: (note) => {
      queryClient.invalidateQueries({
        queryKey: applicationKeys.notes(applicationId),
      });
      queryClient.invalidateQueries({
        queryKey: applicationKeys.noteHistory(note.id),
      });
      toast.success('Nota restaurada');
    },
    onError: (e: Error) =>
      toast.error('Erro ao restaurar', { description: e.message }),
  });
}
