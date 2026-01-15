/**
 * SkipLink Component
 * PRD-003-dgn: Mobile-First e Acessibilidade
 *
 * Link "Pular para conteúdo" para navegação por teclado
 * Visível apenas quando focado (acessível mas não intrusivo)
 */

import { cn } from '@/lib/utils';

interface SkipLinkProps {
  href?: string;
  children?: React.ReactNode;
  className?: string;
}

export function SkipLink({
  href = '#main-content',
  children = 'Pular para conteúdo principal',
  className,
}: SkipLinkProps) {
  return (
    <a
      href={href}
      className={cn(
        // Oculto visualmente por padrão (sr-only)
        "sr-only",
        // Visível quando focado
        "focus:not-sr-only",
        "focus:absolute focus:z-[100]",
        "focus:top-4 focus:left-4",
        // Estilo visual
        "focus:px-4 focus:py-3",
        "focus:bg-primary focus:text-primary-foreground",
        "focus:rounded-lg focus:shadow-lg",
        // Focus ring
        "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
        // Transição suave
        "transition-opacity duration-150",
        className
      )}
    >
      {children}
    </a>
  );
}

/**
 * Componente wrapper para landmarks semânticos
 */
interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export function MainContent({ children, className }: MainContentProps) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className={cn("focus:outline-none", className)}
      role="main"
      aria-label="Conteúdo principal"
    >
      {children}
    </main>
  );
}

/**
 * Região com anúncio para screen readers
 */
interface LiveRegionProps {
  children: React.ReactNode;
  mode?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  className?: string;
}

export function LiveRegion({
  children,
  mode = 'polite',
  atomic = true,
  className,
}: LiveRegionProps) {
  return (
    <div
      aria-live={mode}
      aria-atomic={atomic}
      className={className}
    >
      {children}
    </div>
  );
}

/**
 * Região oculta para anúncios de screen reader
 */
interface ScreenReaderOnlyProps {
  children: React.ReactNode;
}

export function ScreenReaderOnly({ children }: ScreenReaderOnlyProps) {
  return (
    <span className="sr-only">
      {children}
    </span>
  );
}
