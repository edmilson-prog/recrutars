/**
 * AccessibilityContext
 * PRD-003-dgn: Mobile-First e Acessibilidade
 *
 * Context para preferências de acessibilidade do usuário
 * Persiste em localStorage e aplica imediatamente
 */

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';

// Chave para localStorage
const STORAGE_KEY = 'recrutars-accessibility-prefs';

// Valores padrão
const DEFAULT_PREFS: AccessibilityPrefs = {
  fontSize: 16,
  lineHeight: 1.5,
  reduceMotion: false,
  highContrast: false,
};

// Limites
const FONT_SIZE_MIN = 12;
const FONT_SIZE_MAX = 24;
const LINE_HEIGHT_MIN = 1.2;
const LINE_HEIGHT_MAX = 2.0;

export interface AccessibilityPrefs {
  fontSize: number; // 12-24px
  lineHeight: number; // 1.2-2.0
  reduceMotion: boolean;
  highContrast: boolean;
}

interface AccessibilityContextValue {
  prefs: AccessibilityPrefs;
  setFontSize: (size: number) => void;
  setLineHeight: (height: number) => void;
  setReduceMotion: (value: boolean) => void;
  setHighContrast: (value: boolean) => void;
  resetToDefaults: () => void;
  isDefault: boolean;
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

// Aplicar preferências ao documento
function applyPrefsToDocument(prefs: AccessibilityPrefs) {
  const root = document.documentElement;

  // Font size
  root.style.setProperty('--a11y-font-size', `${prefs.fontSize}px`);

  // Line height
  root.style.setProperty('--a11y-line-height', `${prefs.lineHeight}`);

  // Reduce motion
  if (prefs.reduceMotion) {
    root.classList.add('reduce-motion');
  } else {
    root.classList.remove('reduce-motion');
  }

  // High contrast
  if (prefs.highContrast) {
    root.classList.add('high-contrast');
  } else {
    root.classList.remove('high-contrast');
  }
}

// Carregar preferências do localStorage
function loadPrefs(): AccessibilityPrefs {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        fontSize: Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, parsed.fontSize ?? DEFAULT_PREFS.fontSize)),
        lineHeight: Math.max(LINE_HEIGHT_MIN, Math.min(LINE_HEIGHT_MAX, parsed.lineHeight ?? DEFAULT_PREFS.lineHeight)),
        reduceMotion: Boolean(parsed.reduceMotion),
        highContrast: Boolean(parsed.highContrast),
      };
    }
  } catch {
    // Ignorar erros de parsing
  }

  // Verificar preferência do sistema para motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return {
    ...DEFAULT_PREFS,
    reduceMotion: prefersReducedMotion,
  };
}

// Salvar preferências no localStorage
function savePrefs(prefs: AccessibilityPrefs) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignorar erros de storage
  }
}

interface AccessibilityProviderProps {
  children: ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [prefs, setPrefs] = useState<AccessibilityPrefs>(DEFAULT_PREFS);

  // Carregar preferências na montagem
  useEffect(() => {
    const loadedPrefs = loadPrefs();
    setPrefs(loadedPrefs);
    applyPrefsToDocument(loadedPrefs);
  }, []);

  // Aplicar e salvar quando prefs mudar
  useEffect(() => {
    applyPrefsToDocument(prefs);
    savePrefs(prefs);
  }, [prefs]);

  // Setters individuais
  const setFontSize = useCallback((size: number) => {
    const clampedSize = Math.max(FONT_SIZE_MIN, Math.min(FONT_SIZE_MAX, size));
    setPrefs((prev) => ({ ...prev, fontSize: clampedSize }));
  }, []);

  const setLineHeight = useCallback((height: number) => {
    const clampedHeight = Math.max(LINE_HEIGHT_MIN, Math.min(LINE_HEIGHT_MAX, height));
    setPrefs((prev) => ({ ...prev, lineHeight: clampedHeight }));
  }, []);

  const setReduceMotion = useCallback((value: boolean) => {
    setPrefs((prev) => ({ ...prev, reduceMotion: value }));
  }, []);

  const setHighContrast = useCallback((value: boolean) => {
    setPrefs((prev) => ({ ...prev, highContrast: value }));
  }, []);

  const resetToDefaults = useCallback(() => {
    setPrefs(DEFAULT_PREFS);
  }, []);

  // Verificar se está nos valores padrão
  const isDefault =
    prefs.fontSize === DEFAULT_PREFS.fontSize &&
    prefs.lineHeight === DEFAULT_PREFS.lineHeight &&
    prefs.reduceMotion === DEFAULT_PREFS.reduceMotion &&
    prefs.highContrast === DEFAULT_PREFS.highContrast;

  return (
    <AccessibilityContext.Provider
      value={{
        prefs,
        setFontSize,
        setLineHeight,
        setReduceMotion,
        setHighContrast,
        resetToDefaults,
        isDefault,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

// Re-exportar constantes
export { FONT_SIZE_MIN, FONT_SIZE_MAX, LINE_HEIGHT_MIN, LINE_HEIGHT_MAX };
