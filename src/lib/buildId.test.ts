import { describe, it, expect } from 'vitest';
import { resolveBuildId } from './buildId';

describe('resolveBuildId', () => {
  it('prioriza VERCEL_GIT_COMMIT_SHA quando presente', () => {
    expect(
      resolveBuildId({ VERCEL_GIT_COMMIT_SHA: 'abc123', CF_PAGES_COMMIT_SHA: 'def456' }),
    ).toBe('abc123');
  });

  it('usa CF_PAGES_COMMIT_SHA quando a variável da Vercel não existe', () => {
    expect(resolveBuildId({ CF_PAGES_COMMIT_SHA: 'def456' })).toBe('def456');
  });

  it('cai para "dev" quando nenhuma variável de commit existe', () => {
    expect(resolveBuildId({})).toBe('dev');
  });
});
