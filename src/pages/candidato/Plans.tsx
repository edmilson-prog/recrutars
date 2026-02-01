/**
 * Candidate Plans Page
 * Pagina de assinatura de planos do candidato
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
  free: string | boolean;
  pro: string | boolean;
  premium: string | boolean;
}

const features: PlanFeature[] = [
  { label: 'Perfil básico', free: true, pro: true, premium: true },
  { label: 'Candidaturas/mês', free: '5', pro: '30', premium: 'Ilimitadas' },
  { label: 'Teste comportamental', free: '1', pro: 'Ilimitados', premium: 'Ilimitados' },
  { label: 'Vagas recomendadas', free: false, pro: true, premium: true },
  { label: 'Currículos', free: '1', pro: '3', premium: '10' },
  { label: 'Destaque nas buscas', free: false, pro: false, premium: true },
  { label: 'Análise IA do perfil', free: false, pro: false, premium: true },
  { label: 'Suporte', free: 'Email', pro: 'Prioritário', premium: 'VIP' },
];

const plans = [
  {
    name: 'Gratuito',
    price: 'R$ 0',
    period: '/mês',
    description: 'Ideal para quem está começando a buscar oportunidades.',
    isCurrent: true,
    isPopular: false,
    featureKey: 'free' as const,
  },
  {
    name: 'Pro',
    price: 'R$ 29',
    period: '/mês',
    description: 'Para candidatos que querem se destacar e ter mais visibilidade.',
    isCurrent: false,
    isPopular: true,
    featureKey: 'pro' as const,
  },
  {
    name: 'Premium',
    price: 'R$ 59',
    period: '/mês',
    description: 'Acesso completo com recursos exclusivos e suporte VIP.',
    isCurrent: false,
    isPopular: false,
    featureKey: 'premium' as const,
  },
];

const faq = [
  {
    question: 'Posso cancelar a assinatura a qualquer momento?',
    answer: 'Sim, você pode cancelar sua assinatura a qualquer momento sem multas ou taxas adicionais.',
  },
  {
    question: 'Como funciona o período de teste?',
    answer: 'Oferecemos 7 dias grátis para os planos Pro e Premium. Você pode cancelar antes do fim do período sem ser cobrado.',
  },
  {
    question: 'Posso trocar de plano depois?',
    answer: 'Sim, você pode fazer upgrade ou downgrade do seu plano a qualquer momento. A diferença será calculada proporcionalmente.',
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

export default function CandidatePlans() {
  const { toast } = useToast();

  const handleUpgrade = (planName: string) => {
    toast({
      title: 'Funcionalidade em breve',
      description: `A assinatura do plano ${planName} estará disponível em breve.`,
    });
  };

  return (
    <DashboardLayout userType="candidate">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-primary" />
            Planos e Assinatura
          </h1>
          <p className="text-muted-foreground mt-1">
            Escolha o plano ideal para impulsionar sua carreira
          </p>
          <Badge variant="secondary" className="mt-2">
            Plano Atual: Gratuito
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
