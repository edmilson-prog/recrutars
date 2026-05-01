/**
 * Compara o score de skills atual (legacy text-based) vs proposto (std_skills
 * separadas em técnica/comportamental, média 50/50). Roda nos 4 pares cujo
 * candidato tem std_skills cadastradas.
 */
import { calculateSkillsScore, calculateStandardizedSkillsScore } from '../src/lib/matchCalculator';

type Pair = {
  app_id: string;
  candidate: string;
  job: string;
  legacy_skills_text: string[];      // skills texto livre
  legacy_requirements_text: string[]; // requisitos texto livre
  cand_tech: string[];                // ids ordenados por priority
  cand_beh: string[];
  job_tech: string[];
  job_beh: string[];
};

const PAIRS: Pair[] = [
  {
    app_id: '0ad78620',
    candidate: 'ELISANDRA FRANZMANN',
    job: 'Caixa',
    legacy_skills_text: ['Aprendizado Contínuo', 'Comunicação Verbal', 'Proatividade'],
    legacy_requirements_text: ['Requisitos:', 'Ensino médio completo', 'Experiência com caixa ou atendimento ao público', 'Facilidade com vendas e abordagem ao cliente', 'Boa comunicação e proatividade'],
    cand_tech: [],
    cand_beh: ['c0e3e271-cfce-4827-9a9b-e5c7becb7929', '51850d70-629b-48a3-aa89-fefe27309b59', 'e589a36d-6b41-4480-a42f-110dd11d7ef4'],
    job_tech: ['1867af48-7d36-4253-a62b-03083e6c0d42', '2d7ced98-6c6a-4c8b-9ca7-a988bd04ca8e', 'ee424dd0-12d4-47dd-9645-babc0cb80d54', '3171785a-c70c-43a3-a89f-65073d553f23', '8bcc2a20-a9cb-437a-85c2-802286771038'],
    job_beh: ['5c4393c8-b161-4f0d-9c73-5a564ad2ebcb', '0609cb73-882f-43a1-b23e-a8520934f6c1', 'a341bd38-86e9-4668-b0ee-cb2bf0c4cbd3', 'e589a36d-6b41-4480-a42f-110dd11d7ef4', 'd2049c0f-99bc-4902-8fe9-e3f05769f2c7'],
  },
  {
    app_id: '72d1d0a5',
    candidate: 'SUL ELEN TEREZA',
    job: 'Analista Financeiro',
    legacy_skills_text: ['Controle Financeiro', 'Resiliência', 'Gestão de Projetos', 'Trabalho em Equipe', 'Pacote Office', 'Ética Profissional', 'BI e Dashboards', 'Comunicação Verbal', 'Automação de Processos', 'Relacionamento Interpessoal', 'Google Workspace', 'Empatia', 'Sistemas ERP', 'Tomada de Decisão', 'Análise de Dados', 'Gestão do Tempo', 'Melhoria Contínua', 'Planejamento', 'Faturamento e Cobrança', 'Resolução de Problemas'],
    legacy_requirements_text: ['•  Experiência mínima de 5 anos na área financeira.', '•  Experiência comprovada em contas a pagar, contas a receber, conciliação bancária e fluxo de caixa.', '•  Desejável Formação ou cursando superior em Administração, Ciências Contábeis, Economia ou áreas correlatas.', '•  Domínio de Excel mínimo intermediário ', '•  Experiência com ERP financeiro ou sistema de gestão empresarial.'],
    cand_tech: ['2d7ced98-6c6a-4c8b-9ca7-a988bd04ca8e', 'd59c99ff-8850-4d1d-9049-8740bc5d88c8', '9acb8c6f-df7c-452b-8179-fb2af764823f', '8cd8bb79-8521-4b1b-afab-28e75982eddf', '397440ca-0353-4aa3-849e-f5e7f572f8d3', '816d9bf5-1eec-4fea-8148-0f5de375012a', 'a727cfaf-339b-401d-bf9f-809c168d5fa8', '6fd99cf1-8eaf-428c-bec4-7d03a7cb00a7', '3171785a-c70c-43a3-a89f-65073d553f23', '5da47b3e-aec6-4f22-b27b-ffa82ea5a456'],
    cand_beh: ['02087441-96c5-4501-bdd3-d91faad883d5', 'a341bd38-86e9-4668-b0ee-cb2bf0c4cbd3', 'fae9a44e-2dd8-4163-b9cc-a314ba715a78', '51850d70-629b-48a3-aa89-fefe27309b59', '19f16f53-c813-44fd-b868-a1ceebfefd3c', 'ac1f29f7-6f87-48d1-8c2d-b4af166ebc1e', '315d3c82-d078-4462-bfe4-78ecb668e880', '6967dd32-abbe-42a5-aab1-f2f30b2af7a8', '73b816d0-8daa-41eb-bc3b-c01c09af869a', 'd2cd419e-f362-4e80-bde1-d4be456170db'],
    job_tech: ['2d7ced98-6c6a-4c8b-9ca7-a988bd04ca8e', '8c16a07f-436e-491f-a385-6bc3477a9b8b', '3171785a-c70c-43a3-a89f-65073d553f23', '655a10bf-8188-4f74-a624-676f821dc489', '1d021395-7563-4a3a-beb2-1956649a9608'],
    job_beh: ['ce7315df-eb67-40c1-aad8-0d80824e079d', '73b816d0-8daa-41eb-bc3b-c01c09af869a', 'bc577587-7e9a-4697-9c08-e55e79e3806a', 'a341bd38-86e9-4668-b0ee-cb2bf0c4cbd3', 'fae9a44e-2dd8-4163-b9cc-a314ba715a78'],
  },
  {
    app_id: '93efa6e1',
    candidate: 'WAGNER MACHADO',
    job: 'Estoquista',
    legacy_skills_text: ['Melhoria Contínua'],
    legacy_requirements_text: ['✅ Requisitos:', '• Experiência na função será um diferencial', '• Organização e atenção aos detalhes', '• Agilidade e responsabilidade'],
    cand_tech: ['3171785a-c70c-43a3-a89f-65073d553f23'],
    cand_beh: [],
    job_tech: ['622a89cf-bc6a-4561-a7ae-dad76b92bb34', '3171785a-c70c-43a3-a89f-65073d553f23', '655a10bf-8188-4f74-a624-676f821dc489', 'f728481f-95ef-4e46-8e11-0d31f729685f'],
    job_beh: ['c0e3e271-cfce-4827-9a9b-e5c7becb7929', '5c4393c8-b161-4f0d-9c73-5a564ad2ebcb', 'b11e36d7-8835-4dc7-a5a3-b6f5c7e570fb', 'e589a36d-6b41-4480-a42f-110dd11d7ef4', 'ce7315df-eb67-40c1-aad8-0d80824e079d'],
  },
  {
    app_id: '9507417b',
    candidate: 'GABRIELLI DA CRUZ',
    job: 'Guia de Turismo',
    legacy_skills_text: ['Atendimento ao Cliente', 'Criatividade', 'Faturamento e Cobrança', 'Atenção a Detalhes', 'Pacote Office', 'Liderança', 'Visual Merchandising', 'Gestão de Conflitos', 'Técnicas de Vendas', 'Empatia', 'Trabalho em Equipe', 'Orientação ao Cliente', 'Inteligência Emocional', 'Adaptabilidade', 'Ética Profissional'],
    legacy_requirements_text: ['✅ Requisitos', 'Boa comunicação e facilidade com atendimento ao público', 'Perfil proativo', 'Disposição para aprender e se desenvolver', 'Conhecimento básico em Word e Excel (ou vontade de aprender)', 'Disponibilidade de horários, incluindo finais de semana e feriados sob demanda'],
    cand_tech: ['8bcc2a20-a9cb-437a-85c2-802286771038', '5da47b3e-aec6-4f22-b27b-ffa82ea5a456', '9acb8c6f-df7c-452b-8179-fb2af764823f', '67fbc142-c4b7-4cef-ae21-443cdfb02f23', '1867af48-7d36-4253-a62b-03083e6c0d42'],
    cand_beh: ['25c03518-96ed-4497-b53f-aa57fa84f5c1', 'e28d187d-9037-4d9b-a24f-391451b9da0a', 'e7034a12-c65c-4c4f-9f2f-b6e58139864f', '3dea6799-7896-4312-aa84-5f25c1a53aed', 'ac1f29f7-6f87-48d1-8c2d-b4af166ebc1e', 'a341bd38-86e9-4668-b0ee-cb2bf0c4cbd3', 'ddcaae6b-f75c-46a9-ae96-7164d8de3c65', '9270bd01-b492-454b-ad71-794f2104828e', '0609cb73-882f-43a1-b23e-a8520934f6c1', 'fae9a44e-2dd8-4163-b9cc-a314ba715a78'],
    job_tech: ['8bcc2a20-a9cb-437a-85c2-802286771038', '3171785a-c70c-43a3-a89f-65073d553f23', 'f66f6226-a325-4669-a96a-db990091936b', '1867af48-7d36-4253-a62b-03083e6c0d42', '622a89cf-bc6a-4561-a7ae-dad76b92bb34'],
    job_beh: ['51850d70-629b-48a3-aa89-fefe27309b59', 'ac1f29f7-6f87-48d1-8c2d-b4af166ebc1e', 'd2049c0f-99bc-4902-8fe9-e3f05769f2c7', 'ddcaae6b-f75c-46a9-ae96-7164d8de3c65', '73b816d0-8daa-41eb-bc3b-c01c09af869a'],
  },
];

console.log('app_id   | candidato            | vaga                | LEGACY | tech | beh  | NOVO  | Δ');
console.log('-'.repeat(110));

for (const p of PAIRS) {
  const legacy = calculateSkillsScore(p.legacy_skills_text, p.legacy_requirements_text);
  const tech = (p.cand_tech.length && p.job_tech.length)
    ? calculateStandardizedSkillsScore(p.cand_tech, p.job_tech)
    : (p.job_tech.length ? 20 : 50);
  const beh = (p.cand_beh.length && p.job_beh.length)
    ? calculateStandardizedSkillsScore(p.cand_beh, p.job_beh)
    : (p.job_beh.length ? 20 : 50);
  const novo = Math.round((tech + beh) / 2);
  const delta = novo - legacy;

  const sign = delta > 0 ? '+' : '';
  console.log(`${p.app_id} | ${p.candidate.padEnd(20)} | ${p.job.padEnd(19)} | ${String(legacy).padStart(6)} | ${String(tech).padStart(4)} | ${String(beh).padStart(4)} | ${String(novo).padStart(5)} | ${sign}${delta}`);
}

console.log('\nNotas:');
console.log('• LEGACY = calculateSkillsScore com texto livre (caminho atual)');
console.log('• tech / beh = calculateStandardizedSkillsScore para cada tipo, separado');
console.log('• NOVO = média 50/50 de tech + beh');
console.log('• Quando candidato não tem skill std de um tipo: penaliza para 20 (igual fallback do legacy)');
