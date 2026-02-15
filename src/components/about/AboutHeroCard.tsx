/**
 * AboutHeroCard Component
 * PRD-044: Card principal com versão atual
 */

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Calendar, Tag, Sparkles, ArrowDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { Version } from '@/types/changelog';

interface AboutHeroCardProps {
  version: Version;
  onViewHistory: () => void;
}

const releaseTypeConfig = {
  major: {
    label: 'Major',
    description: 'Mudanças significativas',
    color: 'bg-red-500/20 text-red-500 border-red-500/30',
  },
  minor: {
    label: 'Minor',
    description: 'Novas funcionalidades',
    color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  },
  patch: {
    label: 'Patch',
    description: 'Correções e ajustes',
    color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  },
};

export function AboutHeroCard({ version, onViewHistory }: AboutHeroCardProps) {
  const releaseConfig = releaseTypeConfig[version.type];
  const releaseDate = parseISO(version.releaseDate);
  const formattedDate = format(releaseDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  // Count total changes
  const totalChanges = version.changes.reduce(
    (acc, category) => acc + category.items.length,
    0
  );

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-0">
        {/* Header gradient */}
        <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            {/* Version info */}
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl md:text-4xl font-bold">
                  v{version.version}
                </h2>
                <Badge
                  variant="outline"
                  className={cn("text-sm font-medium", releaseConfig.color)}
                >
                  {releaseConfig.label}
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-green-500/20 text-green-600 border-green-500/30"
                >
                  Atual
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground">
                "{version.codename}"
              </p>
              <p className="text-sm md:text-base max-w-xl">
                {version.description}
              </p>
            </div>

            {/* PRD reference */}
            {version.prd && (
              <Badge variant="outline" className="self-start">
                {version.prd}
              </Badge>
            )}
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-3 divide-x border-t">
          <div className="p-4 md:p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Lançamento</span>
            </div>
            <p className="font-semibold text-sm md:text-base">{formattedDate}</p>
          </div>
          <div className="p-4 md:p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
              <Tag className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Tipo</span>
            </div>
            <p className="font-semibold text-sm md:text-base">{releaseConfig.description}</p>
          </div>
          <div className="p-4 md:p-6 text-center">
            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-1">
              <Sparkles className="w-4 h-4" />
              <span className="text-xs uppercase tracking-wider">Mudanças</span>
            </div>
            <p className="font-semibold text-sm md:text-base">{totalChanges} itens</p>
          </div>
        </div>

        {/* CTA */}
        <div className="p-4 md:p-6 border-t bg-muted/30">
          <Button
            variant="outline"
            className="w-full"
            onClick={onViewHistory}
          >
            <ArrowDown className="w-4 h-4 mr-2" />
            O que há de novo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
