/**
 * Consent decision hook (candidate side).
 * Exposes accept / refuse / revoke mutations. On success each invalidates the
 * consent caches plus applications and candidates so the company-facing gate
 * and the candidate list refetch fresh state.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getConsentService } from '@/services/consent/consentService';
import { applicationKeys } from '@/hooks/useApplicationsQuery';
import { candidateKeys } from '@/hooks/useCandidatesQuery';
import { consentKeys } from '@/hooks/useConsentStatus';
import { useAuth } from '@/contexts/AuthContext';

export function useConsentDecision() {
  const queryClient = useQueryClient();
  const { currentCandidate } = useAuth();

  const invalidateAll = (applicationId: string) => {
    queryClient.invalidateQueries({
      queryKey: consentKeys.disclosure(applicationId),
    });
    queryClient.invalidateQueries({
      queryKey: consentKeys.disclosureFull(applicationId),
    });
    if (currentCandidate?.id) {
      queryClient.invalidateQueries({
        queryKey: consentKeys.byCandidate(currentCandidate.id),
      });
    }
    // Refetch applications so the "offer/hired" flow and the company hire gate
    // pick up the new disclosure state.
    queryClient.invalidateQueries({ queryKey: applicationKeys.all });
    // Refetch candidates so the company list re-reads masked/unmasked PII.
    queryClient.invalidateQueries({ queryKey: candidateKeys.all });
  };

  const accept = useMutation({
    mutationFn: async (input: {
      applicationId: string;
      termVersion: string;
      termHash: string;
    }) => {
      const service = await getConsentService();
      return service.accept(input);
    },
    onSuccess: (disclosure) => {
      invalidateAll(disclosure.applicationId);
      toast.success('Consentimento autorizado', {
        description: 'Seus dados foram liberados para a empresa.',
      });
    },
    onError: (e: Error) =>
      toast.error('Erro ao autorizar', { description: e.message }),
  });

  const refuse = useMutation({
    mutationFn: async (applicationId: string) => {
      const service = await getConsentService();
      return service.refuse(applicationId);
    },
    onSuccess: (disclosure) => {
      invalidateAll(disclosure.applicationId);
      toast.success('Compartilhamento recusado');
    },
    onError: (e: Error) =>
      toast.error('Erro ao recusar', { description: e.message }),
  });

  const revoke = useMutation({
    mutationFn: async (applicationId: string) => {
      const service = await getConsentService();
      return service.revoke(applicationId);
    },
    onSuccess: (disclosure) => {
      invalidateAll(disclosure.applicationId);
      toast.success('Consentimento revogado', {
        description: 'A empresa não tem mais acesso aos seus dados sensíveis.',
      });
    },
    onError: (e: Error) =>
      toast.error('Erro ao revogar', { description: e.message }),
  });

  return { accept, refuse, revoke };
}
