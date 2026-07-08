import { useCallback, useEffect, useMemo, useRef } from 'react';
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
  hasPhotoFilter: boolean;
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
  setHasPhotoFilter: (value: boolean) => void;
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
  hasPhoto: 'false',
  sort: 'match',
  matchJob: 'best',
  view: 'list' as ViewMode,
} as const;

const FILTER_KEYS = ['q', 'state', 'location', 'profile', 'experience', 'skills', 'hasPhoto'] as const;

const PAGE_RESET_KEYS: readonly (keyof typeof DEFAULTS)[] = [
  ...FILTER_KEYS,
  'sort',
  'matchJob',
];

const STORAGE_KEY = 'talentPool:filters';
export const TALENT_POOL_FILTER_KEYS = Object.keys(DEFAULTS) as (keyof typeof DEFAULTS)[];

function saveFiltersToStorage(params: URLSearchParams): void {
  try {
    const data: Record<string, string> = {};
    for (const key of TALENT_POOL_FILTER_KEYS) {
      const val = params.get(key);
      if (val !== null && val !== DEFAULTS[key]) {
        data[key] = val;
      }
    }
    if (Object.keys(data).length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch { /* sessionStorage unavailable */ }
}

export function loadStoredTalentPoolFilters(): Record<string, string> | null {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

function clearFiltersFromStorage(): void {
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
}

/**
 * Syncs Talent Pool filters with URL search params so filters survive
 * navigation away and back (e.g., to candidate detail page).
 *
 * Uses `replace: true` to avoid polluting browser history on every keystroke.
 * Params equal to defaults are omitted from the URL to keep it clean.
 *
 * Resets `page` whenever any filter changes (same batch as the filter write).
 *
 * Persists state to sessionStorage so that navigating away via sidebar/nav
 * links (which go to the bare URL) and returning restores the last-used
 * filters. URL params remain the authoritative source — sessionStorage is
 * only read by the page component during atomic restoration on mount.
 */
export function useCandidateFilters(): UseCandidateFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();

  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  // Write-through cache: every URL change is mirrored to sessionStorage
  // so non-URL-preserving navigations (sidebar links) can restore state.
  useEffect(() => {
    saveFiltersToStorage(searchParams);
  }, [searchParams]);

  const read = (key: keyof typeof DEFAULTS): string =>
    searchParams.get(key) ?? DEFAULTS[key];

  const searchTerm = read('q');
  const stateFilter = read('state');
  const locationFilter = read('location');
  const profileFilter = read('profile');
  const experienceFilter = read('experience');
  const skillsRaw = read('skills');
  const hasPhotoFilter = read('hasPhoto') === 'true';
  const sortBy = read('sort');
  const matchJobId = read('matchJob');
  const viewMode = (read('view') === 'grid' ? 'grid' : 'list') as ViewMode;

  const skillsFilter = useMemo<string[]>(
    () => (skillsRaw ? skillsRaw.split(',').filter(Boolean) : []),
    [skillsRaw]
  );

  // Generic setter: writes a single key, resets page if it's a key that
  // affects ordering/filtering (filters + sort + matchJob).
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
          if ((PAGE_RESET_KEYS as readonly string[]).includes(key)) {
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
  const setHasPhotoFilter = useCallback((v: boolean) => setParam('hasPhoto', v ? 'true' : 'false'), [setParam]);
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
    clearFiltersFromStorage();
  }, []);

  const hasActiveFilters =
    searchTerm !== '' ||
    stateFilter !== 'all' ||
    locationFilter !== 'all' ||
    profileFilter !== 'all' ||
    experienceFilter !== 'all' ||
    skillsFilter.length > 0 ||
    hasPhotoFilter;

  return {
    searchTerm,
    stateFilter,
    locationFilter,
    profileFilter,
    experienceFilter,
    skillsFilter,
    hasPhotoFilter,
    sortBy,
    matchJobId,
    viewMode,
    setSearchTerm,
    setStateFilter,
    setLocationFilter,
    setProfileFilter,
    setExperienceFilter,
    setSkillsFilter,
    setHasPhotoFilter,
    setSortBy,
    setMatchJobId,
    setViewMode,
    clearFilters,
    hasActiveFilters,
  };
}
