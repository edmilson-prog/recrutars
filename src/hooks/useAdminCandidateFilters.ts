import { useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface AdminCandidateFilters {
  searchTerm: string;
  statusFilter: string;
  testStatusFilter: string;
  behavioralProfileFilter: string;
  originFilter: string;
}

export interface UseAdminCandidateFiltersReturn extends AdminCandidateFilters {
  setSearchTerm: (v: string) => void;
  setStatusFilter: (v: string) => void;
  setTestStatusFilter: (v: string) => void;
  setBehavioralProfileFilter: (v: string) => void;
  setOriginFilter: (v: string) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

const DEFAULTS = {
  q: '',
  status: 'all',
  testStatus: 'all',
  profile: 'all',
  origin: 'all',
} as const;

const FILTER_KEYS = ['q', 'status', 'testStatus', 'profile', 'origin'] as const;

/**
 * URL-synced filters for /admin/candidatos.
 * Filters survive navigation to candidate detail and back.
 */
export function useAdminCandidateFilters(): UseAdminCandidateFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRef = useRef(setSearchParams);
  setRef.current = setSearchParams;

  const read = (key: keyof typeof DEFAULTS): string =>
    searchParams.get(key) ?? DEFAULTS[key];

  const searchTerm = read('q');
  const statusFilter = read('status');
  const testStatusFilter = read('testStatus');
  const behavioralProfileFilter = read('profile');

  // Legacy compat: older links used ?origin=collaborator; normalize here
  const originRaw = searchParams.get('origin');
  const originFilter = originRaw === 'collaborator' ? 'collaborator' : (originRaw ?? DEFAULTS.origin);

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
  const setTestStatusFilter = useCallback((v: string) => setParam('testStatus', v), [setParam]);
  const setBehavioralProfileFilter = useCallback((v: string) => setParam('profile', v), [setParam]);
  const setOriginFilter = useCallback((v: string) => setParam('origin', v), [setParam]);

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
    testStatusFilter !== 'all' ||
    behavioralProfileFilter !== 'all' ||
    originFilter !== 'all';

  return {
    searchTerm,
    statusFilter,
    testStatusFilter,
    behavioralProfileFilter,
    originFilter,
    setSearchTerm,
    setStatusFilter,
    setTestStatusFilter,
    setBehavioralProfileFilter,
    setOriginFilter,
    clearFilters,
    hasActiveFilters,
  };
}
