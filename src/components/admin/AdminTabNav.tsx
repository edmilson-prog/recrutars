/**
 * AdminTabNav Component
 * Barra de tabs horizontal para navegação entre páginas de um grupo admin.
 * Usa Link do react-router (não Radix Tabs) para navegação real por rota.
 * Auto-detecta o grupo baseado na URL atual.
 */

import { Link, useLocation } from 'react-router-dom';
import { getTabGroupForPath } from '@/config/adminTabConfig';
import { cn } from '@/lib/utils';

export function AdminTabNav() {
  const { pathname } = useLocation();
  const group = getTabGroupForPath(pathname);

  if (!group) return null;

  return (
    <nav className="mb-6 -mt-2 overflow-x-auto scrollbar-none" aria-label="Navegação por tabs">
      <div className="inline-flex items-center gap-1 rounded-lg bg-muted p-1">
        {group.tabs.map(tab => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              to={tab.href}
              className={cn(
                "inline-flex items-center gap-2 whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span className="hidden sm:inline">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
