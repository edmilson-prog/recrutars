/**
 * Skill Normalizer - PRD-038
 * Normaliza e classifica habilidades
 */

import { SkillType, SkillLevel } from '@/types/cvParser';

// Dicionário de normalização de skills (variações → forma canônica)
const SKILL_NORMALIZATION: Record<string, string> = {
  // JavaScript/TypeScript
  'js': 'JavaScript',
  'javascript': 'JavaScript',
  'es6': 'JavaScript',
  'es2015': 'JavaScript',
  'ecmascript': 'JavaScript',
  'ts': 'TypeScript',
  'typescript': 'TypeScript',

  // React ecosystem
  'react': 'React',
  'reactjs': 'React',
  'react.js': 'React',
  'react js': 'React',
  'react native': 'React Native',
  'reactnative': 'React Native',
  'next': 'Next.js',
  'nextjs': 'Next.js',
  'next.js': 'Next.js',
  'redux': 'Redux',
  'react-redux': 'Redux',

  // Vue ecosystem
  'vue': 'Vue.js',
  'vuejs': 'Vue.js',
  'vue.js': 'Vue.js',
  'nuxt': 'Nuxt.js',
  'nuxtjs': 'Nuxt.js',

  // Angular
  'angular': 'Angular',
  'angularjs': 'Angular',
  'angular.js': 'Angular',

  // Node.js
  'node': 'Node.js',
  'nodejs': 'Node.js',
  'node.js': 'Node.js',
  'express': 'Express.js',
  'expressjs': 'Express.js',
  'nestjs': 'NestJS',
  'nest.js': 'NestJS',

  // Python
  'python': 'Python',
  'python3': 'Python',
  'django': 'Django',
  'flask': 'Flask',
  'fastapi': 'FastAPI',

  // Java
  'java': 'Java',
  'spring': 'Spring',
  'springboot': 'Spring Boot',
  'spring boot': 'Spring Boot',

  // C#/.NET
  'c#': 'C#',
  'csharp': 'C#',
  '.net': '.NET',
  'dotnet': '.NET',
  'asp.net': 'ASP.NET',

  // Databases
  'sql': 'SQL',
  'mysql': 'MySQL',
  'postgres': 'PostgreSQL',
  'postgresql': 'PostgreSQL',
  'mongo': 'MongoDB',
  'mongodb': 'MongoDB',
  'redis': 'Redis',
  'sqlite': 'SQLite',

  // Cloud
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'azure': 'Azure',
  'microsoft azure': 'Azure',
  'gcp': 'Google Cloud',
  'google cloud': 'Google Cloud',
  'google cloud platform': 'Google Cloud',

  // DevOps
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  'jenkins': 'Jenkins',
  'ci/cd': 'CI/CD',
  'cicd': 'CI/CD',
  'terraform': 'Terraform',
  'ansible': 'Ansible',

  // Testing
  'jest': 'Jest',
  'mocha': 'Mocha',
  'cypress': 'Cypress',
  'selenium': 'Selenium',
  'playwright': 'Playwright',

  // Version Control
  'git': 'Git',
  'github': 'GitHub',
  'gitlab': 'GitLab',
  'bitbucket': 'Bitbucket',

  // CSS/Styling
  'css': 'CSS',
  'css3': 'CSS',
  'sass': 'Sass',
  'scss': 'Sass',
  'less': 'Less',
  'tailwind': 'Tailwind CSS',
  'tailwindcss': 'Tailwind CSS',
  'bootstrap': 'Bootstrap',
  'styled-components': 'Styled Components',
  'styledcomponents': 'Styled Components',

  // Mobile
  'ios': 'iOS',
  'android': 'Android',
  'flutter': 'Flutter',
  'kotlin': 'Kotlin',
  'swift': 'Swift',

  // Others
  'html': 'HTML',
  'html5': 'HTML',
  'graphql': 'GraphQL',
  'rest': 'REST API',
  'restful': 'REST API',
  'api rest': 'REST API',
  'agile': 'Agile',
  'scrum': 'Scrum',
  'kanban': 'Kanban',
  'jira': 'Jira',
  'figma': 'Figma',
  'photoshop': 'Photoshop',
  'illustrator': 'Illustrator',
};

// Skills técnicas conhecidas (para classificação)
const TECHNICAL_SKILLS = new Set([
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'C++', 'C', 'Go', 'Rust', 'PHP', 'Ruby',
  'React', 'React Native', 'Vue.js', 'Angular', 'Next.js', 'Nuxt.js', 'Svelte',
  'Node.js', 'Express.js', 'NestJS', 'Django', 'Flask', 'FastAPI', 'Spring', 'Spring Boot', 'ASP.NET', '.NET',
  'SQL', 'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle', 'SQL Server',
  'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'CI/CD', 'Terraform', 'Ansible',
  'Git', 'GitHub', 'GitLab', 'Bitbucket',
  'HTML', 'CSS', 'Sass', 'Tailwind CSS', 'Bootstrap', 'Styled Components',
  'GraphQL', 'REST API',
  'Jest', 'Mocha', 'Cypress', 'Selenium', 'Playwright',
  'iOS', 'Android', 'Flutter', 'Kotlin', 'Swift',
  'Linux', 'Unix', 'Windows Server',
  'Nginx', 'Apache',
  'Elasticsearch', 'RabbitMQ', 'Kafka',
]);

// Skills comportamentais conhecidas
const BEHAVIORAL_SKILLS = new Set([
  'Comunicação', 'Trabalho em equipe', 'Liderança', 'Gestão de tempo', 'Resolução de problemas',
  'Pensamento crítico', 'Criatividade', 'Adaptabilidade', 'Proatividade', 'Organização',
  'Negociação', 'Empatia', 'Inteligência emocional', 'Colaboração', 'Flexibilidade',
  'Communication', 'Teamwork', 'Leadership', 'Time management', 'Problem solving',
  'Critical thinking', 'Creativity', 'Adaptability', 'Proactivity', 'Organization',
]);

// Tools conhecidas
const TOOL_SKILLS = new Set([
  'Jira', 'Confluence', 'Trello', 'Slack', 'Teams', 'Notion',
  'Figma', 'Sketch', 'Adobe XD', 'Photoshop', 'Illustrator', 'InDesign',
  'VS Code', 'IntelliJ', 'Eclipse', 'Visual Studio',
  'Postman', 'Insomnia',
  'Excel', 'Word', 'PowerPoint', 'Google Sheets',
]);

// Idiomas conhecidos
const LANGUAGES = new Set([
  'Inglês', 'English', 'Espanhol', 'Spanish', 'Português', 'Portuguese',
  'Francês', 'French', 'Alemão', 'German', 'Italiano', 'Italian',
  'Mandarim', 'Mandarin', 'Japonês', 'Japanese', 'Coreano', 'Korean',
]);

/**
 * Normaliza o nome de uma skill
 */
export function normalizeSkillName(skill: string): string {
  const normalized = skill.toLowerCase().trim();
  return SKILL_NORMALIZATION[normalized] || capitalizeFirstLetter(skill.trim());
}

/**
 * Capitaliza a primeira letra de cada palavra
 */
function capitalizeFirstLetter(str: string): string {
  return str.replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Classifica o tipo de uma skill
 */
export function classifySkillType(normalizedName: string): SkillType {
  if (TECHNICAL_SKILLS.has(normalizedName)) return 'technical';
  if (BEHAVIORAL_SKILLS.has(normalizedName)) return 'behavioral';
  if (TOOL_SKILLS.has(normalizedName)) return 'tool';
  if (LANGUAGES.has(normalizedName)) return 'language';

  // Heurísticas para classificar skills desconhecidas
  const lower = normalizedName.toLowerCase();

  // Padrões técnicos comuns
  if (
    lower.endsWith('.js') ||
    lower.endsWith('js') ||
    lower.includes('sql') ||
    lower.includes('api') ||
    lower.includes('framework')
  ) {
    return 'technical';
  }

  // Default para técnico (mais comum em CVs)
  return 'technical';
}

/**
 * Extrai nível de skill a partir do texto
 */
export function extractSkillLevel(text: string): SkillLevel | null {
  const lower = text.toLowerCase();

  if (
    lower.includes('expert') ||
    lower.includes('avançado') ||
    lower.includes('avancado') ||
    lower.includes('senior') ||
    lower.includes('sênior')
  ) {
    return 'expert';
  }

  if (
    lower.includes('advanced') ||
    lower.includes('proficiente') ||
    lower.includes('intermediário-avançado')
  ) {
    return 'advanced';
  }

  if (
    lower.includes('intermediate') ||
    lower.includes('intermediário') ||
    lower.includes('intermediario') ||
    lower.includes('pleno')
  ) {
    return 'intermediate';
  }

  if (
    lower.includes('beginner') ||
    lower.includes('básico') ||
    lower.includes('basico') ||
    lower.includes('iniciante') ||
    lower.includes('junior') ||
    lower.includes('júnior')
  ) {
    return 'beginner';
  }

  return null;
}

/**
 * Verifica se uma string parece ser uma skill válida
 */
export function isValidSkill(skill: string): boolean {
  const trimmed = skill.trim();

  // Muito curto ou muito longo
  if (trimmed.length < 2 || trimmed.length > 50) return false;

  // Apenas números
  if (/^\d+$/.test(trimmed)) return false;

  // Parece uma data
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(trimmed)) return false;
  if (/^\d{4}$/.test(trimmed)) return false;

  // Parece um email
  if (trimmed.includes('@')) return false;

  // Parece uma URL
  if (trimmed.startsWith('http') || trimmed.includes('www.')) return false;

  return true;
}

/**
 * Calcula confiança de uma skill baseado em heurísticas
 */
export function calculateSkillConfidence(normalizedName: string, originalName: string): number {
  let confidence = 0.5;

  // Se está na lista de normalização, alta confiança
  if (SKILL_NORMALIZATION[originalName.toLowerCase()]) {
    confidence += 0.3;
  }

  // Se está em alguma das listas conhecidas, alta confiança
  if (
    TECHNICAL_SKILLS.has(normalizedName) ||
    BEHAVIORAL_SKILLS.has(normalizedName) ||
    TOOL_SKILLS.has(normalizedName) ||
    LANGUAGES.has(normalizedName)
  ) {
    confidence += 0.2;
  }

  // Nomes muito curtos têm menos confiança
  if (originalName.length < 3) {
    confidence -= 0.2;
  }

  return Math.min(Math.max(confidence, 0.1), 1.0);
}
