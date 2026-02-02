/**
 * Company Plans Page
 * Pagina de assinatura de planos da empresa
 */

import { Check, X, CreditCard, Star } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';

interface PlanFeature {
  label: string;
  starter: string | boolean;
  professional: string | boolean;
  enterprise: string | boolean;
}

const features: PlanFeature[] = [
  { label: 'Vagas ativas', starter: '2', professional: '10', enterprise: 'Ilimitadas' },
  { label: 'Candidatos/mês', starter: '10', professional: '100', enterprise: 'Ilimitados' },
  { label: 'Testes Gauge-Pro', starter: '5', professional: 'Ilimitados', enterprise: 'Ilimitados' },
  { label: 'Banco de talentos', starter: 'Básico', professional: 'Completo', enterprise: 'Completo + API' },
  { label: 'Análise IA', starter: false, professional: true, enterprise: true },
  { label: 'Usuários na conta', starter: '1', professional: '5', enterprise: 'Ilimitados' },
  { label: 'Relatórios', starter: 'Básico', professional: 'Avançado', enterprise: 'Personalizado' },
  { label: 'Suporte', starter: 'Email', professional: 'Prioritário', enterprise: 'Dedicado + SLA' },
];

const plans = [
  {
    name: 'Starter',
    price: 'R$ 0',
    period: '/mês',
    description: 'Para empresas que estão começando a recrutar na plataforma.',
    isCurrent: true,
    isPopular: false,
    featureKey: 'starter' as const,
  },
  {
    name: 'Professional',
    price: 'R$ 299',
    period: '/mês',
    description: 'Para equipes de RH que precisam de mais recursos e escala.',
    isCurrent: false,
    isPopular: true,
    featureKey: 'professional' as const,
  },
  {
    name: 'Enterprise',
    price: 'R$ 799',
    period: '/mês',
    description: 'Solução completa para grandes operações de recrutamento.',
    isCurrent: false,
    isPopular: false,
    featureKey: 'enterprise' as const,
  },
];

const faq = [
  {
    question: 'Posso cancelar a assinatura a qualquer momento?',
    answer: 'Sim, você pode cancelar sua assinatura a qualquer momento. O acesso continuará até o fim do período pago.',
  },
  {
    question: 'Existe desconto para pagamento anual?',
    answer: 'Sim, oferecemos 20% de desconto para planos anuais. Entre em contato com nosso time comercial.',
  },
  {
    question: 'Como funciona o plano Enterprise?',
    answer: 'O Enterprise inclui API de integração, suporte dedicado com SLA, relatórios personalizados e onboarding assistido.',
  },
  {
    question: 'Posso adicionar mais usuários ao meu plano?',
    answer: 'Nos planos Professional e Enterprise, você pode adicionar usuários extras. No Enterprise, o número é ilimitado.',
  },
];

function FeatureValue({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="w-4 h-4 text-green-500" />;
  }
  if (value === false) {
    return <X className="w-4 h-4 text-muted-foreground/40" />;
  }
  return <span className="text-sm">{value}</span>;
}

export default function CompanyPlans() {
  const { toast } = useToast();

  const handleUpgrade = (planName: string) => {
    toast({
      title: 'Funcionalidade em breve',
      description: `A assinatura do plano ${planName} estará disponível em breve.`,
    });
  };

  return (
    <DashboardLayout userType="company">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Planos e Assinatura
          </h1>
          <p className="text-muted-foreground mt-1">
            Escolha o plano ideal para escalar seu recrutamento
          </p>
          <Badge variant="secondary" className="mt-2">
            Plano Atual: Starter
          </Badge>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={
                plan.isPopular
                  ? 'border-primary shadow-lg relative'
                  : 'relative'
              }
            >
              {plan.isPopular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="gap-1">
                    <Star className="w-3 h-3" />
                    Mais popular
                  </Badge>
                </div>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">{plan.period}</span>
                </div>
                <CardDescription className="mt-2">{plan.description}</CardDescription>
              </CardHeader>
              <Separator />
              <CardContent className="pt-4">
                <ul className="space-y-3">
                  {features.map((feature) => (
                    <li key={feature.label} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{feature.label}</span>
                      <FeatureValue value={feature[plan.featureKey]} />
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  {plan.isCurrent ? (
                    <Button variant="outline" className="w-full" disabled>
                      Plano Atual
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      variant={plan.isPopular ? 'default' : 'outline'}
                      onClick={() => handleUpgrade(plan.name)}
                    >
                      Assinar {plan.name}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Perguntas Frequentes</h2>
          <div className="grid gap-4">
            {faq.map((item) => (
              <Card key={item.question}>
                <CardContent className="pt-4">
                  <h3 className="font-medium text-sm">{item.question}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
