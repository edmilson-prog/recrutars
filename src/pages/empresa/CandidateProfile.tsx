/**
 * Candidate Profile Page
 * PRD-014: Banco de Talentos - Perfil completo com DISC
 */

import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  GraduationCap,
  Mail,
  Calendar,
  Clock,
  DollarSign,
  Send,
  Star,
  CheckCircle,
  AlertCircle,
  Heart,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import { mockCandidates, mockJobs } from '@/data/mockData';
import type { Job } from '@/types';
import { toast } from 'sonner';
import { useFavoriteCandidates } from '@/hooks/useFavoriteCandidates';

// Mock experience data based on candidate.experience field
const generateMockExperiences = (candidateTitle: string, years: number) => {
  const experiences = [];

  if (years >= 3) {
    experiences.push({
      id: 'exp-1',
      company: 'Empresa Atual',
      role: candidateTitle,
      startDate: '2022',
      endDate: null,
      current: true,
      description: 'Atuação na área com foco em resultados e inovação.',
    });
  }

  if (years >= 5) {
    experiences.push({
      id: 'exp-2',
      company: 'Empresa Anterior',
      role: `${candidateTitle} Jr`,
      startDate: '2019',
      endDate: '2022',
      current: false,
      description: 'Desenvolvimento de habilidades e crescimento profissional.',
    });
  }

  if (years >= 7) {
    experiences.push({
      id: 'exp-3',
      company: 'Primeira Empresa',
      role: 'Estágio',
      startDate: '2017',
      endDate: '2019',
      current: false,
      description: 'Início da carreira profissional.',
    });
  }

  return experiences;
};

// Helper to calculate mock match percentage
const calculateMatch = (candidateSkills: string[], jobs: Job[]): number => {
  if (jobs.length === 0) return 0;
  const avgSkillMatch =
    jobs.reduce((acc, job) => {
      const jobSkills = job.requirements.join(' ').toLowerCase();
      const matchingSkills = candidateSkills.filter((s) =>
        jobSkills.includes(s.toLowerCase())
      ).length;
      return acc + (matchingSkills / candidateSkills.length) * 100;
    }, 0) / jobs.length;

  return Math.min(99, Math.round(avgSkillMatch * 0.7 + 20));
};

export default function CandidateProfile() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [inviteMessage, setInviteMessage] = useState('');

  // PRD-030: Hook de candidatos favoritos
  const { isFavorite, toggleFavorite } = useFavoriteCandidates();

  const candidate = mockCandidates.find((c) => c.id === id);

  // Get company jobs (mock: company-1)
  const companyJobs = mockJobs.filter(
    (job) => job.companyId === 'company-1' && job.status === 'active'
  );

  if (!candidate) {
    return (
      <DashboardLayout userType="company">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Candidato não encontrado
          </h2>
          <p className="text-muted-foreground mb-4">
            O candidato solicitado não existe ou foi removido.
          </p>
          <Button asChild>
            <Link to="/empresa/candidatos">Voltar ao Banco de Talentos</Link>
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const matchScore = calculateMatch(candidate.skills, companyJobs);
  const mockExperiences = generateMockExperiences(candidate.title, candidate.experience);

  const handleOpenInviteModal = (job: Job) => {
    setSelectedJob(job);
    setInviteMessage('');
    setIsInviteModalOpen(true);
  };

  const handleSendInvite = () => {
    if (!selectedJob) return;

    toast.success(
      `Convite enviado para ${candidate.name} para a vaga "${selectedJob.title}"`
    );
    setIsInviteModalOpen(false);
    setSelectedJob(null);
    setInviteMessage('');
  };

  return (
    <DashboardLayout userType="company">
      <div className="space-y-6">
        {/* Back button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/empresa/candidatos')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar ao Banco de Talentos
        </Button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card rounded-2xl p-6 shadow-soft"
        >
          <div className="flex flex-col md:flex-row gap-6">
            <Avatar className="w-24 h-24 flex-shrink-0">
              <AvatarImage src={candidate.avatar} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {candidate.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')
                  .slice(0, 2)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    {candidate.name}
                  </h1>
                  <p className="text-lg text-muted-foreground">{candidate.title}</p>

                  <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {candidate.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {candidate.experience} ano{candidate.experience !== 1 ? 's' : ''}{' '}
                      de experiência
                    </span>
                    <span className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      {candidate.email}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {matchScore > 0 && (
                      <Badge
                        variant="secondary"
                        className={
                          matchScore >= 80
                            ? 'bg-success/20 text-success'
                            : matchScore >= 60
                            ? 'bg-warning/20 text-warning'
                            : ''
                        }
                      >
                        <Star className="w-3 h-3 mr-1" />
                        {matchScore}% match com suas vagas
                      </Badge>
                    )}
                    {/* PRD-030: Botão de favoritar */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        const isNowFavorite = toggleFavorite(candidate.id);
                        toast.success(
                          isNowFavorite
                            ? 'Candidato salvo!'
                            : 'Candidato removido dos salvos'
                        );
                      }}
                    >
                      <Heart
                        className={`w-5 h-5 transition-colors ${
                          isFavorite(candidate.id)
                            ? 'fill-destructive text-destructive'
                            : 'text-muted-foreground hover:text-destructive'
                        }`}
                      />
                    </Button>
                  </div>

                  {companyJobs.length > 0 ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button>
                          <Send className="w-4 h-4 mr-2" />
                          Convidar para vaga
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {companyJobs.map((job) => (
                          <DropdownMenuItem
                            key={job.id}
                            onClick={() => handleOpenInviteModal(job)}
                          >
                            {job.title}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Button disabled>
                      <Send className="w-4 h-4 mr-2" />
                      Sem vagas ativas
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* DISC Profile */}
            {candidate.testResult ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-xl">Perfil Comportamental DISC</span>
                      <Badge variant="secondary">
                        {candidate.testResult.result.profile}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* DISC Chart */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Dominância (D)</span>
                            <span className="text-muted-foreground">
                              {candidate.testResult.result.dominance}%
                            </span>
                          </div>
                          <Progress
                            value={candidate.testResult.result.dominance}
                            className="h-3"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Influência (I)</span>
                            <span className="text-muted-foreground">
                              {candidate.testResult.result.influence}%
                            </span>
                          </div>
                          <Progress
                            value={candidate.testResult.result.influence}
                            className="h-3"
                          />
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Estabilidade (S)</span>
                            <span className="text-muted-foreground">
                              {candidate.testResult.result.steadiness}%
                            </span>
                          </div>
                          <Progress
                            value={candidate.testResult.result.steadiness}
                            className="h-3"
                          />
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Conformidade (C)</span>
                            <span className="text-muted-foreground">
                              {candidate.testResult.result.compliance}%
                            </span>
                          </div>
                          <Progress
                            value={candidate.testResult.result.compliance}
                            className="h-3"
                          />
                        </div>
                      </div>
                    </div>

                    <Separator />

                    {/* Strengths */}
                    <div className="space-y-3">
                      <h4 className="font-medium flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-success" />
                        Pontos Fortes
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {candidate.testResult.result.strengths.map((strength) => (
                          <Badge key={strength} variant="outline" className="text-success border-success/30">
                            {strength}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Watch Points */}
                    {candidate.testResult.result.watchPoints && (
                      <div className="space-y-3">
                        <h4 className="font-medium flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-warning" />
                          Pontos de Atenção
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {candidate.testResult.result.watchPoints.map((point) => (
                            <Badge key={point} variant="outline" className="text-warning border-warning/30">
                              {point}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Perfil Comportamental DISC</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-6 text-muted-foreground">
                      <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Este candidato ainda não realizou o teste comportamental.</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Experience */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Experiência Profissional
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {mockExperiences.map((exp, index) => (
                      <div
                        key={exp.id}
                        className={`relative pl-6 ${
                          index !== mockExperiences.length - 1
                            ? 'border-l-2 border-muted pb-4'
                            : ''
                        }`}
                      >
                        <div className="absolute left-0 top-0 w-3 h-3 -translate-x-[7px] rounded-full bg-primary" />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{exp.role}</h4>
                            {exp.current && (
                              <Badge variant="secondary" className="text-xs">
                                Atual
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground">{exp.company}</p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {exp.startDate} - {exp.endDate || 'Presente'}
                          </p>
                          <p className="text-sm mt-2">{exp.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Education */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <GraduationCap className="w-5 h-5" />
                    Formação Acadêmica
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-semibold">{candidate.education}</h4>
                    <p className="text-muted-foreground">Instituição de Ensino</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Skills */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Skills</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {candidate.skills.map((skill) => (
                      <Badge key={skill} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Quick Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Informações</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Disponibilidade</p>
                      <p className="font-medium">{candidate.availability}</p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        Pretensão Salarial
                      </p>
                      <p className="font-medium">
                        R$ {candidate.salary.min.toLocaleString('pt-BR')} - R${' '}
                        {candidate.salary.max.toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                  <Separator />
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Perfil completo</p>
                      <Progress
                        value={candidate.profileCompletion}
                        className="h-2 mt-1"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {candidate.profileCompletion}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Invite Modal */}
      <Dialog open={isInviteModalOpen} onOpenChange={setIsInviteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Convidar candidato</DialogTitle>
            <DialogDescription>
              Envie um convite para {candidate.name} se candidatar à vaga "
              {selectedJob?.title}"
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                Mensagem personalizada (opcional)
              </label>
              <Textarea
                placeholder="Escreva uma mensagem personalizada para o candidato..."
                value={inviteMessage}
                onChange={(e) => setInviteMessage(e.target.value)}
                rows={4}
              />
              <p className="text-sm text-muted-foreground">
                {inviteMessage.length}/500 caracteres
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsInviteModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendInvite}>
              <Send className="w-4 h-4 mr-2" />
              Enviar convite
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
