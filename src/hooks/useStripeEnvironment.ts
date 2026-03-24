/**
 * Hook to read the active Stripe environment from admin settings.
 * Returns 'test' or 'live' based on the stripeActiveEnvironment setting.
 */

import { useSettingsData } from './useSettingsQuery';
import type { StripeEnvironment } from '@/types/plans';

export function useStripeEnvironment(): StripeEnvironment {
  const { data: settings } = useSettingsData('admin');

  const env = (settings as Record<string, Record<string, Record<string, unknown>>> | undefined)
    ?.integrations?.stripe?.stripeActiveEnvironment as string | undefined;

  return (env === 'live' ? 'live' : 'test') as StripeEnvironment;
}
