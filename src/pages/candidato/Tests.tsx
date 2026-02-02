/**
 * Behavioral Test Page
 * PRD-008: Teste Comportamental
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ChevronRight, ChevronLeft, Brain, CheckCircle2, AlertCircle, Download, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { mockBehavioralTests } from '@/data/mockData';

const STORAGE_KEY = 'gauge-pro-progress';

interface Question {
  id: number;
  text: string;
  options: { value: string; label: string; dimension: 'D' | 'I' | 'S' | 'C' }[];
}

const mockQuestions: Question[] = [
  {
    id: 1,
    text: "Quando preciso tomar uma decisão importante, eu geralmente:",
    options: [
      { value: "a", label: "Tomo a decisão rapidamente e sigo em frente", dimension: "D" },
      { value: "b", label: "Consulto outras pessoas e considero suas opiniões", dimension: "I" },
      { value: "c", label: "Analiso cuidadosamente todas as opções disponíveis", dimension: "S" },
      { value: "d", label: "Busco dados e fatos para embasar minha escolha", dimension: "C" },
    ],
  },
  {
    id: 2,
    text: "Em um ambiente de trabalho em equipe, eu prefiro:",
    options: [
      { value: "a", label: "Liderar e direcionar as atividades do grupo", dimension: "D" },
      { value: "b", label: "Motivar e inspirar os colegas", dimension: "I" },
      { value: "c", label: "Apoiar e colaborar com todos harmoniosamente", dimension: "S" },
      { value: "d", label: "Garantir que os processos sejam seguidos corretamente", dimension: "C" },
    ],
  },
  {
    id: 3,
    text: "Diante de um conflito, minha primeira reação é:",
    options: [
      { value: "a", label: "Enfrentar diretamente e resolver logo", dimension: "D" },
      { value: "b", label: "Usar o humor e a diplomacia para amenizar", dimension: "I" },
      { value: "c", label: "Buscar um consenso que agrade a todos", dimension: "S" },
      { value: "d", label: "Analisar os fatos objetivamente antes de agir", dimension: "C" },
    ],
  },
  {
    id: 4,
    text: "O que mais me motiva no trabalho é:",
    options: [
      { value: "a", label: "Desafios e conquista de resultados", dimension: "D" },
      { value: "b", label: "Reconhecimento e interação social", dimension: "I" },
      { value: "c", label: "Estabilidade e um ambiente harmonioso", dimension: "S" },
      { value: "d", label: "Qualidade e precisão no que faço", dimension: "C" },
    ],
  },
  {
    id: 5,
    text: "Quando estou sob pressão, eu costumo:",
    options: [
      { value: "a", label: "Ficar mais assertivo e focado em soluções", dimension: "D" },
      { value: "b", label: "Conversar com pessoas para aliviar o estresse", dimension: "I" },
      { value: "c", label: "Manter a calma e seguir o plano", dimension: "S" },
      { value: "d", label: "Me isolar para pensar com clareza", dimension: "C" },
    ],
  },
  {
    id: 6,
    text: "Meus colegas me descreveriam como alguém:",
    options: [
      { value: "a", label: "Determinado e orientado a resultados", dimension: "D" },
      { value: "b", label: "Entusiasmado e comunicativo", dimension: "I" },
      { value: "c", label: "Confiável e paciente", dimension: "S" },
      { value: "d", label: "Metódico e detalhista", dimension: "C" },
    ],
  },
  {
    id: 7,
    text: "Ao iniciar um novo projeto, minha prioridade é:",
    options: [
      { value: "a", label: "Definir metas claras e prazos", dimension: "D" },
      { value: "b", label: "Formar uma equipe motivada", dimension: "I" },
      { value: "c", label: "Garantir que todos entendam seus papéis", dimension: "S" },
      { value: "d", label: "Criar um plano detalhado e organizado", dimension: "C" },
    ],
  },
  {
    id: 8,
    text: "O que mais me incomoda no trabalho é:",
    options: [
      { value: "a", label: "Falta de autonomia e decisões lentas", dimension: "D" },
      { value: "b", label: "Ambiente frio e sem interação", dimension: "I" },
      { value: "c", label: "Mudanças bruscas e instabilidade", dimension: "S" },
      { value: "d", label: "Trabalho mal feito e sem padrão", dimension: "C" },
    ],
  },
];

const profilesData = {
  D: {
    name: "Dominância",
    color: "hsl(var(--destructive))",
    description: "Orientado a resultados, decisivo, competitivo",
    characteristics: [
      "Foco em resultados e metas",
      "Tomada de decisão rápida",
      "Aceita desafios com facilidade",
      "Direto e assertivo",
    ],
    idealEnvironments: [
      "Empresas com metas claras",
      "Ambientes competitivos",
      "Posições de liderança",
      "Startups e empresas dinâmicas",
    ],
  },
  I: {
    name: "Influência",
    color: "hsl(var(--warning))",
    description: "Comunicativo, entusiasmado, persuasivo",
    characteristics: [
      "Excelente comunicação",
      "Motivador natural",
      "Facilidade em networking",
      "Otimista e entusiasmado",
    ],
    idealEnvironments: [
      "Ambientes colaborativos",
      "Empresas com cultura forte",
      "Áreas de vendas e marketing",
      "Equipes diversas",
    ],
  },
  S: {
    name: "Estabilidade",
    color: "hsl(var(--success))",
    description: "Cooperativo, paciente, confiável",
    characteristics: [
      "Excelente trabalho em equipe",
      "Paciência e consistência",
      "Lealdade e confiabilidade",
      "Busca harmonia",
    ],
    idealEnvironments: [
      "Empresas estáveis",
      "Equipes consolidadas",
      "Ambientes previsíveis",
      "Organizações tradicionais",
    ],
  },
  C: {
    name: "Conformidade",
    color: "hsl(var(--secondary))",
    description: "Analítico, preciso, metódico",
    characteristics: [
      "Atenção aos detalhes",
      "Pensamento analítico",
      "Alta qualidade no trabalho",
      "Organização e método",
    ],
    idealEnvironments: [
      "Empresas com processos claros",
      "Áreas técnicas e analíticas",
      "Ambientes estruturados",
      "Organizações baseadas em dados",
    ],
  },
};

export default function CandidateTests() {
  const [testStarted, setTestStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(15 * 60); // 15 minutes
  const [testCompleted, setTestCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [scores, setScores] = useState({ D: 0, I: 0, S: 0, C: 0 });
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  // Check for saved progress on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      setHasSavedProgress(true);
    }
  }, []);

  // Load saved progress when continuing
  const loadSavedProgress = () => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { answers: savedAnswers, currentQuestion: savedQuestion, timeLeft: savedTime } = JSON.parse(saved);
      setAnswers(savedAnswers);
      setCurrentQuestion(savedQuestion);
      setTimeLeft(savedTime);
      setTestStarted(true);
    }
  };

  // Discard saved progress
  const discardProgress = () => {
    localStorage.removeItem(STORAGE_KEY);
    setHasSavedProgress(false);
    setAnswers({});
    setCurrentQuestion(0);
    setTimeLeft(15 * 60);
    setTestStarted(true);
  };

  // Save progress to localStorage
  useEffect(() => {
    if (testStarted && !testCompleted && !isProcessing) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        answers,
        currentQuestion,
        timeLeft,
      }));
    }
  }, [answers, currentQuestion, timeLeft, testStarted, testCompleted, isProcessing]);

  // Timer countdown
  useEffect(() => {
    if (testStarted && !testCompleted && !isProcessing && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    }
    if (timeLeft === 0 && testStarted && !testCompleted) {
      finishTest();
    }
  }, [testStarted, testCompleted, isProcessing, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswer = (value: string) => {
    setAnswers({ ...answers, [currentQuestion]: value });
  };

  const nextQuestion = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      finishTest();
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const finishTest = () => {
    setIsProcessing(true);
    localStorage.removeItem(STORAGE_KEY);

    // Simulate processing time
    setTimeout(() => {
      const newScores = { D: 0, I: 0, S: 0, C: 0 };

      Object.entries(answers).forEach(([qIndex, answer]) => {
        const question = mockQuestions[parseInt(qIndex)];
        const selectedOption = question.options.find(opt => opt.value === answer);
        if (selectedOption) {
          newScores[selectedOption.dimension] += 12.5; // 100 / 8 questions
        }
      });

      setScores(newScores);

      // Save result to mock data
      const dominantKey = getDominantProfileKey(newScores);
      const newTest = {
        id: `test-${Date.now()}`,
        candidateId: 'candidate-1',
        candidateName: 'Candidato Atual',
        status: 'completed' as const,
        sentAt: new Date().toISOString().split('T')[0],
        completedAt: new Date().toISOString().split('T')[0],
        result: {
          dominance: Math.round(newScores.D),
          influence: Math.round(newScores.I),
          steadiness: Math.round(newScores.S),
          compliance: Math.round(newScores.C),
          profile: profilesData[dominantKey].name,
          strengths: profilesData[dominantKey].characteristics.slice(0, 3),
          watchPoints: ['Ponto de atenção 1', 'Ponto de atenção 2'],
        },
      };
      mockBehavioralTests.push(newTest);

      setIsProcessing(false);
      setTestCompleted(true);
    }, 2000);
  };

  const getDominantProfileKey = (scoreObj: typeof scores) => {
    const maxScore = Math.max(...Object.values(scoreObj));
    return Object.entries(scoreObj).find(([_, score]) => score === maxScore)?.[0] as keyof typeof profilesData;
  };

  const getDominantProfile = () => {
    return getDominantProfileKey(scores);
  };

  const handleDownloadPDF = () => {
    toast.success('Download iniciado! O PDF será enviado ao seu email.');
  };

  const progress = ((currentQuestion + 1) / mockQuestions.length) * 100;

  // Processing screen
  if (isProcessing) {
    return (
      <DashboardLayout userType="candidate">
        <div className="max-w-md mx-auto text-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center"
          >
            <Loader2 className="w-10 h-10 text-primary-foreground" />
          </motion.div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Processando seu perfil...</h2>
          <p className="text-muted-foreground">Analisando suas respostas para gerar seu perfil comportamental</p>
        </div>
      </DashboardLayout>
    );
  }

  // Initial screen
  if (!testStarted) {
    return (
      <DashboardLayout userType="candidate">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-2xl p-8 shadow-soft text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl gradient-primary flex items-center justify-center">
              <Brain className="w-10 h-10 text-primary-foreground" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-4">Teste Gauge-Pro</h1>
            <p className="text-muted-foreground mb-8">
              O teste comportamental Gauge-Pro identifica seu perfil comportamental, ajudando empresas a
              entenderem suas características e encontrarem a melhor posição para você.
            </p>

            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="p-4 bg-muted rounded-xl">
                <div className="text-2xl font-bold text-foreground">{mockQuestions.length}</div>
                <div className="text-sm text-muted-foreground">Perguntas</div>
              </div>
              <div className="p-4 bg-muted rounded-xl">
                <div className="text-2xl font-bold text-foreground">15 min</div>
                <div className="text-sm text-muted-foreground">Tempo máximo</div>
              </div>
            </div>

            <div className="bg-warning/10 border border-warning/20 rounded-xl p-4 mb-8 text-left">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-warning mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground">Importante</h4>
                  <p className="text-sm text-muted-foreground">
                    Responda com sinceridade. Não há respostas certas ou erradas.
                    Seu progresso será salvo automaticamente.
                  </p>
                </div>
              </div>
            </div>

            {hasSavedProgress ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button variant="outline" onClick={discardProgress}>
                  Novo Teste
                </Button>
                <Button size="xl" onClick={loadSavedProgress} className="gradient-primary">
                  Continuar Teste
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
            ) : (
              <Button size="xl" onClick={() => setTestStarted(true)} className="gradient-primary">
                Iniciar Teste
                <ChevronRight className="w-5 h-5" />
              </Button>
            )}
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // Results screen
  if (testCompleted) {
    const dominant = getDominantProfile();
    const profile = profilesData[dominant];

    return (
      <DashboardLayout userType="candidate">
        <div className="max-w-3xl mx-auto space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-card rounded-2xl p-8 shadow-soft text-center"
          >
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Teste Concluído!</h1>
            <p className="text-muted-foreground">Confira seu perfil comportamental abaixo</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-card rounded-2xl p-8 shadow-soft"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6 text-center">Seu Perfil Comportamental</h2>

            {/* Behavioral Chart */}
            <div className="flex justify-center items-end gap-6 h-64 mb-8">
              {(Object.entries(scores) as [keyof typeof profilesData, number][]).map(([key, score], index) => (
                <motion.div
                  key={key}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(score, 10)}%` }}
                  transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                  className="relative w-20 rounded-t-xl flex flex-col items-center justify-end"
                  style={{ backgroundColor: profilesData[key].color }}
                >
                  <span className="text-2xl font-bold text-white mb-2">{Math.round(score)}</span>
                  <div className="absolute -bottom-8 text-center">
                    <span className="font-bold text-foreground">{key}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Dominant Profile */}
            <div className="mt-12 p-6 rounded-xl" style={{ backgroundColor: `${profile.color}20` }}>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Seu perfil predominante: <span style={{ color: profile.color }}>{profile.name}</span>
              </h3>
              <p className="text-muted-foreground">{profile.description}</p>
            </div>
          </motion.div>

          {/* Characteristics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">Características Principais</h2>
            <ul className="space-y-3">
              {profile.characteristics.map((char, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                  <span className="w-2 h-2 mt-2 rounded-full flex-shrink-0" style={{ backgroundColor: profile.color }} />
                  {char}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Ideal Environments */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-card rounded-2xl p-6 shadow-soft"
          >
            <h2 className="text-xl font-semibold text-foreground mb-4">Ambientes Ideais</h2>
            <ul className="space-y-3">
              {profile.idealEnvironments.map((env, index) => (
                <li key={index} className="flex items-start gap-3 text-muted-foreground">
                  <CheckCircle2 className="w-5 h-5 mt-0.5 text-success flex-shrink-0" />
                  {env}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Profile Details Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid md:grid-cols-2 gap-4"
          >
            {(Object.entries(profilesData) as [keyof typeof profilesData, typeof profilesData.D][]).map(([key, profileData]) => (
              <div
                key={key}
                className={cn(
                  "bg-card rounded-xl p-5 shadow-soft border-2 transition-all",
                  key === dominant ? "border-current" : "border-transparent"
                )}
                style={{ borderColor: key === dominant ? profileData.color : 'transparent' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: profileData.color }}
                  >
                    {key}
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{profileData.name}</h4>
                    <div className="text-sm text-muted-foreground">{Math.round(scores[key])}%</div>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{profileData.description}</p>
              </div>
            ))}
          </motion.div>

          {/* Download Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center"
          >
            <Button variant="outline" size="lg" onClick={handleDownloadPDF}>
              <Download className="w-5 h-5 mr-2" />
              Baixar PDF do Resultado
            </Button>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // Question screen
  const question = mockQuestions[currentQuestion];

  return (
    <DashboardLayout userType="candidate">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Timer and Progress */}
        <div className="bg-card rounded-2xl p-4 shadow-soft">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-muted-foreground">
              Pergunta {currentQuestion + 1} de {mockQuestions.length}
            </span>
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full",
              timeLeft < 60 ? "bg-destructive/10 text-destructive" : "bg-muted"
            )}>
              <Clock className="w-4 h-4" />
              <span className="font-mono font-semibold">{formatTime(timeLeft)}</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-card rounded-2xl p-8 shadow-soft"
          >
            <h2 className="text-xl font-semibold text-foreground mb-6">
              {question.text}
            </h2>

            <RadioGroup
              value={answers[currentQuestion] || ''}
              onValueChange={handleAnswer}
              className="space-y-3"
            >
              {question.options.map((option) => (
                <div
                  key={option.value}
                  className={cn(
                    "flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                    answers[currentQuestion] === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50 hover:bg-muted/50"
                  )}
                  onClick={() => handleAnswer(option.value)}
                >
                  <RadioGroupItem value={option.value} id={option.value} />
                  <Label htmlFor={option.value} className="flex-1 cursor-pointer">
                    {option.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={previousQuestion}
                disabled={currentQuestion === 0}
              >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Anterior
              </Button>
              <Button
                onClick={nextQuestion}
                disabled={!answers[currentQuestion]}
                className={answers[currentQuestion] ? 'gradient-primary' : ''}
              >
                {currentQuestion < mockQuestions.length - 1 ? 'Próxima' : 'Finalizar'}
                <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
