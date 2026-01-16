import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'recrutars-sidebar-collapsed';

function loadCollapsedState(): boolean {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'true';
  } catch {
    return false;
  }
}

function saveCollapsedState(collapsed: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  } catch (error) {
    console.error('Erro ao salvar estado da sidebar:', error);
  }
}

export function useSidebarCollapse() {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(loadCollapsedState);

  useEffect(() => {
    saveCollapsedState(isCollapsed);
  }, [isCollapsed]);

  const toggleCollapse = useCallback(() => {
    setIsCollapsed(prev => !prev);
  }, []);

  return { isCollapsed, toggleCollapse };
}
