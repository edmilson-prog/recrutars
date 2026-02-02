/**
 * Internal Candidate Invite
 * PRD-052: Seleção de candidatos internos (da base)
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Search, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { addAuditLog } from '@/utils/auditLog';

interface InternalCandidateInviteProps {
  testId: string;
  testName: string;
}

const mockCandidates = [
  { id: 'cand-1', name: 'Ana Silva', email: 'ana.silva@email.com', title: 'Gerente de Projetos' },
  { id: 'cand-2', name: 'Bruno Costa', email: 'bruno.costa@email.com', title: 'Coordenador' },
  { id: 'cand-3', name: 'Carla Mendes', email: 'carla.mendes@email.com', title: 'Analista Sênior' },
  { id: 'cand-4', name: 'Eduardo Lima', email: 'edu.lima@email.com', title: 'Executivo de Vendas' },
  { id: 'cand-5', name: 'Fernanda Rocha', email: 'fer.rocha@email.com', title: 'Consultora' },
];

export function InternalCandidateInvite({ testId, testName }: InternalCandidateInviteProps) {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = mockCandidates.filter(
    c => c.name.toLowerCase().includes(search.toLowerCase()) ||
         c.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCandidate = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = () => {
    if (selected.size === 0) return;
    selected.forEach(id => {
      const cand = mockCandidates.find(c => c.id === id);
      if (cand) {
        addAuditLog('invite_sent', 'user-comp-1', 'Maria Recrutadora', 'invitation', `inv-${Date.now()}`, cand.name, `Teste: ${testName}`);
      }
    });
    toast({
      title: 'Convites enviados',
      description: `${selected.size} candidato${selected.size > 1 ? 's' : ''} convidado${selected.size > 1 ? 's' : ''}.`,
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
        {filtered.map(cand => (
          <label
            key={cand.id}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
          >
            <Checkbox
              checked={selected.has(cand.id)}
              onCheckedChange={() => toggleCandidate(cand.id)}
            />
            <Avatar className="h-8 w-8">
              <AvatarFallback className="text-xs">
                {cand.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{cand.name}</p>
              <p className="text-xs text-muted-foreground">{cand.title} · {cand.email}</p>
            </div>
          </label>
        ))}
      </div>

      <Button onClick={handleSend} disabled={selected.size === 0}>
        <Send className="h-4 w-4 mr-2" />
        Convidar {selected.size > 0 ? `${selected.size} selecionado${selected.size > 1 ? 's' : ''}` : ''}
      </Button>
    </div>
  );
}
