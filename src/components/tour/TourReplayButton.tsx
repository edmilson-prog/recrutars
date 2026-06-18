/**
 * TourReplayButton (Fase 4)
 * Re-opens the guided tour. Must render inside <CompanyTourProvider>.
 */

import { HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCompanyTour } from './CompanyTourProvider';

export default function TourReplayButton() {
  const { startTour } = useCompanyTour();
  return (
    // Hidden below md: the guided tour anchors to the desktop sidebar, which is
    // not rendered on mobile (the layout uses BottomNav instead).
    <Button
      variant="outline"
      size="sm"
      onClick={startTour}
      className="hidden md:inline-flex gap-2"
    >
      <HelpCircle className="h-4 w-4" />
      Refazer tour guiado
    </Button>
  );
}
