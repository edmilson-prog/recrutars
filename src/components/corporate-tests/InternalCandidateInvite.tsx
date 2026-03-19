/**
 * Internal Candidate / Team Member Invite
 * PRD-052: Seleção de candidatos internos (da base) — Supabase-backed
 * PRD-088: Dual mode — candidates (default) or team members (collaborator tests)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Send, Loader2 } from 'lucide-react';
import {
  useCompanyCandidates,
  useCompanyTeamMembersForInvite,
  useSendTestInvitations,
} from '@/hooks/useCompanyTestsQuery';
import { useDepartments } from '@/hooks/useTeamsQuery';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import type { TargetAudience } from '@/types/companyTest';

interface InternalCandidateInviteProps {
  testId: string;
  testName: string;
  targetAudience?: TargetAudience;
}

const GAUGE_STATUS_LABELS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  unmapped: { label: 'Sem teste', variant: 'outline' },
  not_started: { label: 'Sem teste', variant: 'outline' },
  invited: { label: 'Convidado', variant: 'secondary' },
  in_progress: { label: 'Em andamento', variant: 'secondary' },
  mapped: { label: 'Mapeado', variant: 'default' },
  retest_pending: { label: 'Reteste pendente', variant: 'destructive' },
};

export function InternalCandidateInvite({ testId, testName, targetAudience }: InternalCandidateInviteProps) {
  const { currentCompany } = useAuth();
  const isCollaborator = targetAudience === 'collaborator';

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [departmentFilter, setDepartmentFilter] = useState('all');

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

  const handleSend = async () => {
    if (selected.size === 0) return;

    if (isCollaborator && teamMembers) {
      // Collaborator mode: send invitations with teamMemberId
      const selectedMembers = teamMembers.filter(m => selected.has(m.id));

      await sendInvitations.mutateAsync({
        testId,
        invitations: selectedMembers.map(m => ({
          teamMemberId: m.id,
          candidateName: m.name,
          candidateEmail: m.email,
          method: 'internal' as const,
        })),
      });
    } else if (candidates) {
      // Candidate mode: existing behavior
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
  };

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
              return (
                <label
                  key={member.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                >
                  <Checkbox
                    checked={selected.has(member.id)}
                    onCheckedChange={() => toggleItem(member.id)}
                    disabled={sendInvitations.isPending}
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

      <Button onClick={handleSend} disabled={selected.size === 0 || sendInvitations.isPending}>
        {sendInvitations.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <Send className="h-4 w-4 mr-2" />
        )}
        Convidar {selected.size > 0 ? `${selected.size} selecionado${selected.size > 1 ? 's' : ''}` : ''}
      </Button>
    </div>
  );
}
