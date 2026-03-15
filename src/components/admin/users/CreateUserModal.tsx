/**
 * CreateUserModal
 * Admin: cria usuario diretamente via Edge Function admin-create-user
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Eye, EyeOff, Mail, Lock, Loader2, ChevronDown, ChevronRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useCreateUser } from '@/hooks/useUsersQuery';
import { PasswordStrengthIndicator } from '@/components/invite/PasswordStrengthIndicator';
import { CandidateProfileFields } from './CandidateProfileFields';
import { CompanyProfileFields } from './CompanyProfileFields';
import type { CandidateProfileData } from './CandidateProfileFields';
import type { CompanyProfileData } from './CompanyProfileFields';
import type { CreateUserData } from '@/services/users/usersService';

interface CreateUserModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type UserType = 'admin' | 'company' | 'candidate';
type AccessMethod = 'email' | 'password';

const typeConfig: Record<UserType, { label: string; activeClass: string; inactiveClass: string }> = {
  admin: {
    label: 'Administrador',
    activeClass: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700',
    inactiveClass: 'bg-background text-muted-foreground border-border hover:bg-muted/50',
  },
  company: {
    label: 'Empresa',
    activeClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700',
    inactiveClass: 'bg-background text-muted-foreground border-border hover:bg-muted/50',
  },
  candidate: {
    label: 'Candidato',
    activeClass: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700',
    inactiveClass: 'bg-background text-muted-foreground border-border hover:bg-muted/50',
  },
};

function evaluatePasswordScore(pwd: string): number {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
}

export function CreateUserModal({ open, onOpenChange }: CreateUserModalProps) {
  const { toast } = useToast();
  const createUserMutation = useCreateUser();

  const [type, setType] = useState<UserType>('candidate');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [accessMethod, setAccessMethod] = useState<AccessMethod>('email');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [profileOpen, setProfileOpen] = useState(false);
  const [candidateProfile, setCandidateProfile] = useState<CandidateProfileData>({
    cpf: '', dateOfBirth: '', gender: '', maritalStatus: '',
    nationality: 'Brasileira', state: '', city: '',
  });
  const [companyProfile, setCompanyProfile] = useState<CompanyProfileData>({
    cnpj: '', razaoSocial: '', nomeFantasia: '', cep: '',
    logradouro: '', numero: '', complemento: '', bairro: '',
    city: '', state: '', industry: '', size: '', website: '', linkedin: '',
  });

  const resetForm = () => {
    setType('candidate');
    setName('');
    setEmail('');
    setPhone('');
    setAccessMethod('email');
    setPassword('');
    setShowPassword(false);
    setErrors({});
    setProfileOpen(false);
    setCandidateProfile({
      cpf: '', dateOfBirth: '', gender: '', maritalStatus: '',
      nationality: 'Brasileira', state: '', city: '',
    });
    setCompanyProfile({
      cnpj: '', razaoSocial: '', nomeFantasia: '', cep: '',
      logradouro: '', numero: '', complemento: '', bairro: '',
      city: '', state: '', industry: '', size: '', website: '', linkedin: '',
    });
  };

  const handleClose = () => {
    if (createUserMutation.isPending) return;
    resetForm();
    onOpenChange(false);
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    const nameParts = name.trim().split(/\s+/);
    if (!name.trim()) {
      newErrors.name = 'Nome e obrigatorio';
    } else if (nameParts.length < 2) {
      newErrors.name = 'Informe nome e sobrenome';
    }

    if (!email.trim()) {
      newErrors.email = 'Email e obrigatorio';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email invalido';
    }

    if (accessMethod === 'password') {
      if (!password) {
        newErrors.password = 'Senha e obrigatoria';
      } else if (evaluatePasswordScore(password) < 3) {
        newErrors.password = 'Senha muito fraca. Use letras, numeros e simbolos.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const hasCandidate = type === 'candidate' && Object.values(candidateProfile).some(v => v && v !== 'Brasileira');
    const hasCompany = type === 'company' && Object.values(companyProfile).some(v => !!v);

    const data: CreateUserData = {
      name: name.trim(),
      email: email.trim().toLowerCase(),
      type,
      phone: phone.trim() || undefined,
      password: accessMethod === 'password' ? password : undefined,
      sendInviteEmail: accessMethod === 'email',
      candidateProfile: hasCandidate ? candidateProfile : undefined,
      companyProfile: hasCompany ? companyProfile : undefined,
    };

    try {
      await createUserMutation.mutateAsync(data);
      toast({
        title: 'Usuario criado com sucesso',
        description:
          accessMethod === 'email'
            ? `Um e-mail foi enviado para ${data.email} com instrucoes de acesso.`
            : `A conta de ${data.name} foi criada. Compartilhe a senha com o usuario.`,
      });
      handleClose();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar usuario';
      toast({
        title: 'Erro ao criar usuario',
        description: message.includes('already registered')
          ? 'Este e-mail ja esta cadastrado na plataforma.'
          : message,
        variant: 'destructive',
      });
    }
  };

  const isLoading = createUserMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4 text-primary" />
            </div>
            Criar Novo Usuario
          </DialogTitle>
          <DialogDescription>
            Preencha os dados para provisionar uma nova conta na plataforma.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="pt-2">
        <ScrollArea className="max-h-[70vh] pr-3">
        <div className="space-y-5">
          {/* Type selector */}
          <div className="space-y-2">
            <Label>Tipo de Conta</Label>
            <div className="grid grid-cols-3 gap-2">
              {(Object.keys(typeConfig) as UserType[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={cn(
                    'px-3 py-2 text-xs font-medium rounded-lg border transition-all',
                    type === t ? typeConfig[t].activeClass : typeConfig[t].inactiveClass,
                  )}
                >
                  {typeConfig[t].label}
                </button>
              ))}
            </div>
          </div>

          {/* Name + Email */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="create-name">Nome Completo</Label>
              <Input
                id="create-name"
                placeholder="Nome e sobrenome"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setErrors((prev) => ({ ...prev, name: '' }));
                }}
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="create-email">Email</Label>
              <Input
                id="create-email"
                type="email"
                placeholder="email@exemplo.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setErrors((prev) => ({ ...prev, email: '' }));
                }}
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email}</p>
              )}
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-1.5">
            <Label htmlFor="create-phone">
              Telefone{' '}
              <span className="text-muted-foreground font-normal">(opcional)</span>
            </Label>
            <Input
              id="create-phone"
              type="tel"
              placeholder="(51) 99999-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {/* Conditional profile section */}
          {type !== 'admin' && (
            <Collapsible open={profileOpen} onOpenChange={setProfileOpen}>
              <CollapsibleTrigger asChild>
                <button
                  type="button"
                  className="w-full flex items-center gap-3 group"
                >
                  <div className="flex-1 h-px bg-border" />
                  <span className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
                    {profileOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                    {type === 'candidate' ? 'Perfil do Candidato' : 'Dados da Empresa'}
                    <Badge variant="outline" className="text-[10px] ml-1 px-1.5 py-0">
                      opcional
                    </Badge>
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="pt-4">
                  {type === 'candidate' ? (
                    <CandidateProfileFields
                      value={candidateProfile}
                      onChange={setCandidateProfile}
                    />
                  ) : (
                    <CompanyProfileFields
                      value={companyProfile}
                      onChange={setCompanyProfile}
                    />
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Access method */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-border" />
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                Acesso
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setAccessMethod('email')}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-left',
                  accessMethod === 'email'
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted/50',
                )}
              >
                <Mail className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium leading-tight">
                  Enviar e-mail de ativacao
                </span>
              </button>
              <button
                type="button"
                onClick={() => setAccessMethod('password')}
                className={cn(
                  'flex items-center gap-2 px-3 py-2.5 rounded-lg border transition-all text-left',
                  accessMethod === 'password'
                    ? 'bg-primary/10 text-primary border-primary/30'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted/50',
                )}
              >
                <Lock className="w-4 h-4 shrink-0" />
                <span className="text-xs font-medium leading-tight">
                  Definir senha inicial
                </span>
              </button>
            </div>

            <p className="text-xs text-muted-foreground">
              {accessMethod === 'email'
                ? 'O usuario recebera um e-mail para definir sua propria senha.'
                : 'Defina uma senha inicial e compartilhe com o usuario.'}
            </p>
          </div>

          {/* Password field — animated */}
          <AnimatePresence>
            {accessMethod === 'password' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="space-y-2 pt-1">
                  <Label htmlFor="create-password">Senha</Label>
                  <div className="relative">
                    <Input
                      id="create-password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Minimo 8 caracteres"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, password: '' }));
                      }}
                      className={cn('pr-10', errors.password ? 'border-destructive' : '')}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-xs text-destructive">{errors.password}</p>
                  )}
                  <PasswordStrengthIndicator password={password} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
        </ScrollArea>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isLoading ? 'Criando...' : 'Criar Usuario'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
