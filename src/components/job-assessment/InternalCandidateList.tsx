/**
 * InternalCandidateList Component
 * PRD-048: Teste por Vaga
 *
 * Lista de candidatos internos para enviar convites
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  User,
  Mail,
  Check,
  Clock,
  AlertCircle,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { JobAssessmentInvite } from '@/types/assessment';

export interface InternalCandidate {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  appliedAt: string;
  status: 'new' | 'screening' | 'interview' | 'offer' | 'hired' | 'rejected';
}

interface InternalCandidateListProps {
  candidates: InternalCandidate[];
  existingInvites: JobAssessmentInvite[];
  onSendInvites: (candidateIds: string[]) => void;
  isSending?: boolean;
  className?: string;
}

const statusLabels: Record<InternalCandidate['status'], string> = {
  new: 'Novo',
  screening: 'Triagem',
  interview: 'Entrevista',
  offer: 'Proposta',
  hired: 'Contratado',
  rejected: 'Rejeitado',
};

const statusColors: Record<InternalCandidate['status'], string> = {
  new: 'bg-blue-500/10 text-blue-500',
  screening: 'bg-amber-500/10 text-amber-500',
  interview: 'bg-purple-500/10 text-purple-500',
  offer: 'bg-green-500/10 text-green-500',
  hired: 'bg-success/10 text-success',
  rejected: 'bg-muted text-muted-foreground',
};

function getInviteStatus(
  candidateId: string,
  invites: JobAssessmentInvite[]
): JobAssessmentInvite | undefined {
  return invites.find(
    (inv) => inv.type === 'internal' && inv.candidateId === candidateId
  );
}

export function InternalCandidateList({
  candidates,
  existingInvites,
  onSendInvites,
  isSending,
  className,
}: InternalCandidateListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filtrar candidatos
  const filteredCandidates = useMemo(() => {
    if (!searchTerm) return candidates;
    const term = searchTerm.toLowerCase();
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.email.toLowerCase().includes(term)
    );
  }, [candidates, searchTerm]);

  // Candidatos que ainda não foram convidados
  const availableCandidates = useMemo(() => {
    return filteredCandidates.filter((c) => {
      const invite = getInviteStatus(c.id, existingInvites);
      return !invite || invite.status === 'expired';
    });
  }, [filteredCandidates, existingInvites]);

  // Toggle seleção
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Selecionar todos disponíveis
  const selectAll = () => {
    if (selectedIds.length === availableCandidates.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(availableCandidates.map((c) => c.id));
    }
  };

  // Enviar convites
  const handleSend = () => {
    if (selectedIds.length > 0) {
      onSendInvites(selectedIds);
      setSelectedIds([]);
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-semibold text-foreground">Candidatos da Vaga</h3>
          <p className="text-sm text-muted-foreground">
            {candidates.length} candidatos, {availableCandidates.length}{' '}
            disponíveis para convite
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar candidato..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Select all */}
      {availableCandidates.length > 0 && (
        <div className="flex items-center justify-between py-2 border-b">
          <label className="flex items-center gap-2 cursor-pointer">
            <Checkbox
              checked={
                selectedIds.length === availableCandidates.length &&
                availableCandidates.length > 0
              }
              onCheckedChange={selectAll}
            />
            <span className="text-sm text-muted-foreground">
              Selecionar todos ({availableCandidates.length})
            </span>
          </label>

          {selectedIds.length > 0 && (
            <Button
              size="sm"
              onClick={handleSend}
              disabled={isSending}
              className="gradient-primary"
            >
              <Mail className="w-4 h-4 mr-2" />
              {isSending
                ? 'Enviando...'
                : `Enviar para ${selectedIds.length} candidato(s)`}
            </Button>
          )}
        </div>
      )}

      {/* Lista */}
      <div className="space-y-2 max-h-[400px] overflow-y-auto">
        {filteredCandidates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            Nenhum candidato encontrado
          </div>
        ) : (
          filteredCandidates.map((candidate, index) => {
            const invite = getInviteStatus(candidate.id, existingInvites);
            const isAvailable = !invite || invite.status === 'expired';
            const isSelected = selectedIds.includes(candidate.id);

            return (
              <motion.div
                key={candidate.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.02 }}
                className={cn(
                  'flex items-center gap-3 p-3 rounded-lg border transition-all',
                  isSelected
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50',
                  !isAvailable && 'opacity-60'
                )}
              >
                {/* Checkbox */}
                {isAvailable && (
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(candidate.id)}
                  />
                )}

                {/* Avatar */}
                <Avatar className="w-10 h-10">
                  <AvatarImage src={candidate.avatar} />
                  <AvatarFallback>
                    {candidate.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground truncate">
                      {candidate.name}
                    </span>
                    <Badge
                      variant="secondary"
                      className={statusColors[candidate.status]}
                    >
                      {statusLabels[candidate.status]}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {candidate.email}
                  </p>
                </div>

                {/* Invite status */}
                {invite && (
                  <div className="flex items-center gap-2">
                    {invite.status === 'pending' && (
                      <Badge variant="outline\" className="text-amber-500">
                        <Clock className="w-3 h-3 mr-1" />
                        Aguardando
                      </Badge>
                    )}
                    {invite.status === 'started' && (
                      <Badge variant="outline" className="text-blue-500">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Em andamento
                      </Badge>
                    )}
                    {invite.status === 'completed' && (
                      <Badge variant="outline" className="text-success">
                        <Check className="w-3 h-3 mr-1" />
                        Concluído
                      </Badge>
                    )}
                    {invite.status === 'expired' && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Expirado
                      </Badge>
                    )}
                  </div>
                )}
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}
