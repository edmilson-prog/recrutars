import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, ArrowRight, Mail, Lock, UserIcon, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { ForceLightTheme } from '@/components/theme/ForceLightTheme';

type AccountType = 'company' | 'candidate';

export default function Register() {
  const [accountType, setAccountType] = useState<AccountType | null>(null);
  const navigate = useNavigate();

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/login');
  };

  return (
    <>
      <ForceLightTheme />
      <div className="h-screen flex overflow-hidden">
        {/* Left - Visual */}
        <div className="hidden lg:block flex-1 relative overflow-hidden">
          {/* Background image */}
          <img
            src="/images/register-bg.jpg"
            alt="Empresária usando interface de rede social"
            className="absolute inset-0 w-full h-full object-cover object-[80%_center]"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/90 via-primary/75 to-primary/50" />

          {/* Right edge fade to white */}
          <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-r from-transparent to-background" />

          {/* Background decorations */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse-soft" />
            <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft" />
          </div>

          {/* Centered content */}
          <div className="absolute inset-0 flex items-center justify-center p-12">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7 }}
              className="text-center text-primary-foreground"
            >
              <h2 className="text-4xl font-bold mb-4">
                Junte-se a milhares de profissionais
              </h2>
              <p className="text-xl text-primary-foreground/80 max-w-md mx-auto">
                Crie sua conta e tenha acesso às melhores oportunidades do mercado gaúcho.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Right - Form */}
        <div className="flex-1 flex items-center justify-center p-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="w-full max-w-md"
          >
            <Link to="/" className="flex items-center mb-8">
              <img
                src="/images/logo-horizontal.png"
                alt="RecrutaRS - Consultoria e Gestão"
                className="h-12 w-auto"
              />
            </Link>

            <h1 className="text-3xl font-bold text-foreground mb-2">Criar conta</h1>
            <p className="text-muted-foreground mb-8">
              Escolha seu tipo de conta para começar.
            </p>

            {/* Account Type Selection */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setAccountType('company')}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200",
                  accountType === 'company'
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
                  accountType === 'company' ? "gradient-primary" : "bg-muted"
                )}>
                  <Building2 className={cn(
                    "w-7 h-7",
                    accountType === 'company' ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                </div>
                <span className="font-semibold text-foreground">Empresa</span>
              </button>
              <button
                onClick={() => setAccountType('candidate')}
                className={cn(
                  "flex flex-col items-center gap-3 p-6 rounded-xl border-2 transition-all duration-200",
                  accountType === 'candidate'
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center transition-colors",
                  accountType === 'candidate' ? "gradient-primary" : "bg-muted"
                )}>
                  <User className={cn(
                    "w-7 h-7",
                    accountType === 'candidate' ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                </div>
                <span className="font-semibold text-foreground">Candidato</span>
              </button>
            </div>

            {/* Register Form */}
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{accountType === 'company' ? 'Nome da empresa' : 'Nome completo'}</Label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder={accountType === 'company' ? 'Sua Empresa Ltda' : 'João da Silva'}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="(11) 99999-9999"
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                size="lg"
                disabled={!accountType}
              >
                Criar conta
                <ArrowRight className="w-5 h-5" />
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Já tem uma conta?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                Fazer login
              </Link>
            </p>

            <p className="mt-4 text-center text-xs text-muted-foreground">
              Ao criar uma conta, você concorda com nossos{' '}
              <Link to="/termos-de-uso" className="underline">Termos de Uso</Link> e{' '}
              <Link to="/politica-de-privacidade" className="underline">Política de Privacidade</Link>.
            </p>
          </motion.div>
        </div>
      </div>
    </>
  );
}
