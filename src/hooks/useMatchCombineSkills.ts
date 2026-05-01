import { useEffect, useState, useCallback } from 'react';

const STORAGE_KEY = 'match-breakdown-combined-skills';

export function useMatchCombineSkills(): [boolean, (next: boolean) => void] {
  const [combined, setCombined] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem(STORAGE_KEY) === 'true';
  });

  const update = useCallback((next: boolean) => {
    setCombined(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, String(next));
    }
  }, []);

  // Sync entre tabs
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === STORAGE_KEY) {
        setCombined(e.newValue === 'true');
      }
    }
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return [combined, update];
}
