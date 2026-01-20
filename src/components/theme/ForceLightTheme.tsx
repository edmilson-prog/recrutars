import { useEffect, useState, useRef } from 'react';
import { useTheme } from 'next-themes';

/**
 * ForceLightTheme Component
 *
 * Forces light theme on public pages.
 * Restores the previous theme when the component unmounts.
 */
export function ForceLightTheme() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const previousThemeRef = useRef<string | undefined>(undefined);

  // Armazena tema anterior uma vez no mount
  useEffect(() => {
    setMounted(true);
    previousThemeRef.current = theme;
  }, []);

  // Força light quando montado e resolvedTheme disponível
  useEffect(() => {
    if (mounted && resolvedTheme && resolvedTheme !== 'light') {
      setTheme('light');
    }
  }, [mounted, resolvedTheme, setTheme]);

  // Restaura tema anterior no unmount
  useEffect(() => {
    return () => {
      const prev = previousThemeRef.current;
      if (prev && prev !== 'light') {
        setTheme(prev);
      }
    };
  }, [setTheme]);

  return null;
}
