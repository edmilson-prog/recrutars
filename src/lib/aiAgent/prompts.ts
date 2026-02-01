/**
 * AI Agent Prompts (PRD-051)
 * Prompt engineering para análise comportamental
 */

import type { GaugeProResult } from '@/types/gaugePro';
import { DIMENSION_NAMES } from '@/types/gaugePro';

export const SYSTEM_PROMPT = `Você é um especialista em psicologia organizacional e avaliação comportamental, com profundo conhecimento nos modelos Big Five (OCEAN), DISC e Predictive Index.

Você analisa resultados de testes comportamentais e gera insights acionáveis.

IMPORTANTE:
- Seja objetivo e baseado em evidências
- Não faça afirmações absolutas ("sempre", "nunca")
- Use linguagem condicional ("tende a", "pode preferir")
- Destaque tanto pontos fortes quanto áreas de desenvolvimento
- Não diagnostique condições psicológicas
- Foque em comportamentos observáveis no contexto profissional
- Responda SEMPRE em português brasileiro`;

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

export function buildPracticalPrompt(
  result: GaugeProResult,
  candidateName: string,
  jobTitle?: string,
): string {
  const jobContext = jobTitle
    ? `- Vaga: ${jobTitle}`
    : '- Vaga: Não especificada (análise geral)';

  return `CONTEXTO:
Você está gerando uma análise para um recrutador ou gestor de contratação que NÃO tem formação em psicologia. Ele precisa de informações práticas e acionáveis.

DADOS DO CANDIDATO:
- Nome: ${candidateName}
- Scores Finais (0-100):
${formatScores(result)}
- Perfil Arquetípico: ${result.archetype.name} — ${result.archetype.description}
- Dimensão Primária: ${DIMENSION_NAMES[result.primaryDimension]}
- Dimensão Secundária: ${DIMENSION_NAMES[result.secondaryDimension]}
${jobContext}

PONTOS FORTES IDENTIFICADOS: ${result.strengths.join(', ')}
ÁREAS DE DESENVOLVIMENTO: ${result.developmentAreas.join(', ')}
FUNÇÕES RECOMENDADAS: ${result.careerRecommendations.join(', ')}

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
6. Recomendação Final (1-2 frases)`;
}

export function buildTechnicalPrompt(
  result: GaugeProResult,
  candidateName: string,
): string {
  const part1Detail = (['D1', 'D2', 'D3', 'D4', 'D5'] as const)
    .map(
      (d) =>
        `  - ${d}: Parte 1 = ${Math.round(result.part1Scores[d])}, Parte 2 = ${Math.round(result.part2Scores[d])}, Final = ${Math.round(result.finalScores[d])}`,
    )
    .join('\n');

  return `CONTEXTO:
Você está gerando uma análise técnica para um profissional de RH com formação em psicologia organizacional. Ele entende terminologia científica e quer fundamentação para suas decisões.

DADOS DO CANDIDATO:
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
FUNÇÕES IDEAIS: ${result.careerRecommendations.join(', ')}

INSTRUÇÕES:
1. Use terminologia técnica de psicologia organizacional
2. Faça correlações com modelo Big Five (OCEAN)
3. Analise consistência interna dos resultados (comparando Parte 1 vs Parte 2)
4. Fundamente observações em literatura científica
5. Limite a 1000 palavras

ESTRUTURA OBRIGATÓRIA:
1. Síntese Psicométrica (scores normalizados com classificação)
2. Análise Dimensional Detalhada (cada D1-D5 com interpretação Big Five/DISC)
3. Consistência Interna (coerência entre Parte 1 e Parte 2, indicadores de confiabilidade)
4. Análise de Padrões e Combinações dimensionais
5. Fundamentação Teórica (Big Five OCEAN, DISC)
6. Recomendações Técnicas (entrevista estruturada STAR, avaliação complementar)
7. Red Flags e Observações (inconsistências, pontos de investigação)`;
}
