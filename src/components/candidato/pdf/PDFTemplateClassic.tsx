// PRD-023: Template Clássico para PDF de Currículo

import { Document, Page, Text, View, Link } from '@react-pdf/renderer';
import type { Curriculum } from '@/types';
import {
  baseStyles,
  classicStyles,
  colors,
  getSkillLevelDots,
  formatPeriod,
  formatSalary,
  type PDFSectionConfig,
} from './styles';
import { skillLevelLabels, educationStatusLabels } from '@/types/curriculum';

interface PDFTemplateClassicProps {
  curriculum: Curriculum;
  sections: PDFSectionConfig;
  includeLinks: boolean;
}

export function PDFTemplateClassic({
  curriculum,
  sections,
  includeLinks,
}: PDFTemplateClassicProps) {
  const technicalSkills = curriculum.skills?.filter((s) => s.type === 'technical') || [];
  const behavioralSkills = curriculum.skills?.filter((s) => s.type === 'behavioral') || [];

  return (
    <Document>
      <Page size="A4" style={baseStyles.page}>
        {/* Header */}
        <View style={classicStyles.header}>
          <Text style={baseStyles.name}>{curriculum.title || 'Candidato'}</Text>
          <Text style={baseStyles.title}>{curriculum.title}</Text>

          <View style={classicStyles.contactRow}>
            {curriculum.email && (
              <Text style={classicStyles.contactItem}>{curriculum.email}</Text>
            )}
            {curriculum.phone && (
              <Text style={classicStyles.contactItem}>{curriculum.phone}</Text>
            )}
            {curriculum.location && (
              <Text style={classicStyles.contactItem}>{curriculum.location}</Text>
            )}
            {includeLinks && curriculum.linkedin && (
              <Link src={curriculum.linkedin} style={baseStyles.link}>
                LinkedIn
              </Link>
            )}
          </View>
        </View>

        {/* Resumo */}
        {sections.summary && curriculum.about && (
          <View style={baseStyles.section}>
            <Text style={[baseStyles.sectionTitle, classicStyles.sectionUnderline]}>
              Resumo Profissional
            </Text>
            <Text style={baseStyles.text}>{curriculum.about}</Text>
          </View>
        )}

        {/* Habilidades Técnicas */}
        {sections.technicalSkills && technicalSkills.length > 0 && (
          <View style={baseStyles.section}>
            <Text style={[baseStyles.sectionTitle, classicStyles.sectionUnderline]}>
              Habilidades Técnicas
            </Text>
            <View style={classicStyles.skillsGrid}>
              {technicalSkills.map((skill) => (
                <View key={skill.id} style={[classicStyles.skillItem, { width: '30%' }]}>
                  <View style={baseStyles.row}>
                    {getSkillLevelDots(skill.level).map((filled, idx) => (
                      <View
                        key={idx}
                        style={[
                          classicStyles.skillDot,
                          filled ? classicStyles.skillDotFilled : classicStyles.skillDotEmpty,
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[baseStyles.textSmall, { marginLeft: 6 }]}>
                    {skill.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Habilidades Comportamentais */}
        {sections.behavioralSkills && behavioralSkills.length > 0 && (
          <View style={baseStyles.section}>
            <Text style={[baseStyles.sectionTitle, classicStyles.sectionUnderline]}>
              Habilidades Comportamentais
            </Text>
            <View style={classicStyles.skillsGrid}>
              {behavioralSkills.map((skill) => (
                <View key={skill.id} style={[classicStyles.skillItem, { width: '30%' }]}>
                  <View style={baseStyles.row}>
                    {getSkillLevelDots(skill.level).map((filled, idx) => (
                      <View
                        key={idx}
                        style={[
                          classicStyles.skillDot,
                          filled ? classicStyles.skillDotFilled : classicStyles.skillDotEmpty,
                        ]}
                      />
                    ))}
                  </View>
                  <Text style={[baseStyles.textSmall, { marginLeft: 6 }]}>
                    {skill.name}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Experiência Profissional */}
        {sections.experience && curriculum.experiences?.length > 0 && (
          <View style={baseStyles.section}>
            <Text style={[baseStyles.sectionTitle, classicStyles.sectionUnderline]}>
              Experiência Profissional
            </Text>
            {curriculum.experiences.map((exp) => (
              <View key={exp.id} style={classicStyles.experienceItem}>
                <View style={classicStyles.experienceHeader}>
                  <View style={{ flex: 1 }}>
                    <View style={baseStyles.row}>
                      <Text style={classicStyles.experienceRole}>{exp.role}</Text>
                      {exp.current && (
                        <Text style={classicStyles.currentBadge}>ATUAL</Text>
                      )}
                    </View>
                    <Text style={classicStyles.experienceCompany}>{exp.company}</Text>
                  </View>
                  <Text style={classicStyles.experiencePeriod}>
                    {formatPeriod(exp.startDate, exp.endDate, exp.current)}
                  </Text>
                </View>
                {exp.description && (
                  <Text style={[baseStyles.text, baseStyles.mt4]}>{exp.description}</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Formação Acadêmica */}
        {sections.education && curriculum.education?.length > 0 && (
          <View style={baseStyles.section}>
            <Text style={[baseStyles.sectionTitle, classicStyles.sectionUnderline]}>
              Formação Acadêmica
            </Text>
            {curriculum.education.map((edu) => (
              <View key={edu.id} style={classicStyles.experienceItem}>
                <View style={classicStyles.experienceHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={classicStyles.experienceRole}>
                      {edu.degree} em {edu.field}
                    </Text>
                    <Text style={classicStyles.experienceCompany}>{edu.institution}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={classicStyles.experiencePeriod}>
                      {edu.startYear}
                      {edu.endYear ? ` - ${edu.endYear}` : ''}
                    </Text>
                    <Text style={[baseStyles.textSmall, { color: colors.primary }]}>
                      {educationStatusLabels[edu.status]}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Cursos e Certificações */}
        {sections.courses && curriculum.courses?.length > 0 && (
          <View style={baseStyles.section}>
            <Text style={[baseStyles.sectionTitle, classicStyles.sectionUnderline]}>
              Cursos e Certificações
            </Text>
            {curriculum.courses.map((course) => (
              <View key={course.id} style={[baseStyles.row, baseStyles.mb4]}>
                <View style={baseStyles.bullet} />
                <View style={{ flex: 1 }}>
                  <Text style={baseStyles.text}>
                    {course.name} - {course.institution} ({course.year})
                    {course.hours && ` - ${course.hours}h`}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Pretensão Salarial */}
        {sections.salary && curriculum.salary?.min && curriculum.salary?.max && (
          <View style={baseStyles.section}>
            <Text style={[baseStyles.sectionTitle, classicStyles.sectionUnderline]}>
              Pretensão Salarial
            </Text>
            <Text style={baseStyles.text}>
              {formatSalary(curriculum.salary.min, curriculum.salary.max)}
            </Text>
            {curriculum.availability && (
              <Text style={[baseStyles.textSmall, baseStyles.mt4]}>
                Disponibilidade: {curriculum.availability}
              </Text>
            )}
          </View>
        )}
      </Page>
    </Document>
  );
}
