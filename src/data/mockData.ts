// Mock Data for RecrutaRS Platform

export interface User {
  id: string;
  name: string;
  email: string;
  type: 'admin' | 'company' | 'candidate';
  avatar?: string;
  createdAt: string;
}

export interface Company {
  id: string;
  userId: string;
  name: string;
  logo?: string;
  industry: string;
  size: string;
  location: string;
  description: string;
  website?: string;
  activeJobs: number;
  totalCandidates: number;
}

export interface Candidate {
  id: string;
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  title: string;
  location: string;
  experience: number;
  education: string;
  skills: string[];
  salary: { min: number; max: number };
  availability: string;
  profileCompletion: number;
  hasTest: boolean;
  testResult?: BehavioralTest;
}

export interface Job {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  description: string;
  requirements: string[];
  benefits: string[];
  location: string;
  type: 'remote' | 'hybrid' | 'onsite';
  level: string;
  salary: { min: number; max: number };
  status: 'active' | 'paused' | 'closed';
  applicationsCount: number;
  createdAt: string;
  area: string;
}

export interface Application {
  id: string;
  jobId: string;
  candidateId: string;
  candidateName: string;
  candidateAvatar?: string;
  jobTitle: string;
  companyName: string;
  status: 'pending' | 'reviewing' | 'interview' | 'offer' | 'rejected' | 'hired';
  appliedAt: string;
  updatedAt: string;
}

export interface BehavioralTest {
  id: string;
  candidateId: string;
  candidateName: string;
  companyId?: string;
  jobId?: string;
  status: 'sent' | 'in_progress' | 'completed';
  sentAt: string;
  completedAt?: string;
  result?: {
    dominance: number;
    influence: number;
    steadiness: number;
    compliance: number;
    profile: string;
    strengths: string[];
    watchPoints: string[];
  };
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderType: 'company' | 'candidate';
  receiverId: string;
  receiverName: string;
  subject: string;
  content: string;
  read: boolean;
  createdAt: string;
}

// Mock Users
export const mockUsers: User[] = [
  { id: 'admin-1', name: 'Ana Silva', email: 'admin@recrutars.com', type: 'admin', createdAt: '2024-01-15' },
  { id: 'company-1', name: 'Tech Solutions', email: 'rh@techsolutions.com', type: 'company', createdAt: '2024-02-10' },
  { id: 'company-2', name: 'Inovação Digital', email: 'rh@inovacaodigital.com', type: 'company', createdAt: '2024-03-05' },
  { id: 'company-3', name: 'StartUp Brasil', email: 'contato@startupbrasil.com', type: 'company', createdAt: '2024-04-20' },
  { id: 'candidate-1', name: 'João Santos', email: 'joao.santos@email.com', type: 'candidate', createdAt: '2024-03-10' },
  { id: 'candidate-2', name: 'Maria Oliveira', email: 'maria.oliveira@email.com', type: 'candidate', createdAt: '2024-03-15' },
  { id: 'candidate-3', name: 'Pedro Costa', email: 'pedro.costa@email.com', type: 'candidate', createdAt: '2024-04-01' },
  { id: 'candidate-4', name: 'Carla Mendes', email: 'carla.mendes@email.com', type: 'candidate', createdAt: '2024-04-15' },
  { id: 'candidate-5', name: 'Lucas Ferreira', email: 'lucas.ferreira@email.com', type: 'candidate', createdAt: '2024-05-01' },
];

// Mock Companies
export const mockCompanies: Company[] = [
  {
    id: 'company-1',
    userId: 'company-1',
    name: 'Tech Solutions',
    industry: 'Tecnologia',
    size: '51-200 funcionários',
    location: 'São Paulo, SP',
    description: 'Empresa líder em soluções de software corporativo.',
    website: 'https://techsolutions.com.br',
    activeJobs: 5,
    totalCandidates: 127,
  },
  {
    id: 'company-2',
    userId: 'company-2',
    name: 'Inovação Digital',
    industry: 'Marketing Digital',
    size: '11-50 funcionários',
    location: 'Rio de Janeiro, RJ',
    description: 'Agência especializada em transformação digital e marketing.',
    website: 'https://inovacaodigital.com.br',
    activeJobs: 3,
    totalCandidates: 84,
  },
  {
    id: 'company-3',
    userId: 'company-3',
    name: 'StartUp Brasil',
    industry: 'Fintech',
    size: '1-10 funcionários',
    location: 'Belo Horizonte, MG',
    description: 'Startup inovadora no setor financeiro.',
    website: 'https://startupbrasil.com.br',
    activeJobs: 2,
    totalCandidates: 45,
  },
];

// Mock Candidates
export const mockCandidates: Candidate[] = [
  {
    id: 'candidate-1',
    userId: 'candidate-1',
    name: 'João Santos',
    email: 'joao.santos@email.com',
    title: 'Desenvolvedor Full Stack',
    location: 'São Paulo, SP',
    experience: 5,
    education: 'Bacharel em Ciência da Computação',
    skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'AWS'],
    salary: { min: 12000, max: 18000 },
    availability: 'Imediata',
    profileCompletion: 95,
    hasTest: true,
    testResult: {
      id: 'test-1',
      candidateId: 'candidate-1',
      candidateName: 'João Santos',
      status: 'completed',
      sentAt: '2024-06-01',
      completedAt: '2024-06-02',
      result: {
        dominance: 72,
        influence: 45,
        steadiness: 58,
        compliance: 65,
        profile: 'Executor Analítico',
        strengths: ['Orientado a resultados', 'Pensamento crítico', 'Persistência'],
        watchPoints: ['Pode ser impaciente', 'Tendência ao perfeccionismo'],
      },
    },
  },
  {
    id: 'candidate-2',
    userId: 'candidate-2',
    name: 'Maria Oliveira',
    email: 'maria.oliveira@email.com',
    title: 'Product Manager',
    location: 'Rio de Janeiro, RJ',
    experience: 7,
    education: 'MBA em Gestão de Produtos',
    skills: ['Scrum', 'Product Discovery', 'Analytics', 'Liderança', 'UX Research'],
    salary: { min: 15000, max: 22000 },
    availability: '2 semanas',
    profileCompletion: 100,
    hasTest: true,
    testResult: {
      id: 'test-2',
      candidateId: 'candidate-2',
      candidateName: 'Maria Oliveira',
      status: 'completed',
      sentAt: '2024-05-15',
      completedAt: '2024-05-16',
      result: {
        dominance: 55,
        influence: 78,
        steadiness: 62,
        compliance: 48,
        profile: 'Influenciador Estratégico',
        strengths: ['Comunicação persuasiva', 'Networking', 'Visão de futuro'],
        watchPoints: ['Pode dispersar foco', 'Dificuldade com detalhes'],
      },
    },
  },
  {
    id: 'candidate-3',
    userId: 'candidate-3',
    name: 'Pedro Costa',
    email: 'pedro.costa@email.com',
    title: 'Designer UX/UI',
    location: 'Curitiba, PR',
    experience: 3,
    education: 'Bacharel em Design',
    skills: ['Figma', 'Adobe XD', 'Prototyping', 'Design System', 'User Research'],
    salary: { min: 8000, max: 12000 },
    availability: 'Imediata',
    profileCompletion: 80,
    hasTest: false,
  },
  {
    id: 'candidate-4',
    userId: 'candidate-4',
    name: 'Carla Mendes',
    email: 'carla.mendes@email.com',
    title: 'Analista de Dados',
    location: 'São Paulo, SP',
    experience: 4,
    education: 'Bacharel em Estatística',
    skills: ['Python', 'SQL', 'Power BI', 'Machine Learning', 'Excel'],
    salary: { min: 10000, max: 15000 },
    availability: '1 mês',
    profileCompletion: 90,
    hasTest: true,
    testResult: {
      id: 'test-3',
      candidateId: 'candidate-4',
      candidateName: 'Carla Mendes',
      status: 'completed',
      sentAt: '2024-06-10',
      completedAt: '2024-06-11',
      result: {
        dominance: 35,
        influence: 42,
        steadiness: 75,
        compliance: 85,
        profile: 'Analítico Metódico',
        strengths: ['Atenção aos detalhes', 'Metodologia', 'Precisão'],
        watchPoints: ['Pode ser lento em decisões', 'Resistência a mudanças'],
      },
    },
  },
  {
    id: 'candidate-5',
    userId: 'candidate-5',
    name: 'Lucas Ferreira',
    email: 'lucas.ferreira@email.com',
    title: 'DevOps Engineer',
    location: 'Porto Alegre, RS',
    experience: 6,
    education: 'Bacharel em Engenharia de Software',
    skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Terraform'],
    salary: { min: 14000, max: 20000 },
    availability: 'Imediata',
    profileCompletion: 85,
    hasTest: false,
  },
];

// Mock Jobs
export const mockJobs: Job[] = [
  {
    id: 'job-1',
    companyId: 'company-1',
    companyName: 'Tech Solutions',
    title: 'Desenvolvedor Full Stack Senior',
    description: 'Buscamos um desenvolvedor experiente para liderar projetos de alta complexidade.',
    requirements: ['5+ anos de experiência', 'React e Node.js', 'Inglês avançado', 'Experiência com AWS'],
    benefits: ['Vale refeição', 'Plano de saúde', 'Home office', 'Bônus anual'],
    location: 'São Paulo, SP',
    type: 'hybrid',
    level: 'Senior',
    salary: { min: 15000, max: 22000 },
    status: 'active',
    applicationsCount: 24,
    createdAt: '2024-06-01',
    area: 'Tecnologia',
  },
  {
    id: 'job-2',
    companyId: 'company-1',
    companyName: 'Tech Solutions',
    title: 'Product Manager',
    description: 'Liderar a estratégia de produto para nossa plataforma principal.',
    requirements: ['5+ anos em gestão de produtos', 'Experiência com metodologias ágeis', 'Forte habilidade analítica'],
    benefits: ['Vale refeição', 'Plano de saúde', 'Stock options', 'Desenvolvimento profissional'],
    location: 'São Paulo, SP',
    type: 'remote',
    level: 'Senior',
    salary: { min: 18000, max: 25000 },
    status: 'active',
    applicationsCount: 18,
    createdAt: '2024-06-05',
    area: 'Produto',
  },
  {
    id: 'job-3',
    companyId: 'company-2',
    companyName: 'Inovação Digital',
    title: 'Designer UX/UI Pleno',
    description: 'Criar experiências digitais incríveis para nossos clientes.',
    requirements: ['3+ anos de experiência', 'Domínio de Figma', 'Portfolio sólido'],
    benefits: ['Vale refeição', 'Plano de saúde', 'Horário flexível'],
    location: 'Rio de Janeiro, RJ',
    type: 'hybrid',
    level: 'Pleno',
    salary: { min: 8000, max: 12000 },
    status: 'active',
    applicationsCount: 32,
    createdAt: '2024-06-10',
    area: 'Design',
  },
  {
    id: 'job-4',
    companyId: 'company-3',
    companyName: 'StartUp Brasil',
    title: 'Analista de Dados Junior',
    description: 'Analisar dados para gerar insights de negócio.',
    requirements: ['1+ ano de experiência', 'Python e SQL', 'Conhecimento em BI'],
    benefits: ['Vale refeição', 'Home office integral', 'Ambiente descontraído'],
    location: 'Belo Horizonte, MG',
    type: 'remote',
    level: 'Junior',
    salary: { min: 4000, max: 6000 },
    status: 'active',
    applicationsCount: 45,
    createdAt: '2024-06-12',
    area: 'Dados',
  },
  {
    id: 'job-5',
    companyId: 'company-1',
    companyName: 'Tech Solutions',
    title: 'DevOps Engineer',
    description: 'Manter e evoluir nossa infraestrutura de cloud.',
    requirements: ['4+ anos de experiência', 'AWS ou GCP', 'Kubernetes', 'CI/CD'],
    benefits: ['Vale refeição', 'Plano de saúde', 'Home office', 'Certificações pagas'],
    location: 'São Paulo, SP',
    type: 'remote',
    level: 'Senior',
    salary: { min: 16000, max: 22000 },
    status: 'paused',
    applicationsCount: 12,
    createdAt: '2024-05-20',
    area: 'Infraestrutura',
  },
];

// Mock Applications
export const mockApplications: Application[] = [
  {
    id: 'app-1',
    jobId: 'job-1',
    candidateId: 'candidate-1',
    candidateName: 'João Santos',
    jobTitle: 'Desenvolvedor Full Stack Senior',
    companyName: 'Tech Solutions',
    status: 'interview',
    appliedAt: '2024-06-02',
    updatedAt: '2024-06-10',
  },
  {
    id: 'app-2',
    jobId: 'job-2',
    candidateId: 'candidate-2',
    candidateName: 'Maria Oliveira',
    jobTitle: 'Product Manager',
    companyName: 'Tech Solutions',
    status: 'reviewing',
    appliedAt: '2024-06-06',
    updatedAt: '2024-06-08',
  },
  {
    id: 'app-3',
    jobId: 'job-3',
    candidateId: 'candidate-3',
    candidateName: 'Pedro Costa',
    jobTitle: 'Designer UX/UI Pleno',
    companyName: 'Inovação Digital',
    status: 'pending',
    appliedAt: '2024-06-11',
    updatedAt: '2024-06-11',
  },
  {
    id: 'app-4',
    jobId: 'job-4',
    candidateId: 'candidate-4',
    candidateName: 'Carla Mendes',
    jobTitle: 'Analista de Dados Junior',
    companyName: 'StartUp Brasil',
    status: 'offer',
    appliedAt: '2024-06-13',
    updatedAt: '2024-06-18',
  },
  {
    id: 'app-5',
    jobId: 'job-5',
    candidateId: 'candidate-5',
    candidateName: 'Lucas Ferreira',
    jobTitle: 'DevOps Engineer',
    companyName: 'Tech Solutions',
    status: 'rejected',
    appliedAt: '2024-05-22',
    updatedAt: '2024-05-30',
  },
];

// Mock Behavioral Tests
export const mockBehavioralTests: BehavioralTest[] = [
  {
    id: 'test-1',
    candidateId: 'candidate-1',
    candidateName: 'João Santos',
    companyId: 'company-1',
    jobId: 'job-1',
    status: 'completed',
    sentAt: '2024-06-01',
    completedAt: '2024-06-02',
    result: {
      dominance: 72,
      influence: 45,
      steadiness: 58,
      compliance: 65,
      profile: 'Executor Analítico',
      strengths: ['Orientado a resultados', 'Pensamento crítico', 'Persistência'],
      watchPoints: ['Pode ser impaciente', 'Tendência ao perfeccionismo'],
    },
  },
  {
    id: 'test-2',
    candidateId: 'candidate-2',
    candidateName: 'Maria Oliveira',
    companyId: 'company-1',
    status: 'completed',
    sentAt: '2024-05-15',
    completedAt: '2024-05-16',
    result: {
      dominance: 55,
      influence: 78,
      steadiness: 62,
      compliance: 48,
      profile: 'Influenciador Estratégico',
      strengths: ['Comunicação persuasiva', 'Networking', 'Visão de futuro'],
      watchPoints: ['Pode dispersar foco', 'Dificuldade com detalhes'],
    },
  },
  {
    id: 'test-3',
    candidateId: 'candidate-3',
    candidateName: 'Pedro Costa',
    companyId: 'company-2',
    jobId: 'job-3',
    status: 'sent',
    sentAt: '2024-06-15',
  },
  {
    id: 'test-4',
    candidateId: 'candidate-4',
    candidateName: 'Carla Mendes',
    companyId: 'company-3',
    jobId: 'job-4',
    status: 'completed',
    sentAt: '2024-06-10',
    completedAt: '2024-06-11',
    result: {
      dominance: 35,
      influence: 42,
      steadiness: 75,
      compliance: 85,
      profile: 'Analítico Metódico',
      strengths: ['Atenção aos detalhes', 'Metodologia', 'Precisão'],
      watchPoints: ['Pode ser lento em decisões', 'Resistência a mudanças'],
    },
  },
  {
    id: 'test-5',
    candidateId: 'candidate-5',
    candidateName: 'Lucas Ferreira',
    companyId: 'company-1',
    status: 'in_progress',
    sentAt: '2024-06-18',
  },
];

// Mock Messages
export const mockMessages: Message[] = [
  {
    id: 'msg-1',
    senderId: 'company-1',
    senderName: 'Tech Solutions',
    senderType: 'company',
    receiverId: 'candidate-1',
    receiverName: 'João Santos',
    subject: 'Próximos passos do processo seletivo',
    content: 'Olá João! Ficamos muito impressionados com seu perfil. Gostaríamos de agendar uma entrevista técnica. Você tem disponibilidade na próxima semana?',
    read: true,
    createdAt: '2024-06-10T14:30:00',
  },
  {
    id: 'msg-2',
    senderId: 'candidate-1',
    senderName: 'João Santos',
    senderType: 'candidate',
    receiverId: 'company-1',
    receiverName: 'Tech Solutions',
    subject: 'Re: Próximos passos do processo seletivo',
    content: 'Olá! Muito obrigado pelo retorno. Tenho disponibilidade na terça e quarta-feira, período da tarde. Aguardo confirmação!',
    read: true,
    createdAt: '2024-06-10T16:45:00',
  },
  {
    id: 'msg-3',
    senderId: 'company-2',
    senderName: 'Inovação Digital',
    senderType: 'company',
    receiverId: 'candidate-3',
    receiverName: 'Pedro Costa',
    subject: 'Convite para teste comportamental',
    content: 'Olá Pedro! Seu portfolio nos chamou atenção. Gostaríamos de convidá-lo para realizar nosso teste comportamental Gauge-Pro. O link foi enviado para seu email.',
    read: false,
    createdAt: '2024-06-15T09:00:00',
  },
  {
    id: 'msg-4',
    senderId: 'company-3',
    senderName: 'StartUp Brasil',
    senderType: 'company',
    receiverId: 'candidate-4',
    receiverName: 'Carla Mendes',
    subject: 'Proposta de trabalho',
    content: 'Carla, parabéns! Você foi aprovada em nosso processo seletivo. Estamos preparando uma proposta formal que será enviada em breve.',
    read: true,
    createdAt: '2024-06-18T11:30:00',
  },
];

// Dashboard Stats
export const adminStats = {
  totalCompanies: 47,
  totalCandidates: 1284,
  activeJobs: 156,
  testsCompleted: 892,
  newCompaniesThisMonth: 8,
  newCandidatesThisMonth: 156,
  matchRate: 78,
};

export const companyStats = {
  activeJobs: 5,
  totalApplications: 127,
  testsCompleted: 45,
  interviewsScheduled: 12,
  hiredThisMonth: 3,
  avgTimeToHire: 21,
};

export const candidateStats = {
  applications: 4,
  interviews: 1,
  testsCompleted: 1,
  profileViews: 32,
  savedJobs: 8,
  newMessages: 2,
};
