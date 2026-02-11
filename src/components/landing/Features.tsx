import { motion } from 'framer-motion';
import { Brain, Target, Users, Zap, Shield, BarChart3 } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'Avaliação Gauge-Pro',
    description: 'Teste comportamental científico que identifica o perfil comportamental dos candidatos.',
  },
  {
    icon: Target,
    title: 'Matching Inteligente',
    description: 'IA que cruza requisitos da vaga com perfil do candidato para encontrar o fit ideal.',
  },
  {
    icon: Users,
    title: 'Banco de Talentos',
    description: 'Acesse milhares de profissionais qualificados com filtros avançados.',
  },
  {
    icon: Zap,
    title: 'Processo Ágil',
    description: 'Reduza o tempo de contratação em até 60% com automações inteligentes.',
  },
  {
    icon: Shield,
    title: 'LGPD Compliant',
    description: 'Total conformidade com a Lei Geral de Proteção de Dados.',
  },
  {
    icon: BarChart3,
    title: 'Analytics Avançado',
    description: 'Dashboards completos para acompanhar métricas de recrutamento.',
  },
];

export function Features() {
  return (
    <section className="relative py-24 bg-muted/50">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Por que escolher a RecrutaRS?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Tecnologia de ponta para transformar seu processo de recrutamento e seleção.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-card rounded-2xl p-8 shadow-soft hover:shadow-medium transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-7 h-7 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {feature.title}
              </h3>
              <p className="text-muted-foreground">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
