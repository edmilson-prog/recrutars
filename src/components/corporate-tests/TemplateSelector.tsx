/**
 * Template Selector
 * PRD-052: Cards dos 7 templates
 */

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Target, Crown, Settings, TrendingUp, Code, Palette, SlidersHorizontal } from 'lucide-react';
import type { TestTemplate } from '@/types/companyTest';
import { COMPANY_TEST_TEMPLATES } from '@/data/companyTestTemplates';
import { DIMENSION_SHORT_NAMES } from '@/types/gaugePro';

interface TemplateSelectorProps {
  selectedId: string;
  onSelect: (template: TestTemplate) => void;
}

const iconMap: Record<string, typeof Target> = {
  Target, Crown, Settings, TrendingUp, Code, Palette, SlidersHorizontal,
};

export function TemplateSelector({ selectedId, onSelect }: TemplateSelectorProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {COMPANY_TEST_TEMPLATES.map((template) => {
        const Icon = iconMap[template.icon] || Target;
        const isSelected = selectedId === template.id;

        return (
          <Card
            key={template.id}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              isSelected && 'ring-2 ring-primary border-primary'
            )}
            onClick={() => onSelect(template)}
          >
            <CardContent className="pt-4 pb-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'p-2 rounded-lg',
                  isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{template.name}</p>
                  {template.isCustom && (
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      Editável
                    </Badge>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {template.description}
              </p>
              <div className="flex flex-wrap gap-1">
                {(Object.entries(template.weights) as [string, number][]).map(([dim, weight]) => (
                  <Badge
                    key={dim}
                    variant={weight >= 1.5 ? 'default' : weight <= 0.7 ? 'outline' : 'secondary'}
                    className="text-[10px] px-1.5 py-0"
                  >
                    {DIMENSION_SHORT_NAMES[dim as keyof typeof DIMENSION_SHORT_NAMES]}: {weight.toFixed(1)}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
