import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Shield, ArrowRight, Mail, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { GlassFooter } from '@/components/layout/GlassFooter';
import { ForceLightTheme } from '@/components/theme/ForceLightTheme';

type UserType = 'admin' | 'company' | 'candidate';

const userTypes = [
  { type: 'admin' as UserType, icon: Shield, label: 'Administrador', description: 'Acesso completo à plataforma' },
  { type: 'company' as UserType, icon: Building2, label: 'Empresa', description: 'Gerenciar vagas e candidatos' },
  { type: 'candidate' as UserType, icon: User, label: 'Candidato', description: 'Buscar vagas e se candidatar' },
];

export default function Login() {
  const [selectedType, setSelectedType] = useState<UserType | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedType) {
      login(selectedType);
      const routes = {
        admin: '/admin',
        company: '/empresa',
        candidate: '/candidato',
      };
      navigate(routes[selectedType]);
    }
  };

  return (
    <>
    <ForceLightTheme />
    <div className="min-h-screen flex pb-12">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Link to="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">R</span>
            </div>
            <span className="text-xl font-bold text-foreground">RecrutaRS</span>
          </Link>

          <h1 className="text-3xl font-bold text-foreground mb-2">Bem-vindo de volta</h1>
          <p className="text-muted-foreground mb-8">
            Selecione seu tipo de acesso para entrar na plataforma.
          </p>

          {/* User Type Selection */}
          <div className="grid gap-3 mb-8">
            {userTypes.map((item) => (
              <button
                key={item.type}
                onClick={() => setSelectedType(item.type)}
                className={cn(
                  "flex items-center gap-4 p-4 rounded-xl border-2 transition-all duration-200 text-left",
                  selectedType === item.type
                    ? "border-primary bg-primary/5 shadow-soft"
                    : "border-border hover:border-primary/50 hover:bg-muted/50"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors",
                  selectedType === item.type ? "gradient-primary" : "bg-muted"
                )}>
                  <item.icon className={cn(
                    "w-6 h-6",
                    selectedType === item.type ? "text-primary-foreground" : "text-muted-foreground"
                  )} />
                </div>
                <div>
                  <div className="font-semibold text-foreground">{item.label}</div>
                  <div className="text-sm text-muted-foreground">{item.description}</div>
                </div>
              </button>
            ))}
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="seu@email.com"
                  className="pl-10"
                  defaultValue="demo@recrutars.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="password">Senha</Label>
                <Link to="#" className="text-sm text-secondary hover:underline">
                  Esqueceu a senha?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  defaultValue="demo123"
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={!selectedType}
            >
              Entrar
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Não tem uma conta?{' '}
            <Link to="/cadastro" className="text-primary font-medium hover:underline">
              Cadastre-se
            </Link>
          </p>

          <div className="mt-8 p-4 bg-muted/50 rounded-xl">
            <p className="text-xs text-muted-foreground text-center">
              <strong>Demo:</strong> Selecione um tipo de usuário e clique em "Entrar" para acessar com dados mockados.
            </p>
          </div>
        </motion.div>
      </div>

      {/* Right - Visual */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-secondary/20 rounded-full blur-3xl animate-pulse-soft" />
          <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-secondary/10 rounded-full blur-3xl animate-pulse-soft" />
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative z-10 text-center text-primary-foreground"
        >
          <h2 className="text-4xl font-bold mb-4">
            Conecte-se aos melhores talentos
          </h2>
          <p className="text-xl text-primary-foreground/80 max-w-md">
            Plataforma completa de recrutamento com avaliação comportamental e matching inteligente.
          </p>
        </motion.div>
      </div>
    </div>
    <GlassFooter />
    </>
  );
}
