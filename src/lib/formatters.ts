/**
 * Utilitários de formatação compartilhados
 * v0.49.1: Infraestrutura para Painel Admin Avançado
 */

/**
 * Formata um número como moeda BRL (R$)
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata uma data como tempo relativo (ex: "há 2 dias", "há 3 horas")
 */
export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diffMs = now.getTime() - target.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return 'agora mesmo';
  if (diffMinutes < 60) return `há ${diffMinutes} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return 'ontem';
  if (diffDays < 7) return `há ${diffDays} dias`;
  if (diffWeeks < 4) return `há ${diffWeeks} semana${diffWeeks > 1 ? 's' : ''}`;
  if (diffMonths < 12) return `há ${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`;

  return target.toLocaleDateString('pt-BR');
}

/**
 * Formata um número como porcentagem
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Formata um número com separador de milhar
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}

/**
 * Parses a date string safely, treating date-only strings (YYYY-MM-DD) as local
 * dates instead of UTC midnight (which causes off-by-one day in negative timezones).
 */
function parseDate(date: string | Date): Date {
  if (date instanceof Date) return date;
  // Date-only format: "2026-05-19" → parse as local to avoid UTC shift
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const [y, m, d] = date.split('-').map(Number);
    return new Date(y, m - 1, d);
  }
  return new Date(date);
}

/**
 * Formata data no padrão brasileiro DD/MM/YYYY
 */
export function formatDateBR(date: string | Date): string {
  const d = parseDate(date);
  return d.toLocaleDateString('pt-BR');
}

/**
 * Formata data e hora no padrão brasileiro DD/MM/YYYY às HH:MM
 */
export function formatDateTimeBR(date: string | Date): string {
  const d = parseDate(date);
  return d.toLocaleDateString('pt-BR') + ' às ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

/**
 * Formata telefone brasileiro: (XX) XXXXX-XXXX (celular) ou (XX) XXXX-XXXX (fixo).
 * Aceita entrada com ou sem máscara; ignora não-dígitos e limita a 11 dígitos.
 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 10) {
    // Fixo: (XX) XXXX-XXXX
    return digits
      .replace(/(\d{2})(\d)/, '($1) $2')
      .replace(/(\d{4})(\d)/, '$1-$2');
  }
  // Celular: (XX) XXXXX-XXXX
  return digits
    .replace(/(\d{2})(\d)/, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2');
}
