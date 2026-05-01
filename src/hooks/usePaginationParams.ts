import { useCallback, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UsePaginationParamsOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  /** When true, page param is 0-indexed internally but stored as 1-indexed in URL */
  zeroIndexed?: boolean;
  /** When set, pagination state is persisted to sessionStorage under this key
   *  and restored on mount if no URL params are present. */
  storageKey?: string;
}

interface UsePaginationParamsReturn {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetPage: () => void;
}

function savePaginationToStorage(key: string, params: URLSearchParams): void {
  try {
    const data: Record<string, string> = {};
    const page = params.get('page');
    const pageSize = params.get('pageSize');
    if (page) data.page = page;
    if (pageSize) data.pageSize = pageSize;
    if (Object.keys(data).length > 0) {
      sessionStorage.setItem(key, JSON.stringify(data));
    } else {
      sessionStorage.removeItem(key);
    }
  } catch { /* sessionStorage unavailable */ }
}

/**
 * Reads persisted pagination state from sessionStorage under the given key.
 * Used for atomic restoration alongside other URL state.
 */
export function loadStoredPagination(key: string): Record<string, string> | null {
  try {
    const stored = sessionStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  } catch { return null; }
}

/**
 * Syncs pagination state with URL search params so that
 * navigating away and pressing "back" restores the same page.
 *
 * Uses `replace: true` for page changes to avoid polluting browser history
 * with every page click. Preserves all other existing search params.
 */
export function usePaginationParams(
  options: UsePaginationParamsOptions = {}
): UsePaginationParamsReturn {
  const { defaultPage = 1, defaultPageSize, zeroIndexed = false, storageKey } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  // Store setSearchParams in a ref to guarantee stable callback references
  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  const optionsRef = useRef({ defaultPage, defaultPageSize, zeroIndexed });
  optionsRef.current = { defaultPage, defaultPageSize, zeroIndexed };

  const storageKeyRef = useRef(storageKey);
  storageKeyRef.current = storageKey;

  // Sync to sessionStorage on every URL change (opt-in via storageKey).
  // Restoration is owned by the page so filters + pagination can be restored
  // atomically in a single setSearchParams call (avoids race condition).
  useEffect(() => {
    if (storageKeyRef.current) {
      savePaginationToStorage(storageKeyRef.current, searchParams);
    }
  }, [searchParams]);

  // Read from URL (always stored as 1-indexed)
  const urlPage = searchParams.get('page');
  const urlPageSize = searchParams.get('pageSize');

  const storedPage = urlPage ? Number(urlPage) : defaultPage;
  const page = zeroIndexed ? storedPage - 1 : storedPage;
  const pageSize = urlPageSize ? Number(urlPageSize) : (defaultPageSize ?? 20);

  // Stable callbacks — never change reference between renders
  const setPage = useCallback(
    (newPage: number) => {
      const { zeroIndexed: zi, defaultPage: dp } = optionsRef.current;
      setSearchParamsRef.current(
        (prev) => {
          const next = new URLSearchParams(prev);
          const urlValue = zi ? newPage + 1 : newPage;
          if (urlValue === dp) {
            next.delete('page');
          } else {
            next.set('page', String(urlValue));
          }
          return next;
        },
        { replace: true }
      );
    },
    [] // stable: reads from refs
  );

  const setPageSize = useCallback(
    (newSize: number) => {
      const { defaultPageSize: dps } = optionsRef.current;
      setSearchParamsRef.current(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (dps && newSize === dps) {
            next.delete('pageSize');
          } else {
            next.set('pageSize', String(newSize));
          }
          next.delete('page');
          return next;
        },
        { replace: true }
      );
    },
    [] // stable: reads from refs
  );

  const resetPage = useCallback(() => {
    setSearchParamsRef.current(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('page');
        return next;
      },
      { replace: true }
    );
  }, []); // stable: reads from ref

  return { page, pageSize, setPage, setPageSize, resetPage };
}
