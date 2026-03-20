/**
 * Internal Candidate / Team Member Invite
 * PRD-052: Seleção de candidatos internos (da base) — Supabase-backed
 * PRD-088: Dual mode — candidates (default) or team members (collaborator tests)
 * PRD-088 hotfix: Channel selection step for collaborator mode
 */

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Search, Send, Loader2, Link2, Mail, MessageCircle, ArrowLeft, Copy, Check } from 'lucide-react';
import {
  useCompanyCandidates,
  useCompanyTeamMembersForInvite,
  useSendTestInvitations,
} from '@/hooks/useCompanyTestsQuery';
import { useDepartments } from '@/hooks/useTeamsQuery';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { TargetAudience, InvitationMethod } from '@/types/companyTest';

interface InternalCandidateInviteProps {
  testId: string;
  testName: string;
  targetAudience?: TargetAudience;
}

type SendStep = 'select' | 'channel' | 'links';

interface GeneratedLink {
  name: string;
  link: string;
}

const GAUGE_STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  unmapped: { label: 'Sem teste', variant: 'outline' },
  not_started: { label: 'Sem teste', variant: 'outline' },
  invited: { label: 'Convidado', variant: 'secondary' },
  in_progress: { label: 'Em andamento', variant: 'secondary' },
  mapped: { label: 'Mapeado', variant: 'default' },
  retest_pending: { label: 'Reteste pendente', variant: 'destructive' },
};

const CHANNEL_OPTIONS = [
  { value: 'public_link' as InvitationMethod, label: 'Link Unico', description: 'Gera links copiaveis para compartilhar manualmente', icon: Link2 },
  { value: 'email' as InvitationMethod, label: 'Email', description: 'Envia email com o link do teste para cada colaborador', icon: Mail },
  { value: 'internal' as InvitationMethod, label: 'WhatsApp', description: 'Envia mensagem via WhatsApp (Evolution API)', icon: MessageCircle },
];

export function InternalCandidateInvite({ testId, testName, targetAudience }: InternalCandidateInviteProps) {
  const { currentCompany } = useAuth();
  const isCollaborator = targetAudience === 'collaborator';

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [sendStep, setSendStep] = useState<SendStep>('select');
  const [selectedChannel, setSelectedChannel] = useState<InvitationMethod>('public_link');
  const [generatedLinks, setGeneratedLinks] = useState<GeneratedLink[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Candidate mode (default)
  const { data: candidates, isLoading: candidatesLoading } = useCompanyCandidates(
    !isCollaborator ? currentCompany?.id : undefined,
    search,
  );

  // Collaborator mode
  const { data: teamMembers, isLoading: teamMembersLoading } = useCompanyTeamMembersForInvite(
    isCollaborator ? currentCompany?.id : undefined,
    search,
  );

  const { data: departments } = useDepartments(isCollaborator ? currentCompany?.id : undefined);

  const sendInvitations = useSendTestInvitations();

  // Query active invitations for this test to detect duplicates (collaborator mode)
  const { data: activeInvitations } = useQuery({
    queryKey: ['active-invitations-for-test', testId],
    queryFn: async () => {
      const { data } = await supabase
        .from('test_invitations')
        .select('team_member_id')
        .eq('test_id', testId)
        .in('status', ['sent', 'viewed', 'started'])
        .not('team_member_id', 'is', null);
      return data ?? [];
    },
    enabled: isCollaborator && !!testId,
  });

  const membersWithActiveInvite = useMemo(
    () => new Set((activeInvitations ?? []).map(i => i.team_member_id as string)),
    [activeInvitations],
  );

  const isLoading = isCollaborator ? teamMembersLoading : candidatesLoading;

  // Filter team members by department
  const filteredTeamMembers = departmentFilter === 'all'
    ? teamMembers
    : teamMembers?.filter(m => m.departmentId === departmentFilter);

  const toggleItem = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleProceedToChannel = () => {
    if (selected.size === 0) return;
    setSendStep('channel');
  };

  const handleBackToSelect = () => {
    setSendStep('select');
  };

  const handleConfirmSend = async () => {
    if (selected.size === 0) return;

    try {
      if (isCollaborator && teamMembers) {
        // Collaborator mode: filter out members who already have active invitations
        const selectedMembers = teamMembers.filter(m => selected.has(m.id));
        const newMembers = selectedMembers.filter(m => !membersWithActiveInvite.has(m.id));
        const duplicateMembers = selectedMembers.filter(m => membersWithActiveInvite.has(m.id));

        if (duplicateMembers.length > 0) {
          const names = duplicateMembers.map(m => m.name).slice(0, 3).join(', ');
          const extra = duplicateMembers.length > 3 ? ` e mais ${duplicateMembers.length - 3}` : '';
          toast.info(`Convite ja ativo para: ${names}${extra}. Apenas novos convites serao enviados.`);
        }

        if (newMembers.length === 0) {
          toast.warning('Todos os colaboradores selecionados ja possuem convite ativo para este teste.');
          return;
        }

        const result = await sendInvitations.mutateAsync({
          testId,
          invitations: newMembers.map(m => ({
            teamMemberId: m.id,
            candidateName: m.name,
            candidateEmail: m.email,
            method: selectedChannel,
          })),
        });

        // If channel is Link Unico, show generated links instead of resetting
        if (selectedChannel === 'public_link' && result?.length > 0) {
          const links = result.map((inv: { candidateName?: string; candidate_name?: string; token?: string }) => ({
            name: (inv.candidateName ?? inv.candidate_name ?? '') as string,
            link: `${window.location.origin}/convite/teste/${inv.token}`,
          }));
          setGeneratedLinks(links);
          setSendStep('links');
          setSelected(new Set());
          return;
        }
      } else if (candidates) {
      // Candidate mode: existing behavior (no channel step)
      const selectedCandidates = candidates.filter(c => selected.has(c.id));

      // PRD-081: Create team_members for each selected candidate (invite_base)
      if (currentCompany?.id) {
        for (const c of selectedCandidates) {
          const { data: existing } = await supabase
            .from('team_members')
            .select('id')
            .eq('company_id', currentCompany.id)
            .eq('email', c.email)
            .maybeSingle();

          if (!existing) {
            await supabase.from('team_members').insert({
              company_id: currentCompany.id,
              name: c.name,
              email: c.email,
              gauge_status: 'invited',
            });
          }
        }
      }

      await sendInvitations.mutateAsync({
        testId,
        invitations: selectedCandidates.map(c => ({
          candidateId: c.id,
          candidateName: c.name,
          candidateEmail: c.email,
          method: 'internal' as const,
        })),
      });
    }

    setSelected(new Set());
    setSendStep('select');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar convites.';
      if (msg.includes('unique constraint') || msg.includes('duplicate key')) {
        toast.error('Alguns colaboradores ja possuem convite ativo para este teste.');
      } else {
        toast.error(`Erro ao enviar convites: ${msg}`);
      }
    }
  };

  // For candidate mode, send directly (no channel step)
  const handleSendDirect = async () => {
    await handleConfirmSend();
  };

  // ─── Links Display Step (after Link Unico send) ───
  if (sendStep === 'links' && generatedLinks.length > 0) {
    const handleCopyLink = async (link: string, index: number) => {
      try {
        await navigator.clipboard.writeText(link);
        setCopiedIndex(index);
        toast.success('Link copiado!');
        setTimeout(() => setCopiedIndex(null), 2000);
      } catch {
        toast.error('Erro ao copiar link.');
      }
    };

    const handleCopyAll = async () => {
      try {
        const allLinks = generatedLinks.map(l => `${l.name}: ${l.link}`).join('\n');
        await navigator.clipboard.writeText(allLinks);
        toast.success('Todos os links copiados!');
      } catch {
        toast.error('Erro ao copiar links.');
      }
    };

    const handleFinish = () => {
      setGeneratedLinks([]);
      setSendStep('select');
    };

    return (
      <div className="space-y-4">
        <div className="space-y-1">
          <Label className="text-sm font-medium">Links gerados</Label>
          <p className="text-xs text-muted-foreground">
            Copie e compartilhe os links com os colaboradores. Os links expiram em 30 dias.
          </p>
        </div>

        <div className="space-y-3 max-h-[300px] overflow-y-auto">
          {generatedLinks.map((item, index) => (
            <div key={index} className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">{item.name}</p>
              <div className="flex gap-2">
                <Input
                  value={item.link}
                  readOnly
                  className="bg-muted/50 text-xs font-mono"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleCopyLink(item.link, index)}
                  className="shrink-0"
                >
                  {copiedIndex === index ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {generatedLinks.length > 1 && (
            <Button variant="outline" onClick={handleCopyAll}>
              <Copy className="h-4 w-4 mr-2" />
              Copiar todos
            </Button>
          )}
          <Button className="flex-1" onClick={handleFinish}>
            Concluir
          </Button>
        </div>
      </div>
    );
  }

  // ─── Channel Selection Step (collaborator mode only) ───
  if (isCollaborator && sendStep === 'channel') {
    const selectedNames = teamMembers
      ?.filter(m => selected.has(m.id))
      .map(m => m.name) ?? [];

    return (
      <div className="space-y-4">
        {/* Summary */}
        <div className="rounded-md border p-3 bg-muted/20">
          <p className="text-sm font-medium">
            {selectedNames.length} colaborador{selectedNames.length > 1 ? 'es' : ''} selecionado{selectedNames.length > 1 ? 's' : ''}
          </p>
          <p className="text-xs text-muted-foreground mt-1 truncate">
            {selectedNames.slice(0, 3).join(', ')}{selectedNames.length > 3 ? ` e mais ${selectedNames.length - 3}` : ''}
          </p>
        </div>

        {/* Channel Selection */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Como deseja enviar o convite?</Label>
          <RadioGroup value={selectedChannel} onValueChange={(v) => setSelectedChannel(v as InvitationMethod)}>
            {CHANNEL_OPTIONS.map(opt => {
              const Icon = opt.icon;
              return (
                <label
                  key={opt.value}
                  className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                >
                  <RadioGroupItem value={opt.value} />
                  <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-sm font-medium">{opt.label}</p>
                    <p className="text-xs text-muted-foreground">{opt.description}</p>
                  </div>
                </label>
              );
            })}
          </RadioGroup>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleBackToSelect} disabled={sendInvitations.isPending}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <Button className="flex-1" onClick={handleConfirmSend} disabled={sendInvitations.isPending}>
            {sendInvitations.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Confirmar Envio
          </Button>
        </div>
      </div>
    );
  }

  // ─── Selection Step (both modes) ───
  return (
    <div className="space-y-4">
      {/* Search + Department filter */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={isCollaborator ? 'Buscar colaborador por nome ou email...' : 'Buscar candidato por nome ou email...'}
            className="pl-10"
          />
        </div>
        {isCollaborator && departments && departments.length > 0 && (
          <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Departamento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {departments.map(d => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {/* List */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-2">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-8 w-8 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))
        ) : isCollaborator ? (
          // Team members list
          (filteredTeamMembers ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {search ? 'Nenhum colaborador encontrado.' : 'Nenhum colaborador ativo na equipe.'}
            </p>
          ) : (
            (filteredTeamMembers ?? []).map(member => {
              const statusConfig = GAUGE_STATUS_LABELS[member.gaugeStatus] ?? GAUGE_STATUS_LABELS.unmapped;
              const hasActiveInvite = membersWithActiveInvite.has(member.id);
              return (
                <label
                  key={member.id}
                  className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer ${hasActiveInvite ? 'opacity-60' : 'hover:bg-muted/50'}`}
                >
                  <Checkbox
                    checked={selected.has(member.id)}
                    onCheckedChange={() => toggleItem(member.id)}
                    disabled={sendInvitations.isPending || hasActiveInvite}
                  />
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium truncate">{member.name}</p>
                      <Badge variant={statusConfig.variant} className="text-[10px] h-5">
                        {statusConfig.label}
                      </Badge>
                      {member.archetype && (
                        <Badge variant="outline" className="text-[10px] h-5">
                          {member.archetype}
                        </Badge>
                      )}
                      {hasActiveInvite && (
                        <Badge variant="secondary" className="text-[10px] h-5 bg-amber-100 text-amber-700">
                          Convite ativo
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                </label>
              );
            })
          )
        ) : (
          // Candidates list (existing behavior)
          (candidates ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              {search ? 'Nenhum candidato encontrado.' : 'Nenhum candidato na base desta empresa.'}
            </p>
          ) : (
            (candidates ?? []).map(cand => (
              <label
                key={cand.id}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
              >
                <Checkbox
                  checked={selected.has(cand.id)}
                  onCheckedChange={() => toggleItem(cand.id)}
                  disabled={sendInvitations.isPending}
                />
                <Avatar className="h-8 w-8">
                  {cand.avatarUrl && <AvatarImage src={cand.avatarUrl} />}
                  <AvatarFallback className="text-xs">
                    {cand.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{cand.name}</p>
                  <p className="text-xs text-muted-foreground">{cand.title ? `${cand.title} · ` : ''}{cand.email}</p>
                </div>
              </label>
            ))
          )
        )}
      </div>

      {/* Action button */}
      {isCollaborator ? (
        <Button onClick={handleProceedToChannel} disabled={selected.size === 0 || sendInvitations.isPending}>
          <Send className="h-4 w-4 mr-2" />
          Escolher canal de envio {selected.size > 0 ? `(${selected.size})` : ''}
        </Button>
      ) : (
        <Button onClick={handleSendDirect} disabled={selected.size === 0 || sendInvitations.isPending}>
          {sendInvitations.isPending ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Convidar {selected.size > 0 ? `${selected.size} selecionado${selected.size > 1 ? 's' : ''}` : ''}
        </Button>
      )}
    </div>
  );
}
