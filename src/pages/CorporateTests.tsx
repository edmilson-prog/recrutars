import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion, useReducedMotion, type MotionProps } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  Brain,
  ClipboardCheck,
  Target,
  Clock,
  Shield,
  UserCheck,
  TrendingDown,
  Users,
  Crown,
  Handshake,
  Rocket,
  Mail,
  FileText,
  BarChart3,
  Briefcase,
  TrendingUp,
  GraduationCap,
  Award,
  Globe,
  Puzzle,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

// Dados estáticos
const stats = [
  { value: '+15.000', label: 'Testes realizados', icon: ClipboardCheck },
  { value: '94%', label: 'Precisão validada', icon: Target },
  { value: '15min', label: 'Tempo médio', icon: Clock },
  { value: '100%', label: 'Online e seguro', icon: Shield },
];

const behavioralDimensions = [
  {
    letter: 'D',
    name: 'Dominância',
    color: 'bg-red-500',
    textColor: 'text-red-500',
    bgLight: 'bg-red-500/10',
    description: 'Pessoas focadas em resultados, decisivas e competitivas. Gostam de desafios e assumem riscos.',
    traits: ['Direto', 'Decidido', 'Competitivo', 'Orientado a resultados'],
  },
  {
    letter: 'I',
    name: 'Influência',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-500',
    bgLight: 'bg-yellow-500/10',
    description: 'Pessoas comunicativas, entusiasmadas e persuasivas. Gostam de interação social e reconhecimento.',
    traits: ['Comunicativo', 'Entusiasmado', 'Otimista', 'Colaborativo'],
  },
  {
    letter: 'S',
    name: 'Estabilidade',
    color: 'bg-green-500',
    textColor: 'text-green-500',
    bgLight: 'bg-green-500/10',
    description: 'Pessoas cooperativas, pacientes e confiáveis. Valorizam harmonia e ambientes previsíveis.',
    traits: ['Paciente', 'Confiável', 'Leal', 'Bom ouvinte'],
  },
  {
    letter: 'C',
    name: 'Conformidade',
    color: 'bg-blue-500',
    textColor: 'text-blue-500',
    bgLight: 'bg-blue-500/10',
    description: 'Pessoas analíticas, precisas e metódicas. Focam em qualidade, dados e procedimentos.',
    traits: ['Analítico', 'Preciso', 'Sistemático', 'Detalhista'],
  },
];

const benefits = [
  { icon: UserCheck, title: 'Contratações Assertivas', description: 'Reduza erros de contratação identificando candidatos com perfil comportamental alinhado à vaga.' },
  { icon: TrendingDown, title: 'Redução de Turnover', description: 'Diminua a rotatividade contratando pessoas que se adaptam melhor à cultura e ao cargo.' },
  { icon: Users, title: 'Formação de Equipes', description: 'Monte times equilibrados combinando perfis complementares para alta performance.' },
  { icon: Crown, title: 'Desenvolvimento de Líderes', description: 'Identifique potenciais líderes e desenvolva competências com base no perfil comportamental.' },
  { icon: Handshake, title: 'Gestão de Conflitos', description: 'Entenda as diferenças comportamentais para mediar conflitos e melhorar a comunicação.' },
  { icon: Rocket, title: 'Plano de Carreira', description: 'Direcione colaboradores para funções onde seu perfil terá melhor desempenho.' },
];

const steps = [
  { step: '01', title: 'Convite', description: 'Envie o teste por email para candidatos ou colaboradores', icon: Mail },
  { step: '02', title: 'Realização', description: 'O avaliado responde 24 questões em cerca de 15 minutos', icon: FileText },
  { step: '03', title: 'Análise', description: 'Nosso algoritmo processa as respostas instantaneamente', icon: Brain },
  { step: '04', title: 'Relatório', description: 'Receba relatório detalhado com gráficos e recomendações', icon: BarChart3 },
];

const useCases = [
  { icon: Briefcase, title: 'Recrutamento e Seleção', description: 'Avalie candidatos antes da entrevista para decisões mais assertivas.' },
  { icon: Users, title: 'Team Building', description: 'Analise a composição da equipe e identifique gaps comportamentais.' },
  { icon: TrendingUp, title: 'Promoções Internas', description: 'Avalie se o colaborador tem perfil para assumir novas responsabilidades.' },
  { icon: GraduationCap, title: 'Treinamentos', description: 'Personalize programas de desenvolvimento com base nos perfis.' },
];

const differentials = [
  { icon: Award, title: 'Base Científica', description: 'Metodologia validada internacionalmente com mais de 50 anos de pesquisa.' },
  { icon: Globe, title: 'Adaptado ao Brasil', description: 'Questões e interpretações calibradas para o contexto cultural brasileiro.' },
  { icon: Puzzle, title: 'Integração Total', description: 'Resultados integrados ao perfil do candidato na plataforma RecrutaRS.' },
];

const reportScores: Record<string, number> = { D: 75, I: 60, S: 45, C: 80 };

const reportItems = [
  'Gráfico de perfil comportamental',
  'Pontos fortes identificados',
  'Áreas de desenvolvimento',
  'Estilo de comunicação',
  'Como motivar este perfil',
  'Ambientes de trabalho ideais',
  'Recomendações de gestão',
];

const faqs = [
  {
    question: 'O que é o teste comportamental?',
    answer: 'O Gauge-Pro é uma metodologia de avaliação comportamental que identifica 4 dimensões principais do comportamento humano: Dominância, Influência, Estabilidade e Conformidade. É uma das ferramentas mais utilizadas no mundo para compreender perfis comportamentais no ambiente corporativo.'
  },
  {
    question: 'Quanto tempo leva para fazer o teste?',
    answer: 'Em média 15 minutos. O teste tem 24 questões de escolha forçada, onde o avaliado escolhe qual comportamento mais o representa e qual menos o representa em cada situação.'
  },
  {
    question: 'O resultado é confiável?',
    answer: 'Sim, a metodologia comportamental tem mais de 50 anos de validação científica e é utilizada por milhares de empresas em todo o mundo. Nossa versão Gauge-Pro foi adaptada e validada especificamente para o contexto brasileiro.'
  },
  {
    question: 'Posso usar para colaboradores atuais?',
    answer: 'Sim, o teste é útil tanto para seleção de novos colaboradores quanto para desenvolvimento de equipes existentes, promoções internas, realocação de pessoal e programas de liderança.'
  },
  {
    question: 'Como recebo os resultados?',
    answer: 'Os resultados ficam disponíveis imediatamente na plataforma após a conclusão do teste. Você recebe um relatório completo com gráficos, análise de perfil, pontos fortes, áreas de desenvolvimento e recomendações de gestão.'
  },
];

type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  subtitle: string;
  reveal: MotionProps;
};

function SectionHeader({ eyebrow, title, subtitle, reveal }: SectionHeaderProps) {
  return (
    <motion.div {...reveal} className="text-center mb-14 md:mb-16 max-w-2xl mx-auto">
      <div className="inline-flex items-center gap-2.5 mb-4">
        <span className="h-px w-8 bg-gradient-to-r from-transparent to-secondary/60" />
        <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">{eyebrow}</span>
        <span className="h-px w-8 bg-gradient-to-l from-transparent to-secondary/60" />
      </div>
      <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{title}</h2>
      <p className="text-muted-foreground text-lg leading-relaxed">{subtitle}</p>
    </motion.div>
  );
}

export default function CorporateTests() {
  const prefersReduced = useReducedMotion();

  // Animação de revelação que respeita prefers-reduced-motion
  const reveal = (delay = 0): MotionProps =>
    prefersReduced
      ? { initial: false }
      : {
          initial: { opacity: 0, y: 24 },
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true, margin: '-80px' },
          transition: { duration: 0.5, delay, ease: 'easeOut' },
        };

  return (
    <PublicLayout>
      <div className="min-h-screen pb-12">
        <Header />

        {/* Hero */}
        <header className="relative overflow-hidden pt-28 pb-32 md:pb-36 gradient-hero">
          {/* Decoração de fundo */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-24 -right-16 w-80 h-80 rounded-full bg-secondary/20 blur-3xl" />
            <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
                backgroundSize: '56px 56px',
                maskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
                WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 40%, black, transparent)',
              }}
            />
          </div>

          <div className="container relative text-center text-primary-foreground">
            <motion.span
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm mb-6"
              initial={prefersReduced ? false : { opacity: 0, y: -10 }}
              animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Sparkles className="w-4 h-4 text-secondary" />
              Gauge-Pro · Avaliação Comportamental
            </motion.span>

            <motion.h1
              className="text-4xl md:text-6xl font-bold mb-5 tracking-tight"
              initial={prefersReduced ? false : { opacity: 0, y: 20 }}
              animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              Testes Corporativos
            </motion.h1>

            <motion.p
              className="text-lg md:text-2xl text-primary-foreground/80 max-w-3xl mx-auto mb-9 leading-relaxed"
              initial={prefersReduced ? false : { opacity: 0, y: 20 }}
              animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Avaliação comportamental científica para contratações mais assertivas e equipes de alta performance
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={prefersReduced ? false : { opacity: 0, y: 20 }}
              animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <Button asChild size="lg" variant="secondary" className="shadow-glow">
                <Link to="/cadastro">Solicitar Demo</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link to="/planos">Ver Planos</Link>
              </Button>
            </motion.div>

            <motion.p
              className="mt-7 text-sm text-primary-foreground/60"
              initial={prefersReduced ? false : { opacity: 0 }}
              animate={prefersReduced ? undefined : { opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.25 }}
            >
              Metodologia validada · +50 anos de pesquisa · Adaptada ao Brasil
            </motion.p>
          </div>
        </header>

        {/* Stats — barra flutuante sobre o hero */}
        <section className="container relative z-10 -mt-16 md:-mt-20">
          <motion.div
            {...reveal()}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-2 rounded-2xl border border-border/60 bg-card shadow-soft p-6 md:p-8 divide-border/60 md:divide-x"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="text-center md:px-4">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                  <stat.icon className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-2xl md:text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* O que é o Teste Comportamental */}
        <section className="py-20 md:py-24">
          <div className="container">
            <motion.div {...reveal()} className="max-w-4xl mx-auto">
              <div className="relative bg-card rounded-2xl border border-border/60 shadow-soft p-8 md:p-12">
                <div className="absolute left-0 top-10 bottom-10 w-1 rounded-r-full bg-gradient-to-b from-secondary to-secondary/30 hidden md:block" />
                <div className="text-center mb-8">
                  <span className="text-xs font-bold uppercase tracking-[0.2em] text-secondary">Metodologia</span>
                  <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-3">O que é o Teste Comportamental?</h2>
                </div>
                <div className="space-y-4 text-muted-foreground leading-relaxed">
                  <p>
                    O teste comportamental é uma metodologia de avaliação desenvolvida a partir dos estudos do psicólogo William Moulton Marston na década de 1920. A avaliação mapeia as quatro dimensões principais do comportamento humano: <strong className="text-foreground">Dominância</strong>, <strong className="text-foreground">Influência</strong>, <strong className="text-foreground">Estabilidade</strong> e <strong className="text-foreground">Conformidade</strong>.
                  </p>
                  <p>
                    Diferente de testes de personalidade, a avaliação comportamental foca em comportamentos observáveis e como as pessoas tendem a agir em diferentes situações. Isso torna a metodologia extremamente útil para o ambiente corporativo, onde entender como uma pessoa se comporta é tão importante quanto suas habilidades técnicas.
                  </p>
                  <p>
                    O <strong className="text-foreground">Gauge-Pro</strong> é nossa versão proprietária da avaliação comportamental, desenvolvida especificamente para o mercado brasileiro, com questões adaptadas ao nosso contexto cultural e profissional.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Dimensões Comportamentais */}
        <section className="py-20 md:py-24 bg-muted/30">
          <div className="container">
            <SectionHeader
              reveal={reveal()}
              eyebrow="Modelo DISC"
              title="As 4 Dimensões Comportamentais"
              subtitle="Cada pessoa possui uma combinação única dessas dimensões comportamentais"
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {behavioralDimensions.map((dimension, index) => (
                <motion.div
                  key={dimension.letter}
                  {...reveal(index * 0.08)}
                  className="group bg-card rounded-2xl border border-border/60 shadow-soft p-6 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className={`w-16 h-16 rounded-2xl ${dimension.color} text-white flex items-center justify-center mx-auto mb-4 transition-transform duration-200 group-hover:scale-105`}>
                    <span className="text-3xl font-bold">{dimension.letter}</span>
                  </div>
                  <h3 className={`text-xl font-semibold mb-3 ${dimension.textColor}`}>{dimension.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{dimension.description}</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {dimension.traits.map((trait) => (
                      <span key={trait} className={`px-2 py-1 rounded-full ${dimension.bgLight} ${dimension.textColor} text-xs font-medium`}>
                        {trait}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefícios */}
        <section className="py-20 md:py-24">
          <div className="container">
            <SectionHeader
              reveal={reveal()}
              eyebrow="Por que usar"
              title="Benefícios para sua Empresa"
              subtitle="Transforme seu processo de RH com dados comportamentais científicos"
            />

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  {...reveal(index * 0.06)}
                  className="group bg-card rounded-2xl border border-border/60 shadow-soft p-6 transition-all duration-200 hover:shadow-lg hover:border-secondary/40"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4 transition-colors duration-200 group-hover:bg-secondary group-hover:text-white">
                    <benefit.icon className="w-6 h-6 text-secondary transition-colors duration-200 group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Como Funciona */}
        <section className="py-20 md:py-24 bg-muted/30">
          <div className="container">
            <SectionHeader
              reveal={reveal()}
              eyebrow="Processo"
              title="Como Funciona"
              subtitle="Processo simples e rápido para avaliar seus candidatos"
            />

            <div className="relative max-w-5xl mx-auto">
              {/* Linha conectora (desktop) */}
              <div className="hidden md:block absolute top-7 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-secondary/10 via-secondary/40 to-secondary/10" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-4 relative">
                {steps.map((step, index) => (
                  <motion.div key={step.step} {...reveal(index * 0.1)} className="text-center">
                    <div className="w-14 h-14 rounded-2xl bg-secondary text-secondary-foreground flex items-center justify-center mx-auto mb-4 relative z-10 ring-4 ring-muted/30 shadow-glow">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="text-xs font-bold text-secondary tracking-[0.2em] mb-1">PASSO {step.step}</div>
                    <h4 className="font-semibold text-foreground mb-2">{step.title}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-[220px] mx-auto">{step.description}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Relatório Detalhado */}
        <section className="py-20 md:py-24">
          <div className="container">
            <SectionHeader
              reveal={reveal()}
              eyebrow="Entregável"
              title="Relatório Detalhado"
              subtitle="Receba análises completas para tomar decisões embasadas"
            />

            <motion.div {...reveal()} className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl border border-border/60 shadow-soft overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1">Exemplo de Relatório Gauge-Pro</h3>
                    <p className="text-primary-foreground/80">Análise comportamental completa</p>
                  </div>
                  <BarChart3 className="w-10 h-10 text-primary-foreground/40 hidden sm:block" />
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8 md:gap-10">
                    {/* Gráfico simulado */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">Perfil Comportamental</h4>
                      <div className="space-y-3">
                        {behavioralDimensions.map((dim) => (
                          <div key={dim.letter} className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded-lg ${dim.color} text-white flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                              {dim.letter}
                            </span>
                            <div className="flex-1">
                              <div className="h-3 bg-muted rounded-full overflow-hidden">
                                <motion.div
                                  className={`h-full ${dim.color} rounded-full`}
                                  initial={prefersReduced ? false : { width: 0 }}
                                  whileInView={prefersReduced ? undefined : { width: `${reportScores[dim.letter]}%` }}
                                  viewport={{ once: true }}
                                  transition={{ duration: 0.8, ease: 'easeOut' }}
                                  style={prefersReduced ? { width: `${reportScores[dim.letter]}%` } : undefined}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-semibold text-foreground w-10 text-right tabular-nums">
                              {reportScores[dim.letter]}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Lista de características */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">O que você recebe</h4>
                      <ul className="space-y-3">
                        {reportItems.map((item) => (
                          <li key={item} className="flex items-center gap-2.5 text-muted-foreground">
                            <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Casos de Uso */}
        <section className="py-20 md:py-24 bg-muted/30">
          <div className="container">
            <SectionHeader
              reveal={reveal()}
              eyebrow="Aplicações"
              title="Casos de Uso"
              subtitle="Diversas aplicações para potencializar sua gestão de pessoas"
            />

            <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={useCase.title}
                  {...reveal(index * 0.06)}
                  className="group bg-card rounded-2xl border border-border/60 shadow-soft p-6 transition-all duration-200 hover:shadow-lg hover:border-secondary/40"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0 transition-colors duration-200 group-hover:bg-secondary group-hover:text-white">
                      <useCase.icon className="w-6 h-6 text-secondary transition-colors duration-200 group-hover:text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{useCase.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{useCase.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Diferenciais */}
        <section className="py-20 md:py-24">
          <div className="container">
            <SectionHeader
              reveal={reveal()}
              eyebrow="Diferenciais"
              title="Diferenciais Gauge-Pro"
              subtitle="O que torna nossa avaliação única no mercado"
            />

            <div className="grid md:grid-cols-3 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {differentials.map((diff, index) => (
                <motion.div
                  key={diff.title}
                  {...reveal(index * 0.08)}
                  className="group bg-card rounded-2xl border border-border/60 shadow-soft p-8 text-center transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4 transition-colors duration-200 group-hover:bg-secondary group-hover:text-white">
                    <diff.icon className="w-7 h-7 text-secondary transition-colors duration-200 group-hover:text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{diff.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{diff.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 md:py-24 bg-muted/30">
          <div className="container">
            <SectionHeader
              reveal={reveal()}
              eyebrow="Dúvidas"
              title="Perguntas Frequentes"
              subtitle="Tire suas dúvidas sobre o teste comportamental Gauge-Pro"
            />

            <motion.div {...reveal()} className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-card rounded-xl border border-border/60 shadow-soft px-6"
                  >
                    <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline py-5">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-muted-foreground leading-relaxed pb-5">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </motion.div>
          </div>
        </section>

        {/* CTA final */}
        <section className="py-20 md:py-24">
          <div className="container">
            <motion.div
              {...reveal()}
              className="relative overflow-hidden rounded-3xl gradient-hero px-6 py-16 md:px-12 md:py-20 text-center text-primary-foreground"
            >
              <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -right-10 w-72 h-72 rounded-full bg-secondary/20 blur-3xl" />
                <div className="absolute -bottom-24 -left-10 w-80 h-80 rounded-full bg-white/5 blur-3xl" />
              </div>
              <div className="relative max-w-3xl mx-auto">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Comece a avaliar com ciência</h2>
                <p className="text-lg md:text-xl text-primary-foreground/80 mb-8 leading-relaxed">
                  Junte-se às empresas que já utilizam o Gauge-Pro para contratações mais assertivas
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" variant="secondary" className="shadow-glow">
                    <Link to="/cadastro">
                      Solicitar Demo
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                    <Link to="/ajuda">Falar com Vendas</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PublicLayout>
  );
}
