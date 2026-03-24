/**
 * Team Lifecycle Mutation Hooks
 * PRD-090: Ciclo de Vida do Colaborador (Empresa)
 *
 * Mutations for termination, unlinking, reactivation, leave,
 * movements, and anonymization — all via Edge Functions.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { teamKeys } from './useTeamsQuery';
import type {
  TerminationReason,
  LeaveType,
  UnlinkReason,
  EventVisibility,
} from '@/types/teamManagement';

// ---------------------------------------------------------------------------
// Edge Function helpers
// ---------------------------------------------------------------------------

async function invokeLifecycle(action: string, body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('manage-team-lifecycle', {
    body: { action, ...body },
  });
  if (error) throw new Error(error.message || `Lifecycle action '${action}' failed`);
  return data;
}

async function invokeMovement(action: string, body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('manage-team-movement', {
    body: { action, ...body },
  });
  if (error) throw new Error(error.message || `Movement action '${action}' failed`);
  return data;
}

async function invokeAnonymization(action: string, body: Record<string, unknown>) {
  const { data, error } = await supabase.functions.invoke('manage-team-anonymization', {
    body: { action, ...body },
  });
  if (error) throw new Error(error.message || `Anonymization action '${action}' failed`);
  return data;
}

// ---------------------------------------------------------------------------
// Lifecycle mutations (manage-team-lifecycle)
// ---------------------------------------------------------------------------

// Params interfaces
interface TerminateParams {
  teamMemberId: string;
  terminationReason: TerminationReason;
  terminationReasonDetail?: string;
  terminationDate: string;
  terminationNotes?: string;
  notifyCollaborator: boolean;
  offboardingItems?: string[];
  performedBy: string;
}

interface UnlinkParams {
  teamMemberId: string;
  unlinkReason: UnlinkReason;
  unlinkReasonDetail?: string;
  performedBy: string;
}

interface ReactivateParams {
  teamMemberId: string;
  hireDate: string;
  departmentId: string;
  positionId: string;
  notes?: string;
  keepGaugeProfile: boolean;
  performedBy: string;
}

interface CancelScheduledTerminationParams {
  teamMemberId: string;
  performedBy: string;
}

export function useTerminateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: TerminateParams) => invokeLifecycle('terminate', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useUnlinkMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: UnlinkParams) => invokeLifecycle('unlink', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useReactivateMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: ReactivateParams) => invokeLifecycle('reactivate', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useCancelScheduledTermination() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: CancelScheduledTerminationParams) =>
      invokeLifecycle('cancel_scheduled_termination', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Movement mutations (manage-team-movement)
// ---------------------------------------------------------------------------

interface StartLeaveParams {
  teamMemberId: string;
  leaveType: LeaveType;
  leaveStartDate: string;
  leaveExpectedReturn?: string;
  leaveIncludeMetrics: boolean;
  notes?: string;
  performedBy: string;
}

interface ReturnFromLeaveParams {
  teamMemberId: string;
  returnDate: string;
  notes?: string;
  performedBy: string;
}

interface PromoteParams {
  teamMemberId: string;
  newPositionId: string;
  newDepartmentId?: string;
  effectiveDate: string;
  justification?: string;
  performedBy: string;
}

interface TransferDepartmentParams {
  teamMemberId: string;
  newDepartmentId: string;
  newPositionId?: string;
  effectiveDate: string;
  reason?: string;
  performedBy: string;
}

interface ChangePositionParams {
  teamMemberId: string;
  newPositionId: string;
  effectiveDate: string;
  reason?: string;
  performedBy: string;
}

interface AddTimelineNoteParams {
  teamMemberId: string;
  text: string;
  visibility: EventVisibility;
  performedBy: string;
}

export function useStartLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: StartLeaveParams) => invokeMovement('start_leave', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useReturnFromLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: ReturnFromLeaveParams) => invokeMovement('return_from_leave', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function usePromoteMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: PromoteParams) => invokeMovement('promote', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useTransferDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: TransferDepartmentParams) => invokeMovement('transfer_department', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useChangePosition() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: ChangePositionParams) => invokeMovement('change_position', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useAddTimelineNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: AddTimelineNoteParams) => invokeMovement('add_note', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Anonymization mutations (manage-team-anonymization)
// ---------------------------------------------------------------------------

interface AnonymizeParams {
  teamMemberId: string;
  performedBy: string;
  justification?: string;
  forceOverride: boolean;
}

export function useAnonymizeMember() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: AnonymizeParams) =>
      invokeAnonymization('request_anonymization', params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Bulk mutations
// ---------------------------------------------------------------------------

interface BulkTerminateParams {
  teamMemberIds: string[];
  terminationReason: TerminationReason;
  terminationReasonDetail?: string;
  terminationDate: string;
  terminationNotes?: string;
  performedBy: string;
}

interface BulkTransferDepartmentParams {
  teamMemberIds: string[];
  newDepartmentId: string;
  effectiveDate: string;
  reason?: string;
  performedBy: string;
}

interface BulkStartLeaveParams {
  teamMemberIds: string[];
  leaveType: LeaveType;
  leaveStartDate: string;
  leaveExpectedReturn?: string;
  leaveIncludeMetrics: boolean;
  performedBy: string;
}

export function useBulkTerminate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: BulkTerminateParams) =>
      invokeLifecycle('terminate', { ...params, bulk: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useBulkTransferDepartment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: BulkTransferDepartmentParams) =>
      invokeMovement('transfer_department', { ...params, bulk: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}

export function useBulkStartLeave() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: BulkStartLeaveParams) =>
      invokeMovement('start_leave', { ...params, bulk: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teamKeys.all });
    },
  });
}
