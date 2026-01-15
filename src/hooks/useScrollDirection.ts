/**
 * useScrollDirection Hook
 * PRD-003-dgn: Mobile-First e Acessibilidade
 *
 * Detecta a direção do scroll para ocultar/mostrar bottom nav
 */

import { useState, useEffect, useCallback } from 'react';

export type ScrollDirection = 'up' | 'down' | null;

interface UseScrollDirectionOptions {
  threshold?: number; // Pixels mínimos para detectar mudança
  initialDirection?: ScrollDirection;
}

export function useScrollDirection({
  threshold = 10,
  initialDirection = null,
}: UseScrollDirectionOptions = {}): ScrollDirection {
  const [scrollDirection, setScrollDirection] = useState<ScrollDirection>(initialDirection);
  const [lastScrollY, setLastScrollY] = useState(0);

  const updateScrollDirection = useCallback(() => {
    const scrollY = window.scrollY;
    const direction = scrollY > lastScrollY ? 'down' : 'up';

    // Só atualiza se a diferença for maior que o threshold
    if (Math.abs(scrollY - lastScrollY) >= threshold) {
      setScrollDirection(direction);
      setLastScrollY(scrollY);
    }
  }, [lastScrollY, threshold]);

  useEffect(() => {
    // Inicializa lastScrollY
    setLastScrollY(window.scrollY);
  }, []);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateScrollDirection();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [updateScrollDirection]);

  return scrollDirection;
}

/**
 * Hook alternativo que retorna booleano para visibilidade
 * Mais simples para uso com bottom nav
 */
export function useScrollVisibility(threshold = 10): boolean {
  const direction = useScrollDirection({ threshold });
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Mostra quando scroll up ou no topo
    if (direction === 'up' || window.scrollY < threshold) {
      setIsVisible(true);
    } else if (direction === 'down' && window.scrollY > threshold) {
      setIsVisible(false);
    }
  }, [direction, threshold]);

  return isVisible;
}
