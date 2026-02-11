import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { Target, Heart, Lightbulb, Lock, Award, Handshake } from 'lucide-react';

const valores = [
  {
    icon: Heart,
    titulo: 'Valorização das pessoas',
    descricao: 'Colocamos as pessoas no centro de tudo. Cada decisão é pensada para promover o bem-estar, o desenvolvimento e a realização profissional de candidatos e colaboradores.',
  },
  {
    icon: Lock,
    titulo: 'Ética e responsabilidade',
    descricao: 'Atuamos com integridade, transparência e respeito à legislação. Tratamos dados com rigor (LGPD) e mantemos confidencialidade absoluta em todos os processos.',
  },
  {
    icon: Lightbulb,
    titulo: 'Inovação prática',
    descricao: 'Buscamos soluções tecnológicas que resolvem problemas reais, simplificam processos e geram valor concreto para empresas e profissionais.',
  },
  {
    icon: Target,
    titulo: 'Compromisso com resultados',
    descricao: 'Nosso sucesso é medido pelo sucesso dos nossos clientes. Assumimos responsabilidade pelos resultados e trabalhamos para superar expectativas.',
  },
  {
    icon: Award,
    titulo: 'Conhecimento e atualização contínua',
    descricao: 'Investimos continuamente em capacitação, aperfeiçoamento técnico e domínio das melhores práticas em gestão de pessoas, recrutamento e conformidade trabalhista.',
  },
  {
    icon: Handshake,
    titulo: 'Parceria com o cliente',
    descricao: 'Construímos relações de confiança e colaboração de longo prazo, entendendo as necessidades de cada cliente para entregar soluções sob medida.',
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function MissaoVisaoValores() {
  return (
    <PublicLayout>
      <div className="min-h-screen pb-12">
        <Header />

        {/* Hero */}
        <div className="pt-20 gradient-hero min-h-[50vh] flex items-center">
          <div className="container py-16 text-center text-primary-foreground">
            <motion.h1
              className="text-4xl md:text-5xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Missão, Visão e Valores
            </motion.h1>
            <motion.p
              className="text-xl text-primary-foreground/80 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              Conectando Talentos, Construindo Futuros
            </motion.p>
          </div>
        </div>

        {/* Missão e Visão */}
        <section className="relativepy-24">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <motion.div
                {...fadeInUp}
                className="bg-card rounded-2xl shadow-soft p-8 md:p-10"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                  <Target className="w-7 h-7 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Nossa Missão</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Conectar empresas e pessoas por meio de soluções inteligentes em recrutamento, gestão de pessoas, qualificação profissional e apoio à conformidade trabalhista, promovendo ambientes de trabalho seguros, saudáveis e produtivos para todos.
                </p>
              </motion.div>

              <motion.div
                {...fadeInUp}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl shadow-soft p-8 md:p-10"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                  <Lightbulb className="w-7 h-7 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Nossa Visão</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Ser referência nacional em soluções digitais de RH, reconhecida pela inovação, ética e impacto positivo na gestão de pessoas e na prevenção de riscos organizacionais.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="relativepy-24 bg-muted/30">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Nossos Valores</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                Os princípios que guiam cada decisão e ação da RecrutaRS
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
              {valores.map((valor, index) => (
                <motion.div
                  key={valor.titulo}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className="bg-card rounded-2xl shadow-soft p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
                    <valor.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{valor.titulo}</h3>
                  <p className="text-muted-foreground leading-relaxed">{valor.descricao}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <Footer />
      </div>
    </PublicLayout>
  );
}
