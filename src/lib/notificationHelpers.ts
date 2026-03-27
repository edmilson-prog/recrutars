/**
 * Shared notification utility functions.
 * Extracted from useNotifications.ts and useCompanyNotifications.ts
 * during the Supabase migration.
 */

import type { AdminNotification } from '@/types/adminNotifications';
import type { CompanyNotification } from '@/types/companyNotifications';

/** Resolve deep-link URL for admin notifications based on type + metadata */
export function resolveAdminNotificationUrl(notification: AdminNotification): string {
  const { type, metadata, actionUrl } = notification;

  switch (type) {
    case 'new_candidate':
      if (metadata.candidateId) return `/admin/candidatos/${metadata.candidateId}`;
      break;
    case 'new_company':
      if (metadata.companyId) return `/admin/empresas/${metadata.companyId}`;
      break;
    case 'job_pending_moderation':
      if (metadata.jobId) return `/admin/vagas/${metadata.jobId}`;
      break;
    case 'new_ticket':
    case 'ticket_reply':
      if (metadata.ticketId) return `/admin/helpdesk/tickets/${metadata.ticketId}`;
      break;
  }

  return actionUrl;
}

/** Resolve deep-link URL for company notifications based on type + metadata */
export function resolveCompanyNotificationUrl(notification: CompanyNotification): string {
  const { type, metadata, actionUrl } = notification;

  switch (type) {
    case 'new_application':
    case 'invite_accepted':
    case 'invite_declined':
    case 'test_completed':
    case 'interview_confirmed':
    case 'interview_suggested':
    case 'interview_cancelled':
      if (metadata.candidateId) return `/empresa/candidatos/${metadata.candidateId}`;
      break;
    case 'new_message':
      return '/empresa/mensagens';
    case 'job_expiring':
    case 'job_expired':
      if (metadata.jobId) return `/empresa/vagas/${metadata.jobId}`;
      break;
  }

  return actionUrl;
}

/** Format a date string as relative time in Portuguese */
export function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return 'Agora';
  } else if (diffMins < 60) {
    return `há ${diffMins} min`;
  } else if (diffHours < 24) {
    return `há ${diffHours}h`;
  } else if (diffDays === 1) {
    return 'há 1 dia';
  } else if (diffDays < 7) {
    return `há ${diffDays} dias`;
  } else {
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  }
}

/** Group notifications by date category (Hoje, Ontem, Esta semana, etc.) */
export function groupNotificationsByDate<T extends { createdAt: string }>(
  notifications: T[]
): { label: string; notifications: T[] }[] {
  const groups: Map<string, T[]> = new Map();
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

  for (const notif of notifications) {
    const date = new Date(notif.createdAt);
    let label: string;

    if (date >= today) {
      label = 'Hoje';
    } else if (date >= yesterday) {
      label = 'Ontem';
    } else if (date >= weekAgo) {
      label = 'Esta semana';
    } else if (date >= monthAgo) {
      label = 'Este mês';
    } else {
      label = 'Anteriores';
    }

    if (!groups.has(label)) {
      groups.set(label, []);
    }
    groups.get(label)!.push(notif);
  }

  const order = ['Hoje', 'Ontem', 'Esta semana', 'Este mês', 'Anteriores'];
  return order
    .filter((label) => groups.has(label))
    .map((label) => ({
      label,
      notifications: groups.get(label)!,
    }));
}
