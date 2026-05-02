import { useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export type SortOption = string;
export type ViewMode = 'list' | 'grid';

export interface CandidateFilters {
  searchTerm: string;
  stateFilter: string;
  locationFilter: string;
  profileFilter: string;
  experienceFilter: string;
  skillsFilter: string[];
  sortBy: SortOption;
  matchJobId: string;
  viewMode: ViewMode;
}

export interface UseCandidateFiltersReturn extends CandidateFilters {
  setSearchTerm: (value: string) => void;
  setStateFilter: (value: string) => void;
  setLocationFilter: (value: string) => void;
  setProfileFilter: (value: string) => void;
  setExperienceFilter: (value: string) => void;
  setSkillsFilter: (valueOrUpdater: string[] | ((prev: string[]) => string[])) => void;
  setSortBy: (value: SortOption) => void;
  setMatchJobId: (value: string) => void;
  setViewMode: (value: ViewMode) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const DEFAULTS = {
  q: '',
  state: 'all',
  location: 'all',
  profile: 'all',
  experience: 'all',
  skills: '',
  sort: 'match',
  matchJob: 'best',
  view: 'list' as ViewMode,
} as const;

const FILTER_KEYS = ['q', 'state', 'location', 'profile', 'experience', 'skills'] as const;

/**
 * Syncs Talent Pool filters with URL search params so filters survive
 * navigation away and back (e.g., to candidate detail page).
 *
 * Uses `replace: true` to avoid polluting browser history on every keystroke.
 * Params equal to defaults are omitted from the URL to keep it clean.
 *
 * Resets `page` whenever any filter changes (same batch as the filter write).
 */
export function useCandidateFilters(): UseCandidateFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  const read = (key: keyof typeof DEFAULTS): string =>
    searchParams.get(key) ?? DEFAULTS[key];

  const searchTerm = read('q');
  const stateFilter = read('state');
  const locationFilter = read('location');
  const profileFilter = read('profile');
  const experienceFilter = read('experience');
  const skillsRaw = read('skills');
  const sortBy = read('sort');
  const matchJobId = read('matchJob');
  const viewMode = (read('view') === 'grid' ? 'grid' : 'list') as ViewMode;

  const skillsFilter = useMemo<string[]>(
    () => (skillsRaw ? skillsRaw.split(',').filter(Boolean) : []),
    [skillsRaw]
  );

  // Generic setter: writes a single key, resets page if it's a filter key
  const setParam = useCallback(
    (key: keyof typeof DEFAULTS, rawValue: string) => {
      setSearchParamsRef.current(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (rawValue === '' || rawValue === DEFAULTS[key]) {
            next.delete(key);
          } else {
            next.set(key, rawValue);
          }
          if ((FILTER_KEYS as readonly string[]).includes(key)) {
            next.delete('page');
          }
          return next;
        },
        { replace: true }
      );
    },
    []
  );

  const setSearchTerm = useCallback((v: string) => setParam('q', v), [setParam]);
  const setStateFilter = useCallback((v: string) => setParam('state', v), [setParam]);
  const setLocationFilter = useCallback((v: string) => setParam('location', v), [setParam]);
  const setProfileFilter = useCallback((v: string) => setParam('profile', v), [setParam]);
  const setExperienceFilter = useCallback((v: string) => setParam('experience', v), [setParam]);
  const setSortBy = useCallback((v: string) => setParam('sort', v), [setParam]);
  const setMatchJobId = useCallback((v: string) => setParam('matchJob', v), [setParam]);
  const setViewMode = useCallback((v: ViewMode) => setParam('view', v), [setParam]);

  // Skills needs functional-updater support because callers do `prev.filter(...)`
  const skillsRef = useRef(skillsFilter);
  skillsRef.current = skillsFilter;

  const setSkillsFilter = useCallback(
    (valueOrUpdater: string[] | ((prev: string[]) => string[])) => {
      const nextValue =
        typeof valueOrUpdater === 'function'
          ? valueOrUpdater(skillsRef.current)
          : valueOrUpdater;
      setParam('skills', nextValue.join(','));
    },
    [setParam]
  );

  const clearFilters = useCallback(() => {
    setSearchParamsRef.current(
      (prev) => {
        const next = new URLSearchParams(prev);
        FILTER_KEYS.forEach((key) => next.delete(key));
        next.delete('page');
        return next;
      },
      { replace: true }
    );
  }, []);

  const hasActiveFilters =
    searchTerm !== '' ||
    stateFilter !== 'all' ||
    locationFilter !== 'all' ||
    profileFilter !== 'all' ||
    experienceFilter !== 'all' ||
    skillsFilter.length > 0;

  return {
    searchTerm,
    stateFilter,
    locationFilter,
    profileFilter,
    experienceFilter,
    skillsFilter,
    sortBy,
    matchJobId,
    viewMode,
    setSearchTerm,
    setStateFilter,
    setLocationFilter,
    setProfileFilter,
    setExperienceFilter,
    setSkillsFilter,
    setSortBy,
    setMatchJobId,
    setViewMode,
    clearFilters,
    hasActiveFilters,
  };
}
