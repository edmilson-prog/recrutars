/**
 * Service Layer — Data Source Configuration
 * PRD-072: All modules now use Supabase
 */

import type { DataSource } from './types';

export const DATA_SOURCE: Record<string, DataSource> = {
  users: 'supabase',
  candidates: 'supabase',
  companies: 'supabase',
  jobs: 'supabase',
  applications: 'supabase',
  favorites: 'supabase',
  messages: 'supabase',
  interviews: 'supabase',
  behavioralTests: 'supabase',
  assessments: 'supabase',
  gaugePro: 'supabase',
  curriculums: 'supabase',
  teams: 'supabase',
  plans: 'supabase',
  rbac: 'supabase',
  featureFlags: 'supabase',
  reports: 'supabase',
  gamification: 'supabase',
  notifications: 'supabase',
  tickets: 'supabase',
};

export function getDataSource(module: string): DataSource {
  return DATA_SOURCE[module] ?? 'supabase';
}
