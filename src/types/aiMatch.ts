/**
 * AI Match — Domain Types
 *
 * Análise inteligente de compatibilidade candidato↔vaga.
 * Complementa (não substitui) o match algorítmico de matchCalculator.ts.
 */

export interface AIMatchAnalysis {
  id: string;
  usageId: string;
  companyId: string;
  candidateId: string;
  jobId: string;
  /** Markdown estruturado em 5 seções (## Leitura, ## Por que combina, ...) */
  content: string;
  modelUsed: string | null;
  tokensInput: number | null;
  tokensOutput: number | null;
  generationTimeMs: number | null;
  /** Score do match algorítmico no momento da geração (snapshot p/ contexto) */
  algorithmicScoreSnapshot: number | null;
  createdAt: string;
}

export interface AIMatchQuotaStatus {
  used: number;
  total: number;
  remaining: number;
  unlimited: boolean;
}

/**
 * Identificadores das 5 seções esperadas no markdown gerado pela IA.
 * Usados para parse e renderização com ícones específicos.
 */
export type AIMatchSectionKey =
  | 'reading'        // 📖 Leitura do candidato
  | 'whyMatches'     // ✅ Por que combina
  | 'attention'      // ⚠️ Pontos de atenção
  | 'potential'      // 🌱 Potencial e fit cultural
  | 'questions';     // 💬 Perguntas sugeridas para entrevista

export interface AIMatchSection {
  key: AIMatchSectionKey;
  title: string;
  icon: string;
  body: string;
}

/** Resultado intermediário do generateAnalysis: usage_id reservado + dados pra Claude */
export interface AIMatchReservation {
  usageId: string;
}
