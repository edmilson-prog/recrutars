/**
 * Roda o matchCalculator em pares reais (candidate, job) e tabula o resultado.
 * Uso: npx tsx scripts/match-audit.ts
 */
import { calculateMatchBreakdown } from '../src/lib/matchCalculator';

type Row = {
  app_id: string;
  job_title: string;
  job_level: string;
  job_type: 'remote' | 'hybrid' | 'onsite';
  job_requirements: string[];
  job_city: string;
  job_state: string;
  job_location: string;
  candidate_name: string;
  experience_years: number;
  candidate_skills: string[];
  candidate_city: string;
  candidate_state: string;
  candidate_location: string;
};

const DATA: Row[] = [
  { app_id: '0ad78620', job_title: 'Caixa', job_level: 'Pleno', job_type: 'onsite', job_requirements: ['Requisitos:', 'Ensino médio completo', 'Experiência com caixa ou atendimento ao público', 'Facilidade com vendas e abordagem ao cliente', 'Boa comunicação e proatividade'], job_city: 'Frederico Westphalen', job_state: 'RS', job_location: 'Frederico Westphalen/RS', candidate_name: 'ELISANDRA FRANZMANN', experience_years: 0, candidate_skills: ['Aprendizado Contínuo', 'Comunicação Verbal', 'Proatividade'], candidate_city: 'Frederico Westphalen', candidate_state: 'RS', candidate_location: 'Frederico Westphalen, RS' },
  { app_id: '72d1d0a5', job_title: 'Analista Financeiro', job_level: 'Pleno', job_type: 'onsite', job_requirements: ['•  Experiência mínima de 5 anos na área financeira.', '•  Experiência comprovada em contas a pagar, contas a receber, conciliação bancária e fluxo de caixa.', '•  Desejável Formação ou cursando superior em Administração, Ciências Contábeis, Economia ou áreas correlatas.', '•  Domínio de Excel mínimo intermediário ', '•  Experiência com ERP financeiro ou sistema de gestão empresarial.'], job_city: 'Jarinu', job_state: 'SP', job_location: 'Jarinu/SP', candidate_name: 'SUL ELEN TEREZA NOITER SANTANA', experience_years: 0, candidate_skills: ['Controle Financeiro', 'Resiliência', 'Gestão de Projetos', 'Trabalho em Equipe', 'Pacote Office', 'Ética Profissional', 'BI e Dashboards', 'Comunicação Verbal', 'Automação de Processos', 'Relacionamento Interpessoal', 'Google Workspace', 'Empatia', 'Sistemas ERP', 'Tomada de Decisão', 'Análise de Dados', 'Gestão do Tempo', 'Melhoria Contínua', 'Planejamento', 'Faturamento e Cobrança', 'Resolução de Problemas'], candidate_city: 'Jaguariúna', candidate_state: 'SP', candidate_location: 'Jaguariúna, SP' },
  { app_id: 'a2811e71', job_title: 'Analista de Recursos Humanos', job_level: 'Pleno', job_type: 'onsite', job_requirements: ['Requisitos:', 'Experiência comprovada em recrutamento e seleção (obrigatório)', 'Boa capacidade analítica e senso crítico na avaliação de candidatos', 'Comunicação clara e postura profissional', 'Organização e gestão de múltiplas vagas/processos', 'Ensino superior em andamento ou concluído em áreas afins'], job_city: 'Frederico Westphalen', job_state: 'RS', job_location: 'Frederico Westphalen/RS', candidate_name: 'ALINE APARECIDA GALHARDO', experience_years: 0, candidate_skills: [], candidate_city: 'Frederico Westphalen', candidate_state: 'RS', candidate_location: 'Frederico Westphalen, RS' },
  { app_id: 'a9f13889', job_title: 'Vendedor - Artigos de Pesca', job_level: 'Pleno', job_type: 'onsite', job_requirements: ['✅ Requisitos:', '• Experiência com vendas', '• Boa comunicação e negociação', '• Perfil proativo e orientado a metas'], job_city: 'Frederico Westphalen', job_state: 'RS', job_location: 'Frederico Westphalen/RS', candidate_name: 'EVERTON MARQUES', experience_years: 0, candidate_skills: [], candidate_city: 'Frederico Westphalen', candidate_state: 'RS', candidate_location: 'Frederico Westphalen, RS' },
  { app_id: '1f7e583d', job_title: 'Analista de Recursos Humanos', job_level: 'Pleno', job_type: 'onsite', job_requirements: ['Requisitos:', 'Experiência comprovada em recrutamento e seleção (obrigatório)', 'Boa capacidade analítica e senso crítico na avaliação de candidatos', 'Comunicação clara e postura profissional', 'Organização e gestão de múltiplas vagas/processos', 'Ensino superior em andamento ou concluído em áreas afins'], job_city: 'Frederico Westphalen', job_state: 'RS', job_location: 'Frederico Westphalen/RS', candidate_name: 'ANABEL FRAZÃO SILVA ALBARELLO', experience_years: 0, candidate_skills: [], candidate_city: 'Frederico Westphalen', candidate_state: 'RS', candidate_location: 'Frederico Westphalen, RS' },
  { app_id: '4cf012c6', job_title: 'Caixa', job_level: 'Pleno', job_type: 'onsite', job_requirements: ['Requisitos:', 'Ensino médio completo', 'Experiência com caixa ou atendimento ao público', 'Facilidade com vendas e abordagem ao cliente', 'Boa comunicação e proatividade'], job_city: 'Frederico Westphalen', job_state: 'RS', job_location: 'Frederico Westphalen/RS', candidate_name: 'CRISTIANO S PRESTES', experience_years: 0, candidate_skills: [], candidate_city: 'Taquaruçu do Sul', candidate_state: 'RS', candidate_location: 'Taquaruçu do Sul, RS' },
  { app_id: 'f8e9088f', job_title: 'Estoquista', job_level: 'Junior', job_type: 'onsite', job_requirements: ['✅ Requisitos:', '• Experiência na função será um diferencial', '• Organização e atenção aos detalhes', '• Agilidade e responsabilidade'], job_city: 'Frederico Westphalen', job_state: 'RS', job_location: 'Frederico Westphalen/RS', candidate_name: 'CRISTIANO S PRESTES', experience_years: 0, candidate_skills: [], candidate_city: 'Taquaruçu do Sul', candidate_state: 'RS', candidate_location: 'Taquaruçu do Sul, RS' },
  { app_id: 'cd728f3d', job_title: 'Analista de Recursos Humanos', job_level: 'Pleno', job_type: 'onsite', job_requirements: ['Requisitos:', 'Experiência comprovada em recrutamento e seleção (obrigatório)', 'Boa capacidade analítica e senso crítico na avaliação de candidatos', 'Comunicação clara e postura profissional', 'Organização e gestão de múltiplas vagas/processos', 'Ensino superior em andamento ou concluído em áreas afins'], job_city: 'Frederico Westphalen', job_state: 'RS', job_location: 'Frederico Westphalen/RS', candidate_name: 'TAIANA MEDEIROS BARBOSA', experience_years: 0, candidate_skills: [], candidate_city: 'Frederico Westphalen', candidate_state: 'RS', candidate_location: 'Frederico Westphalen, RS' },
  { app_id: '8fde0cb1', job_title: 'Caixa', job_level: 'Pleno', job_type: 'onsite', job_requirements: ['Requisitos:', 'Ensino médio completo', 'Experiência com caixa ou atendimento ao público', 'Facilidade com vendas e abordagem ao cliente', 'Boa comunicação e proatividade'], job_city: 'Frederico Westphalen', job_state: 'RS', job_location: 'Frederico Westphalen/RS', candidate_name: 'TAIANA MEDEIROS BARBOSA', experience_years: 0, candidate_skills: [], candidate_city: 'Frederico Westphalen', candidate_state: 'RS', candidate_location: 'Frederico Westphalen, RS' },
  { app_id: 'e46b5655', job_title: 'Estoquista', job_level: 'Junior', job_type: 'onsite', job_requirements: ['✅ Requisitos:', '• Experiência na função será um diferencial', '• Organização e atenção aos detalhes', '• Agilidade e responsabilidade'], job_city: 'Frederico Westphalen', job_state: 'RS', job_location: 'Frederico Westphalen/RS', candidate_name: 'EVERTON MARQUES', experience_years: 0, candidate_skills: [], candidate_city: 'Frederico Westphalen', candidate_state: 'RS', candidate_location: 'Frederico Westphalen, RS' },
  { app_id: '46563d8d', job_title: 'Estoquista', job_level: 'Junior', job_type: 'onsite', job_requirements: ['✅ Requisitos:', '• Experiência na função será um diferencial', '• Organização e atenção aos detalhes', '• Agilidade e responsabilidade'], job_city: 'Frederico Westphalen', job_state: 'RS', job_location: 'Frederico Westphalen/RS', candidate_name: 'LUCAS DA MOTTA ANTUNES', experience_years: 0, candidate_skills: [], candidate_city: 'Frederico Westphalen', candidate_state: 'RS', candidate_location: 'Frederico Westphalen, RS' },
  { app_id: 'dccbe22f', job_title: 'Caixa', job_level: 'Pleno', job_type: 'onsite', job_requirements: ['Requisitos:', 'Ensino médio completo', 'Experiência com caixa ou atendimento ao público', 'Facilidade com vendas e abordagem ao cliente', 'Boa comunicação e proatividade'], job_city: 'Frederico Westphalen', job_state: 'RS', job_location: 'Frederico Westphalen/RS', candidate_name: 'LUANA FRANCINE DE LIMA', experience_years: 0, candidate_skills: [], candidate_city: 'Frederico Westphalen', candidate_state: 'RS', candidate_location: 'Frederico Westphalen, RS' },
  { app_id: '93efa6e1', job_title: 'Estoquista', job_level: 'Junior', job_type: 'onsite', job_requirements: ['✅ Requisitos:', '• Experiência na função será um diferencial', '• Organização e atenção aos detalhes', '• Agilidade e responsabilidade'], job_city: 'Frederico Westphalen', job_state: 'RS', job_location: 'Frederico Westphalen/RS', candidate_name: 'WAGNER MACHADO', experience_years: 0, candidate_skills: ['Melhoria Contínua'], candidate_city: 'Frederico Westphalen', candidate_state: 'RS', candidate_location: 'Frederico Westphalen, RS' },
  { app_id: '055842f2', job_title: 'Guia de Turismo', job_level: 'Junior', job_type: 'onsite', job_requirements: ['✅ Requisitos', 'Boa comunicação e facilidade com atendimento ao público', 'Perfil proativo', 'Disposição para aprender e se desenvolver', 'Conhecimento básico em Word e Excel (ou vontade de aprender)', 'Disponibilidade de horários, incluindo finais de semana e feriados sob demanda'], job_city: 'Ametista do Sul', job_state: 'RS', job_location: 'Ametista do Sul/RS', candidate_name: 'RAFAEL HELFENSTEIN', experience_years: 0, candidate_skills: [], candidate_city: 'Erval Seco', candidate_state: 'RS', candidate_location: 'Erval Seco, RS' },
  { app_id: '84e0b3dd', job_title: 'Analista de Dados Junior', job_level: 'Junior', job_type: 'remote', job_requirements: ['1+ ano de experiência', 'Python e SQL', 'Conhecimento em BI'], job_city: 'Belo Horizonte', job_state: 'MG', job_location: 'Belo Horizonte, MG', candidate_name: 'VITORIA SALDANHA', experience_years: 0, candidate_skills: [], candidate_city: 'Frederico Westphalen', candidate_state: 'RS', candidate_location: 'Frederico Westphalen, RS' },
  { app_id: '17a87536', job_title: 'Full Stack Developer', job_level: 'Pleno', job_type: 'remote', job_requirements: ['2+ anos de experiência', 'React ou Vue', 'Node.js ou Python', 'SQL'], job_city: 'Belo Horizonte', job_state: 'MG', job_location: 'Belo Horizonte, MG', candidate_name: 'VITORIA SALDANHA', experience_years: 0, candidate_skills: [], candidate_city: 'Frederico Westphalen', candidate_state: 'RS', candidate_location: 'Frederico Westphalen, RS' },
  { app_id: '655d02f8', job_title: 'Guia de Turismo', job_level: 'Junior', job_type: 'onsite', job_requirements: ['✅ Requisitos', 'Boa comunicação e facilidade com atendimento ao público', 'Perfil proativo', 'Disposição para aprender e se desenvolver', 'Conhecimento básico em Word e Excel (ou vontade de aprender)', 'Disponibilidade de horários, incluindo finais de semana e feriados sob demanda'], job_city: 'Ametista do Sul', job_state: 'RS', job_location: 'Ametista do Sul/RS', candidate_name: 'CLAUDIA MARIA GIOTTI', experience_years: 0, candidate_skills: [], candidate_city: 'Ametista do Sul', candidate_state: 'RS', candidate_location: 'Ametista do Sul, RS' },
  { app_id: '894690c7', job_title: 'Analista Financeiro', job_level: 'Pleno', job_type: 'onsite', job_requirements: ['•  Experiência mínima de 5 anos na área financeira.', '•  Experiência comprovada em contas a pagar, contas a receber, conciliação bancária e fluxo de caixa.', '•  Desejável Formação ou cursando superior em Administração, Ciências Contábeis, Economia ou áreas correlatas.', '•  Domínio de Excel mínimo intermediário ', '•  Experiência com ERP financeiro ou sistema de gestão empresarial.'], job_city: 'Jarinu', job_state: 'SP', job_location: 'Jarinu/SP', candidate_name: 'LUANA JARRA', experience_years: 0, candidate_skills: [], candidate_city: 'Jarinu', candidate_state: 'SP', candidate_location: 'Jarinu, SP' },
  { app_id: '9507417b', job_title: 'Guia de Turismo', job_level: 'Junior', job_type: 'onsite', job_requirements: ['✅ Requisitos', 'Boa comunicação e facilidade com atendimento ao público', 'Perfil proativo', 'Disposição para aprender e se desenvolver', 'Conhecimento básico em Word e Excel (ou vontade de aprender)', 'Disponibilidade de horários, incluindo finais de semana e feriados sob demanda'], job_city: 'Ametista do Sul', job_state: 'RS', job_location: 'Ametista do Sul/RS', candidate_name: 'GABRIELLI DA CRUZ', experience_years: 0, candidate_skills: ['Atendimento ao Cliente', 'Criatividade', 'Faturamento e Cobrança', 'Atenção a Detalhes', 'Pacote Office', 'Liderança', 'Visual Merchandising', 'Gestão de Conflitos', 'Técnicas de Vendas', 'Empatia', 'Trabalho em Equipe', 'Orientação ao Cliente', 'Inteligência Emocional', 'Adaptabilidade', 'Ética Profissional'], candidate_city: 'Frederico Westphalen', candidate_state: 'RS', candidate_location: 'Frederico Westphalen, RS' },
  { app_id: '6eca4d11', job_title: 'Gestão - Odontotop', job_level: 'Gerente', job_type: 'onsite', job_requirements: ['Requisitos', '- Experiência comprovada em liderança e gestão de equipes', '- Histórico consistente com vendas e atingimento de metas', '- Perfil analítico, organizado e orientado a resultados', '- Boa comunicação e habilidade de negociação', '- Capacidade de tomada de decisão e resolução de problemas'], job_city: 'Santa Rosa', job_state: 'RS', job_location: 'Santa Rosa/RS', candidate_name: 'JAQUELINE SAVISKI DOS SANTOS', experience_years: 0, candidate_skills: [], candidate_city: 'Tucunduva', candidate_state: 'RS', candidate_location: 'Tucunduva, RS' },
];

const fmt = (n: number, w = 4) => String(n).padStart(w, ' ');

const header = `app_id    | ${'Vaga'.padEnd(34)} | nivel    | type    | sk | exp | beh | loc | TOT  | candidato`;
console.log(header);
console.log('-'.repeat(header.length + 25));

const summary = { skillsBuckets: { '0-19': 0, '20-39': 0, '40-59': 0, '60-79': 0, '80-100': 0 }, expBuckets: { '0-39': 0, '40-59': 0, '60-79': 0, '80-100': 0 }, locBuckets: { '0-39': 0, '40-59': 0, '60-79': 0, '80-100': 0 }, totBuckets: { '0-29': 0, '30-49': 0, '50-69': 0, '70-100': 0 } };

for (const r of DATA) {
  const candidate = {
    name: r.candidate_name,
    experience: r.experience_years,
    skills: r.candidate_skills,
    city: r.candidate_city,
    state: r.candidate_state,
    location: r.candidate_location,
  } as any;
  const job = {
    title: r.job_title,
    level: r.job_level,
    type: r.job_type,
    requirements: r.job_requirements,
    city: r.job_city,
    state: r.job_state,
    location: r.job_location,
  } as any;

  const result = calculateMatchBreakdown(candidate, job);
  const cats = Object.fromEntries(result.categories.map(c => [c.id, c.score]));
  const sk = cats.skills, exp = cats.experience, beh = cats.behavioral, loc = cats.location, tot = result.totalScore;

  console.log(`${r.app_id} | ${r.job_title.padEnd(34)} | ${r.job_level.padEnd(8)} | ${r.job_type.padEnd(7)} | ${fmt(sk, 2)} | ${fmt(exp, 3)} | ${fmt(beh, 3)} | ${fmt(loc, 3)} | ${fmt(tot, 4)} | ${r.candidate_name}`);

  if (sk < 20) summary.skillsBuckets['0-19']++;
  else if (sk < 40) summary.skillsBuckets['20-39']++;
  else if (sk < 60) summary.skillsBuckets['40-59']++;
  else if (sk < 80) summary.skillsBuckets['60-79']++;
  else summary.skillsBuckets['80-100']++;

  if (exp < 40) summary.expBuckets['0-39']++;
  else if (exp < 60) summary.expBuckets['40-59']++;
  else if (exp < 80) summary.expBuckets['60-79']++;
  else summary.expBuckets['80-100']++;

  if (loc < 40) summary.locBuckets['0-39']++;
  else if (loc < 60) summary.locBuckets['40-59']++;
  else if (loc < 80) summary.locBuckets['60-79']++;
  else summary.locBuckets['80-100']++;

  if (tot < 30) summary.totBuckets['0-29']++;
  else if (tot < 50) summary.totBuckets['30-49']++;
  else if (tot < 70) summary.totBuckets['50-69']++;
  else summary.totBuckets['70-100']++;
}

console.log('\n--- DISTRIBUIÇÃO ---');
console.log('Skills:', summary.skillsBuckets);
console.log('Experiência:', summary.expBuckets);
console.log('Localização:', summary.locBuckets);
console.log('Total:', summary.totBuckets);
