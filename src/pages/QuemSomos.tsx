import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { motion } from 'framer-motion';
import { Brain, Heart, LineChart, Target, Shield, Building2, User, Mail, MapPin, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const diferenciais = [
  {
    icon: Brain,
    titulo: 'Base Científica Sólida',
    descricao: 'Não trabalhamos com "achismos". Cada avaliação é fundamentada em metodologias validadas pela psicologia organizacional e ciência de dados.',
  },
  {
    icon: Heart,
    titulo: 'Tecnologia Humanizada',
    descricao: 'Usamos IA para processar dados e identificar padrões, mas mantemos o olhar humano especializado para interpretar contextos e nuances.',
  },
  {
    icon: LineChart,
    titulo: 'Dados que Falam',
    descricao: 'Nossos relatórios vão além de pontuações genéricas. Fornecemos insights acionáveis, identificamos red flags e destacamos potenciais.',
  },
  {
    icon: Target,
    titulo: 'Foco em Resultados',
    descricao: 'Não medimos sucesso por quantidade de currículos enviados, mas por qualidade dos matches e taxa de retenção das contratações.',
  },
  {
    icon: Shield,
    titulo: 'Conformidade LGPD',
    descricao: 'Tratamento ético e seguro de dados pessoais é prioridade absoluta. Todos os processos seguem rigorosamente a Lei Geral de Proteção de Dados.',
  },
];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { duration: 0.5 },
};

export default function QuemSomos() {
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
              Quem Somos
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-primary-foreground/80 max-w-3xl mx-auto mb-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              RecrutaRS Consultoria e Gestão
            </motion.p>
            <motion.p
              className="text-lg text-primary-foreground/70 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Conectando Talentos às Oportunidades.
            </motion.p>
          </div>
        </div>

        {/* Nossa História */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeInUp} className="max-w-4xl mx-auto">
              <h2 className="text-3xl font-bold text-foreground mb-8 text-center">Nossa História</h2>
              <div className="bg-card rounded-2xl shadow-soft p-8 md:p-12">
                <p className="text-muted-foreground text-lg leading-relaxed mb-6">
                  A <strong className="text-foreground">RecrutaRS</strong> nasceu da necessidade de transformar o mercado de recrutamento e seleção brasileiro, trazendo metodologia científica para um processo que historicamente dependia de intuição e "feeling".
                </p>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Fundada em <strong className="text-foreground">Frederico Westphalen, Rio Grande do Sul</strong>, sob a liderança da CEO <strong className="text-foreground">Andréia Carina Marion Galdoni</strong>, a RecrutaRS representa uma nova geração de consultorias de RH: aquelas que entendem que <em>tecnologia e humanização não são opostos, mas aliados poderosos</em>.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Problema e Solução */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <motion.div
                {...fadeInUp}
                className="bg-card rounded-2xl shadow-soft p-8"
              >
                <h3 className="text-2xl font-bold text-foreground mb-6">O Problema que Resolvemos</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Você sabia que <strong className="text-foreground">erros de contratação custam às empresas brasileiras milhões de reais por ano?</strong>
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Turnover prematuro, baixa produtividade, conflitos de equipe e retrabalho são apenas algumas das consequências de processos seletivos baseados apenas em currículos e entrevistas convencionais.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Do outro lado, <strong className="text-foreground">profissionais talentosos perdem oportunidades ideais</strong> porque seus perfis comportamentais não foram adequadamente avaliados.
                </p>
              </motion.div>

              <motion.div
                {...fadeInUp}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl shadow-soft p-8"
              >
                <h3 className="text-2xl font-bold text-foreground mb-6">Nossa Solução</h3>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Desenvolvemos uma <strong className="text-foreground">metodologia proprietária de avaliação comportamental</strong> que vai além do currículo tradicional. Combinamos:
                </p>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3">
                    <Brain className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground"><strong className="text-foreground">Ciência Psicométrica</strong> - Metodologias cientificamente validadas</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <LineChart className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground"><strong className="text-foreground">Inteligência Artificial</strong> - Análise preditiva e matching inteligente</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Heart className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground"><strong className="text-foreground">Expertise Humana</strong> - Interpretação sensível e contextualizada</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Target className="w-5 h-5 text-secondary mt-1 flex-shrink-0" />
                    <span className="text-muted-foreground"><strong className="text-foreground">5 Dimensões Comportamentais</strong> - Sistema exclusivo adaptado ao Brasil</span>
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Diferenciais */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Nossos Diferenciais</h2>
              <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                O que nos torna únicos no mercado de recrutamento e seleção
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {diferenciais.map((item, index) => (
                <motion.div
                  key={item.titulo}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-card rounded-2xl shadow-soft p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                    <item.icon className="w-6 h-6 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">{item.titulo}</h3>
                  <p className="text-muted-foreground leading-relaxed">{item.descricao}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Para Quem Trabalhamos */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-16">
              <h2 className="text-3xl font-bold text-foreground mb-4">Para Quem Trabalhamos</h2>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div
                {...fadeInUp}
                className="bg-card rounded-2xl shadow-soft p-8"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <Building2 className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Empresas</h3>
                <p className="text-muted-foreground mb-4">De pequenos negócios a grandes corporações que buscam:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                    Reduzir tempo e custo de recrutamento
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                    Diminuir turnover e aumentar retenção
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                    Construir equipes mais alinhadas e produtivas
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                    Ter dados concretos para decisões
                  </li>
                </ul>
              </motion.div>

              <motion.div
                {...fadeInUp}
                transition={{ delay: 0.1 }}
                className="bg-card rounded-2xl shadow-soft p-8"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <User className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="text-2xl font-semibold text-foreground mb-4">Profissionais</h3>
                <p className="text-muted-foreground mb-4">Candidatos que desejam:</p>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                    Encontrar vagas compatíveis com seu perfil
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                    Entender suas características comportamentais
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                    Destacar-se de forma estratégica no mercado
                  </li>
                  <li className="flex items-center gap-2 text-muted-foreground">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                    Construir carreiras mais satisfatórias
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Compromisso */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeInUp} className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-8">Nosso Compromisso</h2>
              <div className="bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl p-8 md:p-12">
                <p className="text-lg text-muted-foreground leading-relaxed mb-8">
                  Na RecrutaRS, acreditamos que <strong className="text-foreground">contratações bem-sucedidas transformam vidas</strong>. Quando o profissional certo encontra a empresa certa, todos ganham.
                </p>
                <div className="grid sm:grid-cols-2 gap-4 text-left max-w-2xl mx-auto">
                  <div className="flex items-center gap-3 text-foreground">
                    <span className="text-success text-xl">✓</span>
                    O profissional trabalha motivado e engajado
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <span className="text-success text-xl">✓</span>
                    A empresa alcança resultados superiores
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <span className="text-success text-xl">✓</span>
                    As equipes funcionam de forma harmoniosa
                  </div>
                  <div className="flex items-center gap-3 text-foreground">
                    <span className="text-success text-xl">✓</span>
                    Ambientes de trabalho mais saudáveis
                  </div>
                </div>
                <p className="text-xl font-semibold text-foreground mt-8">
                  Esse é o futuro que estamos construindo - uma contratação de cada vez.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Liderança */}
        <section className="py-24 bg-muted/30">
          <div className="container">
            <motion.div {...fadeInUp} className="text-center mb-12">
              <h2 className="text-3xl font-bold text-foreground mb-4">Conheça Nossa Liderança</h2>
            </motion.div>

            <motion.div
              {...fadeInUp}
              className="max-w-3xl mx-auto bg-card rounded-2xl shadow-soft p-8 md:p-12"
            >
              <div className="flex flex-col md:flex-row gap-8 items-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-4xl font-bold text-white">ACG</span>
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">Andréia Carina Marion Galdoni</h3>
                  <p className="text-secondary font-medium mb-4">CEO & Fundadora</p>
                  <p className="text-muted-foreground leading-relaxed">
                    Especialista em Gestão de Pessoas e Recrutamento Estratégico, Andréia lidera a RecrutaRS com o propósito de tornar os processos de recrutamento mais acessíveis, estruturados e estratégicos para as empresas. Atua no desenvolvimento de soluções que fortalecem processos de contratação mais eficientes, éticos e alinhados às necessidades das empresas e valorizando o respeito, a escuta e a experiência dos candidatos em cada etapa da jornada profissional.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Contato */}
        <section className="py-24">
          <div className="container">
            <motion.div {...fadeInUp} className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">Junte-se a Nós</h2>
              <p className="text-lg text-muted-foreground mb-8">
                Seja você uma <strong className="text-foreground">empresa buscando os melhores talentos</strong> ou um <strong className="text-foreground">profissional em busca da oportunidade ideal</strong>, a RecrutaRS está pronta para conectar você ao seu futuro.
              </p>

              <div className="bg-card rounded-2xl shadow-soft p-8 mb-8">
                <p className="text-2xl font-semibold text-secondary mb-8">
                  Porque aqui, não é sorte. É ciência.
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                  <Button asChild size="lg">
                    <Link to="/cadastro">Criar conta gratuita</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/como-funciona">Saiba mais</Link>
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-6 text-muted-foreground">
                  <div className="flex items-center gap-2 justify-center">
                    <MapPin className="w-5 h-5 text-secondary" />
                    <span>Frederico Westphalen - RS</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Mail className="w-5 h-5 text-secondary" />
                    <span>contato@recrutars.com.br</span>
                  </div>
                  <div className="flex items-center gap-2 justify-center">
                    <Globe className="w-5 h-5 text-secondary" />
                    <span>www.recrutars.com.br</span>
                  </div>
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
