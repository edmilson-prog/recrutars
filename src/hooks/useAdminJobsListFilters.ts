import { useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

export interface AdminJobsListFilterObject {
  status?: string;
  moderationStatus?: string;
  company?: string;
  area?: string;
  location?: string;
  search?: string;
  isHighlighted?: boolean;
}

export interface UseAdminJobsListFiltersReturn {
  filters: AdminJobsListFilterObject;
  setFilters: (next: Record<string, unknown>) => void;
  clearFilters: () => void;
}

const KNOWN_KEYS = [
  'status',
  'moderationStatus',
  'company',
  'area',
  'location',
  'search',
  'isHighlighted',
] as const;

const BOOLEAN_KEYS = new Set<string>(['isHighlighted']);

/**
 * URL-synced filters for /admin/vagas (Admin Jobs List).
 * Filters survive navigation to job detail and back.
 *
 * Uses individual URL params (flat) instead of a single JSON blob for readability.
 */
export function useAdminJobsListFilters(): UseAdminJobsListFiltersReturn {
  const [searchParams, setSearchParams] = useSearchParams();
  const setRef = useRef(setSearchParams);
  setRef.current = setSearchParams;

  const filters = useMemo<AdminJobsListFilterObject>(() => {
    const out: AdminJobsListFilterObject = {};
    for (const key of KNOWN_KEYS) {
      const raw = searchParams.get(key);
      if (raw === null) continue;
      if (BOOLEAN_KEYS.has(key)) {
        if (raw === 'true') (out as Record<string, unknown>)[key] = true;
      } else if (raw !== '') {
        (out as Record<string, unknown>)[key] = raw;
      }
    }
    return out;
  }, [searchParams]);

  const setFilters = useCallback((next: Record<string, unknown>) => {
    setRef.current(
      (prev) => {
        const nextParams = new URLSearchParams(prev);
        for (const key of KNOWN_KEYS) {
          nextParams.delete(key);
        }
        for (const [key, value] of Object.entries(next)) {
          if (value === undefined || value === null || value === '' || value === false) {
            continue;
          }
          if (!(KNOWN_KEYS as readonly string[]).includes(key)) continue;
          nextParams.set(key, String(value));
        }
        nextParams.delete('page');
        return nextParams;
      },
      { replace: true }
    );
  }, []);

  const clearFilters = useCallback(() => {
    setRef.current(
      (prev) => {
        const next = new URLSearchParams(prev);
        KNOWN_KEYS.forEach((k) => next.delete(k));
        next.delete('page');
        return next;
      },
      { replace: true }
    );
  }, []);

  return { filters, setFilters, clearFilters };
}
