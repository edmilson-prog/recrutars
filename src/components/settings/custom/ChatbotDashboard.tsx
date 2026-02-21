/**
 * ChatbotDashboard — Painel de gestão do Assistente IA
 * Subcategoria: Admin → Inteligência Artificial → Assistente IA
 *
 * Dashboard com controles de habilitação por tipo de usuário + KPIs e métricas
 * (dados mock nesta versão — integração real com chatbot_events pendente)
 */

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { chatbotConfigKeys } from '@/hooks/useChatbotConfig';
import {
  Bot,
  Users,
  Building2,
  MessageSquare,
  Zap,
  Clock,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Save,
  Loader2,
  BarChart3,
  HelpCircle,
  Activity,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

interface ChatbotDashboardProps {
  values: Record<string, unknown>;
  onValueChange: (key: string, value: unknown) => void;
  onSave: () => void;
  isSaving?: boolean;
}

// ---------------------------------------------------------------------------
// Dados mock — substituir por consultas reais a chatbot_events quando disponível
// ---------------------------------------------------------------------------

const generateDailyData = () => {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const day = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    const base = 80 + Math.floor(Math.random() * 50);
    data.push({
      day,
      total: base,
      ai: Math.floor(base * (0.88 + Math.random() * 0.08)),
      fallback: Math.floor(base * (0.04 + Math.random() * 0.04)),
    });
  }
  return data;
};

const DAILY_DATA = generateDailyData();

const USER_DISTRIBUTION = [
  { name: 'Candidatos', value: 1842, color: '#06b6d4' },
  { name: 'Empresas', value: 742, color: '#3b82f6' },
  { name: 'Visitantes', value: 263, color: '#8b5cf6' },
];

const TOP_QUESTIONS = [
  { question: 'Como me candidatar a uma vaga?', count: 312, category: 'candidatos' },
  { question: 'Como publicar uma nova vaga?', count: 278, category: 'empresas' },
  { question: 'Como fazer o teste Gauge-Pro?', count: 241, category: 'testes' },
  { question: 'Esqueci minha senha', count: 198, category: 'conta' },
  { question: 'Como ver o status da candidatura?', count: 175, category: 'candidatos' },
  { question: 'Quanto custa a plataforma?', count: 163, category: 'geral' },
  { question: 'Como editar meu perfil?', count: 147, category: 'candidatos' },
  { question: 'Como convidar minha equipe?', count: 132, category: 'empresas' },
  { question: 'Não recebi o email de confirmação', count: 118, category: 'conta' },
  { question: 'Como fazer upload do currículo?', count: 104, category: 'candidatos' },
];

const RECENT_ESCALATIONS = [
  { type: 'candidate', subject: 'Erro ao carregar vídeo de apresentação', date: '19/02/2026', status: 'open' },
  { type: 'company', subject: 'Candidato apareceu com status errado', date: '19/02/2026', status: 'resolved' },
  { type: 'candidate', subject: 'Teste comportamental travou no meio', date: '18/02/2026', status: 'resolved' },
  { type: 'company', subject: 'Relatório de análise IA não gerou', date: '18/02/2026', status: 'open' },
  { type: 'candidate', subject: 'Email de convite não recebido', date: '17/02/2026', status: 'resolved' },
];

const RECENT_ACTIVITY = [
  { userType: 'candidate', snippet: 'Como ver minhas candidaturas?', source: 'ai', time: '2 min' },
  { userType: 'company', snippet: 'Como filtrar candidatos por nota?', source: 'ai', time: '5 min' },
  { userType: 'guest', snippet: 'A plataforma é gratuita?', source: 'fallback', time: '8 min' },
  { userType: 'candidate', snippet: 'Esqueci minha senha, como recupero?', source: 'ai', time: '12 min' },
  { userType: 'company', snippet: 'Como publicar uma vaga com teste?', source: 'ai', time: '15 min' },
  { userType: 'candidate', snippet: 'Preciso falar com um atendente', source: 'escalation', time: '18 min' },
  { userType: 'guest', snippet: 'Quais planos vocês oferecem?', source: 'ai', time: '22 min' },
  { userType: 'company', snippet: 'Relatório não está carregando', source: 'escalation', time: '28 min' },
];

// ---------------------------------------------------------------------------
// Sub-componentes auxiliares
// ---------------------------------------------------------------------------

const CATEGORY_BADGE_MAP: Record<string, { label: string; variant: string }> = {
  candidatos: { label: 'Candidatos', variant: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' },
  empresas: { label: 'Empresas', variant: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  testes: { label: 'Testes', variant: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300' },
  conta: { label: 'Conta', variant: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  geral: { label: 'Geral', variant: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  tecnico: { label: 'Técnico', variant: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

const SOURCE_BADGE_MAP: Record<string, { label: string; className: string }> = {
  ai: { label: 'IA', className: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300' },
  fallback: { label: 'Base Local', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  escalation: { label: 'Escalação', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
};

const USER_TYPE_ICONS: Record<string, React.ReactNode> = {
  candidate: <Users className="h-3.5 w-3.5" />,
  company: <Building2 className="h-3.5 w-3.5" />,
  guest: <HelpCircle className="h-3.5 w-3.5" />,
};

const USER_TYPE_LABELS: Record<string, string> = {
  candidate: 'Candidato',
  company: 'Empresa',
  guest: 'Visitante',
};

// ---------------------------------------------------------------------------
// Componente principal
// ---------------------------------------------------------------------------

export default function ChatbotDashboard({
  values,
  onValueChange,
  onSave,
  isSaving = false,
}: ChatbotDashboardProps) {
  const queryClient = useQueryClient();
  const [localSaving, setLocalSaving] = useState(false);

  const enabledCandidates = (values.chatbotEnabledCandidates ?? true) as boolean;
  const enabledCompanies = (values.chatbotEnabledCompanies ?? true) as boolean;

  const handleSave = async () => {
    setLocalSaving(true);
    try {
      await Promise.resolve(onSave());
      // Invalidate the chatbot config cache so ChatbotWidget picks up changes immediately
      queryClient.invalidateQueries({ queryKey: chatbotConfigKeys.all });
    } finally {
      setLocalSaving(false);
    }
  };

  const saving = isSaving || localSaving;

  const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay },
  });

  return (
    <div className="space-y-6">
      {/* Header banner */}
      <motion.div {...fadeUp(0)}>
        <Card className="border-0 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent">
          <CardContent className="flex items-center gap-4 py-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 shrink-0">
              <Bot className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Assistente IA</h2>
              <p className="text-sm text-muted-foreground">
                Controle e monitoramento do chatbot de suporte com inteligência artificial
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Controles de habilitação */}
      <motion.div {...fadeUp(0.05)}>
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Controles de Habilitação</CardTitle>
            <CardDescription>
              Defina quais tipos de usuário podem usar o assistente com IA
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-100 dark:bg-cyan-900/30">
                  <Users className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                </div>
                <div>
                  <p className="text-sm font-medium">Candidatos</p>
                  <p className="text-xs text-muted-foreground">
                    {enabledCandidates
                      ? 'Assistente IA ativo para candidatos'
                      : 'Usando base de conhecimento local como fallback'}
                  </p>
                </div>
              </div>
              <Switch
                checked={enabledCandidates}
                onCheckedChange={(v) => onValueChange('chatbotEnabledCandidates', v)}
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Building2 className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm font-medium">Empresas</p>
                  <p className="text-xs text-muted-foreground">
                    {enabledCompanies
                      ? 'Assistente IA ativo para empresas'
                      : 'Usando base de conhecimento local como fallback'}
                  </p>
                </div>
              </div>
              <Switch
                checked={enabledCompanies}
                onCheckedChange={(v) => onValueChange('chatbotEnabledCompanies', v)}
              />
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={handleSave} disabled={saving} className="gap-2">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                Salvar Configurações
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* KPI cards */}
      <motion.div {...fadeUp(0.1)}>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Card>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Conversas este mês</p>
                  <p className="mt-1 text-2xl font-bold">2.847</p>
                </div>
                <div className="rounded-lg bg-cyan-100 p-2 dark:bg-cyan-900/30">
                  <MessageSquare className="h-4 w-4 text-cyan-700 dark:text-cyan-300" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                <TrendingUp className="h-3 w-3" />
                <span>+12% vs. mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Taxa de resposta IA</p>
                  <p className="mt-1 text-2xl font-bold">94,2%</p>
                </div>
                <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30">
                  <Zap className="h-4 w-4 text-emerald-700 dark:text-emerald-300" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                <TrendingUp className="h-3 w-3" />
                <span>+2.1% vs. mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Tempo médio de resposta</p>
                  <p className="mt-1 text-2xl font-bold">1,8s</p>
                </div>
                <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900/30">
                  <Clock className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-emerald-600">
                <TrendingDown className="h-3 w-3" />
                <span>-0.3s vs. mês anterior</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-muted-foreground">Taxa de escalação</p>
                  <p className="mt-1 text-2xl font-bold">5,8%</p>
                </div>
                <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30">
                  <AlertTriangle className="h-4 w-4 text-amber-700 dark:text-amber-300" />
                </div>
              </div>
              <div className="mt-2 flex items-center gap-1 text-xs text-red-500">
                <TrendingUp className="h-3 w-3" />
                <span>+0.4% vs. mês anterior</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Gráficos */}
      <motion.div {...fadeUp(0.15)}>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Área — conversas por dia */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
                Conversas nos últimos 30 dias
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={DAILY_DATA} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="gradAI" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis
                    dataKey="day"
                    tick={{ fontSize: 10 }}
                    tickLine={false}
                    axisLine={false}
                    interval={6}
                  />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: 12,
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    stroke="#3b82f6"
                    fill="url(#gradTotal)"
                    strokeWidth={1.5}
                    name="Total"
                    dot={false}
                  />
                  <Area
                    type="monotone"
                    dataKey="ai"
                    stroke="#06b6d4"
                    fill="url(#gradAI)"
                    strokeWidth={2}
                    name="Respondido pela IA"
                    dot={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Donut — distribuição por tipo de usuário */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <Users className="h-4 w-4 text-muted-foreground" />
                Por tipo de usuário
              </CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={USER_DISTRIBUTION}
                    cx="50%"
                    cy="45%"
                    innerRadius={50}
                    outerRadius={72}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {USER_DISTRIBUTION.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => (
                      <span className="text-xs text-foreground">{value}</span>
                    )}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: 12,
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Perguntas mais frequentes + Escalações recentes */}
      <motion.div {...fadeUp(0.2)}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Top questions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                Perguntas mais frequentes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {TOP_QUESTIONS.map((item, idx) => {
                const badge = CATEGORY_BADGE_MAP[item.category];
                return (
                  <div
                    key={idx}
                    className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-muted/50 transition-colors"
                  >
                    <span className="w-5 text-right text-xs font-bold text-muted-foreground">
                      {idx + 1}
                    </span>
                    <span className="flex-1 truncate text-sm">{item.question}</span>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${badge?.variant ?? ''}`}
                    >
                      {badge?.label ?? item.category}
                    </span>
                    <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                      {item.count}
                    </span>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Escalações recentes */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                Escalações recentes
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="pl-6 text-xs">Tipo</TableHead>
                    <TableHead className="text-xs">Assunto</TableHead>
                    <TableHead className="text-xs">Data</TableHead>
                    <TableHead className="pr-6 text-xs">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {RECENT_ESCALATIONS.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="pl-6">
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          {USER_TYPE_ICONS[row.type]}
                          <span>{USER_TYPE_LABELS[row.type]}</span>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[180px] truncate text-xs">
                        {row.subject}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.date}</TableCell>
                      <TableCell className="pr-6">
                        {row.status === 'open' ? (
                          <div className="flex items-center gap-1 text-xs text-amber-600">
                            <XCircle className="h-3 w-3" />
                            Aberto
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 text-xs text-emerald-600">
                            <CheckCircle2 className="h-3 w-3" />
                            Resolvido
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Feed de atividade recente */}
      <motion.div {...fadeUp(0.25)}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Activity className="h-4 w-4 text-muted-foreground" />
              Atividade recente
            </CardTitle>
            <CardDescription>Últimas interações com o assistente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
              {RECENT_ACTIVITY.map((item, idx) => {
                const sourceBadge = SOURCE_BADGE_MAP[item.source];
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-3 rounded-lg border p-3 text-sm transition-colors hover:bg-muted/40"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      {USER_TYPE_ICONS[item.userType]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate text-sm">{item.snippet}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {USER_TYPE_LABELS[item.userType]}
                      </p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${sourceBadge?.className ?? ''}`}
                      >
                        {sourceBadge?.label ?? item.source}
                      </span>
                      <span className="text-xs text-muted-foreground">há {item.time}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Nota sobre dados mock */}
      <motion.div {...fadeUp(0.3)}>
        <p className="text-center text-xs text-muted-foreground">
          Os dados exibidos acima são ilustrativos. A integração com métricas em tempo real será
          adicionada em versão futura.
        </p>
      </motion.div>
    </div>
  );
}
