/**
 * PublicLayout Component
 * PRD-003-dgn: Mobile-First e Acessibilidade
 */

import { ReactNode } from 'react';
import { SkipLink } from '@/components/accessibility';
import { ForceLightTheme } from '@/components/theme/ForceLightTheme';

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      <ForceLightTheme />
      {/* PRD-003-dgn: Skip link para navegação por teclado */}
      <SkipLink href="#main-content" />

      <main
        id="main-content"
        tabIndex={-1}
        className="relative focus:outline-none"
        role="main"
        aria-label="Conteúdo principal"
      >
        {children}
      </main>
    </>
  );
}
