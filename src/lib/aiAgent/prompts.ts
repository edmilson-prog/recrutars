/**
 * AI Agent Prompts (PRD-051)
 * Prompt engineering para análise comportamental
 * Templates configuráveis com fallback para defaults hardcoded
 */

import type { GaugeProResult } from '@/types/gaugePro';
import { DIMENSION_NAMES } from '@/types/gaugePro';

// --- Default Prompts (used when admin has not customized) ---

export const DEFAULT_SYSTEM_PROMPT = `Você é um especialista em psicologia organizacional e avaliação comportamental, com profundo conhecimento em avaliação comportamental, incluindo modelos como Predictive Index (PI) e Big Five (OCEAN).

Você analisa resultados de testes comportamentais e gera insights acionáveis.

IMPORTANTE:
- Seja objetivo e baseado em evidências
- Não faça afirmações absolutas ("sempre", "nunca")
- Use linguagem condicional ("tende a", "pode preferir")
- Destaque tanto pontos fortes quanto áreas de desenvolvimento
- Não diagnostique condições psicológicas
- Foque em comportamentos observáveis no contexto profissional
- Responda SEMPRE em português brasileiro`;

export const DEFAULT_PRACTICAL_TEMPLATE = `CONTEXTO:
Você está gerando uma análise para um recrutador ou gestor de contratação que NÃO tem formação em psicologia. Ele precisa de informações práticas e acionáveis.

INSTRUÇÕES:
1. Use linguagem simples, sem jargões técnicos
2. Foque em "o que fazer" e não em "por quê"
3. Seja direto e prático
4. Limite a 500 palavras

ESTRUTURA OBRIGATÓRIA:
1. Resumo do Perfil (2-3 frases)
2. Pontos Fortes (3-5 bullet points com ✅)
3. Pontos de Atenção (2-3 bullet points com ⚠️)
4. Fit com a Vaga (se aplicável)
5. Perguntas Sugeridas para Entrevista (3-5 perguntas)
6. Recomendação Final (1-2 frases)

FORMATAÇÃO:
- Use ## para cada seção principal (ex: ## Resumo do Perfil, ## Pontos Fortes)
- Use ✅ no início de cada ponto forte (ex: ✅ Facilidade de comunicação)
- Use ⚠️ no início de cada ponto de atenção (ex: ⚠️ Pode ser impaciente)
- Use - no início de cada pergunta de entrevista
- Separe seções com uma linha em branco
- Envolva a recomendação final em **negrito**`;

export const DEFAULT_TECHNICAL_TEMPLATE = `CONTEXTO:
Você está gerando uma análise técnica para um profissional de RH com formação em psicologia organizacional. Ele entende terminologia científica e quer fundamentação para suas decisões.

INSTRUÇÕES:
1. Use terminologia técnica de psicologia organizacional
2. Faça correlações com Predictive Index (PI) e modelo Big Five (OCEAN)
3. Analise consistência interna dos resultados (comparando Parte 1 vs Parte 2)
4. Fundamente observações em literatura científica
5. Limite a 1000 palavras

ESTRUTURA OBRIGATÓRIA:
1. Síntese Psicométrica (scores normalizados com classificação)
2. Análise Dimensional Detalhada (cada D1-D5 com interpretação Predictive Index e Big Five)
3. Consistência Interna (coerência entre Parte 1 e Parte 2, indicadores de confiabilidade)
4. Análise de Padrões e Combinações dimensionais
5. Fundamentação Teórica (Predictive Index, Big Five OCEAN)
6. Recomendações Técnicas (entrevista estruturada STAR, avaliação complementar)
7. Red Flags e Observações (inconsistências, pontos de investigação)

FORMATAÇÃO:
- Use ## para cada seção principal (ex: ## Síntese Psicométrica, ## Análise Dimensional Detalhada)
- Na Síntese Psicométrica, apresente os scores em tabela markdown:
  | Dimensão | Score Final | Classificação | Parte 1 | Parte 2 | Delta |
  |----------|-------------|---------------|---------|---------|-------|
- Use 🔴 no início de cada red flag (ex: 🔴 Discrepância significativa em D1)
- Use ⚠️ para observações de atenção
- Use - para itens de lista genéricos
- Separe seções com uma linha em branco
- Envolva conclusões importantes em **negrito**`;

/** @deprecated Use DEFAULT_SYSTEM_PROMPT — kept for backward compatibility */
export const SYSTEM_PROMPT = DEFAULT_SYSTEM_PROMPT;

// --- Helpers ---

function formatClassification(classification: string): string {
  const map: Record<string, string> = {
    low: 'Baixo (0-33)',
    medium: 'Médio (34-66)',
    high: 'Alto (67-100)',
  };
  return map[classification] || classification;
}

function formatScores(result: GaugeProResult): string {
  const dimensions = (['D1', 'D2', 'D3', 'D4', 'D5'] as const);
  return dimensions
    .map(
      (d) =>
        `- ${d} (${DIMENSION_NAMES[d]}): ${Math.round(result.finalScores[d])} — Classificação: ${formatClassification(result.classifications[d])}`,
    )
    .join('\n');
}

// --- Prompt Builders ---

export function buildPracticalPrompt(
  result: GaugeProResult,
  candidateName: string,
  jobTitle?: string,
  customTemplate?: string,
): string {
  const template = customTemplate || DEFAULT_PRACTICAL_TEMPLATE;

  const jobContext = jobTitle
    ? `- Vaga: ${jobTitle}`
    : '- Vaga: Não especificada (análise geral)';

  const candidateData = `DADOS DO CANDIDATO:
- Nome: ${candidateName}
- Scores Finais (0-100):
${formatScores(result)}
- Perfil Arquetípico: ${result.archetype.name} — ${result.archetype.description}
- Dimensão Primária: ${DIMENSION_NAMES[result.primaryDimension]}
- Dimensão Secundária: ${DIMENSION_NAMES[result.secondaryDimension]}
${jobContext}

PONTOS FORTES IDENTIFICADOS: ${result.strengths.join(', ')}
ÁREAS DE DESENVOLVIMENTO: ${result.developmentAreas.join(', ')}
FUNÇÕES RECOMENDADAS: ${result.careerRecommendations.join(', ')}`;

  return `${candidateData}\n\n${template}`;
}

export function buildTechnicalPrompt(
  result: GaugeProResult,
  candidateName: string,
  customTemplate?: string,
): string {
  const template = customTemplate || DEFAULT_TECHNICAL_TEMPLATE;

  const part1Detail = (['D1', 'D2', 'D3', 'D4', 'D5'] as const)
    .map(
      (d) =>
        `  - ${d}: Parte 1 = ${Math.round(result.part1Scores[d])}, Parte 2 = ${Math.round(result.part2Scores[d])}, Final = ${Math.round(result.finalScores[d])}`,
    )
    .join('\n');

  const candidateData = `DADOS DO CANDIDATO:
- Nome: ${candidateName}
- Scores Normalizados (0-100):
${formatScores(result)}
- Perfil Arquetípico: ${result.archetype.name}
- Descrição do Arquétipo: ${result.archetype.description}
- Estilo de Trabalho: ${result.archetype.workStyle}
- Estilo de Comunicação: ${result.archetype.communicationStyle}
- Dimensão Primária: ${DIMENSION_NAMES[result.primaryDimension]} (score: ${Math.round(result.finalScores[result.primaryDimension])})
- Dimensão Secundária: ${DIMENSION_NAMES[result.secondaryDimension]} (score: ${Math.round(result.finalScores[result.secondaryDimension])})

SCORES DETALHADOS POR PARTE (Parte 1 = Seleção de Palavras 60%, Parte 2 = Cenários 40%):
${part1Detail}

PONTOS FORTES: ${result.strengths.join(', ')}
ÁREAS DE DESENVOLVIMENTO: ${result.developmentAreas.join(', ')}
FUNÇÕES IDEAIS: ${result.careerRecommendations.join(', ')}`;

  return `${candidateData}\n\n${template}`;
}
