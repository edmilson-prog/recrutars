export function hasNewBuild(currentBuildId: string, fetchedBuildId: string | null): boolean {
  return typeof fetchedBuildId === 'string' && fetchedBuildId.length > 0 && fetchedBuildId !== currentBuildId;
}

export function isSnoozed(snoozedUntil: number | null, now: number): boolean {
  return snoozedUntil !== null && now < snoozedUntil;
}
