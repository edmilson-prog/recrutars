/**
 * ConfigInfoBanner Component
 * PRD-080: Banner informativo (read-only) com link de navegação
 */

import { Info, ArrowRight } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { ConfigField } from '@/types/settings';

interface ConfigInfoBannerProps {
  field: ConfigField;
  onNavigate?: (link: string) => void;
}

export function ConfigInfoBanner({ field, onNavigate }: ConfigInfoBannerProps) {
  const handleClick = () => {
    if (field.link && onNavigate) {
      onNavigate(field.link);
    }
  };

  return (
    <Alert className="border-primary/25 bg-primary/5">
      <Info className="h-4 w-4 text-primary" />
      <AlertDescription className="text-sm text-muted-foreground">
        {field.description}
        {field.link && (
          <button
            type="button"
            onClick={handleClick}
            className="ml-1 inline-flex items-center gap-1 font-semibold text-primary hover:underline"
          >
            {field.linkText || 'Ir para configuração'}
            <ArrowRight className="h-3 w-3" />
          </button>
        )}
      </AlertDescription>
    </Alert>
  );
}
