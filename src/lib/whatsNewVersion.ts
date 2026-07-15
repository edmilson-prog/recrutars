const STORAGE_KEY = 'recrutars_last_seen_version';

export function shouldShowWhatsNew(lastSeenVersion: string | null, currentVersion: string | null): boolean {
  return currentVersion !== null && lastSeenVersion !== null && lastSeenVersion !== currentVersion;
}

export function readLastSeenVersion(): string | null {
  try {
    return localStorage.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

export function writeLastSeenVersion(version: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, version);
  } catch {
    // localStorage unavailable (private mode, blocked cookies) — ignore
  }
}
