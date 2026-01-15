import { ReactNode } from 'react';
import { GlassFooter } from '@/components/layout/GlassFooter';

interface PublicLayoutProps {
  children: ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <>
      {children}
      <GlassFooter />
    </>
  );
}
