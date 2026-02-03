/**
 * Utilitários para geração de dados mock
 * v0.49.1: Infraestrutura para Painel Admin Avançado
 */

let idCounter = 1000;

/**
 * Gera um ID único prefixado
 */
export function generateId(prefix = 'id'): string {
  idCounter += 1;
  return `${prefix}-${idCounter}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Gera uma data aleatória entre duas datas
 */
export function randomDate(start: Date, end: Date): Date {
  const startTime = start.getTime();
  const endTime = end.getTime();
  return new Date(startTime + Math.random() * (endTime - startTime));
}

/**
 * Seleciona um elemento aleatório de um array
 */
export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Seleciona N elementos aleatórios de um array (sem repetição)
 */
export function randomSample<T>(arr: T[], n: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(n, arr.length));
}

/**
 * Gera um array de datas (uma por dia) para um intervalo de dias
 */
export function generateDateRange(days: number, endDate?: Date): Date[] {
  const end = endDate || new Date();
  const dates: Date[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(end);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    dates.push(d);
  }
  return dates;
}

/**
 * Gera um número aleatório inteiro entre min e max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Gera um número aleatório float entre min e max
 */
export function randomFloat(min: number, max: number): number {
  return min + Math.random() * (max - min);
}
