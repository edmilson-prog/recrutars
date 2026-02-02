import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
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
  Star,
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

const pricing = [
  { name: 'Avulso', price: 'R$ 49', unit: '/teste', description: 'Ideal para contratações pontuais', features: ['1 teste individual', 'Relatório completo', 'Válido por 30 dias'], popular: false },
  { name: 'Pacote', price: 'R$ 299', unit: '/10 testes', description: 'Para empresas em crescimento', features: ['10 testes', 'Relatórios completos', 'Válido por 90 dias', 'Suporte prioritário'], popular: true },
  { name: 'Ilimitado', price: 'R$ 599', unit: '/mês', description: 'Para alto volume de contratações', features: ['Testes ilimitados', 'Dashboard de analytics', 'API de integração', 'Gerente de conta'], popular: false },
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

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function CorporateTests() {
  return (
    <PublicLayout>
      <div className="min-h-screen pb-12">
        <Header />

        {/* Hero */}
        <div className="pt-20 gradient-hero min-h-[50vh] flex items-center">
          <div className="container py-16 text-center text-primary-foreground">
            <motion.div
              className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center mx-auto mb-6"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Brain className="w-8 h-8" />
            </motion.div>
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Testes Corporativos
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-primary-foreground/80 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Gauge-Pro: Avaliação comportamental científica para contratações mais assertivas
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button asChild size="lg" variant="secondary">
                <Link to="/cadastro">Solicitar Demo</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link to="/planos">Ver Planos</Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* What is the Behavioral Test */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
              <div className="bg-card rounded-2xl shadow-soft p-8 md:p-12">
                <h2 className="text-3xl font-bold text-foreground mb-6 text-center">O que é o Teste Comportamental?</h2>
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

        {/* Behavioral Dimensions */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">As 4 Dimensões Comportamentais</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Cada pessoa possui uma combinação única dessas dimensões comportamentais
              </p>
            </motion.div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
              {behavioralDimensions.map((dimension, index) => (
                <motion.div
                  key={dimension.letter}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-2xl shadow-soft p-6 text-center hover:shadow-lg transition-shadow"
                >
                  <div className={`w-16 h-16 rounded-2xl ${dimension.color} text-white flex items-center justify-center mx-auto mb-4`}>
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

        {/* Benefits */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Benefícios para sua Empresa</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Transforme seu processo de RH com dados comportamentais científicos
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-2xl shadow-soft p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{benefit.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Como Funciona</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Processo simples e rápido para avaliar seus candidatos
              </p>
            </motion.div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-2 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center"
                >
                  <div className="text-center w-48">
                    <div className="w-14 h-14 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mx-auto mb-3">
                      <step.icon className="w-6 h-6" />
                    </div>
                    <div className="text-sm font-bold text-secondary mb-1">{step.step}</div>
                    <h4 className="font-semibold text-foreground mb-1">{step.title}</h4>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight className="w-5 h-5 text-muted-foreground mx-2 hidden md:block" />
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Report Preview */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Relatório Detalhado</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Receba análises completas para tomar decisões embasadas
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="max-w-4xl mx-auto"
            >
              <div className="bg-card rounded-2xl shadow-soft overflow-hidden">
                <div className="bg-gradient-to-r from-primary to-primary/80 p-6 text-primary-foreground">
                  <h3 className="text-xl font-semibold mb-2">Exemplo de Relatório Gauge-Pro</h3>
                  <p className="text-primary-foreground/80">Análise comportamental completa</p>
                </div>
                <div className="p-8">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Gráfico simulado */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">Perfil Comportamental</h4>
                      <div className="space-y-3">
                        {behavioralDimensions.map((dim) => (
                          <div key={dim.letter} className="flex items-center gap-3">
                            <span className={`w-8 h-8 rounded ${dim.color} text-white flex items-center justify-center text-sm font-bold`}>
                              {dim.letter}
                            </span>
                            <div className="flex-1">
                              <div className="h-4 bg-muted rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${dim.color}`}
                                  style={{ width: dim.letter === 'D' ? '75%' : dim.letter === 'I' ? '60%' : dim.letter === 'S' ? '45%' : '80%' }}
                                />
                              </div>
                            </div>
                            <span className="text-sm font-medium text-foreground w-12 text-right">
                              {dim.letter === 'D' ? '75%' : dim.letter === 'I' ? '60%' : dim.letter === 'S' ? '45%' : '80%'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                    {/* Lista de características */}
                    <div>
                      <h4 className="font-semibold text-foreground mb-4">O que você recebe</h4>
                      <ul className="space-y-3">
                        {[
                          'Gráfico de perfil comportamental',
                          'Pontos fortes identificados',
                          'Áreas de desenvolvimento',
                          'Estilo de comunicação',
                          'Como motivar este perfil',
                          'Ambientes de trabalho ideais',
                          'Recomendações de gestão',
                        ].map((item) => (
                          <li key={item} className="flex items-center gap-2 text-muted-foreground">
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

        {/* Use Cases */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Casos de Uso</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Diversas aplicações para potencializar sua gestão de pessoas
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {useCases.map((useCase, index) => (
                <motion.div
                  key={useCase.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-2xl shadow-soft p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center flex-shrink-0">
                      <useCase.icon className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-foreground mb-2">{useCase.title}</h3>
                      <p className="text-muted-foreground">{useCase.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Differentials */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Diferenciais Gauge-Pro</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                O que torna nossa avaliação única no mercado
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {differentials.map((diff, index) => (
                <motion.div
                  key={diff.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-2xl shadow-soft p-8 text-center hover:shadow-lg transition-shadow"
                >
                  <div className="w-14 h-14 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <diff.icon className="w-7 h-7 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{diff.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{diff.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Planos e Preços</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Escolha a opção ideal para o tamanho da sua operação
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {pricing.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-card rounded-2xl shadow-soft p-6 relative ${plan.popular ? 'border-2 border-secondary ring-4 ring-secondary/10' : ''
                    }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-secondary text-secondary-foreground text-sm font-medium rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Mais Popular
                    </div>
                  )}
                  <div className="text-center mb-6 pt-2">
                    <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-foreground">
                      {plan.price}
                      <span className="text-lg font-normal text-muted-foreground">{plan.unit}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full" variant={plan.popular ? 'default' : 'outline'}>
                    <Link to="/cadastro">Começar</Link>
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Perguntas Frequentes</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Tire suas dúvidas sobre o teste comportamental Gauge-Pro
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-3xl mx-auto"
            >
              <Accordion type="single" collapsible className="space-y-4">
                {faqs.map((faq, index) => (
                  <AccordionItem
                    key={index}
                    value={`item-${index}`}
                    className="bg-card rounded-xl shadow-soft px-6 border-none"
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

        {/* CTA */}
        <section className="py-24 gradient-hero">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center text-primary-foreground max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Comece a avaliar com ciência</h2>
              <p className="text-xl text-primary-foreground/80 mb-8">
                Junte-se às empresas que já utilizam o Gauge-Pro para contratações mais assertivas
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/cadastro">Solicitar Demo</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Link to="/ajuda">Falar com Vendas</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PublicLayout>
  );
}
