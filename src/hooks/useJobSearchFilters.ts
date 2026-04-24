import { useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export type SortOption = 'recent' | 'salary-high' | 'salary-low' | 'match-high';
export type ViewMode = 'list' | 'grid';

export interface JobSearchFilters {
  searchTerm: string;
  locationFilter: string;
  typeFilter: string;
  areaFilter: string;
  levelFilter: string;
  salaryRange: [number, number];
  sortBy: SortOption;
  viewMode: ViewMode;
}

export interface UseJobSearchFiltersReturn extends JobSearchFilters {
  setSearchTerm: (v: string) => void;
  setLocationFilter: (v: string) => void;
  setTypeFilter: (v: string) => void;
  setAreaFilter: (v: string) => void;
  setLevelFilter: (v: string) => void;
  setSalaryRange: (v: number[]) => void;
  setSortBy: (v: SortOption) => void;
  setViewMode: (v: ViewMode) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const DEFAULTS = {
  q: '',
  location: 'all',
  type: 'all',
  area: 'all',
  level: 'all',
  salaryMin: '0',
  salaryMax: '30000',
  sort: 'recent',
  view: 'list',
} as const;

const SALARY_MIN_DEFAULT = 0;
const SALARY_MAX_DEFAULT = 30000;

const FILTER_KEYS = ['q', 'location', 'type', 'area', 'level', 'salaryMin', 'salaryMax'] as const;

/**
 * URL-synced filters for /candidato/vagas (Job Search).
 * Filters survive navigation to job detail and back.
 */
export function useJobSearchFilters(): UseJobSearchFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRef = useRef(setSearchParams);
  setRef.current = setSearchParams;

  const read = (key: keyof typeof DEFAULTS): string =>
    searchParams.get(key) ?? DEFAULTS[key];

  const searchTerm = read('q');
  const locationFilter = read('location');
  const typeFilter = read('type');
  const areaFilter = read('area');
  const levelFilter = read('level');
  const sortBy = (read('sort') as SortOption);
  const viewMode = (read('view') === 'grid' ? 'grid' : 'list') as ViewMode;

  const salaryMinRaw = Number.parseInt(read('salaryMin'), 10);
  const salaryMaxRaw = Number.parseInt(read('salaryMax'), 10);
  const salaryMin = Number.isFinite(salaryMinRaw) ? salaryMinRaw : SALARY_MIN_DEFAULT;
  const salaryMax = Number.isFinite(salaryMaxRaw) ? salaryMaxRaw : SALARY_MAX_DEFAULT;
  const salaryRange: [number, number] = [salaryMin, salaryMax];

  const setParam = useCallback(
    (key: keyof typeof DEFAULTS, value: string) => {
      setRef.current(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (value === '' || value === DEFAULTS[key]) {
            next.delete(key);
          } else {
            next.set(key, value);
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
  const setLocationFilter = useCallback((v: string) => setParam('location', v), [setParam]);
  const setTypeFilter = useCallback((v: string) => setParam('type', v), [setParam]);
  const setAreaFilter = useCallback((v: string) => setParam('area', v), [setParam]);
  const setLevelFilter = useCallback((v: string) => setParam('level', v), [setParam]);
  const setSortBy = useCallback((v: SortOption) => setParam('sort', v), [setParam]);
  const setViewMode = useCallback((v: ViewMode) => setParam('view', v), [setParam]);

  const setSalaryRange = useCallback(
    (range: number[]) => {
      const [min = SALARY_MIN_DEFAULT, max = SALARY_MAX_DEFAULT] = range;
      setRef.current(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (min === SALARY_MIN_DEFAULT) next.delete('salaryMin');
          else next.set('salaryMin', String(min));
          if (max === SALARY_MAX_DEFAULT) next.delete('salaryMax');
          else next.set('salaryMax', String(max));
          next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    []
  );

  const clearFilters = useCallback(() => {
    setRef.current(
      (prev) => {
        const next = new URLSearchParams(prev);
        FILTER_KEYS.forEach((k) => next.delete(k));
        next.delete('page');
        return next;
      },
      { replace: true }
    );
  }, []);

  const hasActiveFilters =
    searchTerm !== '' ||
    locationFilter !== 'all' ||
    typeFilter !== 'all' ||
    areaFilter !== 'all' ||
    levelFilter !== 'all' ||
    salaryMin > SALARY_MIN_DEFAULT ||
    salaryMax < SALARY_MAX_DEFAULT;

  return {
    searchTerm,
    locationFilter,
    typeFilter,
    areaFilter,
    levelFilter,
    salaryRange,
    sortBy,
    viewMode,
    setSearchTerm,
    setLocationFilter,
    setTypeFilter,
    setAreaFilter,
    setLevelFilter,
    setSalaryRange,
    setSortBy,
    setViewMode,
    clearFilters,
    hasActiveFilters,
  };
}
