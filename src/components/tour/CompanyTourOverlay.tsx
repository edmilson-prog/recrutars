/**
 * CompanyTourOverlay (Fase 4)
 * Renders (via portal) the spotlight + step card. Spotlight uses the box-shadow
 * trick to dim everything except the target's bounding box. Falls back to a
 * centered card when the target is missing or not measurable.
 */

import { useCallback, useLayoutEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { CompanyTourStep } from '@/data/companyTourSteps';

interface Rect { top: number; left: number; width: number; height: number; }

interface CompanyTourOverlayProps {
  steps: CompanyTourStep[];
  stepIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
  reducedMotion: boolean;
}

const PAD = 8;

export function CompanyTourOverlay({
  steps, stepIndex, onPrev, onNext, onSkip, reducedMotion,
}: CompanyTourOverlayProps) {
  const step = steps[stepIndex];
  const [rect, setRect] = useState<Rect | null>(null);

  const measure = useCallback(() => {
    const tourId = step?.tourId;
    if (!tourId) { setRect(null); return; }
    const el = document.querySelector(`[data-tour="${tourId}"]`) as HTMLElement | null;
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > window.innerHeight) {
      setRect(null); return;
    }
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step?.tourId]);

  useLayoutEffect(() => {
    const tourId = step?.tourId;
    if (tourId) {
      const el = document.querySelector(`[data-tour="${tourId}"]`) as HTMLElement | null;
      el?.scrollIntoView({ block: 'nearest', behavior: reducedMotion ? 'auto' : 'smooth' });
    }
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [measure, step?.tourId, reducedMotion]);

  if (!step) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const hasSpotlight = rect !== null;

  const cardStyle: React.CSSProperties = hasSpotlight
    ? {
        position: 'fixed',
        top: Math.max(12, Math.min(rect!.top, window.innerHeight - 260)),
        left: Math.min(rect!.left + rect!.width + 16, window.innerWidth - 340),
        width: 320,
        zIndex: 102,
      }
    : {
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)', width: 'min(90vw, 360px)', zIndex: 102,
      };

  const overlay = (
    <div role="dialog" aria-modal="true" aria-label="Tour guiado">
      {/* Click blocker (does NOT skip on click — use the buttons) */}
      <div
        className="fixed inset-0"
        style={{ zIndex: 100, background: hasSpotlight ? 'transparent' : 'rgba(0,0,0,0.6)' }}
      />
      {/* Spotlight */}
      {hasSpotlight && (
        <div
          className="fixed rounded-lg"
          style={{
            zIndex: 101,
            top: rect!.top - PAD,
            left: rect!.left - PAD,
            width: rect!.width + PAD * 2,
            height: rect!.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6)',
            pointerEvents: 'none',
            transition: reducedMotion ? undefined : 'all 0.3s ease',
          }}
        />
      )}
      {/* Card */}
      <div
        style={cardStyle}
        className="relative rounded-xl border bg-background p-5 shadow-2xl"
      >
        <button
          onClick={onSkip}
          aria-label="Fechar tour"
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <p className="mb-1 text-xs font-medium text-cyan-600 dark:text-cyan-400">
          Passo {stepIndex + 1} de {steps.length}
        </p>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
        <p className="mb-4 text-sm text-muted-foreground">{step.body}</p>
        <div className="flex items-center justify-between gap-2">
          <Button variant="ghost" size="sm" onClick={onSkip}>Pular tour</Button>
          <div className="flex gap-2">
            {!isFirst && (
              <Button variant="outline" size="sm" onClick={onPrev}>Anterior</Button>
            )}
            <Button
              size="sm"
              className="bg-cyan-600 hover:bg-cyan-700 text-white"
              onClick={onNext}
            >
              {isLast ? 'Concluir' : 'Avançar'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(overlay, document.body);
}
