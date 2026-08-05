/**
 * Lancamentos Financeiros — calculo puro de parcelas e datas de recorrencia.
 * Trabalha em CENTAVOS internamente para evitar erros de ponto flutuante;
 * os amounts retornados sao em reais (number, 2 casas).
 */

import type { InstallmentItem, RecurrenceFrequency } from '@/types/finance';

/** Quantos meses cada intervalo representa para frequencias baseadas em mes. */
const MONTHS_PER_INTERVAL: Record<Exclude<RecurrenceFrequency, 'weekly'>, number> = {
  monthly: 1,
  quarterly: 3,
  yearly: 12,
};

function fmt(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

/**
 * Soma `intervalN` periodos a uma data ISO (YYYY-MM-DD), preservando o dia
 * quando possivel e fazendo clamp para o ultimo dia do mes quando o dia nao
 * existe (ex.: 31/jan + 1 mes -> 28/29 de fev).
 */
export function addByFrequency(
  dateISO: string,
  frequency: RecurrenceFrequency,
  intervalN: number,
): string {
  const [y, m, d] = dateISO.split('-').map(Number);

  if (frequency === 'weekly') {
    // Aritmetica de dias via Date (UTC para evitar shift de timezone).
    const base = new Date(Date.UTC(y, m - 1, d));
    base.setUTCDate(base.getUTCDate() + 7 * intervalN);
    return fmt(base.getUTCFullYear(), base.getUTCMonth() + 1, base.getUTCDate());
  }

  const monthsToAdd = MONTHS_PER_INTERVAL[frequency] * intervalN;
  // Indice de mes 0-based total para resolver overflow de ano.
  const totalMonthIndex = m - 1 + monthsToAdd;
  const targetYear = y + Math.floor(totalMonthIndex / 12);
  const targetMonth = ((totalMonthIndex % 12) + 12) % 12; // 0-based
  const lastDay = new Date(Date.UTC(targetYear, targetMonth + 1, 0)).getUTCDate();
  const targetDay = Math.min(d, lastDay);
  return fmt(targetYear, targetMonth + 1, targetDay);
}

/**
 * Divide `totalCents` em `count` parcelas iguais (floor) e soma o resto na
 * ultima parcela, garantindo soma exata. Datas via addByFrequency.
 */
export function calcInstallments(
  totalCents: number,
  count: number,
  firstDueDateISO: string,
  frequency: RecurrenceFrequency,
  intervalN: number,
): InstallmentItem[] {
  if (!Number.isInteger(count) || count < 1) {
    throw new Error('O numero de parcelas deve ser um inteiro >= 1.');
  }
  if (!Number.isFinite(totalCents) || totalCents <= 0) {
    throw new Error('O valor total (em centavos) deve ser maior que zero.');
  }

  const base = Math.floor(totalCents / count);
  const remainder = totalCents - base * count; // vai todo na ultima parcela

  const items: InstallmentItem[] = [];
  for (let k = 1; k <= count; k++) {
    const cents = k === count ? base + remainder : base;
    items.push({
      number: k,
      dueDate: addByFrequency(firstDueDateISO, frequency, intervalN * (k - 1)),
      amount: cents / 100,
    });
  }
  return items;
}
