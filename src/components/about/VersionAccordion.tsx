/**
 * VersionAccordion Component
 * PRD-044: Accordion expansível com versões
 */

import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Plus, RefreshCw, AlertTriangle, Trash2, Wrench, Shield,
  Calendar, FileCode, Route,
} from 'lucide-react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Version, ChangeType } from '@/types/changelog';

interface VersionAccordionProps {
  versions: Version[];
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

const changeTypeConfig: Record<ChangeType, { label: string; icon: typeof Plus; color: string }> = {
  added: {
    label: 'Adicionado',
    icon: Plus,
    color: 'text-green-500',
  },
  changed: {
    label: 'Alterado',
    icon: RefreshCw,
    color: 'text-blue-500',
  },
  deprecated: {
    label: 'Descontinuado',
    icon: AlertTriangle,
    color: 'text-yellow-500',
  },
  removed: {
    label: 'Removido',
    icon: Trash2,
    color: 'text-red-500',
  },
  fixed: {
    label: 'Corrigido',
    icon: Wrench,
    color: 'text-purple-500',
  },
  security: {
    label: 'Segurança',
    icon: Shield,
    color: 'text-orange-500',
  },
};

export function VersionAccordion({ versions }: VersionAccordionProps) {
  return (
    <Accordion type="single" collapsible className="space-y-2">
      {versions.map((version) => {
        const releaseConfig = releaseTypeConfig[version.type];
        const releaseDate = parseISO(version.releaseDate);
        const formattedDate = format(releaseDate, "dd MMM yyyy", { locale: ptBR });

        return (
          <AccordionItem
            key={version.version}
            value={version.version}
            className="border rounded-lg px-4 data-[state=open]:bg-muted/30"
          >
            <AccordionTrigger className="hover:no-underline py-4">
              <div className="flex flex-1 items-center gap-3 text-left">
                {/* Version number */}
                <span className="font-bold text-base">
                  v{version.version}
                </span>

                {/* Badges */}
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn("text-xs", releaseConfig.color)}
                  >
                    {releaseConfig.label}
                  </Badge>
                  {version.isCurrent && (
                    <Badge
                      variant="secondary"
                      className="bg-green-500/20 text-green-600 border-green-500/30 text-xs"
                    >
                      Atual
                    </Badge>
                  )}
                </div>

                {/* Codename */}
                <span className="text-sm text-muted-foreground hidden sm:inline">
                  {version.codename}
                </span>

                {/* Date */}
                <div className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {formattedDate}
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="pb-4">
              <div className="space-y-4">
                {/* Description */}
                <p className="text-sm text-muted-foreground">
                  {version.description}
                </p>

                {/* PRD reference */}
                {version.prd && (
                  <Badge variant="outline" className="text-xs">
                    {version.prd}
                  </Badge>
                )}

                {/* Changes grouped by type */}
                <div className="space-y-4 pt-2">
                  {version.changes.map((category) => {
                    const config = changeTypeConfig[category.type];
                    const Icon = config.icon;

                    return (
                      <div key={category.type} className="space-y-2">
                        <div className={cn("flex items-center gap-2 font-medium text-sm", config.color)}>
                          <Icon className="w-4 h-4" />
                          {config.label}
                        </div>
                        <ul className="space-y-1 pl-6">
                          {category.items.map((item, index) => {
                            const detail = category.details?.[String(index)];
                            if (detail) {
                              return (
                                <li
                                  key={index}
                                  className="text-sm text-muted-foreground list-disc marker:text-muted-foreground/50"
                                >
                                  <HoverCard openDelay={200} closeDelay={100}>
                                    <HoverCardTrigger asChild>
                                      <span className="cursor-pointer underline decoration-dotted decoration-muted-foreground/40 underline-offset-2 hover:text-foreground transition-colors">
                                        {item}
                                      </span>
                                    </HoverCardTrigger>
                                    <HoverCardContent className="w-[80vw] max-w-2xl text-sm" side="top" align="start">
                                      <p className="text-foreground mb-3">{detail.description}</p>
                                      {detail.files && detail.files.length > 0 && (
                                        <div className="mb-2">
                                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                                            <FileCode className="w-3 h-3" />
                                            Arquivos
                                          </div>
                                          <div className="space-y-0.5">
                                            {detail.files.map((file, i) => (
                                              <p key={i} className="text-xs font-mono text-cyan-500 truncate">{file}</p>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                      {detail.routes && detail.routes.length > 0 && (
                                        <div>
                                          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-1">
                                            <Route className="w-3 h-3" />
                                            Rotas
                                          </div>
                                          <div className="space-y-0.5">
                                            {detail.routes.map((route, i) => (
                                              <p key={i} className="text-xs font-mono text-emerald-500">{route}</p>
                                            ))}
                                          </div>
                                        </div>
                                      )}
                                    </HoverCardContent>
                                  </HoverCard>
                                </li>
                              );
                            }
                            return (
                              <li
                                key={index}
                                className="text-sm text-muted-foreground list-disc marker:text-muted-foreground/50"
                              >
                                {item}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
