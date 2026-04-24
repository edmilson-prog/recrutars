import { useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface AdminCompanyFilters {
  searchTerm: string;
  statusFilter: string;
  planFilter: string;
  industryFilter: string;
}

export interface UseAdminCompanyFiltersReturn extends AdminCompanyFilters {
  setSearchTerm: (v: string) => void;
  setStatusFilter: (v: string) => void;
  setPlanFilter: (v: string) => void;
  setIndustryFilter: (v: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const DEFAULTS = {
  q: '',
  status: 'all',
  plan: 'all',
  industry: 'all',
} as const;

const FILTER_KEYS = ['q', 'status', 'plan', 'industry'] as const;

/**
 * URL-synced filters for /admin/empresas.
 * Filters survive navigation to company detail and back.
 */
export function useAdminCompanyFilters(): UseAdminCompanyFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRef = useRef(setSearchParams);
  setRef.current = setSearchParams;

  const read = (key: keyof typeof DEFAULTS): string =>
    searchParams.get(key) ?? DEFAULTS[key];

  const searchTerm = read('q');
  const statusFilter = read('status');
  const planFilter = read('plan');
  const industryFilter = read('industry');

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
  const setStatusFilter = useCallback((v: string) => setParam('status', v), [setParam]);
  const setPlanFilter = useCallback((v: string) => setParam('plan', v), [setParam]);
  const setIndustryFilter = useCallback((v: string) => setParam('industry', v), [setParam]);

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
    statusFilter !== 'all' ||
    planFilter !== 'all' ||
    industryFilter !== 'all';

  return {
    searchTerm,
    statusFilter,
    planFilter,
    industryFilter,
    setSearchTerm,
    setStatusFilter,
    setPlanFilter,
    setIndustryFilter,
    clearFilters,
    hasActiveFilters,
  };
}
