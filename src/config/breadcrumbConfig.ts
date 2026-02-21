/**
 * Breadcrumb Configuration
 * Static route-to-label mappings and helpers for dynamic segments.
 */

export interface BreadcrumbItemConfig {
  label: string;
  href?: string;
}

/**
 * Static labels for routes not covered by navItems or admin tab groups.
 */
export const ROUTE_LABELS: Record<string, string> = {
  // Empresa
  '/empresa/vagas/nova': 'Nova Vaga',
  '/empresa/equipes/compatibilidade': 'Compatibilidade',
  '/empresa/equipes/gap-analysis': 'Analise de Gap',
  '/empresa/equipes/team-builder': 'Team Builder',
  '/empresa/equipes/talentos': 'Talentos',
  '/empresa/equipes/cultura': 'Cultura',
  '/empresa/equipes/relatorios': 'Relatorios',
  '/empresa/testes/metricas': 'Metricas',
  '/empresa/testes/auditoria': 'Auditoria',
  '/empresa/meu-plano': 'Meu Plano',
  '/empresa/checkout/sucesso': 'Checkout Concluido',
  '/empresa/checkout/cancelado': 'Checkout Cancelado',

  // Candidato
  '/candidato/conta': 'Minha Conta',
  '/candidato/teste-comportamental/resultado': 'Resultado',
  '/candidato/gauge-pro': 'Gauge-Pro',
  '/candidato/gauge-pro/resultado': 'Resultado',
  '/candidato/importar-cv': 'Importar CV',
  '/candidato/meu-plano': 'Meu Plano',

  // Admin
  '/admin/planos/novo': 'Novo Plano',

  // Shared
  '/ajuda': 'Central de Ajuda',
  '/sobre': 'Sobre',
};

/**
 * Labels for known segments that appear after dynamic IDs (e.g. /vagas/:id/editar).
 */
export const SEGMENT_LABELS: Record<string, string> = {
  editar: 'Editar',
  'candidatos-sugeridos': 'Candidatos Sugeridos',
  teste: 'Teste',
  resultado: 'Resultado',
  comparar: 'Comparar',
  relatorios: 'Relatorios',
  tickets: 'Tickets',
};

/**
 * Detects dynamic segments: UUIDs, numeric IDs, or long alphanumeric IDs (20+ chars).
 */
export function isDynamicSegment(segment: string): boolean {
  // UUID pattern
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
    return true;
  }
  // Numeric ID
  if (/^\d+$/.test(segment)) {
    return true;
  }
  // Long alphanumeric ID (20+ chars, e.g. Supabase IDs)
  if (/^[a-zA-Z0-9]{20,}$/.test(segment)) {
    return true;
  }
  return false;
}
