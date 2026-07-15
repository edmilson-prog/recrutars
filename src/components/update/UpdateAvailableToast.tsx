import { useUpdateChecker } from '@/hooks/useUpdateChecker';

export function UpdateAvailableToast() {
  useUpdateChecker();
  return null;
}
