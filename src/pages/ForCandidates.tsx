import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  User,
  Gift,
  Briefcase,
  Clock,
  Zap,
  FileUser,
  Files,
  Upload,
  Search,
  Heart,
  Bell,
  Sparkles,
  Compass,
  Trophy,
  Medal,
  Flame,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

const benefits = [
  { value: '100%', label: 'Gratuito para candidatos', icon: Gift },
  { value: '+50.000', label: 'Vagas disponíveis', icon: Briefcase },
  { value: '15min', label: 'Tempo do teste', icon: Clock },
  { value: 'Grátis', label: 'Resultado imediato', icon: Zap },
];

const behavioralDimensions = [
  { letter: 'D', name: 'Dominância', color: 'bg-red-500', description: 'Foco em resultados e desafios' },
  { letter: 'I', name: 'Influência', color: 'bg-yellow-500', description: 'Comunicação e entusiasmo' },
  { letter: 'S', name: 'Estabilidade', color: 'bg-green-500', description: 'Cooperação e paciência' },
  { letter: 'C', name: 'Conformidade', color: 'bg-blue-500', description: 'Precisão e qualidade' },
];

const features = [
  {
    icon: FileUser,
    title: 'Perfil Profissional Completo',
    description: 'Crie um perfil detalhado com experiências, habilidades e objetivos para se destacar nas candidaturas.',
  },
  {
    icon: Files,
    title: 'Múltiplos Currículos',
    description: 'Gerencie diferentes versões de currículo para diferentes tipos de vagas e oportunidades.',
  },
  {
    icon: Upload,
    title: 'Parser Inteligente de CV',
    description: 'Faça upload do seu currículo e deixe nossa IA preencher automaticamente seu perfil.',
  },
  {
    icon: Search,
    title: 'Busca Avançada de Vagas',
    description: 'Encontre oportunidades com filtros por localização, salário, regime de trabalho e muito mais.',
  },
  {
    icon: Heart,
    title: 'Vagas Favoritas',
    description: 'Salve vagas interessantes para se candidatar depois e acompanhe as que mais combinam com você.',
  },
  {
    icon: Bell,
    title: 'Notificações em Tempo Real',
    description: 'Receba alertas instantâneos sobre novas vagas, atualizações de candidaturas e mensagens.',
  },
];

const aiFeatures = [
  {
    icon: Sparkles,
    title: 'Vagas Recomendadas por IA',
    description: 'Nossa inteligência artificial analisa seu perfil e sugere as vagas mais compatíveis para você.',
    highlight: 'Powered by AI',
  },
  {
    icon: Compass,
    title: 'Análise de Fit Cultural',
    description: 'Descubra o quanto você se encaixa na cultura de cada empresa antes de se candidatar.',
    highlight: 'Powered by AI',
  },
];

const gamification = [
  {
    icon: Trophy,
    title: 'Pontos de Experiência (XP)',
    description: 'Ganhe pontos ao completar seu perfil, fazer testes e se candidatar a vagas.',
  },
  {
    icon: Medal,
    title: 'Badges e Conquistas',
    description: 'Desbloqueie badges especiais que destacam seu perfil para os recrutadores.',
  },
  {
    icon: Flame,
    title: 'Streak de Atividade',
    description: 'Mantenha sua sequência de dias ativos e aumente sua visibilidade na plataforma.',
  },
];

const steps = [
  { step: '01', title: 'Cadastre-se', description: 'Crie sua conta gratuita em minutos' },
  { step: '02', title: 'Complete', description: 'Preencha seu perfil profissional' },
  { step: '03', title: 'Teste', description: 'Faça o Gauge-Pro gratuitamente' },
  { step: '04', title: 'Receba', description: 'Vagas recomendadas pelo seu perfil' },
  { step: '05', title: 'Candidate-se', description: 'Com apenas um clique' },
  { step: '06', title: 'Acompanhe', description: 'Status em tempo real' },
];

const testimonials = [
  {
    name: 'Lucas Fernandes',
    role: 'Desenvolvedor Full Stack',
    content: 'O teste comportamental me ajudou a entender melhor meu perfil profissional. Consegui meu emprego atual em menos de um mês usando a RecrutaRS!',
  },
  {
    name: 'Juliana Mendes',
    role: 'Analista de Marketing',
    content: 'A plataforma é super intuitiva e as recomendações de vagas são muito precisas. Recebi várias propostas de empresas que realmente combinavam comigo.',
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function ForCandidates() {
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
              <User className="w-8 h-8" />
            </motion.div>
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Para Candidatos
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-primary-foreground/80 max-w-3xl mx-auto mb-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Descubra seu perfil comportamental e encontre a vaga ideal para você
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Button asChild size="lg" variant="secondary">
                <Link to="/cadastro">Criar Conta Grátis</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                <Link to="/como-funciona">Conhecer Teste Comportamental</Link>
              </Button>
            </motion.div>
          </div>
        </div>

        {/* Benefits */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={benefit.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                    <benefit.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">{benefit.value}</p>
                  <p className="text-sm text-muted-foreground">{benefit.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Behavioral Section */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Descubra seu perfil com o Teste Comportamental</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                O Gauge-Pro revela suas características comportamentais em 5 dimensões
              </p>
            </motion.div>

            <motion.div
              {...fadeInUp}
              className="max-w-4xl mx-auto bg-card rounded-2xl shadow-soft p-8 md:p-12"
            >
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                {behavioralDimensions.map((dim, index) => (
                  <motion.div
                    key={dim.letter}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`w-16 h-16 rounded-2xl ${dim.color} flex items-center justify-center mx-auto mb-3`}>
                      <span className="text-2xl font-bold text-white">{dim.letter}</span>
                    </div>
                    <h4 className="font-semibold text-foreground mb-1">{dim.name}</h4>
                    <p className="text-sm text-muted-foreground">{dim.description}</p>
                  </motion.div>
                ))}
              </div>

              <div className="text-center">
                <p className="text-muted-foreground mb-6">
                  O teste leva apenas <strong className="text-foreground">15 minutos</strong> e você recebe o resultado imediatamente
                </p>
                <Button asChild size="lg">
                  <Link to="/cadastro">Fazer o Teste Agora</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Recursos para impulsionar sua carreira</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Ferramentas gratuitas para você se destacar no mercado de trabalho
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
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary mb-4">
                <Sparkles className="w-4 h-4" />
                <span className="text-sm font-medium">Inteligência Artificial</span>
              </div>
              <h2 className="text-3xl font-bold text-foreground mb-4">IA trabalhando por você</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Nossa tecnologia encontra as melhores oportunidades para o seu perfil
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
        <section className="py-24 bg-muted/30">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Como funciona</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Seis passos simples para encontrar sua vaga ideal
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

        {/* Gamification */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Gamificação que recompensa</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Quanto mais você usa a plataforma, mais benefícios você ganha
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {gamification.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-2xl shadow-soft p-6 text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                    <item.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Histórias de sucesso</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Candidatos que encontraram o emprego dos sonhos com a RecrutaRS
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
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
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
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Comece sua jornada agora</h2>
              <p className="text-xl text-primary-foreground/80 mb-2">
                100% gratuito. Sem cartão de crédito.
              </p>
              <p className="text-primary-foreground/70 mb-8">
                Descubra seu perfil comportamental e encontre vagas que combinam com você
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" variant="secondary">
                  <Link to="/cadastro">Criar Conta Grátis</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
                  <Link to="/candidato/vagas">Explorar Vagas</Link>
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
