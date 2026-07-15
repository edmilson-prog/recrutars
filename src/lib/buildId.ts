export function resolveBuildId(env: Record<string, string | undefined>): string {
  return env.VERCEL_GIT_COMMIT_SHA || env.CF_PAGES_COMMIT_SHA || 'dev';
}
