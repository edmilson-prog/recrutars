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
import type { Candidate } from '@/types/candidate';
import type { Job } from '@/types/job';
import type { MatchResult } from '@/types/disc';
import type { GaugeProResult } from '@/types/gaugePro';
import { DIMENSION_NAMES, DIMENSION_SHORT_NAMES } from '@/types/gaugePro';

export const DEFAULT_AI_MATCH_SYSTEM_PROMPT = `Você é um especialista em recrutamento e psicologia organizacional brasileiro,
analisando a compatibilidade entre um candidato e uma vaga específica para um recrutador profissional.

Sua análise deve ser profunda, contextual e prática — complementando (não substituindo) o score
numérico do match algorítmico. Use linguagem clara, objetiva, em português brasileiro.

CONTEXTO DO TESTE COMPORTAMENTAL DA PLATAFORMA:
O teste Gauge-Pro é uma adaptação do framework Predictive Index (PI) com 5 dimensões:
- **Dominância/Assertividade**: assertividade, iniciativa, busca por resultado direto.
- **Sociabilidade/Extroversão**: comunicação, persuasão, energia social.
- **Ritmo/Paciência**: constância, tolerância a rotinas, persistência.
- **Conformidade/Estrutura**: aderência a regras, atenção a detalhes, processos.
- **Orientação Relacional**: empatia, harmonia, sensibilidade interpessoal.

Cada dimensão tem pontuação 0-100 e classificação Baixo/Médio/Alto. Não use a terminologia DISC
(D/I/S/C) — é incorreta para este teste.

ESTRUTURA OBRIGATÓRIA DA SAÍDA (markdown, exatamente nesta ordem):

## 📖 Leitura do candidato
3-4 parágrafos contextualizando quem é essa pessoa profissionalmente: trajetória, padrão de movimentação,
posicionamento atual no mercado, traços de personalidade que emergem do Gauge-Pro (cite as dimensões
predominantes e o arquétipo nominalmente).

## ✅ Por que combina
Lista de 4-6 pontos com evidências concretas (cite cargos, anos, perfil) de por que o candidato faz sentido
para essa vaga. Conecte explicitamente skills, experiência e o perfil Gauge-Pro.

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
- Use citações diretas do CV ou do teste quando reforçarem um ponto.
- Quando referenciar o teste comportamental, use "Gauge-Pro" e os nomes das dimensões em português,
  nunca "DISC".`;

export interface BuildAIMatchPromptInput {
  candidate: Candidate;
  job: Job;
  matchResult: MatchResult;
  /** Resultado completo do teste Gauge-Pro do candidato (se realizado). */
  gaugeProResult?: GaugeProResult | null;
  /** Análise comportamental existente (prática), se houver — vai como contexto */
  behavioralAnalysisExisting?: string | null;
  /** Prompt do sistema customizado (parametrizado em system_settings). Default: DEFAULT_AI_MATCH_SYSTEM_PROMPT. */
  customSystemPrompt?: string;
}

/**
 * Bloco estático (system + descrição da vaga) — vai com cache_control para reduzir
 * custo quando múltiplos candidatos são analisados para a mesma vaga.
 */
function buildJobBlock(job: Job): string {
  const requirements = job.requirements ?? [];
  const benefits = job.benefits ?? [];

  return `# CONTEXTO DA VAGA

## Cabeçalho
- Título: ${job.title}
- Empresa: ${job.companyName}
- Modalidade: ${job.type === 'remote' ? 'Remoto' : job.type === 'hybrid' ? 'Híbrido' : 'Presencial'}
- Localização: ${[job.city, job.state].filter(Boolean).join(' / ') || job.location || 'N/A'}
- Nível: ${job.level}
- Área: ${job.area ?? 'N/A'}

## Descrição
${job.description}

## Requisitos
${requirements.length ? requirements.map((r) => `- ${r}`).join('\n') : '(não informado)'}

## Benefícios
${benefits.length ? benefits.map((b) => `- ${b}`).join('\n') : '(não informado)'}

## Pesos do Match configurados
- Skills Técnicas: ${job.weightSkillsTechnical ?? 25}%
- Skills Comportamentais: ${job.weightSkillsBehavioral ?? 15}%
- Experiência: ${job.weightExperience ?? 30}%
- Perfil Comportamental: ${job.weightGaugePro ?? 20}%
- Localização: ${job.weightLocation ?? 10}%`;
}

function buildCandidateBlock(input: BuildAIMatchPromptInput): string {
  const { candidate, matchResult, gaugeProResult, behavioralAnalysisExisting } = input;

  const skills = candidate.skills ?? [];

  const gauge = gaugeProResult;
  const gaugeProBlock = gauge
    ? (() => {
        const scores = gauge.finalScores;
        const cls = gauge.classifications;
        const lines = (Object.keys(scores) as Array<keyof typeof scores>).map((d) => {
          const name = DIMENSION_SHORT_NAMES[d];
          const full = DIMENSION_NAMES[d];
          const score = scores[d];
          const classification = cls[d];
          const label = classification === 'high' ? 'Alto' : classification === 'medium' ? 'Médio' : 'Baixo';
          return `- ${name} (${full}): ${score}% — ${label}`;
        }).join('\n');
        const archetypeName = (gauge.archetype as { name?: string })?.name ?? '?';
        const archetypeDesc = (gauge.archetype as { description?: string })?.description ?? '';
        const primary = DIMENSION_SHORT_NAMES[gauge.primaryDimension];
        const secondary = DIMENSION_SHORT_NAMES[gauge.secondaryDimension];
        const strengths = gauge.strengths?.length ? gauge.strengths.map((s) => `- ${s}`).join('\n') : '(não informado)';
        const dev = gauge.developmentAreas?.length ? gauge.developmentAreas.map((s) => `- ${s}`).join('\n') : '(não informado)';
        return `## Perfil Comportamental (Gauge-Pro — adaptação do Predictive Index)
**Arquétipo:** ${archetypeName}${archetypeDesc ? ` — ${archetypeDesc}` : ''}
**Dimensão primária:** ${primary} · **Dimensão secundária:** ${secondary}

### Pontuações por dimensão (escala 0-100)
${lines}

### Pontos fortes identificados pelo teste
${strengths}

### Áreas de desenvolvimento
${dev}`;
      })()
    : '## Perfil Comportamental (Gauge-Pro)\n(teste não realizado)';

  return `# CONTEXTO DO CANDIDATO

## Dados Básicos
- Nome: ${candidate.name}
- Cargo atual / título: ${candidate.title}
- Localização: ${[candidate.city, candidate.state].filter(Boolean).join(' / ') || candidate.location}
- Experiência total: ${candidate.experience} anos
- Disponibilidade: ${candidate.availability}

## Sobre
${candidate.about ?? '(não informado)'}

## Formação
${candidate.education || '(não informado)'}

## Skills declaradas
${skills.length ? skills.map((s) => `- ${s}`).join('\n') : '(não informado)'}

${gaugeProBlock}

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
  const systemPrompt = input.customSystemPrompt?.trim() || DEFAULT_AI_MATCH_SYSTEM_PROMPT;

  return {
    model,
    max_tokens: maxTokens,
    temperature,
    system: [
      { type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } },
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
