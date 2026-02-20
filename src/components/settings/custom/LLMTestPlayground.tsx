/**
 * LLM Test Playground
 * Area de teste para validar conexao com provedores LLM
 * e testar prompts de analise comportamental com dados de exemplo.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlaskConical,
  Send,
  Loader2,
  Copy,
  Trash2,
  ChevronDown,
  ChevronRight,
  Plug,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  FileText,
  User,
  Briefcase,
  Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { loadAgentSettingsAsync } from '@/lib/aiAgent/settingsLoader';
import { callLLMApi, LLMApiError } from '@/lib/aiAgent/llmApiService';
import {
  buildPracticalPrompt,
  buildTechnicalPrompt,
  DEFAULT_SYSTEM_PROMPT,
} from '@/lib/aiAgent/prompts';
import { useLLMConnectionTest } from '@/hooks/useLLMConnectionTest';
import type { AIAgentSettings, ClaudeApiResponse } from '@/types/aiAnalysis';
import type { GaugeProResult } from '@/types/gaugePro';

// --- Mock Data ---

const MOCK_GAUGE_PRO_RESULT: GaugeProResult = {
  id: 'playground-mock-001',
  assessmentId: 'playground-assessment-001',
  candidateId: 'playground-candidate-001',
  part1Scores: { D1: 62, D2: 78, D3: 45, D4: 71, D5: 83 },
  part2Scores: { D1: 58, D2: 74, D3: 50, D4: 68, D5: 80 },
  finalScores: { D1: 60, D2: 76, D3: 47, D4: 70, D5: 82 },
  classifications: { D1: 'medium', D2: 'high', D3: 'medium', D4: 'high', D5: 'high' },
  archetype: {
    id: 'counselor',
    name: 'O Conselheiro',
    description:
      'Sociavel e empatico, combina habilidades de comunicacao com genuino interesse pelas pessoas.',
    strengths: ['Escuta ativa', 'Aconselhamento', 'Empatia', 'Construcao de confianca'],
    developmentAreas: ['Assertividade em situacoes dificeis', 'Tomada de decisao rapida'],
    idealRoles: ['Psicologo Organizacional', 'Mediador', 'Coaching'],
    workStyle: 'Acolhedor, paciente, prioriza qualidade das relacoes.',
    communicationStyle: 'Atencioso, gentil, faz perguntas profundas.',
  },
  primaryDimension: 'D5',
  secondaryDimension: 'D2',
  strengths: ['Escuta ativa', 'Empatia', 'Construcao de relacoes', 'Atencao a detalhes'],
  developmentAreas: ['Assertividade', 'Tomada de decisao sob pressao', 'Ritmo de execucao'],
  careerRecommendations: ['Analista de RH', 'Business Partner', 'Consultora de DO'],
  xpAwarded: 100,
  badgeAwarded: 'behavioral-master',
  generatedAt: new Date().toISOString(),
};

const MOCK_CANDIDATE_NAME = 'Ana Carolina Silva';
const MOCK_JOB_TITLE = 'Analista de RH Pleno';

const DIMENSION_LABELS: Record<string, string> = {
  D1: 'Dominancia/Assertividade',
  D2: 'Sociabilidade/Extroversao',
  D3: 'Ritmo/Paciencia',
  D4: 'Conformidade/Estrutura',
  D5: 'Orientacao Relacional',
};

// --- Props ---

interface LLMTestPlaygroundProps {
  values: Record<string, unknown>;
  onValueChange: (fieldKey: string, value: unknown) => void;
  onSave: () => void;
}

// --- Component ---

export default function LLMTestPlayground(_props: LLMTestPlaygroundProps) {
  // Settings
  const [settings, setSettings] = useState<AIAgentSettings | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Controls
  const [analysisType, setAnalysisType] = useState<'practical' | 'technical'>('practical');

  // Prompt preview
  const [systemPromptOpen, setSystemPromptOpen] = useState(true);
  const [userMessageOpen, setUserMessageOpen] = useState(false);
  const [sampleDataOpen, setSampleDataOpen] = useState(false);

  // LLM request/response
  const [isGenerating, setIsGenerating] = useState(false);
  const [llmResponse, setLlmResponse] = useState<ClaudeApiResponse | null>(null);
  const [llmError, setLlmError] = useState<string | null>(null);
  const [latencyMs, setLatencyMs] = useState<number | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Connection test
  const testMutation = useLLMConnectionTest();
  const { toast } = useToast();

  // --- Load settings on mount ---

  useEffect(() => {
    loadAgentSettingsAsync()
      .then((s) => {
        setSettings(s);
        setSettingsError(null);
      })
      .catch(() => setSettingsError('Erro ao carregar configuracoes do agente.'))
      .finally(() => setSettingsLoading(false));
  }, []);

  // --- Timer during generation ---

  useEffect(() => {
    if (!isGenerating) return;
    setElapsedSeconds(0);
    const interval = setInterval(() => setElapsedSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [isGenerating]);

  // --- Computed prompts ---

  const systemPrompt = useMemo(
    () => settings?.systemPrompt || DEFAULT_SYSTEM_PROMPT,
    [settings],
  );

  const userMessage = useMemo(
    () =>
      analysisType === 'practical'
        ? buildPracticalPrompt(
            MOCK_GAUGE_PRO_RESULT,
            MOCK_CANDIDATE_NAME,
            MOCK_JOB_TITLE,
            settings?.practicalPromptTemplate,
          )
        : buildTechnicalPrompt(
            MOCK_GAUGE_PRO_RESULT,
            MOCK_CANDIDATE_NAME,
            settings?.technicalPromptTemplate,
          ),
    [analysisType, settings],
  );

  const isCustomSystemPrompt = !!settings?.systemPrompt;
  const isCustomTemplate =
    analysisType === 'practical'
      ? !!settings?.practicalPromptTemplate
      : !!settings?.technicalPromptTemplate;

  const hasApiKey = !!settings?.apiKey;

  const estimatedTokens = useMemo(() => {
    const chars = (systemPrompt?.length ?? 0) + (userMessage?.length ?? 0);
    return Math.round(chars / 4);
  }, [systemPrompt, userMessage]);

  // --- Handlers ---

  const handleTestConnection = useCallback(async () => {
    if (!settings) return;
    try {
      const result = await testMutation.mutateAsync({
        provider: settings.provider,
        apiKey: settings.apiKey,
        model: settings.model,
      });
      if (result.success) {
        toast({
          title: 'Conexao OK',
          description: `${settings.provider} respondeu em ${result.latencyMs}ms (modelo: ${result.modelUsed || settings.model})`,
        });
      } else {
        toast({
          title: 'Falha na conexao',
          description: result.error || 'Erro desconhecido',
          variant: 'destructive',
        });
      }
    } catch (err) {
      toast({
        title: 'Erro ao testar',
        description: err instanceof Error ? err.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  }, [settings, testMutation, toast]);

  const handleSendToLLM = useCallback(async () => {
    if (!settings || !hasApiKey) return;

    setIsGenerating(true);
    setLlmResponse(null);
    setLlmError(null);
    setLatencyMs(null);

    const startTime = performance.now();

    try {
      const response = await callLLMApi(
        {
          model: settings.model,
          max_tokens: settings.maxTokens,
          temperature: settings.temperature,
          system: systemPrompt,
          messages: [{ role: 'user', content: userMessage }],
        },
        settings.apiKey,
        settings.provider,
      );

      setLlmResponse(response);
      setLatencyMs(Math.round(performance.now() - startTime));
    } catch (err) {
      const elapsed = Math.round(performance.now() - startTime);
      setLatencyMs(elapsed);

      if (err instanceof LLMApiError) {
        if (err.statusCode === 401) {
          setLlmError('Chave de API invalida ou expirada. Verifique em Provedores LLM.');
        } else if (err.statusCode === 429) {
          setLlmError('Rate limit excedido. Aguarde alguns segundos e tente novamente.');
        } else if (err.errorType === 'timeout') {
          setLlmError('Timeout (30s). Tente um modelo mais rapido ou reduza max_tokens.');
        } else {
          setLlmError(`${err.message} (HTTP ${err.statusCode})`);
        }
      } else {
        setLlmError(err instanceof Error ? err.message : 'Erro desconhecido');
      }
    } finally {
      setIsGenerating(false);
    }
  }, [settings, hasApiKey, systemPrompt, userMessage]);

  const handleCopyResponse = useCallback(() => {
    if (!llmResponse) return;
    const text = llmResponse.content
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n');
    navigator.clipboard.writeText(text);
    toast({ title: 'Copiado', description: 'Resposta copiada para a area de transferencia.' });
  }, [llmResponse, toast]);

  const handleClearResponse = useCallback(() => {
    setLlmResponse(null);
    setLlmError(null);
    setLatencyMs(null);
  }, []);

  const handleRetrySettings = useCallback(() => {
    setSettingsLoading(true);
    setSettingsError(null);
    loadAgentSettingsAsync()
      .then((s) => {
        setSettings(s);
        setSettingsError(null);
      })
      .catch(() => setSettingsError('Erro ao carregar configuracoes do agente.'))
      .finally(() => setSettingsLoading(false));
  }, []);

  // --- Render ---

  if (settingsLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (settingsError) {
    return (
      <Card>
        <CardContent className="py-8">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{settingsError}</span>
              <Button variant="outline" size="sm" onClick={handleRetrySettings}>
                Tentar Novamente
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const providerLabel =
    settings?.provider === 'openai'
      ? 'OpenAI'
      : settings?.provider === 'openrouter'
        ? 'OpenRouter'
        : 'Anthropic';

  const responseContent = llmResponse?.content
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n');

  return (
    <div className="space-y-6">
      {/* A) Header Banner */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <FlaskConical className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Playground LLM</CardTitle>
              <CardDescription>
                Teste a conexao com o provedor e valide os prompts de analise comportamental com
                dados de exemplo.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* B) Status do Provedor */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Plug className="h-4 w-4" />
            Provedor Configurado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="outline" className="text-sm px-3 py-1">
              {providerLabel}
            </Badge>
            <Badge variant="secondary" className="text-sm px-3 py-1 font-mono">
              {settings?.model || 'Nao configurado'}
            </Badge>
            {hasApiKey ? (
              <Badge variant="default" className="bg-green-600 text-sm px-3 py-1">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                API Key configurada
              </Badge>
            ) : (
              <Badge variant="destructive" className="text-sm px-3 py-1">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Sem API Key
              </Badge>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestConnection}
              disabled={!hasApiKey || testMutation.isPending}
            >
              {testMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Plug className="h-3 w-3 mr-1" />
              )}
              Testar Conexao
            </Button>
          </div>

          {!hasApiKey && (
            <Alert className="mt-3">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Configure uma chave de API em{' '}
                <span className="font-medium">Inteligencia Artificial &gt; Provedores LLM</span>{' '}
                para usar o playground.
              </AlertDescription>
            </Alert>
          )}

          {!settings?.agentEnabled && hasApiKey && (
            <Alert className="mt-3">
              <Info className="h-4 w-4" />
              <AlertDescription>
                O agente de analise esta desativado. O playground ainda funciona para testes.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* C) Tipo de Analise */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Tipo de Analise
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="inline-flex rounded-lg border p-1 bg-muted/50">
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                analysisType === 'practical'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setAnalysisType('practical')}
            >
              <User className="h-3.5 w-3.5 inline mr-1.5" />
              Pratica (Recrutador)
            </button>
            <button
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                analysisType === 'technical'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setAnalysisType('technical')}
            >
              <Cpu className="h-3.5 w-3.5 inline mr-1.5" />
              Tecnica (RH/Admin)
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {analysisType === 'practical'
              ? 'Gera analise com linguagem simples e dicas praticas para o recrutador.'
              : 'Gera analise tecnica com terminologia de psicologia organizacional.'}
          </p>
        </CardContent>
      </Card>

      {/* D) Preview dos Prompts */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Preview dos Prompts
          </CardTitle>
          <CardDescription className="text-xs">
            ~{estimatedTokens.toLocaleString('pt-BR')} tokens estimados |{' '}
            {(systemPrompt.length + userMessage.length).toLocaleString('pt-BR')} caracteres
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* System Prompt */}
          <Collapsible open={systemPromptOpen} onOpenChange={setSystemPromptOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left text-sm font-medium hover:text-primary transition-colors">
              {systemPromptOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              System Prompt
              <Badge variant={isCustomSystemPrompt ? 'default' : 'secondary'} className="text-xs ml-auto">
                {isCustomSystemPrompt ? 'Personalizado' : 'Padrao'}
              </Badge>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <pre className="text-xs bg-muted/50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap border max-h-64 overflow-y-auto">
                {systemPrompt}
              </pre>
            </CollapsibleContent>
          </Collapsible>

          {/* User Message */}
          <Collapsible open={userMessageOpen} onOpenChange={setUserMessageOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left text-sm font-medium hover:text-primary transition-colors">
              {userMessageOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              User Message (Dados + Template)
              <Badge variant={isCustomTemplate ? 'default' : 'secondary'} className="text-xs ml-auto">
                {isCustomTemplate ? 'Personalizado' : 'Padrao'}
              </Badge>
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <pre className="text-xs bg-muted/50 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap border max-h-80 overflow-y-auto">
                {userMessage}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* E) Botao Enviar ao LLM */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSendToLLM}
          disabled={!hasApiKey || isGenerating}
          className="gap-2"
          size="lg"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Gerando... ({elapsedSeconds}s)
            </>
          ) : (
            <>
              <Send className="h-4 w-4" />
              Enviar ao LLM
            </>
          )}
        </Button>
        {isGenerating && (
          <span className="text-xs text-muted-foreground">
            Aguardando resposta do {providerLabel}...
          </span>
        )}
      </div>

      {/* F) Resposta da IA */}
      {llmError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{llmError}</AlertDescription>
        </Alert>
      )}

      {responseContent && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Resposta da IA
              </CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={handleCopyResponse}>
                  <Copy className="h-3.5 w-3.5 mr-1" />
                  Copiar
                </Button>
                <Button variant="ghost" size="sm" onClick={handleClearResponse}>
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Limpar
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Response content */}
            <div className="prose prose-sm max-w-none dark:prose-invert bg-muted/30 rounded-lg p-4 border overflow-auto max-h-[600px]">
              <pre className="whitespace-pre-wrap text-sm font-sans">{responseContent}</pre>
            </div>

            {/* Metadata */}
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground pt-2 border-t">
              <span className="flex items-center gap-1">
                <Cpu className="h-3 w-3" />
                {llmResponse.model}
              </span>
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {llmResponse.usage.input_tokens.toLocaleString('pt-BR')} in /{' '}
                {llmResponse.usage.output_tokens.toLocaleString('pt-BR')} out
              </span>
              {latencyMs !== null && (
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {(latencyMs / 1000).toFixed(1)}s
                </span>
              )}
              <span className="flex items-center gap-1">
                <Plug className="h-3 w-3" />
                {providerLabel}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* G) Dados de Amostra */}
      <Card>
        <CardContent className="pt-4">
          <Collapsible open={sampleDataOpen} onOpenChange={setSampleDataOpen}>
            <CollapsibleTrigger className="flex items-center gap-2 w-full text-left text-sm font-medium hover:text-primary transition-colors">
              {sampleDataOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <Briefcase className="h-4 w-4" />
              Dados de Amostra (Candidato Ficticio)
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Candidato</p>
                  <p className="text-sm font-medium">{MOCK_CANDIDATE_NAME}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Vaga</p>
                  <p className="text-sm font-medium">{MOCK_JOB_TITLE}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Arquetipo</p>
                  <p className="text-sm font-medium">{MOCK_GAUGE_PRO_RESULT.archetype.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {MOCK_GAUGE_PRO_RESULT.archetype.description}
                  </p>
                </div>
              </div>

              {/* Dimension scores */}
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-2">Scores Finais</p>
                <div className="space-y-2">
                  {(['D1', 'D2', 'D3', 'D4', 'D5'] as const).map((d) => (
                    <div key={d} className="flex items-center gap-3">
                      <span className="text-xs font-mono w-6 text-muted-foreground">{d}</span>
                      <span className="text-xs w-40 truncate">{DIMENSION_LABELS[d]}</span>
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${MOCK_GAUGE_PRO_RESULT.finalScores[d]}%` }}
                        />
                      </div>
                      <span className="text-xs font-mono w-8 text-right">
                        {MOCK_GAUGE_PRO_RESULT.finalScores[d]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">Pontos Fortes</p>
                  <ul className="text-xs space-y-0.5">
                    {MOCK_GAUGE_PRO_RESULT.strengths.map((s) => (
                      <li key={s} className="text-muted-foreground">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-1">
                    Areas de Desenvolvimento
                  </p>
                  <ul className="text-xs space-y-0.5">
                    {MOCK_GAUGE_PRO_RESULT.developmentAreas.map((a) => (
                      <li key={a} className="text-muted-foreground">
                        • {a}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      {/* H) Disclaimer */}
      <p className="text-xs text-muted-foreground text-center px-4">
        Este playground consome tokens reais do provedor configurado. Cada envio gera uma chamada
        a API com custo proporcional ao tamanho dos prompts e da resposta.
      </p>
    </div>
  );
}
