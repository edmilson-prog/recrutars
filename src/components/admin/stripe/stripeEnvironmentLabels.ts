import type { StripeEnvironment } from '@/types/plans';

/**
 * Rótulos pt-BR do ambiente Stripe (cobrança), exibidos ao usuário.
 * Fonte única de verdade — não duplicar strings de ambiente em componentes.
 */
export const STRIPE_ENV_LABELS: Record<StripeEnvironment, string> = {
  live: 'Produção',
  test: 'Teste (sandbox)',
};
