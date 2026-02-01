/**
 * Audit Log Utility
 * PRD-054: Registro de auditoria (localStorage)
 */

import type { AuditLog, AuditAction } from '@/types/companyTest';

const STORAGE_KEY = 'recrutars_audit_logs';

export function getAuditLogs(): AuditLog[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addAuditLog(
  action: AuditAction,
  userId: string,
  userName: string,
  resourceType: AuditLog['resourceType'],
  resourceId: string,
  resourceName?: string,
  details?: string
): AuditLog {
  const log: AuditLog = {
    id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    action,
    userId,
    userName,
    resourceType,
    resourceId,
    resourceName,
    details,
    timestamp: new Date().toISOString(),
  };

  const logs = getAuditLogs();
  logs.unshift(log);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
  return log;
}

export function getAuditLogsForCandidate(candidateId: string): AuditLog[] {
  return getAuditLogs().filter(
    (log) => log.resourceId === candidateId || log.details?.includes(candidateId)
  );
}

export function clearAuditLogs(): void {
  localStorage.removeItem(STORAGE_KEY);
}

export function getActionLabel(action: AuditAction): string {
  const labels: Record<AuditAction, string> = {
    test_created: 'Teste criado',
    test_activated: 'Teste ativado',
    test_closed: 'Teste encerrado',
    test_archived: 'Teste arquivado',
    test_duplicated: 'Teste duplicado',
    invite_sent: 'Convite enviado',
    invite_resent: 'Convite reenviado',
    invite_cancelled: 'Convite cancelado',
    link_generated: 'Link público gerado',
    link_deactivated: 'Link público desativado',
    result_viewed: 'Resultado visualizado',
    result_compared: 'Resultados comparados',
    shortlist_added: 'Adicionado à shortlist',
    shortlist_removed: 'Removido da shortlist',
    pdf_downloaded: 'PDF baixado',
    excel_downloaded: 'Excel baixado',
    lgpd_report_generated: 'Relatório LGPD gerado',
  };
  return labels[action];
}

export function getActionIcon(action: AuditAction): string {
  const icons: Record<AuditAction, string> = {
    test_created: 'Plus',
    test_activated: 'Play',
    test_closed: 'Square',
    test_archived: 'Archive',
    test_duplicated: 'Copy',
    invite_sent: 'Send',
    invite_resent: 'RefreshCw',
    invite_cancelled: 'XCircle',
    link_generated: 'Link',
    link_deactivated: 'Unlink',
    result_viewed: 'Eye',
    result_compared: 'GitCompare',
    shortlist_added: 'Star',
    shortlist_removed: 'XCircle',
    pdf_downloaded: 'FileDown',
    excel_downloaded: 'FileSpreadsheet',
    lgpd_report_generated: 'Shield',
  };
  return icons[action];
}
