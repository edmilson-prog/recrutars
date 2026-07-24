import { describe, it, expect, vi } from 'vitest';
import { fetchAllPages } from '../fetchAllPages';
import type { PaginatedResult, PaginationConfig } from '@/services/types';

describe('fetchAllPages', () => {
  it('stops as soon as total is reached, even across a batch boundary', async () => {
    const allItems = Array.from({ length: 25 }, (_, i) => ({ id: i }));
    const fetchPage = vi.fn(
      async ({ page, pageSize }: PaginationConfig): Promise<PaginatedResult<{ id: number }>> => {
        const from = (page - 1) * pageSize;
        const data = allItems.slice(from, from + pageSize);
        return { data, total: allItems.length, page, pageSize, hasMore: from + pageSize < allItems.length };
      }
    );

    const result = await fetchAllPages(fetchPage, 10);

    expect(result).toHaveLength(25);
    expect(result.map((r) => r.id)).toEqual(allItems.map((r) => r.id));
    expect(fetchPage).toHaveBeenCalledTimes(3); // 10 + 10 + 5
  });

  it('returns an empty array without looping when total is 0', async () => {
    const fetchPage = vi.fn(async (): Promise<PaginatedResult<{ id: number }>> => ({
      data: [], total: 0, page: 1, pageSize: 1000, hasMore: false,
    }));

    const result = await fetchAllPages(fetchPage);

    expect(result).toEqual([]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });
});
