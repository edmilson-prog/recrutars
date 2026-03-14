/**
 * PageHeader — Reusable page header with title + collapsible "Como funciona?"
 *
 * Replaces the old gradient banner pattern across all pages.
 * Title + description + action buttons sit outside any container.
 * An optional collapsible "Como funciona?" section sits below with primary left border.
 */

import { useState } from 'react';
import { Info, ChevronDown } from 'lucide-react';
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description: string | React.ReactNode;
  actions?: React.ReactNode;
  badges?: React.ReactNode;
  howItWorks?: string[];
  howItWorksIntro?: string;
}

export function PageHeader({
  title,
  description,
  actions,
  badges,
  howItWorks,
  howItWorksIntro,
}: PageHeaderProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Title + Description + Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          {typeof description === 'string' ? (
            <p className="text-muted-foreground mt-1 text-sm">{description}</p>
          ) : (
            <div className="text-muted-foreground mt-1 text-sm">{description}</div>
          )}
          {badges && <div className="flex flex-wrap gap-2 mt-2">{badges}</div>}
        </div>
        {actions && (
          <div className="flex items-center gap-2 shrink-0">{actions}</div>
        )}
      </div>

      {/* How it works — Collapsible */}
      {howItWorks && howItWorks.length > 0 && (
        <Collapsible open={open} onOpenChange={setOpen}>
          <div className="rounded-lg border border-border/60 border-l-[3px] border-l-primary bg-card">
            <CollapsibleTrigger asChild>
              <button
                className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors rounded-lg"
              >
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium text-foreground">Como funciona?</span>
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-muted-foreground transition-transform duration-200',
                    open && 'rotate-180'
                  )}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-4 pb-4 text-sm text-muted-foreground space-y-2">
                {howItWorksIntro && <p>{howItWorksIntro}</p>}
                <ul className="list-disc list-inside space-y-1 ml-1">
                  {howItWorks.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}
    </>
  );
}
