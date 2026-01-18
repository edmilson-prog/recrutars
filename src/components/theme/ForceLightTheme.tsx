import { useEffect } from 'react';
import { useTheme } from 'next-themes';

/**
 * ForceLightTheme Component
 *
 * Forces light theme on public pages.
 * Restores the previous theme when the component unmounts.
 */
export function ForceLightTheme() {
  const { setTheme, theme, resolvedTheme } = useTheme();

  useEffect(() => {
    // Store the current theme to restore later
    const previousTheme = theme;

    // Force light theme on public pages
    if (resolvedTheme !== 'light') {
      setTheme('light');
    }

    // Restore the previous theme when unmounting (navigating to authenticated pages)
    return () => {
      if (previousTheme && previousTheme !== 'light') {
        setTheme(previousTheme);
      }
    };
  }, []); // Empty dependency array - only run on mount/unmount

  return null;
}
