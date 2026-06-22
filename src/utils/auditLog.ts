/**
 * Audit Log Utility — Pure helper functions
 * Labels and icons for audit actions (no localStorage)
 */

import type { AuditAction } from '@/types/companyTest';

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
    invite_viewed: 'Convite visualizado',
    cpf_verified: 'CPF verificado',
    cpf_failed: 'CPF falhou',
    test_started: 'Teste iniciado',
    test_completed: 'Teste concluido',
    test_abandoned: 'Teste abandonado',
    result_generated: 'Resultado gerado',
    ai_analysis_generated: 'Analise IA gerada',
    ai_analysis_regenerated: 'Analise IA regenerada',
    credit_consumed: 'Credito consumido',
    credit_refunded: 'Credito estornado',
    retest_scheduled: 'Reteste agendado',
    retest_triggered: 'Reteste disparado',
    link_generated: 'Link publico gerado',
    link_deactivated: 'Link publico desativado',
    result_viewed: 'Resultado visualizado',
    result_compared: 'Resultados comparados',
    shortlist_added: 'Adicionado a shortlist',
    shortlist_removed: 'Removido da shortlist',
    pdf_downloaded: 'PDF baixado',
    excel_downloaded: 'Excel baixado',
    lgpd_report_generated: 'Relatorio LGPD gerado',
    consent_granted: 'Consentimento concedido',
    consent_revoked: 'Consentimento revogado',
    sensitive_data_revealed: 'Dados sensíveis revelados',
  };
  return labels[action] ?? action;
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
    invite_viewed: 'Eye',
    cpf_verified: 'ShieldCheck',
    cpf_failed: 'ShieldX',
    test_started: 'PlayCircle',
    test_completed: 'CheckCircle',
    test_abandoned: 'Clock',
    result_generated: 'BarChart3',
    ai_analysis_generated: 'Brain',
    ai_analysis_regenerated: 'RotateCcw',
    credit_consumed: 'CreditCard',
    credit_refunded: 'Undo2',
    retest_scheduled: 'CalendarClock',
    retest_triggered: 'CalendarCheck',
    link_generated: 'Link',
    link_deactivated: 'Unlink',
    result_viewed: 'Eye',
    result_compared: 'GitCompare',
    shortlist_added: 'Star',
    shortlist_removed: 'XCircle',
    pdf_downloaded: 'FileDown',
    excel_downloaded: 'FileSpreadsheet',
    lgpd_report_generated: 'Shield',
    consent_granted: 'ShieldCheck',
    consent_revoked: 'ShieldOff',
    sensitive_data_revealed: 'Eye',
  };
  return icons[action] ?? 'Activity';
}

export function getActionColor(action: AuditAction): string {
  const colors: Partial<Record<AuditAction, string>> = {
    invite_sent: 'text-blue-600',
    invite_resent: 'text-blue-500',
    invite_cancelled: 'text-red-500',
    invite_viewed: 'text-cyan-600',
    cpf_verified: 'text-green-600',
    cpf_failed: 'text-red-600',
    test_started: 'text-amber-600',
    test_completed: 'text-green-600',
    test_abandoned: 'text-orange-500',
    credit_consumed: 'text-purple-600',
    credit_refunded: 'text-emerald-600',
    retest_scheduled: 'text-indigo-600',
    retest_triggered: 'text-indigo-500',
    consent_granted: 'text-green-600',
    consent_revoked: 'text-red-600',
    sensitive_data_revealed: 'text-amber-600',
  };
  return colors[action] ?? 'text-gray-600';
}
