import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Sparkles,
  Database,
  Brain,
  Shield,
  Mail,
  Phone,
  CircleCheck,
} from 'lucide-react';

// Dados estáticos
const passosEmpresas = [
  {
    numero: 1,
    titulo: 'Cadastro e Perfil da Empresa',
    descricao:
      'Crie sua conta empresarial e complete o perfil com informações sobre cultura organizacional, valores e ambiente de trabalho. Quanto mais detalhado, melhores serão os matches.',
  },
  {
    numero: 2,
    titulo: 'Publicação de Vagas',
    descricao:
      'Publique suas oportunidades detalhando requisitos técnicos e, principalmente, o perfil comportamental ideal para a posição. Nossa plataforma guia você nesse processo.',
  },
  {
    numero: 3,
    titulo: 'Matching Inteligente',
    descricao:
      'Nosso algoritmo cruza dados comportamentais, técnicos e culturais para apresentar os candidatos mais compatíveis com cada vaga, economizando tempo e recursos.',
  },
  {
    numero: 4,
    titulo: 'Análise de Candidatos',
    descricao:
      'Acesse relatórios comportamentais completos de cada candidato, visualize o percentual de compatibilidade e compare perfis lado a lado.',
  },
  {
    numero: 5,
    titulo: 'Processo Seletivo',
    descricao:
      'Gerencie entrevistas, feedbacks e etapas do processo diretamente na plataforma. Comunique-se com candidatos de forma centralizada.',
  },
  {
    numero: 6,
    titulo: 'Contratação e Acompanhamento',
    descricao:
      'Efetue a contratação e acompanhe métricas de retenção e satisfação. Aprenda com cada processo para melhorar continuamente.',
  },
];

const passosCandidatos = [
  {
    numero: 1,
    titulo: 'Criação de Perfil',
    descricao:
      'Cadastre-se gratuitamente e monte seu perfil profissional completo. Adicione experiências, formação, habilidades e objetivos de carreira.',
  },
  {
    numero: 2,
    titulo: 'Avaliação Comportamental',
    descricao:
      'Complete nosso teste comportamental científico (15-20 minutos). Baseado em metodologias validadas como Big Five e outras referências científicas, ele revela seu perfil único.',
  },
  {
    numero: 3,
    titulo: 'Receba seu Relatório',
    descricao:
      'Obtenha um relatório detalhado sobre seu perfil comportamental, pontos fortes, áreas de desenvolvimento e ambientes de trabalho ideais para você.',
  },
  {
    numero: 4,
    titulo: 'Vagas Recomendadas',
    descricao:
      'Nossa IA sugere vagas compatíveis com seu perfil técnico e comportamental. Você visualiza o percentual de match com cada oportunidade.',
  },
  {
    numero: 5,
    titulo: 'Candidatura Estratégica',
    descricao:
      'Candidate-se às vagas com um clique. Empresas já recebem seu relatório comportamental, aumentando suas chances de ser chamado.',
  },
  {
    numero: 6,
    titulo: 'Acompanhamento e Feedback',
    descricao:
      'Receba atualizações sobre suas candidaturas em tempo real. Obtenha feedback das empresas e aprimore seu perfil continuamente.',
  },
];

const tecnologias = [
  {
    icon: Sparkles,
    titulo: 'Inteligência Artificial',
    descricao:
      'Algoritmos de machine learning analisam padrões comportamentais e profissionais para encontrar os matches perfeitos.',
    cor: 'amber',
  },
  {
    icon: Database,
    titulo: 'Big Data',
    descricao:
      'Processamos milhares de dados para identificar tendências do mercado e otimizar recomendações.',
    cor: 'violet',
  },
  {
    icon: Brain,
    titulo: 'Ciência Psicométrica',
    descricao:
      'Testes validados internacionalmente garantem avaliações confiáveis e insights precisos sobre comportamento.',
    cor: 'sky',
  },
  {
    icon: Shield,
    titulo: 'Segurança LGPD',
    descricao:
      'Criptografia de ponta a ponta e conformidade total com a Lei Geral de Proteção de Dados.',
    cor: 'yellow',
  },
];

const beneficios = [
  {
    texto: 'Redução de até 70% no tempo de recrutamento',
    destaque: 'Menos currículos irrelevantes, mais candidatos qualificados',
  },
  {
    texto: 'Diminuição de turnover em até 50%',
    destaque: 'Matches comportamentais reduzem incompatibilidades culturais',
  },
  {
    texto: 'Aumento de 85% na satisfação',
    destaque: 'Candidatos se sentem valorizados, empresas contratam com confiança',
  },
  {
    texto: 'Decisões baseadas em dados',
    destaque: 'Menos intuição, mais ciência; menos risco, mais assertividade',
  },
];

// Componente para os passos numerados
interface PassoItemProps {
  numero: number;
  titulo: string;
  descricao: string;
  delay?: number;
  isLast?: boolean;
}

const PassoItem = ({ numero, titulo, descricao, delay = 0, isLast = false }: PassoItemProps) => (
  <motion.div
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5, delay }}
    className="flex gap-4 relative"
  >
    {/* Linha vertical conectora */}
    {!isLast && <div className="absolute left-5 top-12 bottom-0 w-0.5 bg-border" />}

    {/* Badge numerado */}
    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm flex-shrink-0 z-10">
      {numero}
    </div>

    {/* Conteúdo */}
    <div className="flex-1 pb-8">
      <h4 className="font-semibold text-foreground mb-1">{titulo}</h4>
      <p className="text-muted-foreground text-sm leading-relaxed">{descricao}</p>
    </div>
  </motion.div>
);

// Componente para cards de tecnologia
interface TecnologiaCardProps {
  icon: React.ElementType;
  titulo: string;
  descricao: string;
  cor: string;
  delay?: number;
}

const TecnologiaCard = ({ icon: Icon, titulo, descricao, cor, delay = 0 }: TecnologiaCardProps) => {
  const corClasses: Record<string, { border: string; bg: string; text: string }> = {
    amber: {
      border: 'border-l-amber-500',
      bg: 'bg-amber-500/10',
      text: 'text-amber-500',
    },
    violet: {
      border: 'border-l-violet-500',
      bg: 'bg-violet-500/10',
      text: 'text-violet-500',
    },
    sky: {
      border: 'border-l-sky-500',
      bg: 'bg-sky-500/10',
      text: 'text-sky-500',
    },
    yellow: {
      border: 'border-l-yellow-500',
      bg: 'bg-yellow-500/10',
      text: 'text-yellow-500',
    },
  };

  const classes = corClasses[cor] || corClasses.amber;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      className={`bg-card rounded-xl p-5 border-l-4 ${classes.border} shadow-sm hover:shadow-md transition-shadow`}
    >
      <div className="flex items-start gap-4">
        <div className={`w-10 h-10 rounded-lg ${classes.bg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${classes.text}`} />
        </div>
        <div>
          <h4 className="font-semibold text-foreground mb-1">{titulo}</h4>
          <p className="text-muted-foreground text-sm">{descricao}</p>
        </div>
      </div>
    </motion.div>
  );
};

export default function HowItWorksPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen">
        <Header />

        {/* Hero Section */}
        <div className="pt-20 gradient-hero min-h-[40vh] flex items-center">
          <div className="container py-16 text-center text-primary-foreground">
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              Como Funciona
            </motion.h1>
            <motion.p
              className="text-xl text-primary-foreground/80 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              Conectando talentos e empresas de forma inteligente
            </motion.p>
          </div>
        </div>

        {/* Card de Introdução */}
        <section className="py-12">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto bg-secondary/10 rounded-2xl p-8 text-center"
            >
              <p className="text-lg text-foreground leading-relaxed">
                A plataforma RecrutaRS utiliza{' '}
                <strong>inteligência artificial e ciência comportamental</strong> para conectar
                candidatos e empresas de forma mais eficiente e assertiva. Nosso processo é simples,
                transparente e focado em resultados.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Seção Para Empresas */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Para Empresas</h2>
              </motion.div>

              <div className="pl-2">
                {passosEmpresas.map((passo, index) => (
                  <PassoItem
                    key={passo.numero}
                    numero={passo.numero}
                    titulo={passo.titulo}
                    descricao={passo.descricao}
                    delay={index * 0.1}
                    isLast={index === passosEmpresas.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Seção Para Candidatos */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Para Candidatos</h2>
              </motion.div>

              <div className="pl-2">
                {passosCandidatos.map((passo, index) => (
                  <PassoItem
                    key={passo.numero}
                    numero={passo.numero}
                    titulo={passo.titulo}
                    descricao={passo.descricao}
                    delay={index * 0.1}
                    isLast={index === passosCandidatos.length - 1}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Seção Nossa Tecnologia */}
        <section className="py-16">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Nossa Tecnologia
                </h2>
                <p className="text-muted-foreground">
                  Combinamos as melhores práticas de tecnologia e psicologia organizacional
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-4">
                {tecnologias.map((tech, index) => (
                  <TecnologiaCard
                    key={tech.titulo}
                    icon={tech.icon}
                    titulo={tech.titulo}
                    descricao={tech.descricao}
                    cor={tech.cor}
                    delay={index * 0.1}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Seção Por Que Funciona */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center mb-10"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                  Por Que Funciona?
                </h2>
                <p className="text-muted-foreground">
                  Resultados comprovados que fazem a diferença
                </p>
              </motion.div>

              <div className="space-y-4">
                {beneficios.map((beneficio, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="flex items-start gap-4 bg-card rounded-xl p-5"
                  >
                    <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <CircleCheck className="w-5 h-5 text-green-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground mb-1">{beneficio.texto}</h4>
                      <p className="text-muted-foreground text-sm">{beneficio.destaque}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="max-w-4xl mx-auto text-center"
            >
              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Pronto para Começar?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Junte-se a milhares de empresas e candidatos que já transformaram seu processo de
                recrutamento com a RecrutaRS.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg">
                  <Link to="/cadastro">Criar Conta Grátis</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/quem-somos">Conhecer a RecrutaRS</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contato Section */}
        <section className="py-12 border-t">
          <div className="container">
            <div className="max-w-4xl mx-auto text-center">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
              >
                <h3 className="text-lg font-semibold text-foreground mb-4">Ficou com dúvidas?</h3>
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <a
                    href="mailto:contato@recrutars.com.br"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Mail className="w-5 h-5" />
                    contato@recrutars.com.br
                  </a>
                  <a
                    href="tel:+5555999355232"
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                  >
                    <Phone className="w-5 h-5" />
                    (55) 99935-5232
                  </a>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PublicLayout>
  );
}
