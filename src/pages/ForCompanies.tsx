import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Building2,
  Target,
  Clock,
  TrendingDown,
  Briefcase,
  Brain,
  Users,
  Calendar,
  MessageSquare,
  BarChart3,
  Sparkles,
  FileText,
  Heart,
  GitCompare,
  Download,
  ArrowRight,
  CheckCircle2,
  Star,
} from 'lucide-react';

const stats = [
  { value: '+1.200', label: 'Empresas ativas', icon: Building2 },
  { value: '78%', label: 'Taxa de match', icon: Target },
  { value: '-60%', label: 'Tempo de contratação', icon: Clock },
  { value: '-50%', label: 'Redução de turnover', icon: TrendingDown },
];

const features = [
  {
    icon: Briefcase,
    title: 'Gestão de Vagas Completa',
    description: 'Publique, edite e gerencie todas as suas vagas em um só lugar com interface intuitiva e controle total do processo seletivo.',
  },
  {
    icon: Brain,
    title: 'Teste Comportamental Gauge-Pro',
    description: 'Avaliação comportamental científica que revela o perfil dos candidatos, garantindo contratações mais assertivas.',
  },
  {
    icon: Users,
    title: 'Banco de Talentos',
    description: 'Acesse um banco com milhares de profissionais qualificados e pré-avaliados, prontos para suas oportunidades.',
  },
  {
    icon: Calendar,
    title: 'Agendamento Integrado',
    description: 'Agende entrevistas diretamente pela plataforma com sincronização de calendário e notificações automáticas.',
  },
  {
    icon: MessageSquare,
    title: 'Central de Mensagens',
    description: 'Comunicação centralizada com candidatos, templates de mensagens e histórico completo de conversas.',
  },
  {
    icon: BarChart3,
    title: 'Dashboard e Analytics',
    description: 'Métricas em tempo real sobre suas vagas, candidaturas, tempo de contratação e performance do recrutamento.',
  },
];

const aiFeatures = [
  {
    icon: Sparkles,
    title: 'Recomendação de Candidatos',
    description: 'Nossa IA analisa o perfil da vaga e sugere automaticamente os candidatos mais compatíveis do banco de talentos.',
    highlight: 'Powered by AI',
  },
  {
    icon: FileText,
    title: 'Assistente de Redação de Vagas',
    description: 'Crie descrições de vagas profissionais e atrativas com ajuda da inteligência artificial em segundos.',
    highlight: 'Powered by AI',
  },
];

const advancedTools = [
  {
    icon: Heart,
    title: 'Candidatos Favoritos',
    description: 'Salve candidatos interessantes para avaliar posteriormente e monte seu banco de talentos personalizado.',
  },
  {
    icon: GitCompare,
    title: 'Comparar Candidatos',
    description: 'Compare perfis lado a lado com gráficos de compatibilidade e análise de competências.',
  },
  {
    icon: Download,
    title: 'Exportar Dados',
    description: 'Exporte relatórios, currículos e dados de candidatos em diversos formatos para suas análises.',
  },
];

const steps = [
  { step: '01', title: 'Cadastre', description: 'Crie sua conta empresarial gratuitamente' },
  { step: '02', title: 'Publique', description: 'Adicione suas vagas com perfil comportamental' },
  { step: '03', title: 'Receba', description: 'Candidatos compatíveis se candidatam' },
  { step: '04', title: 'Avalie', description: 'Analise resultados do teste comportamental Gauge-Pro' },
  { step: '05', title: 'Agende', description: 'Entrevistas integradas na plataforma' },
  { step: '06', title: 'Contrate', description: 'O candidato ideal para sua equipe' },
];

const plansPreview = [
  {
    name: 'Starter',
    price: 'Grátis',
    highlight: '2 vagas ativas',
    features: ['Até 2 vagas simultâneas', '50 candidatos/mês', 'Dashboard básico', 'Suporte por email'],
    popular: false,
  },
  {
    name: 'Professional',
    price: 'R$ 299',
    period: '/mês',
    highlight: '10 vagas + Testes ilimitados',
    features: ['Até 10 vagas simultâneas', 'Candidatos ilimitados', 'Testes comportamentais ilimitados', 'Recomendação por IA', 'Suporte prioritário'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Personalizado',
    highlight: 'Vagas ilimitadas + API',
    features: ['Vagas ilimitadas', 'API de integração', 'Gerente de conta dedicado', 'SLA garantido', 'Treinamento personalizado'],
    popular: false,
  },
];

const testimonials = [
  {
    name: 'Marcelo Oliveira',
    role: 'Diretor de RH',
    company: 'TechSolutions Brasil',
    content: 'A RecrutaRS revolucionou nosso processo seletivo. Reduzimos o tempo de contratação em 65% e a assertividade aumentou significativamente com os testes comportamentais.',
  },
  {
    name: 'Fernanda Costa',
    role: 'Gerente de Pessoas',
    company: 'Indústria Gaúcha',
    content: 'Finalmente encontramos uma plataforma que entende as necessidades das empresas do RS. O suporte é excepcional e a qualidade dos candidatos é impressionante.',
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function ForCompanies() {
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
              <Building2 className="w-8 h-8" />
            </motion.div>
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Para Empresas
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-primary-foreground/80 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Encontre os melhores talentos com avaliação comportamental científica
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button asChild size="lg" variant="secondary">
                <Link to="/cadastro">Cadastrar Empresa</Link>
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

        {/* Features */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Tudo que você precisa para recrutar melhor</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Uma plataforma completa com ferramentas profissionais para otimizar seu processo seletivo
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-2xl shadow-soft p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* AI Features */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Inteligência Artificial</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Recursos exclusivos com IA</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Tecnologia de ponta para acelerar e melhorar suas decisões de contratação
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {aiFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-2xl shadow-soft p-8 border border-secondary/20"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                      <feature.icon className="w-6 h-6 text-secondary" />
                    </div>
                    <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-medium">
                      {feature.highlight}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Como funciona</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Seis passos simples para encontrar o candidato ideal
              </p>
            </motion.div>

            <div className="flex flex-col md:flex-row justify-center items-center gap-4 md:gap-2 max-w-6xl mx-auto">
              {steps.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="flex items-center"
                >
                  <div className="text-center w-40">
                    <div className="w-14 h-14 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center mx-auto mb-3 text-xl font-bold">
                      {step.step}
                    </div>
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

        {/* Advanced Tools */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Ferramentas avançadas</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Recursos profissionais para gerenciar seu processo seletivo com eficiência
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {advancedTools.map((tool, index) => (
                <motion.div
                  key={tool.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-2xl shadow-soft p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <tool.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{tool.title}</h3>
                  <p className="text-sm text-muted-foreground">{tool.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Plans Preview */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Planos para cada necessidade</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Escolha o plano ideal para o tamanho da sua empresa
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {plansPreview.map((plan, index) => (
                <motion.div
                  key={plan.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className={`bg-card rounded-2xl shadow-soft p-6 relative ${
                    plan.popular ? 'border-2 border-secondary ring-4 ring-secondary/10' : ''
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
                      {plan.period && <span className="text-lg font-normal text-muted-foreground">{plan.period}</span>}
                    </div>
                    <p className="text-sm text-secondary mt-1">{plan.highlight}</p>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              ))}
            </div>

            <motion.div {...fadeInUp} className="text-center mt-8">
              <Button asChild size="lg">
                <Link to="/planos">Ver todos os planos</Link>
              </Button>
            </motion.div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">O que nossos clientes dizem</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Empresas que transformaram seu recrutamento com a RecrutaRS
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-2xl shadow-soft p-8"
                >
                  <p className="text-muted-foreground leading-relaxed mb-6 italic">"{testimonial.content}"</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <span className="text-lg font-bold text-white">
                        {testimonial.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role} - {testimonial.company}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 gradient-hero">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center text-primary-foreground max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Pronto para contratar melhor?</h2>
              <p className="text-xl text-primary-foreground/80 mb-8">
                Junte-se a mais de 1.200 empresas que já transformaram seu processo seletivo
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/cadastro">Cadastrar Empresa</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Link to="/ajuda">Falar com Especialista</Link>
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
