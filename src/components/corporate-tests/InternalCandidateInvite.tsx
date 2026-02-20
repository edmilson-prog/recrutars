/**
 * Internal Candidate Invite
 * PRD-052: Seleção de candidatos internos (da base) — Supabase-backed
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Send, Loader2 } from 'lucide-react';
import { useCompanyCandidates, useSendTestInvitations } from '@/hooks/useCompanyTestsQuery';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';

interface InternalCandidateInviteProps {
  testId: string;
  testName: string;
}

export function InternalCandidateInvite({ testId, testName }: InternalCandidateInviteProps) {
  const { currentCompany } = useAuth();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const { data: candidates, isLoading } = useCompanyCandidates(currentCompany?.id, search);
  const sendInvitations = useSendTestInvitations();

  const toggleCandidate = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (selected.size === 0 || !candidates) return;

    const selectedCandidates = candidates.filter(c => selected.has(c.id));

    // PRD-081: Create team_members for each selected candidate (invite_base)
    if (currentCompany?.id) {
      for (const c of selectedCandidates) {
        // Check if team_member already exists
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

    setSelected(new Set());
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar candidato por nome ou email..."
          className="pl-10"
        />
      </div>

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
        ) : (candidates ?? []).length === 0 ? (
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
                onCheckedChange={() => toggleCandidate(cand.id)}
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
