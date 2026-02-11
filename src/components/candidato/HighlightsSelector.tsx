/**
 * Highlights Selector Component
 * PRD-073: Destaques de candidatura customizável
 *
 * Allows candidates to select which profile items to highlight
 * when applying for a job. Shows collapsible sections for each
 * sub-entity type (experiences, education, skills, courses).
 */

import { useState } from 'react';
import { Briefcase, GraduationCap, Wrench, Award, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import type { Curriculum } from '@/types/curriculum';
import type { ApplicationHighlights } from '@/types/applicationHighlight';

interface HighlightsSelectorProps {
  curriculum: Curriculum;
  onConfirm: (highlights: ApplicationHighlights) => void;
  onSkip: () => void;
}

export function HighlightsSelector({ curriculum, onConfirm, onSkip }: HighlightsSelectorProps) {
  const [selectedExperiences, setSelectedExperiences] = useState<Set<string>>(new Set());
  const [selectedEducation, setSelectedEducation] = useState<Set<string>>(new Set());
  const [selectedSkills, setSelectedSkills] = useState<Set<string>>(new Set());
  const [selectedCourses, setSelectedCourses] = useState<Set<string>>(new Set());

  const totalSelected =
    selectedExperiences.size + selectedEducation.size + selectedSkills.size + selectedCourses.size;

  const toggleItem = (
    set: Set<string>,
    setter: React.Dispatch<React.SetStateAction<Set<string>>>,
    id: string,
  ) => {
    const next = new Set(set);
    if (next.has(id)) {
      next.delete(id);
    } else {
      next.add(id);
    }
    setter(next);
  };

  const handleConfirm = () => {
    onConfirm({
      experienceIds: Array.from(selectedExperiences),
      educationIds: Array.from(selectedEducation),
      skillIds: Array.from(selectedSkills),
      courseIds: Array.from(selectedCourses),
    });
  };

  const hasItems =
    curriculum.experiences.length > 0 ||
    curriculum.education.length > 0 ||
    curriculum.skills.length > 0 ||
    curriculum.courses.length > 0;

  if (!hasItems) {
    return (
      <div className="text-center py-4">
        <p className="text-muted-foreground text-sm">
          Seu perfil ainda não possui itens para destacar.
        </p>
        <Button variant="outline" className="mt-3" onClick={onSkip}>
          Continuar sem destaques
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Selecione os itens do seu perfil que deseja destacar para esta vaga.
        O recrutador verá esses itens em evidência.
      </p>

      {/* Experiences */}
      {curriculum.experiences.length > 0 && (
        <HighlightSection
          icon={<Briefcase className="w-4 h-4" />}
          title="Experiências"
          count={selectedExperiences.size}
          total={curriculum.experiences.length}
        >
          {curriculum.experiences.map((exp) => (
            <HighlightItem
              key={exp.id}
              id={exp.id}
              label={`${exp.role} — ${exp.company}`}
              sublabel={exp.current ? 'Atual' : exp.endDate ?? ''}
              checked={selectedExperiences.has(exp.id)}
              onToggle={() => toggleItem(selectedExperiences, setSelectedExperiences, exp.id)}
            />
          ))}
        </HighlightSection>
      )}

      {/* Education */}
      {curriculum.education.length > 0 && (
        <HighlightSection
          icon={<GraduationCap className="w-4 h-4" />}
          title="Formação"
          count={selectedEducation.size}
          total={curriculum.education.length}
        >
          {curriculum.education.map((edu) => (
            <HighlightItem
              key={edu.id}
              id={edu.id}
              label={`${edu.degree} em ${edu.field}`}
              sublabel={edu.institution}
              checked={selectedEducation.has(edu.id)}
              onToggle={() => toggleItem(selectedEducation, setSelectedEducation, edu.id)}
            />
          ))}
        </HighlightSection>
      )}

      {/* Skills */}
      {curriculum.skills.length > 0 && (
        <HighlightSection
          icon={<Wrench className="w-4 h-4" />}
          title="Habilidades"
          count={selectedSkills.size}
          total={curriculum.skills.length}
        >
          {curriculum.skills.map((skill) => (
            <HighlightItem
              key={skill.id}
              id={skill.id}
              label={skill.name}
              sublabel={skill.level}
              checked={selectedSkills.has(skill.id)}
              onToggle={() => toggleItem(selectedSkills, setSelectedSkills, skill.id)}
            />
          ))}
        </HighlightSection>
      )}

      {/* Courses */}
      {curriculum.courses.length > 0 && (
        <HighlightSection
          icon={<Award className="w-4 h-4" />}
          title="Cursos"
          count={selectedCourses.size}
          total={curriculum.courses.length}
        >
          {curriculum.courses.map((course) => (
            <HighlightItem
              key={course.id}
              id={course.id}
              label={course.name}
              sublabel={course.institution}
              checked={selectedCourses.has(course.id)}
              onToggle={() => toggleItem(selectedCourses, setSelectedCourses, course.id)}
            />
          ))}
        </HighlightSection>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-2">
        <Button variant="ghost" size="sm" onClick={onSkip}>
          Pular
        </Button>
        <Button
          size="sm"
          className="gradient-primary"
          onClick={handleConfirm}
          disabled={totalSelected === 0}
        >
          Confirmar {totalSelected > 0 ? `(${totalSelected})` : ''}
        </Button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function HighlightSection({
  icon,
  title,
  count,
  total,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  total: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <button className="flex items-center gap-2 w-full px-3 py-2 rounded-lg hover:bg-muted transition-colors text-left">
          {icon}
          <span className="font-medium text-sm flex-1">{title}</span>
          {count > 0 && (
            <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
              {count}/{total}
            </span>
          )}
          <ChevronDown
            className={cn(
              'w-4 h-4 text-muted-foreground transition-transform',
              open && 'rotate-180',
            )}
          />
        </button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="pl-4 space-y-1 py-1">{children}</div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function HighlightItem({
  id,
  label,
  sublabel,
  checked,
  onToggle,
}: {
  id: string;
  label: string;
  sublabel?: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-muted/50 transition-colors">
      <Checkbox id={`hl-${id}`} checked={checked} onCheckedChange={onToggle} />
      <Label htmlFor={`hl-${id}`} className="cursor-pointer flex-1 text-sm">
        <span className="text-foreground">{label}</span>
        {sublabel && (
          <span className="text-muted-foreground ml-2 text-xs">{sublabel}</span>
        )}
      </Label>
    </div>
  );
}
