/**
 * CompanyTourOverlay (Fase 4)
 * Renders (via portal) the spotlight + step card. Spotlight uses the box-shadow
 * trick to dim everything except the target's bounding box. Falls back to a
 * centered card when the target is missing or not measurable.
 */

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
const CARD_W = 320;
const GAP = 16;
const MARGIN = 12;
const CARD_EST_H = 260;

/** Same rect? Avoids re-renders when scroll/resize/observer fire with no change. */
function sameRect(a: Rect | null, b: Rect | null): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return a.top === b.top && a.left === b.left && a.width === b.width && a.height === b.height;
}

/**
 * Places the card beside the spotlight without overlapping it: prefer the right
 * of the target, fall back to the left, then below — clamped to the viewport.
 * `cardH` is the card's measured height so the bottom never clips off-screen.
 */
function computeCardStyle(rect: Rect | null, cardH: number): React.CSSProperties {
  if (!rect) {
    return {
      position: 'fixed', top: '50%', left: '50%',
      transform: 'translate(-50%, -50%)', width: 'min(90vw, 360px)', zIndex: 102,
    };
  }
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  // Card width never exceeds the viewport (desktop-only, but stay safe on narrow splits).
  const width = Math.min(CARD_W, vw - 2 * MARGIN);
  const maxTop = Math.max(MARGIN, vh - cardH - MARGIN);
  let top = Math.max(MARGIN, Math.min(rect.top, maxTop));
  const rightX = rect.left + rect.width + GAP;
  const leftX = rect.left - width - GAP;
  let left: number;
  if (rightX + width <= vw - MARGIN) {
    left = rightX;
  } else if (leftX >= MARGIN) {
    left = leftX;
  } else {
    // No room on either side — place below the target.
    left = Math.max(MARGIN, Math.min(rect.left, vw - width - MARGIN));
    top = Math.max(MARGIN, Math.min(rect.top + rect.height + GAP, maxTop));
  }
  return { position: 'fixed', top, left, width, zIndex: 102 };
}

export function CompanyTourOverlay({
  steps, stepIndex, onPrev, onNext, onSkip, reducedMotion,
}: CompanyTourOverlayProps) {
  const step = steps[stepIndex];
  const [rect, setRect] = useState<Rect | null>(null);
  const [cardHeight, setCardHeight] = useState(CARD_EST_H);
  const cardRef = useRef<HTMLDivElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const measure = useCallback(() => {
    const tourId = step?.tourId;
    if (!tourId) { setRect((prev) => (prev === null ? prev : null)); return; }
    const el = document.querySelector(`[data-tour="${tourId}"]`) as HTMLElement | null;
    if (!el) { setRect((prev) => (prev === null ? prev : null)); return; }
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.bottom < 0 || r.top > window.innerHeight) {
      setRect((prev) => (prev === null ? prev : null)); return;
    }
    const next: Rect = { top: r.top, left: r.left, width: r.width, height: r.height };
    setRect((prev) => (sameRect(prev, next) ? prev : next));
  }, [step?.tourId]);

  // Keep the spotlight aligned with its anchor across step change, scroll, resize
  // and layout shifts (e.g. sidebar collapse/expand, which only changes geometry).
  useLayoutEffect(() => {
    const tourId = step?.tourId;
    const el = tourId
      ? (document.querySelector(`[data-tour="${tourId}"]`) as HTMLElement | null)
      : null;
    // Instant scroll (not smooth): a smooth scroll is async, so measuring right
    // after would read a stale position; the spotlight's own box-shadow CSS
    // transition still animates the highlight gliding to the new target. #6
    el?.scrollIntoView({ block: 'nearest', behavior: 'auto' });

    measure();
    // Re-measure next frame so the first paint reflects the post-scroll position
    // before the scroll listener fires (avoids a one-frame jump). #6
    const raf = requestAnimationFrame(measure);

    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);

    // ResizeObserver catches the sidebar collapse/expand transition: as the
    // sidebar animates between widths, the anchor's own box resizes, so observing
    // the anchor itself is enough (no need to watch the whole document body). #3
    let ro: ResizeObserver | undefined;
    if (el && typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => measure());
      ro.observe(el);
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
      ro?.disconnect();
    };
  }, [measure, step?.tourId]);

  // Measure the rendered card height so the position clamp keeps the whole card
  // on-screen regardless of step content (extra button, wrapped body text).
  useLayoutEffect(() => {
    const h = cardRef.current?.offsetHeight;
    if (h && Math.abs(h - cardHeight) > 1) setCardHeight(h);
  }, [stepIndex, rect, cardHeight]);

  // Focus management: capture the pre-tour focus, move focus into the dialog, trap
  // Tab inside it, and restore focus on close. Focus enters the card once on open;
  // step-to-step changes are announced via the aria-live region below, which keeps
  // focus on the advance button so "Enter to advance" keeps working. #4
  useEffect(() => {
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    cardRef.current?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const card = cardRef.current;
      if (!card) return;
      const focusables = Array.from(
        card.querySelectorAll<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((node) => !node.hasAttribute('disabled'));
      if (focusables.length === 0) { e.preventDefault(); return; }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeInside = card.contains(document.activeElement);
      if (e.shiftKey) {
        if (!activeInside || document.activeElement === first) {
          e.preventDefault(); last.focus();
        }
      } else if (!activeInside || document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => {
      document.removeEventListener('keydown', onKeyDown, true);
      restoreFocusRef.current?.focus?.();
    };
  }, []);

  if (!step) return null;

  const isFirst = stepIndex === 0;
  const isLast = stepIndex === steps.length - 1;
  const hasSpotlight = rect !== null;
  const cardStyle = computeCardStyle(rect, cardHeight);

  const overlay = (
    <div role="dialog" aria-modal="true" aria-labelledby="company-tour-title">
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
        ref={cardRef}
        tabIndex={-1}
        style={cardStyle}
        className="relative rounded-xl border bg-background p-5 shadow-2xl focus:outline-none"
      >
        <button
          onClick={onSkip}
          aria-label="Fechar tour"
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        <div aria-live="polite" aria-atomic="true">
          <p className="mb-1 text-xs font-medium text-cyan-600 dark:text-cyan-400">
            Passo {stepIndex + 1} de {steps.length}
          </p>
          <h3 id="company-tour-title" className="mb-2 text-lg font-semibold text-foreground">{step.title}</h3>
          <p className="mb-4 text-sm text-muted-foreground">{step.body}</p>
        </div>
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
