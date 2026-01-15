import { Header } from '@/components/landing/Header';
import { Footer } from '@/components/landing/Footer';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';
import { motion } from 'framer-motion';

const plans = [
  {
    name: 'Starter',
    price: 'Grátis',
    description: 'Para empresas que estão começando',
    features: [
      'Até 2 vagas ativas',
      '10 candidatos/mês',
      'Dashboard básico',
      'Suporte por email',
    ],
    cta: 'Começar grátis',
    popular: false,
  },
  {
    name: 'Professional',
    price: 'R$ 299',
    period: '/mês',
    description: 'Para empresas em crescimento',
    features: [
      'Até 10 vagas ativas',
      '100 candidatos/mês',
      'Testes comportamentais ilimitados',
      'Banco de talentos completo',
      'Analytics avançado',
      'Suporte prioritário',
    ],
    cta: 'Começar teste grátis',
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 'Personalizado',
    description: 'Para grandes empresas',
    features: [
      'Vagas ilimitadas',
      'Candidatos ilimitados',
      'API de integração',
      'Gerente de conta dedicado',
      'SLA garantido',
      'Treinamento personalizado',
    ],
    cta: 'Falar com vendas',
    popular: false,
  },
];

export default function PlansPage() {
  return (
    <PublicLayout>
      <div className="min-h-screen pb-12">
        <Header />
        <div className="pt-20 gradient-hero min-h-[40vh] flex items-center">
          <div className="container py-16 text-center text-primary-foreground">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Planos e Preços</h1>
            <p className="text-xl text-primary-foreground/80 max-w-2xl mx-auto">
              Escolha o plano ideal para sua empresa
            </p>
          </div>
        </div>
        <div className="container py-24">
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-card rounded-2xl p-8 shadow-soft relative ${
                  plan.popular ? 'border-2 border-secondary ring-4 ring-secondary/20' : 'border border-border'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-secondary text-secondary-foreground text-sm font-medium rounded-full">
                    Mais popular
                  </span>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-xl font-semibold text-foreground mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                  </div>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <Check className="w-5 h-5 text-success flex-shrink-0" />
                      <span className="text-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className="w-full"
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </PublicLayout>
  );
}
