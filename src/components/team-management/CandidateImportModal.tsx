/**
 * CandidateImportModal
 * PRD-055: Modal para importar candidato aprovado como membro da equipe.
 */

import { useState, useMemo } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { UserPlus, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDepartments, usePositions } from '@/hooks/useTeamsQuery';
import { useAuth } from '@/contexts/AuthContext';
import { DIMENSION_SHORT_NAMES } from '@/types/gaugePro';
import type { GaugeProDimension, DimensionScores } from '@/types/gaugePro';
import type { TeamMember } from '@/types/teamManagement';

interface CandidateImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (data: Partial<TeamMember>) => void;
}

interface HiredCandidate {
  id: string;
  name: string;
  email: string;
  gaugeScores: DimensionScores | null;
  archetype: string | null;
}

const mockHiredCandidates: HiredCandidate[] = [
  {
    id: 'c1',
    name: 'Ana Rodrigues',
    email: 'ana.r@email.com',
    gaugeScores: { D1: 72, D2: 65, D3: 48, D4: 58, D5: 80 },
    archetype: 'Líder Inspirador',
  },
  {
    id: 'c2',
    name: 'Bruno Ferreira',
    email: 'bruno.f@email.com',
    gaugeScores: { D1: 45, D2: 38, D3: 75, D4: 82, D5: 55 },
    archetype: 'Especialista Técnico',
  },
  {
    id: 'c3',
    name: 'Carla Mendes',
    email: 'carla.m@email.com',
    gaugeScores: null,
    archetype: null,
  },
  {
    id: 'c4',
    name: 'Diego Santos',
    email: 'diego.s@email.com',
    gaugeScores: { D1: 68, D2: 72, D3: 55, D4: 42, D5: 78 },
    archetype: 'Comunicador Nato',
  },
  {
    id: 'c5',
    name: 'Elena Costa',
    email: 'elena.c@email.com',
    gaugeScores: null,
    archetype: null,
  },
];

const DIMENSIONS: GaugeProDimension[] = ['D1', 'D2', 'D3', 'D4', 'D5'];

function getBarColor(score: number): string {
  if (score >= 67) return 'bg-green-500';
  if (score >= 34) return 'bg-amber-500';
  return 'bg-red-500';
}

export default function CandidateImportModal({
  open,
  onOpenChange,
  onImport,
}: CandidateImportModalProps) {
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';

  const { data: departments = [] } = useDepartments(companyId);
  const { data: allPositions = [] } = usePositions('all');

  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [departmentId, setDepartmentId] = useState('');
  const [positionId, setPositionId] = useState('');

  const selectedCandidate = useMemo(
    () => mockHiredCandidates.find((c) => c.id === selectedCandidateId) ?? null,
    [selectedCandidateId],
  );

  const filteredPositions = useMemo(
    () => allPositions.filter((p) => p.departmentId === departmentId && p.isActive),
    [allPositions, departmentId],
  );

  const canImport = selectedCandidate !== null && departmentId !== '' && positionId !== '';

  function handleSelectCandidate(id: string) {
    setSelectedCandidateId(id);
    setDepartmentId('');
    setPositionId('');
  }

  function handleDepartmentChange(value: string) {
    setDepartmentId(value);
    setPositionId('');
  }

  function handleImport() {
    if (!selectedCandidate || !canImport) return;

    const data: Partial<TeamMember> = {
      name: selectedCandidate.name,
      email: selectedCandidate.email,
      departmentId,
      positionId,
      gaugeStatus: selectedCandidate.gaugeScores ? 'mapped' : 'unmapped',
      gaugeScores: selectedCandidate.gaugeScores ?? undefined,
      archetype: selectedCandidate.archetype ?? undefined,
      importedFromCandidateId: selectedCandidate.id,
      hireDate: new Date().toISOString(),
      isActive: true,
    };

    onImport(data);
    handleReset();
  }

  function handleReset() {
    setSelectedCandidateId(null);
    setDepartmentId('');
    setPositionId('');
  }

  function handleOpenChange(value: boolean) {
    if (!value) handleReset();
    onOpenChange(value);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5 text-primary" />
            Importar Candidato Aprovado
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-hidden space-y-5">
          {/* Candidate selection list */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Selecione o candidato</Label>
            <ScrollArea className="h-[180px] border rounded-md">
              <div className="p-2 space-y-1">
                {mockHiredCandidates.map((candidate) => {
                  const initials = candidate.name
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();
                  const isSelected = selectedCandidateId === candidate.id;

                  return (
                    <button
                      key={candidate.id}
                      type="button"
                      className={cn(
                        'w-full flex items-center gap-3 p-2.5 rounded-md text-left transition-colors',
                        isSelected
                          ? 'bg-primary/10 border border-primary/30'
                          : 'hover:bg-muted/50 border border-transparent',
                      )}
                      onClick={() => handleSelectCandidate(candidate.id)}
                    >
                      <Avatar className="h-9 w-9 shrink-0">
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{candidate.name}</p>
                        <p className="text-xs text-muted-foreground truncate">
                          {candidate.email}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {candidate.gaugeScores ? (
                          <Badge
                            variant="secondary"
                            className="bg-green-100 text-green-800 text-[10px]"
                          >
                            Gauge-Pro
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            Sem teste
                          </Badge>
                        )}
                        {isSelected && (
                          <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
          </div>

          {/* Form fields (only shown after selecting a candidate) */}
          {selectedCandidate && (
            <>
              <Separator />

              <div className="grid grid-cols-2 gap-4">
                {/* Name (read-only) */}
                <div className="space-y-1.5">
                  <Label htmlFor="import-name" className="text-xs">
                    Nome
                  </Label>
                  <Input
                    id="import-name"
                    value={selectedCandidate.name}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>

                {/* Email (read-only) */}
                <div className="space-y-1.5">
                  <Label htmlFor="import-email" className="text-xs">
                    Email
                  </Label>
                  <Input
                    id="import-email"
                    value={selectedCandidate.email}
                    readOnly
                    className="bg-muted/50"
                  />
                </div>

                {/* Department */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Departamento</Label>
                  <Select value={departmentId} onValueChange={handleDepartmentChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departments
                        .filter((d) => d.isActive)
                        .map((dept) => (
                          <SelectItem key={dept.id} value={dept.id}>
                            {dept.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Position */}
                <div className="space-y-1.5">
                  <Label className="text-xs">Cargo</Label>
                  <Select
                    value={positionId}
                    onValueChange={setPositionId}
                    disabled={!departmentId}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={departmentId ? 'Selecione...' : 'Selecione um departamento'}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredPositions.map((pos) => (
                        <SelectItem key={pos.id} value={pos.id}>
                          {pos.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Gauge-Pro Scores (if available) */}
              {selectedCandidate.gaugeScores && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-cyan-600" />
                    <span className="text-xs text-cyan-700 font-medium">
                      Scores importados do Gauge-Pro
                    </span>
                    {selectedCandidate.archetype && (
                      <Badge
                        variant="secondary"
                        className="ml-auto bg-cyan-100 text-cyan-800 text-[10px]"
                      >
                        {selectedCandidate.archetype}
                      </Badge>
                    )}
                  </div>
                  <div className="space-y-2 rounded-md border p-3 bg-muted/30">
                    {DIMENSIONS.map((dim) => {
                      const score = selectedCandidate.gaugeScores![dim];
                      return (
                        <div key={dim} className="space-y-0.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-muted-foreground font-medium">
                              {dim} - {DIMENSION_SHORT_NAMES[dim]}
                            </span>
                            <span className="font-semibold">{score}</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className={cn(
                                'h-full rounded-full transition-all',
                                getBarColor(score),
                              )}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <DialogFooter className="pt-2">
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleImport} disabled={!canImport}>
            <UserPlus className="h-4 w-4 mr-2" />
            Importar Colaborador
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
