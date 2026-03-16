/**
 * CVReviewSkills Component - PRD-038
 * Revisão de habilidades extraídas do currículo
 */

import { useState } from 'react';
import { Lightbulb, X } from 'lucide-react';
import { ParsedSkill, SkillType, getConfidenceLevel } from '@/types/cvParser';
import { CVReviewSection, ConfidenceIndicator } from './CVReviewSection';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface CVReviewSkillsProps {
  data: ParsedSkill[];
  onChange: (data: ParsedSkill[]) => void;
}

const SKILL_TYPE_CONFIG: Record<SkillType, { label: string; color: string }> = {
  technical: { label: 'Técnica', color: 'bg-blue-100 text-blue-700 border-blue-200' },
  behavioral: { label: 'Comportamental', color: 'bg-purple-100 text-purple-700 border-purple-200' },
  tool: { label: 'Ferramenta', color: 'bg-green-100 text-green-700 border-green-200' },
  language: { label: 'Idioma', color: 'bg-orange-100 text-orange-700 border-orange-200' },
};

export function CVReviewSkills({ data, onChange }: CVReviewSkillsProps) {
  const avgConfidence =
    data.length > 0
      ? data.reduce((sum, skill) => sum + skill.confidence, 0) / data.length
      : 0;

  // Agrupar skills por tipo
  const groupedSkills = data.reduce(
    (acc, skill) => {
      if (!acc[skill.type]) {
        acc[skill.type] = [];
      }
      acc[skill.type].push(skill);
      return acc;
    },
    {} as Record<SkillType, ParsedSkill[]>
  );

  const handleRemove = (skillId: string) => {
    onChange(data.filter((s) => s.id !== skillId));
  };

  return (
    <CVReviewSection
      title="Habilidades"
      description={`${data.length} habilidade${data.length !== 1 ? 's' : ''} detectada${data.length !== 1 ? 's' : ''}`}
      confidence={avgConfidence}
      icon={<Lightbulb className="w-5 h-5 text-gray-500" />}
    >
      <div className="space-y-4">
        {data.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">
            Nenhuma habilidade detectada.
          </p>
        ) : (
          Object.entries(groupedSkills).map(([type, skills]) => (
            <SkillGroup
              key={type}
              type={type as SkillType}
              skills={skills}
              onRemove={handleRemove}
            />
          ))
        )}
      </div>
    </CVReviewSection>
  );
}

interface SkillGroupProps {
  type: SkillType;
  skills: ParsedSkill[];
  onRemove: (id: string) => void;
}

function SkillGroup({ type, skills, onRemove }: SkillGroupProps) {
  const config = SKILL_TYPE_CONFIG[type];

  return (
    <div className="space-y-2">
      <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
        {config.label}s
      </span>
      <div className="flex flex-wrap gap-2">
        {skills.map((skill) => (
          <SkillBadge
            key={skill.id}
            skill={skill}
            config={config}
            onRemove={() => onRemove(skill.id)}
          />
        ))}
      </div>
    </div>
  );
}

interface SkillBadgeProps {
  skill: ParsedSkill;
  config: { label: string; color: string };
  onRemove: () => void;
}

function SkillBadge({ skill, config, onRemove }: SkillBadgeProps) {
  const confidenceLevel = getConfidenceLevel(skill.confidence);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Badge
      variant="outline"
      className={cn(
        'px-3 py-1 text-sm font-normal transition-all cursor-default',
        config.color,
        confidenceLevel === 'low' && 'opacity-70 border-dashed'
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span>{skill.normalizedName}</span>
      {confidenceLevel !== 'high' && (
        <span className="ml-1.5 opacity-60">
          <ConfidenceIndicator level={confidenceLevel} value={skill.confidence} />
        </span>
      )}
      {isHovered && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1.5 hover:text-red-600 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </Badge>
  );
}
