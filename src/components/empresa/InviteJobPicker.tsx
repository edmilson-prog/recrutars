/**
 * InviteJobPicker
 *
 * Seletor de vagas do fluxo "Convidar candidato" (Banco de Talentos, Salvos e
 * Perfil do Candidato). Substitui o DropdownMenu que listava todas as vagas sem
 * busca nem limite de altura.
 *
 * Fonte da verdade do design: Claude Design — Recrutars Design System,
 * `templates/invite-job-picker/InviteJobPicker.dc.html`.
 *
 * Comportamento definido no design:
 * - Popover + Command (mesmo padrão do combobox de estado em Candidates.tsx)
 * - Busca com autofoco a partir de 6 vagas (título, empresa ou cidade, ignora acentos)
 * - Rolagem interna com altura máxima de 288px — o menu nunca estoura a tela
 * - Ordenação pelo match do candidato quando os scores são informados
 * - Título truncado + meta em linha própria: itens de altura constante
 * - Vaga já convidada aparece marcada e desabilitada
 * - Fluxo preservado: selecionar abre o mesmo modal de mensagem
 */

import { useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Check, Send, Star } from 'lucide-react';
import { Button, type ButtonProps } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import type { Job } from '@/types';

/** A busca só aparece a partir deste número de vagas (design: 6). */
const SEARCH_THRESHOLD = 6;

/** Score mínimo para a vaga do topo receber a estrela de "melhor match". */
const BEST_MATCH_THRESHOLD = 60;

export interface InviteJobPickerProps {
  /** Vagas ativas da empresa. */
  jobs: Job[];
  /** Chamado ao escolher uma vaga — deve abrir o modal de mensagem. */
  onSelectJob: (job: Job) => void;
  /** Match do candidato por vaga (0-100). Quando informado, ordena a lista. */
  scores?: Map<string, number> | Array<{ jobId: string; score: number }>;
  /** Vagas em que o candidato já está — aparecem marcadas e desabilitadas. */
  invitedJobIds?: Iterable<string>;
  /** Rótulo das vagas desabilitadas. */
  invitedLabel?: string;
  /** Texto do botão que abre o seletor. */
  triggerLabel?: string;
  triggerVariant?: ButtonProps['variant'];
  triggerSize?: ButtonProps['size'];
  triggerClassName?: string;
  /** Classe do ícone do botão (call sites usam w-3/w-4). */
  iconClassName?: string;
  /** Elemento extra no fim do botão (ex.: ChevronDown). */
  triggerAdornment?: React.ReactNode;
  align?: 'start' | 'center' | 'end';
  contentClassName?: string;
  disabled?: boolean;
}

/** Remove acentos e caixa para que a busca case "Analista" com "análista". */
const normalize = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();

/** Cores do badge de match, conforme faixas definidas no design. */
const scoreBadgeClass = (score: number): string => {
  if (score >= 80) return 'bg-emerald-400/15 text-emerald-600 dark:text-emerald-400';
  if (score >= 60) return 'bg-amber-400/15 text-amber-600 dark:text-amber-400';
  if (score >= 40) return 'bg-sky-400/15 text-sky-600 dark:text-sky-400';
  return 'bg-muted text-muted-foreground';
};

/** "Embalagio · Caxias do Sul/RS" — empresa só entra quando há mais de uma. */
const jobMeta = (job: Job, showCompany: boolean): string => {
  const place = job.city && job.state ? `${job.city}/${job.state}` : job.location;
  return [showCompany ? job.companyName : '', place].filter(Boolean).join(' · ');
};

export function InviteJobPicker({
  jobs,
  onSelectJob,
  scores,
  invitedJobIds,
  invitedLabel = 'Convidado',
  triggerLabel = 'Convidar',
  triggerVariant,
  triggerSize,
  triggerClassName,
  iconClassName = 'w-4 h-4 mr-2',
  triggerAdornment,
  align = 'end',
  contentClassName,
  disabled,
}: InviteJobPickerProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const commandRef = useRef<HTMLDivElement>(null);

  const scoreMap = useMemo(() => {
    if (!scores) return null;
    if (scores instanceof Map) return scores;
    return new Map(scores.map((s) => [s.jobId, s.score]));
  }, [scores]);

  const invitedSet = useMemo(
    () => new Set(invitedJobIds ?? []),
    [invitedJobIds]
  );

  // Empresa só aparece na meta quando a lista mistura mais de uma.
  const showCompany = useMemo(
    () => new Set(jobs.map((j) => j.companyName)).size > 1,
    [jobs]
  );

  /** Vagas ordenadas pelo match (desc) — empate resolvido pelo título. */
  const sortedJobs = useMemo(() => {
    if (!scoreMap) return jobs;
    return [...jobs].sort((a, b) => {
      const diff = (scoreMap.get(b.id) ?? 0) - (scoreMap.get(a.id) ?? 0);
      return diff !== 0 ? diff : a.title.localeCompare(b.title, 'pt-BR');
    });
  }, [jobs, scoreMap]);

  const showSearch = jobs.length >= SEARCH_THRESHOLD;

  const visibleJobs = useMemo(() => {
    const q = normalize(query.trim());
    if (!q) return sortedJobs;
    return sortedJobs.filter((job) =>
      normalize(`${job.title} ${job.companyName} ${job.location} ${job.city ?? ''} ${job.state ?? ''}`).includes(q)
    );
  }, [sortedJobs, query]);

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) setQuery('');
  };

  const handleSelect = (job: Job) => {
    if (invitedSet.has(job.id)) return;
    handleOpenChange(false);
    onSelectJob(job);
  };

  const countLabel = `${jobs.length} ${jobs.length === 1 ? 'vaga ativa' : 'vagas ativas'}`;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant={triggerVariant}
          size={triggerSize}
          className={triggerClassName}
          disabled={disabled}
          aria-expanded={open}
          aria-haspopup="listbox"
        >
          <Send className={iconClassName} />
          {triggerLabel}
          {triggerAdornment}
        </Button>
      </PopoverTrigger>

      <PopoverContent
        align={align}
        className={cn('w-[22.625rem] max-w-[calc(100vw-2rem)] p-0', contentClassName)}
        // Sem campo de busca não há elemento focável: foca a raiz do Command
        // para que ↑ ↓ e Enter continuem funcionando.
        onOpenAutoFocus={
          showSearch
            ? undefined
            : (event) => {
                event.preventDefault();
                commandRef.current?.focus();
              }
        }
      >
        <div className="flex items-center justify-between gap-2 border-b border-border/60 px-3.5 py-2.5">
          <span className="text-[10px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
            Convidar para vaga
          </span>
          {jobs.length > 0 && (
            <span className="shrink-0 whitespace-nowrap rounded-full bg-secondary/15 px-2 py-0.5 text-[10px] font-semibold text-secondary">
              {countLabel}
            </span>
          )}
        </div>

        {jobs.length === 0 ? (
          <div className="px-4 py-7 text-center">
            <Briefcase className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mb-1 mt-2 text-[13px] font-semibold text-foreground">Sem vagas ativas</p>
            <p className="mb-3.5 text-[11px] text-muted-foreground">
              Publique uma vaga para convidar candidatos.
            </p>
            <Button variant="outline" size="sm" className="text-secondary" asChild>
              <Link to="/empresa/vagas/nova">+ Criar vaga</Link>
            </Button>
          </div>
        ) : (
          <Command
            ref={commandRef}
            tabIndex={-1}
            shouldFilter={false}
            loop
            className="outline-none focus:outline-none focus-visible:outline-none"
          >
            {showSearch && (
              <CommandInput
                value={query}
                onValueChange={setQuery}
                placeholder="Buscar vaga, empresa ou cidade..."
              />
            )}

            <CommandList className="max-h-[288px] p-1.5">
              <CommandEmpty className="px-4 py-6 text-center">
                <p className="text-[13px] font-semibold text-foreground">Nenhuma vaga encontrada</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Tente outro termo — busque por título, empresa ou cidade.
                </p>
              </CommandEmpty>

              <CommandGroup className="p-0">
                {visibleJobs.map((job, index) => {
                  const invited = invitedSet.has(job.id);
                  const score = scoreMap?.get(job.id);
                  const isBest =
                    !query.trim() &&
                    index === 0 &&
                    score !== undefined &&
                    score >= BEST_MATCH_THRESHOLD;

                  return (
                    <CommandItem
                      key={job.id}
                      value={job.id}
                      disabled={invited}
                      onSelect={() => handleSelect(job)}
                      className={cn(
                        'flex items-center gap-2.5 rounded-lg px-2.5 py-2',
                        invited ? 'opacity-50' : 'cursor-pointer'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          {isBest && (
                            <Star className="h-3 w-3 shrink-0 fill-secondary text-secondary" />
                          )}
                          <span className="truncate text-[13px] font-medium text-foreground">
                            {job.title}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                          {jobMeta(job, showCompany)}
                        </p>
                      </div>

                      {invited ? (
                        <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                          <Check className="h-3 w-3" />
                          {invitedLabel}
                        </span>
                      ) : (
                        score !== undefined && (
                          <span
                            className={cn(
                              'shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold',
                              scoreBadgeClass(score)
                            )}
                          >
                            {score}%
                          </span>
                        )
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>

            {visibleJobs.length > 0 && (
              <div className="border-t border-border/60 px-3.5 py-1.5 text-center text-[9.5px] tracking-wide text-muted-foreground">
                ↑ ↓ navegar · Enter convidar · Esc fechar
              </div>
            )}
          </Command>
        )}
      </PopoverContent>
    </Popover>
  );
}
