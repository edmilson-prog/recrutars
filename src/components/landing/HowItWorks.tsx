import { motion } from 'framer-motion';
import { Building2, FileSearch, Brain, Handshake } from 'lucide-react';

const steps = [
  {
    icon: Building2,
    step: '01',
    title: 'Cadastre sua empresa',
    description: 'Crie sua conta em minutos e configure o perfil da sua empresa.',
  },
  {
    icon: FileSearch,
    step: '02',
    title: 'Publique suas vagas',
    description: 'Descreva as posições abertas e os requisitos que você busca.',
  },
  {
    icon: Brain,
    step: '03',
    title: 'Avalie candidatos',
    description: 'Envie testes comportamentais e receba análises detalhadas.',
  },
  {
    icon: Handshake,
    step: '04',
    title: 'Contrate o melhor',
    description: 'Encontre o candidato ideal com nosso matching inteligente.',
  },
];

export function HowItWorks() {
  return (
    <section className="py-24">
      <div className="container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Como funciona
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Quatro passos simples para revolucionar seu recrutamento.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              className="relative"
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-10 left-[calc(50%+32px)] w-[calc(100%-64px)] h-[2px] bg-gradient-to-r from-secondary to-secondary/30" />
              )}
              
              <div className="text-center">
                <div className="relative inline-flex mb-6">
                  <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center shadow-medium">
                    <item.icon className="w-10 h-10 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-secondary text-secondary-foreground text-sm font-bold flex items-center justify-center shadow-soft">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
