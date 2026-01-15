/**
 * PublicLayout Component
 * PRD-003-dgn: Mobile-First e Acessibilidade
 */

import { ReactNode } from 'react';
import { GlassFooter } from '@/components/layout/GlassFooter';
import { SkipLink } from '@/components/accessibility';

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      {/* PRD-003-dgn: Skip link para navegação por teclado */}
      <SkipLink href="#main-content" />

      <main
        id="main-content"
        tabIndex={-1}
        className="focus:outline-none"
        role="main"
        aria-label="Conteúdo principal"
      >
        {children}
      </main>

      <GlassFooter />
    </>
  );
}
