// PRD-023: Template Moderno para PDF de Currículo

import { Document, Page, Text, View, Link } from '@react-pdf/renderer';
import type { Curriculum } from '@/types';
import {
  baseStyles,
  modernStyles,
  colors,
  getSkillLevelDots,
  formatPeriod,
  formatSalary,
  type PDFSectionConfig,
} from './styles';
import { skillLevelLabels, educationStatusLabels } from '@/types/curriculum';

interface PDFTemplateModernProps {
  curriculum: Curriculum;
  sections: PDFSectionConfig;
  includeLinks: boolean;
}

export function PDFTemplateModern({
  curriculum,
  sections,
  includeLinks,
}: PDFTemplateModernProps) {
  const technicalSkills = curriculum.skills?.filter((s) => s.type === 'technical') || [];
  const behavioralSkills = curriculum.skills?.filter((s) => s.type === 'behavioral') || [];

  return (
    <Document>
      <Page size="A4" style={baseStyles.page}>
        {/* Header com fundo escuro */}
        <View style={modernStyles.headerBg}>
          <Text style={modernStyles.headerName}>{curriculum.title || 'Candidato'}</Text>
          <Text style={modernStyles.headerTitle}>{curriculum.title}</Text>

          <View style={modernStyles.headerContact}>
            {curriculum.email && (
              <Text style={modernStyles.headerContactItem}>{curriculum.email}</Text>
            )}
            {curriculum.phone && (
              <Text style={modernStyles.headerContactItem}>{curriculum.phone}</Text>
            )}
            {curriculum.location && (
              <Text style={modernStyles.headerContactItem}>{curriculum.location}</Text>
            )}
            {includeLinks && curriculum.linkedin && (
              <Link src={curriculum.linkedin} style={[modernStyles.headerContactItem, { color: colors.primary }]}>
                linkedin.com
              </Link>
            )}
          </View>
        </View>

        {/* Layout em duas colunas */}
        <View style={modernStyles.twoColumn}>
          {/* Sidebar */}
          <View style={modernStyles.sidebar}>
            {/* Contato */}
            {sections.personalInfo && (
              <View style={modernStyles.sidebarSection}>
                <Text style={modernStyles.sidebarTitle}>Contato</Text>
                {curriculum.email && (
                  <Text style={[baseStyles.textSmall, baseStyles.mb4]}>{curriculum.email}</Text>
                )}
                {curriculum.phone && (
                  <Text style={[baseStyles.textSmall, baseStyles.mb4]}>{curriculum.phone}</Text>
                )}
                {curriculum.location && (
                  <Text style={baseStyles.textSmall}>{curriculum.location}</Text>
                )}
              </View>
            )}

            {/* Habilidades Técnicas */}
            {sections.technicalSkills && technicalSkills.length > 0 && (
              <View style={modernStyles.sidebarSection}>
                <Text style={modernStyles.sidebarTitle}>Habilidades Técnicas</Text>
                {technicalSkills.map((skill) => (
                  <View key={skill.id} style={modernStyles.skillBar}>
                    <Text style={modernStyles.skillName}>{skill.name}</Text>
                    <View style={modernStyles.skillLevel}>
                      {getSkillLevelDots(skill.level).map((filled, idx) => (
                        <View
                          key={idx}
                          style={[
                            modernStyles.skillLevelDot,
                            { backgroundColor: filled ? colors.primary : colors.border },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Habilidades Comportamentais */}
            {sections.behavioralSkills && behavioralSkills.length > 0 && (
              <View style={modernStyles.sidebarSection}>
                <Text style={modernStyles.sidebarTitle}>Soft Skills</Text>
                {behavioralSkills.map((skill) => (
                  <View key={skill.id} style={modernStyles.skillBar}>
                    <Text style={modernStyles.skillName}>{skill.name}</Text>
                    <View style={modernStyles.skillLevel}>
                      {getSkillLevelDots(skill.level).map((filled, idx) => (
                        <View
                          key={idx}
                          style={[
                            modernStyles.skillLevelDot,
                            { backgroundColor: filled ? colors.primaryDark : colors.border },
                          ]}
                        />
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Disponibilidade e Salário */}
            {sections.salary && curriculum.salary?.min && curriculum.salary?.max && (
              <View style={modernStyles.sidebarSection}>
                <Text style={modernStyles.sidebarTitle}>Disponibilidade</Text>
                {curriculum.availability && (
                  <Text style={[baseStyles.textSmall, baseStyles.mb4]}>
                    {curriculum.availability}
                  </Text>
                )}
                <Text style={[baseStyles.textSmall, { color: colors.primary }]}>
                  {formatSalary(curriculum.salary.min, curriculum.salary.max)}
                </Text>
              </View>
            )}
          </View>

          {/* Main Content */}
          <View style={modernStyles.mainContent}>
            {/* Resumo */}
            {sections.summary && curriculum.about && (
              <View style={modernStyles.mainSection}>
                <Text style={modernStyles.mainSectionTitle}>Resumo</Text>
                <Text style={baseStyles.text}>{curriculum.about}</Text>
              </View>
            )}

            {/* Experiência */}
            {sections.experience && curriculum.experiences?.length > 0 && (
              <View style={modernStyles.mainSection}>
                <Text style={modernStyles.mainSectionTitle}>Experiência</Text>
                {curriculum.experiences.map((exp, index) => (
                  <View
                    key={exp.id}
                    style={[
                      { marginBottom: 12 },
                      index < curriculum.experiences.length - 1 && {
                        paddingBottom: 12,
                        borderBottomWidth: 0.5,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <View style={baseStyles.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <View style={baseStyles.row}>
                          <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.navy }}>
                            {exp.role}
                          </Text>
                          {exp.current && (
                            <View
                              style={{
                                backgroundColor: colors.primary,
                                paddingHorizontal: 6,
                                paddingVertical: 2,
                                borderRadius: 3,
                                marginLeft: 8,
                              }}
                            >
                              <Text style={{ fontSize: 7, color: colors.white }}>ATUAL</Text>
                            </View>
                          )}
                        </View>
                        <Text style={{ fontSize: 10, color: colors.textLight }}>{exp.company}</Text>
                      </View>
                      <Text style={{ fontSize: 9, color: colors.textMuted }}>
                        {formatPeriod(exp.startDate, exp.endDate, exp.current)}
                      </Text>
                    </View>
                    {exp.description && (
                      <Text style={[baseStyles.text, { marginTop: 6 }]}>{exp.description}</Text>
                    )}
                  </View>
                ))}
              </View>
            )}

            {/* Formação */}
            {sections.education && curriculum.education?.length > 0 && (
              <View style={modernStyles.mainSection}>
                <Text style={modernStyles.mainSectionTitle}>Formação</Text>
                {curriculum.education.map((edu, index) => (
                  <View
                    key={edu.id}
                    style={[
                      { marginBottom: 10 },
                      index < curriculum.education.length - 1 && {
                        paddingBottom: 10,
                        borderBottomWidth: 0.5,
                        borderBottomColor: colors.border,
                      },
                    ]}
                  >
                    <View style={baseStyles.rowBetween}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 11, fontWeight: 'bold', color: colors.navy }}>
                          {edu.degree} em {edu.field}
                        </Text>
                        <Text style={{ fontSize: 10, color: colors.textLight }}>{edu.institution}</Text>
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontSize: 9, color: colors.textMuted }}>
                          {edu.startYear}{edu.endYear ? ` - ${edu.endYear}` : ''}
                        </Text>
                        <Text style={{ fontSize: 8, color: colors.primary }}>
                          {educationStatusLabels[edu.status]}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Cursos */}
            {sections.courses && curriculum.courses?.length > 0 && (
              <View style={modernStyles.mainSection}>
                <Text style={modernStyles.mainSectionTitle}>Certificações</Text>
                {curriculum.courses.map((course) => (
                  <View key={course.id} style={[baseStyles.row, { marginBottom: 6 }]}>
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: colors.primary,
                        marginRight: 8,
                        marginTop: 4,
                      }}
                    />
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 10, color: colors.text }}>
                        {course.name}
                      </Text>
                      <Text style={{ fontSize: 9, color: colors.textLight }}>
                        {course.institution} ({course.year}){course.hours && ` - ${course.hours}h`}
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}
