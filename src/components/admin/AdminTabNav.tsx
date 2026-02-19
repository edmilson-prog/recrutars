/**
 * AdminTabNav Component
 * Barra de tabs horizontal para navegacao entre paginas de um grupo admin.
 * Usa Link do react-router (nao Radix Tabs) para navegacao real por rota.
 * Auto-detecta o grupo baseado na URL atual.
 *
 * Design: underline indicator style com primary color accent,
 * consistente com o border-l-primary dos banners admin.
 */

import { useRef, useEffect, useState, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getTabGroupForPath } from '@/config/adminTabConfig';
import { cn } from '@/lib/utils';

export function AdminTabNav() {
  const { pathname } = useLocation();
  const group = getTabGroupForPath(pathname);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLAnchorElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkOverflow = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }, []);

  // Scroll active tab into view on mount and route change
  useEffect(() => {
    const el = activeRef.current;
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' });
    }
    const timer = setTimeout(checkOverflow, 100);
    return () => clearTimeout(timer);
  }, [pathname, checkOverflow]);

  // Track scroll position for fade indicators
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkOverflow();
    el.addEventListener('scroll', checkOverflow, { passive: true });
    window.addEventListener('resize', checkOverflow);
    return () => {
      el.removeEventListener('scroll', checkOverflow);
      window.removeEventListener('resize', checkOverflow);
    };
  }, [checkOverflow, group]);

  if (!group) return null;

  return (
    <nav aria-label="Navegacao por tabs">
      <div className="relative">
        {/* Left fade indicator */}
        <div
          className={cn(
            'pointer-events-none absolute left-0 top-0 bottom-0 z-10 w-8',
            'bg-gradient-to-r from-background to-transparent',
            'transition-opacity duration-150',
            canScrollLeft ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden="true"
        />

        {/* Scrollable tab container */}
        <div
          ref={scrollRef}
          className={cn(
            'flex items-stretch overflow-x-auto',
            'border-b border-border',
            '[&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]'
          )}
        >
          {group.tabs.map(tab => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                ref={isActive ? activeRef : undefined}
                to={tab.href}
                className={cn(
                  'relative inline-flex items-center gap-2 whitespace-nowrap',
                  'px-4 py-2.5 text-sm font-medium',
                  'border-b-2 -mb-px rounded-t-md',
                  'transition-colors duration-150',
                  'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-[-2px]',
                  isActive
                    ? 'border-b-primary text-primary bg-primary/5'
                    : [
                        'border-b-transparent text-muted-foreground',
                        'hover:text-foreground hover:bg-muted/50',
                      ]
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon
                  className={cn(
                    'w-4 h-4 flex-shrink-0 transition-colors duration-150',
                    isActive ? 'text-primary' : ''
                  )}
                />
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right fade indicator */}
        <div
          className={cn(
            'pointer-events-none absolute right-0 top-0 bottom-0 z-10 w-8',
            'bg-gradient-to-l from-background to-transparent',
            'transition-opacity duration-150',
            canScrollRight ? 'opacity-100' : 'opacity-0'
          )}
          aria-hidden="true"
        />
      </div>
    </nav>
  );
}
