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
    <Button variant="outline" size="sm" onClick={startTour} className="gap-2">
      <HelpCircle className="h-4 w-4" />
      Refazer tour guiado
    </Button>
  );
}
