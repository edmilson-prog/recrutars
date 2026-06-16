// PRD-022: Componente de Preview do Currículo

import {
  MapPin,
  Mail,
  Phone,
  Linkedin,
  Briefcase,
  GraduationCap,
  Award,
  Code,
  Heart,
  Clock,
  DollarSign,
  FileText,
  AlertTriangle,
} from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CertificateViewer } from '@/components/profile/CertificateViewer';


import type { Curriculum } from '@/types';
import {
  skillLevelLabels,
  skillLevelOrder,
  educationStatusLabels,
  educationStatusIcons,
  skillTypeLabels,
} from '@/types/curriculum';

interface CurriculumPreviewProps {
  curriculum: Curriculum;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Componente para exibir nível de habilidade visual
function SkillLevelIndicator({ level }: { level: string }) {
  const levelNum = skillLevelOrder[level as keyof typeof skillLevelOrder] || 3;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className={`text-xs ${
            i <= levelNum ? 'text-cyan-500' : 'text-gray-300 dark:text-gray-600'
          }`}
        >
          ●
        </span>
      ))}
    </div>
  );
}

// Formatar faixa salarial
function formatSalary(salary: { min: number; max: number }): string {
  const formatter = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
  });
  return `${formatter.format(salary.min)} - ${formatter.format(salary.max)}`;
}

// Calcular duração da experiência
function calculateDuration(startDate: string, endDate?: string, current?: boolean): string {
  const start = new Date(startDate);
  const end = current || !endDate ? new Date() : new Date(endDate);

  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years === 0) {
    return `${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
  }
  if (remainingMonths === 0) {
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  }
  return `${years} ${years === 1 ? 'ano' : 'anos'} e ${remainingMonths} ${remainingMonths === 1 ? 'mês' : 'meses'}`;
}

// Formatar período
function formatPeriod(startDate: string, endDate?: string, current?: boolean): string {
  const start = new Date(startDate);
  const startStr = start.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });

  if (current) {
    return `${startStr} - Atual`;
  }

  if (endDate) {
    const end = new Date(endDate);
    const endStr = end.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' });
    return `${startStr} - ${endStr}`;
  }

  return startStr;
}

export function CurriculumPreview({
  curriculum,
  open,
  onOpenChange,
}: CurriculumPreviewProps) {
  // Separar habilidades por tipo
  const technicalSkills = curriculum.skills?.filter((s) => s.type === 'technical') || [];
  const behavioralSkills = curriculum.skills?.filter((s) => s.type === 'behavioral') || [];

  // Ordenar experiências (mais recente primeiro)
  const sortedExperiences = [...(curriculum.experiences || [])].sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
  });

  // Ordenar formação (mais recente primeiro)
  const sortedEducation = [...(curriculum.education || [])].sort((a, b) => {
    const aYear = parseInt(a.endYear || a.startYear);
    const bYear = parseInt(b.endYear || b.startYear);
    return bYear - aYear;
  });

  // Ordenar cursos (mais recente primeiro)
  const sortedCourses = [...(curriculum.courses || [])].sort((a, b) => b.year - a.year);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] p-0">
        <div className="overflow-y-auto max-h-[85vh]">
          <div className="p-6 space-y-6">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-cyan-500" />
                Preview do Perfil Profissional
              </DialogTitle>
            </DialogHeader>

            {/* Aviso */}
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Este é o preview de como as empresas visualizam seu perfil profissional.
              </AlertDescription>
            </Alert>

            {/* Cabeçalho com informações básicas */}
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-cyan-100 text-cyan-700 text-xl">
                  {curriculum.title?.charAt(0) || 'C'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h2 className="text-xl font-bold">{curriculum.title || 'Título não informado'}</h2>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-muted-foreground">
                  {curriculum.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {curriculum.location}
                    </span>
                  )}
                  {curriculum.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5" />
                      {curriculum.email}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                  {curriculum.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5" />
                      {curriculum.phone}
                    </span>
                  )}
                  {curriculum.linkedin && (
                    <a
                      href={curriculum.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-cyan-600 hover:underline"
                    >
                      <Linkedin className="h-3.5 w-3.5" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Badges de disponibilidade e salário */}
            <div className="flex flex-wrap gap-2">
              {curriculum.availability && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {curriculum.availability}
                </Badge>
              )}
              {curriculum.salary?.min && curriculum.salary?.max && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <DollarSign className="h-3 w-3" />
                  {formatSalary(curriculum.salary)}
                </Badge>
              )}
            </div>

            <Separator />

            {/* Sobre */}
            {curriculum.about && (
              <section>
                <h3 className="font-semibold mb-2">Sobre</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {curriculum.about}
                </p>
              </section>
            )}

            {/* Habilidades Técnicas */}
            {technicalSkills.length > 0 && (
              <section>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Code className="h-4 w-4 text-cyan-500" />
                  Habilidades Técnicas
                </h3>
                <div className="space-y-2">
                  {technicalSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between py-1.5 px-3 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <span className="text-sm font-medium">{skill.name}</span>
                      <div className="flex items-center gap-2">
                        <SkillLevelIndicator level={skill.level} />
                        <span className="text-xs text-muted-foreground">
                          {skillLevelLabels[skill.level]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Habilidades Comportamentais */}
            {behavioralSkills.length > 0 && (
              <section>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Heart className="h-4 w-4 text-pink-500" />
                  Habilidades Comportamentais
                </h3>
                <div className="space-y-2">
                  {behavioralSkills.map((skill) => (
                    <div
                      key={skill.id}
                      className="flex items-center justify-between py-1.5 px-3 bg-gray-50 dark:bg-gray-800 rounded"
                    >
                      <span className="text-sm font-medium">{skill.name}</span>
                      <div className="flex items-center gap-2">
                        <SkillLevelIndicator level={skill.level} />
                        <span className="text-xs text-muted-foreground">
                          {skillLevelLabels[skill.level]}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Experiência Profissional */}
            {sortedExperiences.length > 0 && (
              <section>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-500" />
                  Experiência Profissional
                </h3>
                <div className="space-y-4">
                  {sortedExperiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="border-l-2 border-cyan-200 dark:border-cyan-800 pl-4"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium flex items-center gap-2">
                            {exp.role}
                            {exp.current && (
                              <Badge
                                variant="default"
                                className="bg-green-500 text-[10px] h-5"
                              >
                                Atual
                              </Badge>
                            )}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {exp.company}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatPeriod(exp.startDate, exp.endDate, exp.current)} ·{' '}
                        {calculateDuration(exp.startDate, exp.endDate, exp.current)}
                      </p>
                      {exp.description && (
                        <p className="text-sm mt-2 text-muted-foreground">
                          {exp.description}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Formação Acadêmica */}
            {sortedEducation.length > 0 && (
              <section>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <GraduationCap className="h-4 w-4 text-purple-500" />
                  Formação Acadêmica
                </h3>
                <div className="space-y-3">
                  {sortedEducation.map((edu) => (
                    <div
                      key={edu.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">
                            {edu.degree} em {edu.field}
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            {edu.institution}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {edu.startYear}
                            {edu.endYear ? ` - ${edu.endYear}` : ''}
                          </p>
                        </div>
                        <Badge
                          variant={edu.status === 'completed' ? 'default' : 'secondary'}
                          className={
                            edu.status === 'completed'
                              ? 'bg-green-500'
                              : edu.status === 'in_progress'
                              ? 'bg-blue-500'
                              : ''
                          }
                        >
                          {educationStatusIcons[edu.status]}{' '}
                          {educationStatusLabels[edu.status]}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Cursos e Certificações */}
            {sortedCourses.length > 0 && (
              <section>
                <h3 className="font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-4 w-4 text-amber-500" />
                  Cursos e Certificações
                </h3>
                <div className="space-y-3">
                  {sortedCourses.map((course) => (
                    <div
                      key={course.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{course.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {course.institution} · {course.year}
                          </p>
                          {course.hours && (
                            <p className="text-xs text-muted-foreground">
                              {course.hours} horas
                            </p>
                          )}
                        </div>
                        <CertificateViewer course={course} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Mensagem se currículo vazio */}
            {!curriculum.about &&
              technicalSkills.length === 0 &&
              behavioralSkills.length === 0 &&
              sortedExperiences.length === 0 &&
              sortedEducation.length === 0 &&
              sortedCourses.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Seu perfil ainda não possui informações preenchidas.
                  </p>
                </div>
              )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
