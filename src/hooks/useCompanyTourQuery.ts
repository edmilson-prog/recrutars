/**
 * Company Guided Tour — persistence hook (Fase 4)
 * Marks the current collaborator's tour as completed.
 */

import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

export function useCompleteCompanyTour() {
  const { user, currentCompany, refreshCurrentCompany } = useAuth();

  return useMutation({
    mutationFn: async () => {
      if (!user?.id || !currentCompany?.id) {
        throw new Error('Sessão inválida para salvar o tour.');
      }
      const { data, error } = await supabase
        .from('company_users')
        .update({ tour_completed_at: new Date().toISOString() })
        .eq('profile_id', user.id)
        .eq('company_id', currentCompany.id)
        .select();

      if (error) throw error;
      if (!data || data.length === 0) {
        // RLS can block silently (0 rows) without an error object.
        throw new Error('Não foi possível salvar o tour.');
      }
      return data[0];
    },
    onSuccess: () => {
      void refreshCurrentCompany();
    },
  });
}
