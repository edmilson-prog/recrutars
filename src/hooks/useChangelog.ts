/**
 * useChangelog Hook
 * PRD-044: Pagina "Sobre" e Tooltip de Versao no Footer
 */

import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import type { Version, ChangelogFilters, ReleaseFilter, DateFilter } from '@/types/changelog';
import { subWeeks, subMonths, subYears, isAfter, parseISO } from 'date-fns';

interface ChangelogData {
  versions: Version[];
}

interface UseChangelogReturn {
  versions: Version[];
  filteredVersions: Version[];
  currentVersion: Version | null;
  isLoading: boolean;
  error: Error | null;
  filters: ChangelogFilters;
  setReleaseType: (type: ReleaseFilter) => void;
  setDateRange: (range: DateFilter) => void;
  setSearch: (search: string) => void;
  totalCount: number;
  filteredCount: number;
}

export function useChangelog(): UseChangelogReturn {
  const [versions, setVersions] = useState<Version[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ChangelogFilters>({
    releaseType: 'all',
    dateRange: 'all',
    search: '',
  });

  // Debounce search input
  const debouncedSearch = useDebounce(filters.search, 300);

  // Fetch changelog data
  useEffect(() => {
    const fetchChangelog = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/changelog.json');
        if (!response.ok) {
          throw new Error('Failed to fetch changelog');
        }
        const data: ChangelogData = await response.json();
        setVersions(data.versions);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchChangelog();
  }, []);

  // Get current version
  const currentVersion = useMemo(() => {
    return versions.find(v => v.isCurrent) || versions[0] || null;
  }, [versions]);

  // Apply filters
  const filteredVersions = useMemo(() => {
    let result = [...versions];

    // Filter by release type
    if (filters.releaseType !== 'all') {
      result = result.filter(v => v.type === filters.releaseType);
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date();
      let cutoffDate: Date;

      switch (filters.dateRange) {
        case 'week':
          cutoffDate = subWeeks(now, 1);
          break;
        case 'month':
          cutoffDate = subMonths(now, 1);
          break;
        case '3months':
          cutoffDate = subMonths(now, 3);
          break;
        case 'year':
          cutoffDate = subYears(now, 1);
          break;
        default:
          cutoffDate = new Date(0); // Beginning of time
      }

      result = result.filter(v => {
        const releaseDate = parseISO(v.releaseDate);
        return isAfter(releaseDate, cutoffDate);
      });
    }

    // Filter by search (with debounce)
    if (debouncedSearch.trim()) {
      const searchLower = debouncedSearch.toLowerCase();
      result = result.filter(v => {
        // Search in version number
        if (v.version.toLowerCase().includes(searchLower)) return true;
        // Search in codename
        if (v.codename.toLowerCase().includes(searchLower)) return true;
        // Search in description
        if (v.description.toLowerCase().includes(searchLower)) return true;
        // Search in PRD
        if (v.prd?.toLowerCase().includes(searchLower)) return true;
        // Search in changes
        const changesMatch = v.changes.some(category =>
          category.items.some(item =>
            item.toLowerCase().includes(searchLower)
          )
        );
        if (changesMatch) return true;
        return false;
      });
    }

    return result;
  }, [versions, filters.releaseType, filters.dateRange, debouncedSearch]);

  // Filter setters
  const setReleaseType = useCallback((type: ReleaseFilter) => {
    setFilters(prev => ({ ...prev, releaseType: type }));
  }, []);

  const setDateRange = useCallback((range: DateFilter) => {
    setFilters(prev => ({ ...prev, dateRange: range }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setFilters(prev => ({ ...prev, search }));
  }, []);

  return {
    versions,
    filteredVersions,
    currentVersion,
    isLoading,
    error,
    filters,
    setReleaseType,
    setDateRange,
    setSearch,
    totalCount: versions.length,
    filteredCount: filteredVersions.length,
  };
}

// Helper hook for getting just the current version (for tooltip)
export function useCurrentVersion(): { version: Version | null; isLoading: boolean } {
  const [version, setVersion] = useState<Version | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCurrentVersion = async () => {
      try {
        const response = await fetch('/changelog.json');
        if (!response.ok) throw new Error('Failed to fetch');
        const data: ChangelogData = await response.json();
        const current = data.versions.find(v => v.isCurrent) || data.versions[0] || null;
        setVersion(current);
      } catch {
        // Silently fail - tooltip will show basic info
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentVersion();
  }, []);

  return { version, isLoading };
}
