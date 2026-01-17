/**
 * Fuzzy Matcher for Chatbot
 * PRD-040: Chatbot de Suporte
 *
 * Simple fuzzy matching for finding relevant knowledge base items
 */

import type { KnowledgeBaseItem, FuzzyMatchResult, UserContext } from '@/types/chatbot';
import { knowledgeBase } from '@/data/chatbotKnowledge';

/**
 * Normaliza texto para comparação
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[^a-z0-9\s]/g, '') // Remove caracteres especiais
    .trim();
}

/**
 * Divide texto em palavras
 */
function tokenize(text: string): string[] {
  return normalizeText(text)
    .split(/\s+/)
    .filter(word => word.length > 2); // Remove palavras muito curtas
}

/**
 * Calcula similaridade entre duas strings (0-1)
 * Usa algoritmo de distância de Levenshtein simplificado
 */
function stringSimilarity(a: string, b: string): number {
  const normalA = normalizeText(a);
  const normalB = normalizeText(b);

  if (normalA === normalB) return 1;
  if (normalA.includes(normalB) || normalB.includes(normalA)) return 0.8;

  // Calcula sobreposição de caracteres
  const setA = new Set(normalA.split(''));
  const setB = new Set(normalB.split(''));
  const intersection = new Set([...setA].filter(x => setB.has(x)));
  const union = new Set([...setA, ...setB]);

  return intersection.size / union.size;
}

/**
 * Calcula score de match entre query e um item da base
 */
function calculateMatchScore(
  query: string,
  item: KnowledgeBaseItem
): { score: number; matchedKeywords: string[] } {
  const queryTokens = tokenize(query);
  const normalizedQuery = normalizeText(query);
  const matchedKeywords: string[] = [];
  let score = 0;

  // Match direto com a pergunta
  const questionSimilarity = stringSimilarity(query, item.question);
  if (questionSimilarity > 0.7) {
    score += questionSimilarity * 0.5;
  }

  // Match com keywords
  for (const keyword of item.keywords) {
    const normalizedKeyword = normalizeText(keyword);

    // Match exato
    if (normalizedQuery.includes(normalizedKeyword)) {
      score += 0.3;
      matchedKeywords.push(keyword);
      continue;
    }

    // Match por tokens
    for (const token of queryTokens) {
      if (normalizedKeyword.includes(token) || token.includes(normalizedKeyword)) {
        score += 0.15;
        if (!matchedKeywords.includes(keyword)) {
          matchedKeywords.push(keyword);
        }
      }
    }
  }

  // Bonus por prioridade do item
  score += (item.priority / 100);

  // Normaliza score para 0-1
  return {
    score: Math.min(score, 1),
    matchedKeywords,
  };
}

/**
 * Busca itens relevantes na base de conhecimento
 */
export function findMatches(
  query: string,
  context: UserContext,
  maxResults: number = 3,
  minScore: number = 0.2
): FuzzyMatchResult[] {
  // Filtra por contexto
  const contextItems = knowledgeBase.filter(item =>
    item.contexts.includes(context)
  );

  // Calcula scores
  const results: FuzzyMatchResult[] = contextItems
    .map(item => {
      const { score, matchedKeywords } = calculateMatchScore(query, item);
      return { item, score, matchedKeywords };
    })
    .filter(result => result.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);

  return results;
}

/**
 * Encontra o melhor match
 */
export function findBestMatch(
  query: string,
  context: UserContext
): FuzzyMatchResult | null {
  const matches = findMatches(query, context, 1, 0.3);
  return matches.length > 0 ? matches[0] : null;
}

/**
 * Verifica se uma query parece ser uma saudação
 */
export function isGreeting(query: string): boolean {
  const greetings = [
    'oi', 'olá', 'ola', 'hi', 'hello', 'bom dia', 'boa tarde', 'boa noite',
    'eae', 'e ai', 'opa', 'hey', 'fala', 'salve',
  ];

  const normalized = normalizeText(query);
  return greetings.some(g => normalized === g || normalized.startsWith(g + ' '));
}

/**
 * Verifica se uma query é uma despedida
 */
export function isFarewell(query: string): boolean {
  const farewells = [
    'tchau', 'adeus', 'ate mais', 'ate logo', 'bye', 'goodbye',
    'valeu', 'obrigado', 'obrigada', 'brigado', 'brigada', 'thanks',
    'falou', 'flw', 'vlw',
  ];

  const normalized = normalizeText(query);
  return farewells.some(f => normalized === f || normalized.includes(f));
}

/**
 * Extrai possível intenção da query
 */
export function detectIntent(query: string): 'question' | 'greeting' | 'farewell' | 'escalation' | 'feedback' {
  if (isGreeting(query)) return 'greeting';
  if (isFarewell(query)) return 'farewell';

  const normalized = normalizeText(query);

  // Detecta pedido de escalonamento
  if (
    normalized.includes('falar com humano') ||
    normalized.includes('atendente') ||
    normalized.includes('pessoa real') ||
    normalized.includes('suporte humano')
  ) {
    return 'escalation';
  }

  // Detecta feedback
  if (
    normalized.includes('ajudou') ||
    normalized.includes('resolveu') ||
    normalized.includes('util')
  ) {
    return 'feedback';
  }

  return 'question';
}
