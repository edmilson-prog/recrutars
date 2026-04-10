import { useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

interface UsePaginationParamsOptions {
  defaultPage?: number;
  defaultPageSize?: number;
  /** When true, page param is 0-indexed internally but stored as 1-indexed in URL */
  zeroIndexed?: boolean;
}

interface UsePaginationParamsReturn {
  page: number;
  pageSize: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  resetPage: () => void;
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
  const { defaultPage = 1, defaultPageSize, zeroIndexed = false } = options;
  const [searchParams, setSearchParams] = useSearchParams();

  // Store setSearchParams in a ref to guarantee stable callback references
  const setSearchParamsRef = useRef(setSearchParams);
  setSearchParamsRef.current = setSearchParams;

  const optionsRef = useRef({ defaultPage, defaultPageSize, zeroIndexed });
  optionsRef.current = { defaultPage, defaultPageSize, zeroIndexed };

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
