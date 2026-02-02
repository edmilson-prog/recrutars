/**
 * CreateJobTest Page
 * PRD-048: Teste por Vaga
 *
 * Wizard de criação de teste para uma vaga
 */

import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Briefcase, FileQuestion } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { TestWizard } from '@/components/job-assessment';
import { useAuth } from '@/contexts/AuthContext';
import { mockJobs } from '@/data/mockData';
import type { JobAssessment } from '@/types/assessment';
import { useToast } from '@/hooks/use-toast';

export default function CreateJobTest() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  // Buscar dados da vaga
  const job = mockJobs.find((j) => j.id === jobId);

  if (!job) {
    return (
      <DashboardLayout userType="company">
        <div className="flex flex-col items-center justify-center py-16">
          <FileQuestion className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Vaga não encontrada
          </h2>
          <p className="text-muted-foreground mb-4">
            A vaga solicitada não existe ou foi removida.
          </p>
          <Button onClick={() => navigate('/empresa/vagas')}>
            Voltar para Vagas
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const handleComplete = (assessment: JobAssessment) => {
    // Aqui salvaria no backend
    console.log('Assessment criado:', assessment);

    toast({
      title:
        assessment.status === 'published'
          ? 'Teste publicado!'
          : 'Rascunho salvo!',
      description:
        assessment.status === 'published'
          ? 'O teste está pronto para receber candidatos.'
          : 'Você pode continuar editando depois.',
    });

    // Navegar para a página de gestão do teste
    navigate(`/empresa/vagas/${jobId}/teste`);
  };

  const handleCancel = () => {
    navigate(`/empresa/vagas/${jobId}`);
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-foreground">
              Criar Teste Comportamental
            </h1>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Briefcase className="w-4 h-4" />
              <span>{job.title}</span>
            </div>
          </div>
        </motion.div>

        {/* Wizard */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card rounded-xl p-6 border shadow-soft"
        >
          <TestWizard
            jobId={jobId!}
            jobTitle={job.title}
            companyId={job.companyId}
            userId={user?.id || 'user-1'}
            onComplete={handleComplete}
            onCancel={handleCancel}
          />
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
