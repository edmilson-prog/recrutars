import { describe, it, expect } from 'vitest';
import { parseViewMode, DEFAULT_VIEW_MODE } from '@/components/empresa/applications/useViewMode';

describe('parseViewMode', () => {
  it('returns the stored mode when valid', () => {
    expect(parseViewMode('combobox')).toBe('combobox');
    expect(parseViewMode('sidebar')).toBe('sidebar');
    expect(parseViewMode('cards')).toBe('cards');
  });
  it('falls back to the default for null or unknown values', () => {
    expect(parseViewMode(null)).toBe(DEFAULT_VIEW_MODE);
    expect(parseViewMode('bogus')).toBe(DEFAULT_VIEW_MODE);
  });
});
