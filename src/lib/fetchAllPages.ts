import type { PaginatedResult, PaginationConfig } from '@/services/types';

/**
 * Fetches every page of a paginated service call, stopping as soon as the
 * server-reported `total` is reached (not a hardcoded page count). Use this
 * ONLY for the few screens that genuinely need the full dataset in memory
 * (client-side match scoring) — for everything else, pass real page/pageSize
 * to the service and use `total` for counts, instead of fetching everything.
 */
export async function fetchAllPages<T>(
  fetchPage: (pagination: PaginationConfig) => Promise<PaginatedResult<T>>,
  pageSize = 1000,
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;

  for (;;) {
    const result = await fetchPage({ page, pageSize });
    all.push(...result.data);
    if (result.data.length === 0 || all.length >= result.total) break;
    page += 1;
  }

  return all;
}
