/**
 * Hook for Cultural Fit
 * PRD-042: Fit Cultural
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  CulturalProfile,
  CompanyCulturalProfile,
  CandidateCulturalProfile,
  CulturalCompatibility,
  DimensionValue,
  CulturalDimension,
} from '@/types/culturalFit';
import { mockCompanyCulturalProfiles } from '@/data/culturalDimensions';
import {
  calculateCompatibility,
  deriveCulturalProfileFromBehavioral,
  getQuickCompatibilityScore,
} from '@/lib/culturalFit';

const STORAGE_KEY = 'recruta_company_cultural_profiles';

interface UseCulturalFitOptions {
  companyId?: string;
}

interface UseCulturalFitReturn {
  // Company profile
  companyProfile: CompanyCulturalProfile | null;
  updateCompanyProfile: (profile: Partial<CulturalProfile>) => void;
  updateCompanyValues: (values: string[]) => void;
  updateCompanyDescription: (description: string) => void;
  saveCompanyProfile: () => void;

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
  setFormDimension: (dimension: CulturalDimension, value: DimensionValue) => void;
  resetForm: () => void;
  isModified: boolean;
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
  const { companyId = 'company-1' } = options;

  // Load company profile from localStorage or mock
  const loadCompanyProfile = (): CompanyCulturalProfile | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const profiles = JSON.parse(stored) as CompanyCulturalProfile[];
        const found = profiles.find(p => p.companyId === companyId);
        if (found) return found;
      }
    } catch {
      // Ignore parsing errors
    }

    // Fallback to mock data
    return mockCompanyCulturalProfiles.find(p => p.companyId === companyId) || null;
  };

  // State
  const [companyProfile, setCompanyProfile] = useState<CompanyCulturalProfile | null>(
    loadCompanyProfile
  );
  const [formProfile, setFormProfile] = useState<CulturalProfile>(
    companyProfile || DEFAULT_PROFILE
  );
  const [formValues, setFormValues] = useState<string[]>(companyProfile?.values || []);
  const [formDescription, setFormDescription] = useState<string>(
    companyProfile?.description || ''
  );

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

  // Save company profile
  const saveCompanyProfile = useCallback(() => {
    const newProfile: CompanyCulturalProfile = {
      ...formProfile,
      companyId,
      values: formValues,
      description: formDescription,
      updatedAt: new Date().toISOString(),
    };

    // Save to localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const profiles = stored ? JSON.parse(stored) : [];
      const filtered = profiles.filter(
        (p: CompanyCulturalProfile) => p.companyId !== companyId
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...filtered, newProfile]));
    } catch {
      // Ignore storage errors
    }

    setCompanyProfile(newProfile);
  }, [companyId, formProfile, formValues, formDescription]);

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
    setFormDimension,
    resetForm,
    isModified,
  };
}
