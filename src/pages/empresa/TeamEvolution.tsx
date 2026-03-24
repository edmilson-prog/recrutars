/**
 * TeamEvolution Page
 * PRD-057: Pagina de Evolucao Temporal de um membro da equipe.
 */

import { useState, useMemo, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { motion } from 'framer-motion';
import { pageTransition } from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeft } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import EvolutionTimeline from '@/components/team-management/EvolutionTimeline';
import DeltaEvolutionTable from '@/components/team-management/DeltaEvolutionTable';
import EvolutionAnnotationForm from '@/components/team-management/EvolutionAnnotationForm';
import { useAuth } from '@/contexts/AuthContext';
import {
  useTeamMember,
  useDepartments,
  usePositions,
  useAnnotations,
  useCreateAnnotation,
} from '@/hooks/useTeamsQuery';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Loader2 } from 'lucide-react';
import type { EvolutionAnnotation } from '@/types/teamManagement';

export default function TeamEvolution() {
  const { id } = useParams();
  const { toast } = useToast();
  const { currentCompany } = useAuth();
  const companyId = currentCompany?.id ?? '';

  // Service layer hooks
  const { data: member, isLoading: memberLoading } = useTeamMember(id ?? '');
  const { data: departments = [] } = useDepartments(companyId);
  const { data: positions = [] } = usePositions('all', companyId);
  const { data: fetchedAnnotations = [], isLoading: annotationsLoading } = useAnnotations(id ?? '');
  const createAnnotationMutation = useCreateAnnotation();

  const department = useMemo(
    () => departments.find((d) => d.id === member?.departmentId),
    [member, departments],
  );

  const position = useMemo(
    () => positions.find((p) => p.id === member?.positionId),
    [member, positions],
  );

  // Load test history from gauge_pro_results via candidate link
  const candidateId = member?.importedFromCandidateId ?? '';
  const { data: memberHistory = [] } = useQuery({
    queryKey: ['team-member-test-history', candidateId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gauge_pro_results')
        .select('id, generated_at, archetype_id, final_scores')
        .eq('candidate_id', candidateId)
        .order('generated_at', { ascending: true });
      if (error) throw error;
      return (data ?? []).map((r) => ({
        id: r.id,
        memberId: id!,
        scores: {
          D1: (r.final_scores as Record<string, number>)?.D1 ?? 0,
          D2: (r.final_scores as Record<string, number>)?.D2 ?? 0,
          D3: (r.final_scores as Record<string, number>)?.D3 ?? 0,
          D4: (r.final_scores as Record<string, number>)?.D4 ?? 0,
          D5: (r.final_scores as Record<string, number>)?.D5 ?? 0,
        },
        archetype: (r.archetype_id as string) ?? '–',
        completedAt: r.generated_at as string,
      }));
    },
    enabled: !!candidateId,
  });

  // Annotations state (initialized from service layer)
  const [annotations, setAnnotations] = useState<EvolutionAnnotation[]>([]);
  const [annotationsInitialized, setAnnotationsInitialized] = useState(false);
  if (!annotationsInitialized && !annotationsLoading) {
    setAnnotations(fetchedAnnotations);
    setAnnotationsInitialized(true);
  }

  const isLoading = memberLoading || annotationsLoading;

  // Initials for avatar
  const initials = member
    ? member.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '';

  // Add annotation handler
  const handleAddAnnotation = useCallback(
    async (data: Omit<EvolutionAnnotation, 'id' | 'createdAt'>) => {
      const tempAnnotation: EvolutionAnnotation = {
        id: crypto.randomUUID(),
        memberId: id || '',
        text: data.text,
        type: data.type,
        date: data.date,
        createdAt: new Date().toISOString(),
      };
      setAnnotations((prev) => [...prev, tempAnnotation]);
      try {
        await createAnnotationMutation.mutateAsync({
          memberId: id || '',
          text: data.text,
          type: data.type,
          date: data.date,
        });
        toast({
          title: 'Anotação adicionada',
          description: 'A anotação de evolução foi registrada com sucesso.',
        });
      } catch {
        setAnnotations((prev) => prev.filter((a) => a.id !== tempAnnotation.id));
        toast({ title: 'Erro ao salvar anotação', variant: 'destructive' });
      }
    },
    [id, toast, createAnnotationMutation],
  );

  if (isLoading) {
    return (
      <DashboardLayout userType="company">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  if (!member) {
    return (
      <DashboardLayout userType="company">
        <motion.div {...pageTransition} className="space-y-6">
          <div className="flex items-center gap-4">
            <Link to="/empresa/equipes">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Membro não encontrado</h1>
          </div>
          <p className="text-muted-foreground">
            O colaborador solicitado não foi encontrado no sistema.
          </p>
        </motion.div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="company">
      <motion.div {...pageTransition} className="space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link to="/empresa/equipes">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <Avatar className="h-12 w-12">
            <AvatarImage src={member.avatar} alt={member.name} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">Evolução Temporal</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-muted-foreground">{member.name}</span>
              {department && (
                <Badge variant="outline" className="text-xs">
                  {department.name}
                </Badge>
              )}
              {position && (
                <Badge variant="secondary" className="text-xs">
                  {position.title}
                </Badge>
              )}
              {member.archetype && (
                <Badge className="text-xs bg-primary/10 text-primary border-primary/20">
                  {member.archetype}
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Evolution Timeline chart */}
        <EvolutionTimeline history={memberHistory} annotations={annotations} />

        {/* Delta Evolution Table */}
        <DeltaEvolutionTable history={memberHistory} />

        {/* Evolution Annotations */}
        <EvolutionAnnotationForm
          annotations={annotations}
          onAdd={handleAddAnnotation}
        />
      </motion.div>
    </DashboardLayout>
  );
}
