/**
 * HiringModal — Modal de contratação de candidato aprovado
 * PRD-077: Fluxo de Contratação e Transição para Gestão de Equipes
 */

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Trophy, Loader2, AlertTriangle, ExternalLink, Star } from 'lucide-react';
import { toast } from 'sonner';
import { useDepartments } from '@/hooks/useTeamsQuery';
import { useHireCandidate } from '@/hooks/useHiringsQuery';
import { useAuth } from '@/contexts/AuthContext';
import type { Application, TestRequestStatus } from '@/types/application';
import type { HireResult } from '@/types/hiring';
import { Link } from 'react-router-dom';
import { getCandidateInitials } from '@/lib/candidateDisplayName';

interface HiringModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  application: Application;
  candidateName: string;
  candidateAvatar?: string;
  jobTitle: string;
  matchScore: number;
  testStatus: TestRequestStatus;
  candidateHasTest?: boolean;
  consentAccepted?: boolean;
  onHired: (result: HireResult) => void;
}

export function HiringModal({
  open,
  onOpenChange,
  application,
  candidateName,
  candidateAvatar,
  jobTitle,
  matchScore,
  testStatus,
  candidateHasTest,
  consentAccepted,
  onHired,
}: HiringModalProps) {
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';

  const { data: departments = [] } = useDepartments(companyId);
  const hireMutation = useHireCandidate();

  const [departmentId, setDepartmentId] = useState('');
  const [positionTitle, setPositionTitle] = useState(jobTitle);
  const [hireDate, setHireDate] = useState('');
  const [salary, setSalary] = useState('');
  const [notes, setNotes] = useState('');
  const [confirmOpen, setConfirmOpen] = useState(false);

  const activeDepartments = departments.filter((d) => d.isActive);
  const hasDepartments = activeDepartments.length > 0;
  const today = new Date().toISOString().split('T')[0];

  const canSubmit =
    departmentId.length > 0 &&
    positionTitle.trim().length > 0 &&
    hireDate.length > 0 &&
    consentAccepted === true &&
    !hireMutation.isPending;

  const handleSubmitClick = () => {
    if (!canSubmit) return;
    setConfirmOpen(true);
  };

  const handleConfirmHire = async (e: React.MouseEvent) => {
    e.preventDefault();

    try {
      const result = await hireMutation.mutateAsync({
        applicationId: application.id,
        departmentId,
        positionTitle: positionTitle.trim(),
        hireDate,
        salary: salary ? Number(salary.replace(/\D/g, '')) / 100 : undefined,
        notes: notes.trim() || undefined,
      });

      toast.success(`${candidateName} foi contratado(a) com sucesso!`);
      resetForm();
      onHired(result);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao contratar candidato';
      toast.error(msg);
    } finally {
      setConfirmOpen(false);
    }
  };

  const resetForm = () => {
    setDepartmentId('');
    setPositionTitle(jobTitle);
    setHireDate('');
    setSalary('');
    setNotes('');
  };

  const handleClose = (value: boolean) => {
    if (!value) resetForm();
    onOpenChange(value);
  };

  const formatSalary = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return '';
    const num = Number(digits) / 100;
    return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const initials = getCandidateInitials(candidateName);

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-emerald-600" />
              Contratar Candidato
            </DialogTitle>
            <DialogDescription className="sr-only">
              Formulário de contratação de candidato
            </DialogDescription>
          </DialogHeader>

          {/* Candidate summary */}
          <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
            <Avatar className="w-12 h-12">
              {candidateAvatar && <AvatarImage src={candidateAvatar} />}
              <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground truncate">{candidateName}</p>
              <p className="text-sm text-muted-foreground truncate">{jobTitle}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              {matchScore > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <Star className="w-3 h-3" />
                  {matchScore}%
                </Badge>
              )}
              <Badge
                variant={testStatus === 'realizado' ? 'default' : candidateHasTest ? 'secondary' : 'outline'}
                className={
                  testStatus === 'realizado' ? 'bg-emerald-100 text-emerald-700 border-emerald-200'
                  : candidateHasTest ? 'bg-cyan-100 text-cyan-700 border-cyan-200'
                  : ''
                }
              >
                {testStatus === 'realizado'
                  ? 'Gauge-Pro'
                  : testStatus === 'solicitado'
                    ? 'Teste pendente'
                    : candidateHasTest
                      ? 'Gauge-Pro voluntário'
                      : 'Sem teste'}
              </Badge>
            </div>
          </div>

          {/* LGPD: Aviso de consentimento pendente */}
          {consentAccepted !== true && (
            <Alert className="border-amber-500/40 bg-amber-500/10">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription className="text-amber-700 dark:text-amber-400">
                Aguardando consentimento do candidato. A contratação só é
                liberada após o candidato autorizar o compartilhamento dos
                dados (LGPD).
              </AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <div className="space-y-4 mt-2">
            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Departamento *</Label>
              {hasDepartments ? (
                <Select value={departmentId} onValueChange={setDepartmentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o departamento" />
                  </SelectTrigger>
                  <SelectContent>
                    {activeDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Alert>
                  <AlertTriangle className="w-4 h-4" />
                  <AlertDescription className="flex items-center justify-between">
                    <span>Nenhum departamento cadastrado.</span>
                    <Link
                      to="/empresa/equipes"
                      className="flex items-center gap-1 text-primary hover:underline text-sm font-medium"
                    >
                      Cadastrar <ExternalLink className="w-3 h-3" />
                    </Link>
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* Position title */}
            <div className="space-y-2">
              <Label htmlFor="position">Cargo definitivo *</Label>
              <Input
                id="position"
                value={positionTitle}
                onChange={(e) => setPositionTitle(e.target.value)}
                placeholder="Ex: Analista Financeiro, Vendedor Externo..."
              />
            </div>

            {/* Hire date + Salary — 2 colunas */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hireDate">Data de início *</Label>
                <Input
                  id="hireDate"
                  type="date"
                  value={hireDate}
                  min={today}
                  onChange={(e) => setHireDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="salary" className="flex items-center gap-2">
                  Salário
                  <Badge variant="outline" className="text-xs font-normal">Confidencial</Badge>
                </Label>
                <Input
                  id="salary"
                  value={salary}
                  onChange={(e) => setSalary(formatSalary(e.target.value))}
                  placeholder="R$ 0,00"
                />
              </div>
            </div>

            {/* Notes (optional) */}
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Anotações sobre a contratação..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => handleClose(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSubmitClick}
              disabled={!canSubmit}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {hireMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Trophy className="w-4 h-4 mr-2" />
              )}
              Confirmar Contratação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation dialog */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar contratação</AlertDialogTitle>
            <AlertDialogDescription>
              <strong>{candidateName}</strong> será transferido(a) para o módulo de{' '}
              <strong>Gestão de Equipes</strong> como colaborador(a). Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmHire}
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={hireMutation.isPending}
            >
              {hireMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
