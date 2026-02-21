/**
 * OnboardingProfessionalProfile
 * PRD-085: Professional profile — step 3 of candidate onboarding (v1.29.0 "Curriculum")
 * Wraps ProfessionalProfile in onboarding mode (no sidebar, with step indicator)
 */

import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import ProfessionalProfile from './ProfessionalProfile';

export default function OnboardingProfessionalProfile() {
  const { currentCandidate, refreshCurrentCandidate } = useAuth();
  const navigate = useNavigate();

  const handleComplete = async () => {
    if (!currentCandidate?.id) return;

    try {
      await supabase
        .from('candidates')
        .update({ onboarding_step: 'gauge_pro_test' })
        .eq('id', currentCandidate.id);

      await refreshCurrentCandidate();
      navigate('/candidato/onboarding/teste-gauge-pro');
    } catch {
      // Error handled inside ProfessionalProfile
    }
  };

  return (
    <ProfessionalProfile
      onboardingMode
      onOnboardingComplete={handleComplete}
    />
  );
}
