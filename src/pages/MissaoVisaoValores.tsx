import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { Target, Heart, Lightbulb, Lock, Award, Leaf, Handshake, Eye, Compass } from 'lucide-react';

const valores = [
  {
    icon: Target,
    titulo: 'Precisão Científica',
    descricao: 'Baseamos nossas decisões em metodologias validadas e dados comportamentais concretos, não em intuição ou achismos. Cada recomendação é fundamentada em ciência psicométrica.',
  },
  {
    icon: Handshake,
    titulo: 'Humanização Tecnológica',
    descricao: 'Acreditamos que tecnologia e IA devem potencializar - nunca substituir - a sensibilidade humana nos processos de recrutamento. O toque humano é inegociável.',
  },
  {
    icon: Lightbulb,
    titulo: 'Inovação Contínua',
    descricao: 'Estamos sempre à frente, antecipando tendências, desenvolvendo soluções proprietárias e aprimorando nossos métodos para entregar vantagens competitivas reais.',
  },
  {
    icon: Lock,
    titulo: 'Ética e Transparência',
    descricao: 'Tratamos dados com máximo rigor (LGPD), mantemos confidencialidade absoluta e operamos com transparência total em nossos processos e metodologias.',
  },
  {
    icon: Award,
    titulo: 'Excelência Profissional',
    descricao: 'Não aceitamos mediocridade. Investimos continuamente em capacitação, aperfeiçoamento técnico e domínio das melhores práticas globais em gestão de pessoas.',
  },
  {
    icon: Leaf,
    titulo: 'Impacto Transformador',
    descricao: 'Cada contratação bem-sucedida muda vidas - do profissional que encontra seu lugar ideal, da empresa que ganha um talento alinhado, e das equipes que se tornam mais coesas.',
  },
  {
    icon: Heart,
    titulo: 'Compromisso com Resultados',
    descricao: 'Nosso sucesso é medido pelo sucesso dos nossos clientes. Assumimos responsabilidade pelos resultados e trabalhamos incansavelmente para superar expectativas.',
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
        <section className="py-24">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              <motion.div
                {...fadeInUp}
                className="bg-card rounded-2xl shadow-soft p-8 md:p-10"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                  <Compass className="w-7 h-7 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Nossa Missão</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Transformar o recrutamento em ciência aplicada, conectando empresas e profissionais através de processos seletivos inteligentes, humanizados e baseados em evidências comportamentais, que reduzem erros de contratação e potencializam o desenvolvimento de equipes de alta performance.
                </p>
              </motion.div>

              <motion.div
                {...fadeInUp}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl shadow-soft p-8 md:p-10"
              >
                <div className="w-14 h-14 rounded-xl bg-secondary/10 flex items-center justify-center mb-6">
                  <Eye className="w-7 h-7 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Nossa Visão</h2>
                <p className="text-muted-foreground leading-relaxed text-lg">
                  Ser referência nacional em recrutamento e seleção inteligente até 2028, reconhecida pela excelência na avaliação comportamental e por revolucionar a forma como empresas e candidatos se encontram, através da integração harmoniosa entre inteligência artificial e gestão humana especializada.
                </p>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Valores */}
        <section className="py-24 bg-muted/30">
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

        {/* Propósito */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Nosso Propósito</h2>
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12 text-center">
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-6">
                  Acreditamos que <strong className="text-foreground">pessoas certas nos lugares certos</strong> não apenas constroem empresas mais fortes - elas constroem carreiras mais realizadas, equipes mais felizes e uma sociedade mais produtiva e harmoniosa.
                </p>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                  Nossa razão de existir é <strong className="text-foreground">reduzir o desperdício de potencial humano</strong> causado por contratações inadequadas, criando matches verdadeiros entre talentos e oportunidades.
                </p>
              </div>

              {/* Citação */}
              <motion.div
                {...fadeInUp}
                className="mt-12 text-center"
              >
                <blockquote className="relative">
                  <span className="text-6xl text-secondary/20 absolute -top-4 left-0">"</span>
                  <p className="text-2xl md:text-3xl font-semibold text-foreground italic px-8">
                    Não é sorte, é ciência.
                  </p>
                  <span className="text-6xl text-secondary/20 absolute -bottom-8 right-0">"</span>
                </blockquote>
                <p className="text-muted-foreground mt-8">
                  — RecrutaRS Consultoria e Gestão
                </p>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>
    </PublicLayout>
  );
}
