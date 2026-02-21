/**
 * Hook for Cultural Fit
 * PRD-042: Fit Cultural
 *
 * Manages company cultural profile form state and compatibility calculations.
 * Data is persisted to Supabase via the culturalProfiles service layer.
 */

import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import type {
  CulturalProfile,
  CompanyCulturalProfile,
  CandidateCulturalProfile,
  CulturalCompatibility,
  DimensionValue,
  CulturalDimension,
} from '@/types/culturalFit';
import {
  calculateCompatibility,
  deriveCulturalProfileFromBehavioral,
  getQuickCompatibilityScore,
} from '@/lib/culturalFit';
import {
  useCulturalProfile,
  useUpsertCulturalProfile,
} from '@/hooks/useCulturalProfileQuery';

// Legacy localStorage key — used only for one-time migration
const LEGACY_STORAGE_KEY = 'recruta_company_cultural_profiles';

interface UseCulturalFitOptions {
  companyId?: string;
}

interface UseCulturalFitReturn {
  // Company profile
  companyProfile: CompanyCulturalProfile | null;
  updateCompanyProfile: (profile: Partial<CulturalProfile>) => void;
  updateCompanyValues: (values: string[]) => void;
  updateCompanyDescription: (description: string) => void;
  saveCompanyProfile: () => Promise<void>;

  // Candidate compatibility
  getCandidateCompatibility: (
    candidateId: string,
    behavioralProfile: string
  ) => CulturalCompatibility | null;
  getCandidateCulturalProfile: (
    candidateId: string,
    behavioralProfile: string
  ) => CandidateCulturalProfile;
  getQuickScore: (behavioralProfile: string) => number;

  // Form state
  formProfile: CulturalProfile;
  formValues: string[];
  formDescription: string;
  setFormDimension: (dimension: CulturalDimension, value: DimensionValue) => void;
  resetForm: () => void;
  isModified: boolean;
  isSaving: boolean;
}

const DEFAULT_PROFILE: CulturalProfile = {
  innovation: 3,
  collaboration: 3,
  hierarchy: 3,
  pace: 3,
  direction: 3,
};

export function useCulturalFit(
  options: UseCulturalFitOptions = {}
): UseCulturalFitReturn {
  const { companyId = '' } = options;

  // Supabase data via React Query
  const { data: serverProfile, isLoading } = useCulturalProfile(companyId);
  const upsertMutation = useUpsertCulturalProfile();

  // Derived company profile from server data
  const companyProfile = serverProfile ?? null;

  // Form state
  const [formProfile, setFormProfile] = useState<CulturalProfile>(DEFAULT_PROFILE);
  const [formValues, setFormValues] = useState<string[]>([]);
  const [formDescription, setFormDescription] = useState<string>('');

  // Track whether form has been synced with server data
  const hasSyncedRef = useRef(false);

  // Sync form state when server data loads (or changes after save)
  useEffect(() => {
    if (serverProfile) {
      setFormProfile({
        innovation: serverProfile.innovation,
        collaboration: serverProfile.collaboration,
        hierarchy: serverProfile.hierarchy,
        pace: serverProfile.pace,
        direction: serverProfile.direction,
      });
      setFormValues(serverProfile.values || []);
      setFormDescription(serverProfile.description || '');
      hasSyncedRef.current = true;
    }
  }, [serverProfile]);

  // One-time migration: localStorage → Supabase
  useEffect(() => {
    if (!companyId || isLoading || serverProfile || hasSyncedRef.current) return;

    try {
      const stored = localStorage.getItem(LEGACY_STORAGE_KEY);
      if (!stored) return;

      const profiles = JSON.parse(stored) as CompanyCulturalProfile[];
      const found = profiles.find(p => p.companyId === companyId);
      if (!found) return;

      // Migrate to Supabase
      upsertMutation.mutate(
        {
          companyId: found.companyId,
          innovation: found.innovation,
          collaboration: found.collaboration,
          hierarchy: found.hierarchy,
          pace: found.pace,
          direction: found.direction,
          description: found.description,
          values: found.values,
        },
        {
          onSuccess: () => {
            // Clean up legacy localStorage entry
            const remaining = profiles.filter(p => p.companyId !== companyId);
            if (remaining.length > 0) {
              localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(remaining));
            } else {
              localStorage.removeItem(LEGACY_STORAGE_KEY);
            }
          },
        },
      );
    } catch {
      // Ignore migration errors — user can re-enter data
    }
  }, [companyId, isLoading, serverProfile]);

  // Check if form has been modified
  const isModified = useMemo(() => {
    if (!companyProfile) return true;

    const profileChanged =
      formProfile.innovation !== companyProfile.innovation ||
      formProfile.collaboration !== companyProfile.collaboration ||
      formProfile.hierarchy !== companyProfile.hierarchy ||
      formProfile.pace !== companyProfile.pace ||
      formProfile.direction !== companyProfile.direction;

    const valuesChanged =
      JSON.stringify(formValues) !== JSON.stringify(companyProfile.values || []);
    const descriptionChanged = formDescription !== (companyProfile.description || '');

    return profileChanged || valuesChanged || descriptionChanged;
  }, [companyProfile, formProfile, formValues, formDescription]);

  // Update a single dimension in form
  const setFormDimension = useCallback(
    (dimension: CulturalDimension, value: DimensionValue) => {
      setFormProfile(prev => ({
        ...prev,
        [dimension]: value,
      }));
    },
    []
  );

  // Reset form to saved profile
  const resetForm = useCallback(() => {
    if (companyProfile) {
      setFormProfile({
        innovation: companyProfile.innovation,
        collaboration: companyProfile.collaboration,
        hierarchy: companyProfile.hierarchy,
        pace: companyProfile.pace,
        direction: companyProfile.direction,
      });
      setFormValues(companyProfile.values || []);
      setFormDescription(companyProfile.description || '');
    } else {
      setFormProfile(DEFAULT_PROFILE);
      setFormValues([]);
      setFormDescription('');
    }
  }, [companyProfile]);

  // Update company profile dimensions
  const updateCompanyProfile = useCallback((profile: Partial<CulturalProfile>) => {
    setFormProfile(prev => ({ ...prev, ...profile }));
  }, []);

  // Update company values
  const updateCompanyValues = useCallback((values: string[]) => {
    setFormValues(values);
  }, []);

  // Update company description
  const updateCompanyDescription = useCallback((description: string) => {
    setFormDescription(description);
  }, []);

  // Save company profile to Supabase
  const saveCompanyProfile = useCallback(async () => {
    if (!companyId) return;

    await upsertMutation.mutateAsync({
      companyId,
      ...formProfile,
      values: formValues,
      description: formDescription,
    });
  }, [companyId, formProfile, formValues, formDescription, upsertMutation]);

  // Get candidate cultural profile from behavioral profile
  const getCandidateCulturalProfile = useCallback(
    (candidateId: string, behavioralProfile: string): CandidateCulturalProfile => {
      return deriveCulturalProfileFromBehavioral(behavioralProfile, candidateId);
    },
    []
  );

  // Get compatibility between company and candidate
  const getCandidateCompatibility = useCallback(
    (candidateId: string, behavioralProfile: string): CulturalCompatibility | null => {
      if (!companyProfile) return null;

      const candidateCultural = getCandidateCulturalProfile(candidateId, behavioralProfile);
      return calculateCompatibility(companyProfile, candidateCultural);
    },
    [companyProfile, getCandidateCulturalProfile]
  );

  // Get quick compatibility score
  const getQuickScore = useCallback(
    (behavioralProfile: string): number => {
      if (!companyProfile) return 50;

      const candidateCultural = deriveCulturalProfileFromBehavioral(behavioralProfile, 'temp');
      return getQuickCompatibilityScore(companyProfile, candidateCultural);
    },
    [companyProfile]
  );

  return {
    companyProfile,
    updateCompanyProfile,
    updateCompanyValues,
    updateCompanyDescription,
    saveCompanyProfile,
    getCandidateCompatibility,
    getCandidateCulturalProfile,
    getQuickScore,
    formProfile,
    formValues,
    formDescription,
    setFormDimension,
    resetForm,
    isModified,
    isSaving: upsertMutation.isPending,
  };
}
