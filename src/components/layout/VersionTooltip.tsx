/**
 * VersionTooltip Component
 * PRD-044: Tooltip interativo de versão no footer
 */

import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ExternalLink, Sparkles } from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { Badge } from '@/components/ui/badge';
import { useCurrentVersion } from '@/hooks/useChangelog';
import { cn } from '@/lib/utils';

interface VersionTooltipProps {
  children: ReactNode;
}

const releaseTypeConfig = {
  major: {
    label: 'Major',
    color: 'bg-red-500/20 text-red-500 border-red-500/30',
  },
  minor: {
    label: 'Minor',
    color: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  },
  patch: {
    label: 'Patch',
    color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  },
};

export function VersionTooltip({ children }: VersionTooltipProps) {
  const { version, isLoading } = useCurrentVersion();

  if (isLoading || !version) {
    return <>{children}</>;
  }

  const releaseConfig = releaseTypeConfig[version.type];
  const releaseDate = parseISO(version.releaseDate);
  const formattedDate = format(releaseDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR });

  return (
    <HoverCard openDelay={200} closeDelay={100}>
      <HoverCardTrigger asChild>
        <button className="cursor-pointer hover:opacity-80 transition-opacity">
          {children}
        </button>
      </HoverCardTrigger>
      <HoverCardContent
        className="w-80"
        side="top"
        align="center"
        sideOffset={8}
      >
        <div className="space-y-3">
          {/* Header com versão e codinome */}
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold">v{version.version}</span>
                <Badge
                  variant="outline"
                  className={cn("text-xs", releaseConfig.color)}
                >
                  {releaseConfig.label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">
                "{version.codename}"
              </p>
            </div>
            <Badge variant="secondary" className="bg-green-500/20 text-green-600 border-green-500/30">
              Atual
            </Badge>
          </div>

          {/* Data de lançamento */}
          <div className="text-sm text-muted-foreground">
            Lançamento: {formattedDate}
          </div>

          {/* Descrição */}
          <p className="text-sm">
            {version.description}
          </p>

          {/* PRD reference se existir */}
          {version.prd && (
            <div className="text-xs text-muted-foreground">
              Referência: {version.prd}
            </div>
          )}

          {/* Link para página Sobre */}
          <Link
            to="/sobre"
            className={cn(
              "flex items-center gap-2 text-sm font-medium",
              "text-primary hover:text-primary/80 transition-colors",
              "pt-2 border-t border-border"
            )}
          >
            <Sparkles className="w-4 h-4" />
            Ver o que há de novo
            <ExternalLink className="w-3 h-3 ml-auto" />
          </Link>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}
