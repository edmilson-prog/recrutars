/**
 * Service Layer — Shared Types
 * PRD-066: Service Layer Pattern
 */

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export interface ServiceError {
  code: string;
  message: string;
  details?: unknown;
}

export interface SortConfig {
  field: string;
  direction: 'asc' | 'desc';
}

export interface PaginationConfig {
  page: number;
  pageSize: number;
}

export type DataSource = 'mock' | 'supabase';
