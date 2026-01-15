// PRD-023: Template Minimalista para PDF de Currículo

import { Document, Page, Text, View, Link } from '@react-pdf/renderer';
import type { Curriculum } from '@/types';
import {
  baseStyles,
  minimalStyles,
  colors,
  formatPeriod,
  formatSalary,
  type PDFSectionConfig,
} from './styles';
import { educationStatusLabels } from '@/types/curriculum';

interface PDFTemplateMinimalProps {
  curriculum: Curriculum;
  sections: PDFSectionConfig;
  includeLinks: boolean;
}

export function PDFTemplateMinimal({
  curriculum,
  sections,
  includeLinks,
}: PDFTemplateMinimalProps) {
  const technicalSkills = curriculum.skills?.filter((s) => s.type === 'technical') || [];
  const behavioralSkills = curriculum.skills?.filter((s) => s.type === 'behavioral') || [];

  // Construir linha de contato com separadores
  const contactParts: string[] = [];
  if (curriculum.email) contactParts.push(curriculum.email);
  if (curriculum.phone) contactParts.push(curriculum.phone);
  if (curriculum.location) contactParts.push(curriculum.location);

  return (
    <Document>
      <Page size="A4" style={baseStyles.page}>
        {/* Header Centralizado */}
        <View style={minimalStyles.headerCenter}>
          <Text style={minimalStyles.nameCenter}>{curriculum.title || 'Candidato'}</Text>
          <Text style={minimalStyles.titleCenter}>{curriculum.title}</Text>

          {/* Contatos em linha única */}
          {sections.personalInfo && contactParts.length > 0 && (
            <View style={minimalStyles.contactCenter}>
              {contactParts.map((part, idx) => (
                <View key={idx} style={{ flexDirection: 'row' }}>
                  {idx > 0 && <Text style={minimalStyles.contactDivider}>•</Text>}
                  <Text style={baseStyles.textSmall}>{part}</Text>
                </View>
              ))}
              {includeLinks && curriculum.linkedin && (
                <View style={{ flexDirection: 'row' }}>
                  <Text style={minimalStyles.contactDivider}>•</Text>
                  <Link src={curriculum.linkedin} style={baseStyles.link}>
                    LinkedIn
                  </Link>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Separador fino */}
        <View style={minimalStyles.thinSeparator} />

        {/* Resumo */}
        {sections.summary && curriculum.about && (
          <View style={minimalStyles.sectionCenter}>
            <Text style={minimalStyles.sectionTitleCenter}>Sobre</Text>
            <Text style={[baseStyles.text, { textAlign: 'center' }]}>{curriculum.about}</Text>
          </View>
        )}

        {/* Habilidades Técnicas em linha */}
        {sections.technicalSkills && technicalSkills.length > 0 && (
          <View style={minimalStyles.sectionCenter}>
            <Text style={minimalStyles.sectionTitleCenter}>Competências Técnicas</Text>
            <View style={minimalStyles.skillsLine}>
              {technicalSkills.map((skill, idx) => (
                <View key={skill.id} style={{ flexDirection: 'row' }}>
                  {idx > 0 && <Text style={minimalStyles.skillChip}> • </Text>}
                  <Text style={minimalStyles.skillChip}>{skill.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Habilidades Comportamentais em linha */}
        {sections.behavioralSkills && behavioralSkills.length > 0 && (
          <View style={minimalStyles.sectionCenter}>
            <Text style={minimalStyles.sectionTitleCenter}>Competências Comportamentais</Text>
            <View style={minimalStyles.skillsLine}>
              {behavioralSkills.map((skill, idx) => (
                <View key={skill.id} style={{ flexDirection: 'row' }}>
                  {idx > 0 && <Text style={minimalStyles.skillChip}> • </Text>}
                  <Text style={minimalStyles.skillChip}>{skill.name}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Separador fino */}
        {(sections.technicalSkills || sections.behavioralSkills) &&
          (sections.experience || sections.education) && (
          <View style={minimalStyles.thinSeparator} />
        )}

        {/* Experiência */}
        {sections.experience && curriculum.experiences?.length > 0 && (
          <View style={minimalStyles.sectionCenter}>
            <Text style={minimalStyles.sectionTitleCenter}>Experiência</Text>
            {curriculum.experiences.map((exp) => (
              <View key={exp.id} style={minimalStyles.experienceMinimal}>
                <View style={minimalStyles.experienceMinimalHeader}>
                  <Text style={minimalStyles.experienceMinimalRole}>
                    {exp.role}
                    {exp.current && ' (Atual)'}
                  </Text>
                  <Text style={minimalStyles.experienceMinimalPeriod}>
                    {formatPeriod(exp.startDate, exp.endDate, exp.current)}
                  </Text>
                </View>
                <Text style={minimalStyles.experienceMinimalCompany}>{exp.company}</Text>
                {exp.description && (
                  <Text style={baseStyles.text}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Formação */}
        {sections.education && curriculum.education?.length > 0 && (
          <View style={minimalStyles.sectionCenter}>
            <Text style={minimalStyles.sectionTitleCenter}>Formação</Text>
            {curriculum.education.map((edu) => (
              <View key={edu.id} style={minimalStyles.experienceMinimal}>
                <View style={minimalStyles.experienceMinimalHeader}>
                  <Text style={minimalStyles.experienceMinimalRole}>
                    {edu.degree} em {edu.field}
                  </Text>
                  <Text style={minimalStyles.experienceMinimalPeriod}>
                    {edu.startYear}{edu.endYear ? ` - ${edu.endYear}` : ''}
                  </Text>
                </View>
                <Text style={minimalStyles.experienceMinimalCompany}>
                  {edu.institution} • {educationStatusLabels[edu.status]}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Cursos */}
        {sections.courses && curriculum.courses?.length > 0 && (
          <View style={minimalStyles.sectionCenter}>
            <Text style={minimalStyles.sectionTitleCenter}>Certificações</Text>
            <View style={minimalStyles.skillsLine}>
              {curriculum.courses.map((course, idx) => (
                <View key={course.id} style={{ flexDirection: 'row' }}>
                  {idx > 0 && <Text style={minimalStyles.skillChip}> • </Text>}
                  <Text style={minimalStyles.skillChip}>
                    {course.name} ({course.year})
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Pretensão Salarial */}
        {sections.salary && curriculum.salary?.min && curriculum.salary?.max && (
          <View style={minimalStyles.sectionCenter}>
            <View style={minimalStyles.thinSeparator} />
            <Text style={[baseStyles.textSmall, { textAlign: 'center' }]}>
              Pretensão: {formatSalary(curriculum.salary.min, curriculum.salary.max)}
              {curriculum.availability && ` • ${curriculum.availability}`}
            </Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
