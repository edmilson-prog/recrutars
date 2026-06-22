// src/components/empresa/pdf/sections/CurriculumSections.tsx
import { View, Text } from '@react-pdf/renderer';
import { empresaStyles, empresaColors } from '../styles';
import {
  type Curriculum,
  type SkillWithLevel,
  type ExperienceWithCurrent,
  type EducationWithStatus,
  type Course,
  type SalaryRange,
  skillLevelLabels,
  educationStatusLabels,
} from '@/types/curriculum';

export function PersonalInfoSection({
  candidate,
  curriculum,
}: {
  curriculum?: Curriculum | null;
  candidate: { name?: string; email?: string; phone?: string; city?: string; state?: string };
}) {
  // LGPD: nunca derivar do currículo cru — a fonte (candidate) já vem mascarada.
  const email = candidate.email;
  const phone = candidate.phone;
  const city = candidate.city ?? curriculum?.city;
  const state = candidate.state ?? curriculum?.state;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Informações Pessoais</Text>
      {candidate.name ? <Text style={empresaStyles.paragraph}>Nome: {candidate.name}</Text> : null}
      {email ? <Text style={empresaStyles.paragraph}>Email: {email}</Text> : null}
      {phone ? <Text style={empresaStyles.paragraph}>Telefone: {phone}</Text> : null}
      {city || state ? (
        <Text style={empresaStyles.paragraph}>
          Localização: {[city, state].filter(Boolean).join(' / ')}
        </Text>
      ) : null}
      {curriculum?.linkedin ? (
        <Text style={empresaStyles.paragraph}>LinkedIn: {curriculum.linkedin}</Text>
      ) : null}
      {curriculum?.title ? (
        <Text style={empresaStyles.paragraph}>Título: {curriculum.title}</Text>
      ) : null}
    </View>
  );
}

export function SummarySection({ summary }: { summary?: string }) {
  if (!summary) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Resumo Profissional</Text>
      <Text style={empresaStyles.paragraph}>{summary}</Text>
    </View>
  );
}

export function TechnicalSkillsSection({ skills }: { skills?: SkillWithLevel[] }) {
  const technical = skills?.filter((s) => s.type === 'technical') ?? [];
  if (technical.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Habilidades Técnicas</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {technical.map((s) => (
          <Text key={s.id} style={empresaStyles.badge}>
            {s.name} · {skillLevelLabels[s.level]}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function BehavioralSkillsSection({ skills }: { skills?: SkillWithLevel[] }) {
  const behavioral = skills?.filter((s) => s.type === 'behavioral') ?? [];
  if (behavioral.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Habilidades Comportamentais</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {behavioral.map((s) => (
          <Text key={s.id} style={empresaStyles.badge}>
            {s.name} · {skillLevelLabels[s.level]}
          </Text>
        ))}
      </View>
    </View>
  );
}

export function ExperienceSection({ experiences }: { experiences?: ExperienceWithCurrent[] }) {
  if (!experiences || experiences.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Experiência Profissional</Text>
      {experiences.map((exp) => (
        <View key={exp.id} style={{ marginBottom: 8 }}>
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold' }]}>
            {exp.role}{exp.company ? ` — ${exp.company}` : ''}
          </Text>
          <Text style={[empresaStyles.paragraph, { color: empresaColors.muted, fontSize: 9 }]}>
            {exp.startDate} {exp.current ? '— Atual' : exp.endDate ? `— ${exp.endDate}` : ''}
          </Text>
          {exp.description ? <Text style={empresaStyles.paragraph}>{exp.description}</Text> : null}
        </View>
      ))}
    </View>
  );
}

export function EducationSection({ educations }: { educations?: EducationWithStatus[] }) {
  if (!educations || educations.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Formação Acadêmica</Text>
      {educations.map((ed) => (
        <View key={ed.id} style={{ marginBottom: 6 }}>
          <Text style={[empresaStyles.paragraph, { fontWeight: 'bold' }]}>
            {ed.degree}{ed.field ? ` em ${ed.field}` : ''}{ed.institution ? ` — ${ed.institution}` : ''}
          </Text>
          <Text style={[empresaStyles.paragraph, { color: empresaColors.muted, fontSize: 9 }]}>
            {ed.startYear}{ed.endYear ? ` – ${ed.endYear}` : ''}
            {ed.status ? ` (${educationStatusLabels[ed.status]})` : ''}
          </Text>
        </View>
      ))}
    </View>
  );
}

export function CoursesSection({ courses }: { courses?: Course[] }) {
  if (!courses || courses.length === 0) return null;
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Cursos e Certificações</Text>
      {courses.map((c) => (
        <Text key={c.id} style={empresaStyles.bullet}>
          • {c.name}{c.institution ? ` — ${c.institution}` : ''} ({c.year})
          {c.hours ? ` · ${c.hours}h` : ''}
        </Text>
      ))}
    </View>
  );
}

export function SalarySection({ salary }: { salary?: SalaryRange | null }) {
  if (!salary || (!salary.min && !salary.max)) return null;
  const fmt = (v?: number) =>
    typeof v === 'number' && v > 0 ? `R$ ${v.toLocaleString('pt-BR')}` : '—';
  return (
    <View style={empresaStyles.sectionContainer}>
      <Text style={empresaStyles.sectionTitle}>Pretensão Salarial</Text>
      <Text style={empresaStyles.paragraph}>De {fmt(salary.min)} a {fmt(salary.max)}</Text>
    </View>
  );
}
