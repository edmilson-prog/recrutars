/**
 * AI Match Prompt Builder
 *
 * Monta o request para Claude com 12 itens de contexto + cache_control no
 * system prompt e na descrição da vaga (estáticos por vaga = ~90% economia
 * com prompt caching da Anthropic em múltiplas análises da mesma vaga).
 *
 * Saída: estrutura ClaudeApiRequest pronta para callLLM().
 */

import type { ClaudeApiRequest } from '@/types/aiAnalysis';
import type { Database } from '@/types/database';
import type { MatchResult } from '@/types/disc';

type Candidate = Database['public']['Tables']['candidates']['Row'];
type Job = Database['public']['Tables']['jobs']['Row'];

const AI_MATCH_SYSTEM_PROMPT = `Você é um especialista em recrutamento e psicologia organizacional brasileiro,
analisando a compatibilidade entre um candidato e uma vaga específica para um recrutador profissional.

Sua análise deve ser profunda, contextual e prática — complementando (não substituindo) o score
numérico do match algorítmico. Use linguagem clara, objetiva, em português brasileiro.

ESTRUTURA OBRIGATÓRIA DA SAÍDA (markdown, exatamente nesta ordem):

## 📖 Leitura do candidato
3-4 parágrafos contextualizando quem é essa pessoa profissionalmente: trajetória, padrão de movimentação,
posicionamento atual no mercado, traços de personalidade que emergem do teste comportamental.

## ✅ Por que combina
Lista de 4-6 pontos com evidências concretas (cite cargos, anos, perfil) de por que o candidato faz sentido
para essa vaga. Conecte explicitamente skills, experiência e comportamento.

## ⚠️ Pontos de atenção
3-5 pontos genuínos de risco ou gap. Seja franco, sem suavizar. Indique como investigar cada um na entrevista.

## 🌱 Potencial e fit cultural
2-3 parágrafos sobre crescimento na função, ambiente onde a pessoa floresce, sinais de fit cultural com
o tipo de empresa/time descrito na vaga.

## 💬 Perguntas sugeridas para entrevista
4-6 perguntas específicas (não genéricas), formuladas para validar pontos de atenção e explorar potencial.

REGRAS:
- Não invente fatos. Se um dado não está disponível, diga "não há informação suficiente" e siga.
- Não devolva score numérico — o algoritmo já entrega isso.
- Não repita o conteúdo do score algorítmico — agregue contexto qualitativo.
- Foque em insights que o algoritmo determinístico NÃO captura.
- Use citações diretas do CV ou do teste quando reforçarem um ponto.`;

export interface BuildAIMatchPromptInput {
  candidate: Candidate;
  job: Job;
  matchResult: MatchResult;
  /** Análise comportamental existente (prática), se houver — vai como contexto */
  behavioralAnalysisExisting?: string | null;
}

function asArray(value: unknown): string[] {
  if (Array.isArray(value)) return value.filter((v): v is string => typeof v === 'string');
  return [];
}

function asString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' ? value : undefined;
}

/**
 * Bloco estático (system + descrição da vaga) — vai com cache_control para reduzir
 * custo quando múltiplos candidatos são analisados para a mesma vaga.
 */
function buildJobBlock(job: Job): string {
  const j = job as unknown as Record<string, unknown>;
  const skills = asArray(j['skills_technical_priorities'] ?? j['required_skills']);
  const behavSkills = asArray(j['skills_behavioral_priorities']);
  const ideal = j['ideal_profile'] as { d?: number; i?: number; s?: number; c?: number } | undefined;

  return `# CONTEXTO DA VAGA

## Cabeçalho
- Título: ${asString(j['title'], 'N/A')}
- Empresa: ${asString(j['company_name'], 'N/A')}
- Modalidade: ${asString(j['work_mode'], 'N/A')}
- Localização: ${[asString(j['city']), asString(j['state'])].filter(Boolean).join(' / ') || 'N/A'}
- Nível: ${asString(j['level'], 'N/A')}

## Descrição
${asString(j['description'], '(sem descrição)')}

## Responsabilidades
${asString(j['responsibilities'], '(não informado)')}

## Requisitos
${asString(j['requirements'], '(não informado)')}

## Skills (em ordem de prioridade)
- Técnicas: ${skills.length ? skills.join(', ') : '(não informado)'}
- Comportamentais: ${behavSkills.length ? behavSkills.join(', ') : '(não informado)'}

## Perfil Comportamental Ideal (Gauge-Pro)
${ideal ? `D=${ideal.d ?? '?'}, I=${ideal.i ?? '?'}, S=${ideal.s ?? '?'}, C=${ideal.c ?? '?'}` : '(não definido)'}

## Pesos do Match configurados
- Skills Técnicas: ${asNumber(j['weight_skills_technical']) ?? 25}%
- Skills Comportamentais: ${asNumber(j['weight_skills_behavioral']) ?? 15}%
- Experiência: ${asNumber(j['weight_experience']) ?? 30}%
- Perfil Comportamental: ${asNumber(j['weight_gauge_pro']) ?? 20}%
- Localização: ${asNumber(j['weight_location']) ?? 10}%`;
}

function buildCandidateBlock(input: BuildAIMatchPromptInput): string {
  const { candidate, matchResult, behavioralAnalysisExisting } = input;
  const c = candidate as unknown as Record<string, unknown>;

  const skillsTech = asArray(c['skills_technical'] ?? c['skills']);
  const skillsBehav = asArray(c['skills_behavioral']);
  const profile = c['gauge_pro_profile'] as
    | { d?: number; i?: number; s?: number; c?: number; r?: number; archetype?: string }
    | undefined;

  const exps = c['experiences'] as
    | Array<{ position?: string; company?: string; period?: string; description?: string }>
    | undefined;

  const edu = c['education'] as Array<{ degree?: string; institution?: string; period?: string }> | undefined;

  const experiencesText = exps?.length
    ? exps.map((e) =>
        `- ${e.position ?? '?'} @ ${e.company ?? '?'} (${e.period ?? '?'}) — ${e.description ?? ''}`.trim(),
      ).join('\n')
    : '(não informado)';

  const educationText = edu?.length
    ? edu.map((e) => `- ${e.degree ?? '?'} — ${e.institution ?? '?'} (${e.period ?? '?'})`).join('\n')
    : '(não informado)';

  return `# CONTEXTO DO CANDIDATO

## Dados Básicos
- Nome: ${asString(c['name'], 'N/A')}
- Idade: ${asNumber(c['age']) ?? 'N/A'}
- Localização: ${[asString(c['city']), asString(c['state'])].filter(Boolean).join(' / ') || asString(c['location'], 'N/A')}
- Experiência total: ${asNumber(c['experience']) ?? '?'} anos

## Currículo (cargos anteriores)
${experiencesText}

## Formação
${educationText}

## Skills declaradas
- Técnicas: ${skillsTech.length ? skillsTech.join(', ') : '(não informado)'}
- Comportamentais: ${skillsBehav.length ? skillsBehav.join(', ') : '(não informado)'}

## Perfil Gauge-Pro (DISC)
${profile ? `D=${profile.d}, I=${profile.i}, S=${profile.s}, C=${profile.c}, R=${profile.r ?? '?'} — Arquétipo: ${profile.archetype ?? '?'}` : '(não realizado)'}

## Pretensão e disponibilidade
- Pretensão salarial: ${(c['salary_expectation'] as string | number | undefined) ?? '(não informado)'}
- Disponibilidade: ${asString(c['availability'], '(não informado)')}

${behavioralAnalysisExisting ? `## Análise comportamental existente (referência)\n${behavioralAnalysisExisting}` : ''}

# RESULTADO DO ALGORITMO DE MATCH (referência objetiva)
- Score total: ${matchResult.totalScore}%
- Breakdown:
${matchResult.categories.map((cat) => `  - ${cat.name}: ${cat.score}% (peso ${cat.effectiveWeight ?? cat.weight}%)`).join('\n')}
- Strengths já detectados: ${matchResult.strengths.map((s) => s.title).join('; ') || '(nenhum)'}
- Opportunities já detectadas: ${matchResult.opportunities.map((o) => o.title).join('; ') || '(nenhuma)'}`;
}

/**
 * Builds the full ClaudeApiRequest with prompt caching enabled on:
 * - system prompt (estático global)
 * - bloco da vaga (estático por vaga — alto cache hit em múltiplas análises)
 *
 * Bloco do candidato fica fora do cache (varia por análise).
 */
export function buildAIMatchRequest(
  input: BuildAIMatchPromptInput,
  model: string,
  maxTokens: number,
  temperature: number,
): ClaudeApiRequest {
  const jobBlock = buildJobBlock(input.job);
  const candidateBlock = buildCandidateBlock(input);

  return {
    model,
    max_tokens: maxTokens,
    temperature,
    system: [
      { type: 'text', text: AI_MATCH_SYSTEM_PROMPT, cache_control: { type: 'ephemeral' } },
      { type: 'text', text: jobBlock, cache_control: { type: 'ephemeral' } },
    ],
    messages: [
      {
        role: 'user',
        content: `${candidateBlock}\n\n# TAREFA\nGere a análise de compatibilidade seguindo a estrutura obrigatória de 5 seções definida no system prompt.`,
      },
    ],
  };
}
