/**
 * OnboardingProfile
 * Fase 2: passo único de perfil do colaborador (cargo + telefone obrigatórios,
 * foto opcional). Full-screen, sem DashboardLayout — espelha o onboarding do
 * candidato. Ao concluir, marca company_users.onboarding_step = 'completed'.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Briefcase, Phone, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { AvatarCropUpload } from '@/components/profile/AvatarCropUpload';
import { formatPhone } from '@/lib/formatters';
import { toast } from 'sonner';

export default function OnboardingProfile() {
  const { user, currentCompany, refreshCurrentCompany } = useAuth();
  const navigate = useNavigate();

  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [showErrors, setShowErrors] = useState(false);

  const phoneDigits = phone.replace(/\D/g, '');
  const isValid = jobTitle.trim().length > 0 && phoneDigits.length >= 10;

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  const handleConcluir = async () => {
    if (!user || !currentCompany) return;
    if (!isValid) {
      setShowErrors(true);
      return;
    }
    setError('');
    setSaving(true);

    try {
      const { error: cuError } = await supabase
        .from('company_users')
        .update({ job_title: jobTitle.trim(), onboarding_step: 'completed' })
        .eq('company_id', currentCompany.id)
        .eq('profile_id', user.id);
      if (cuError) throw cuError;

      const { error: pError } = await supabase
        .from('profiles')
        .update({ phone: phoneDigits, avatar_url: avatarUrl || null })
        .eq('id', user.id);
      if (pError) throw pError;

      await refreshCurrentCompany();
      toast.success('Perfil concluído!');
      navigate('/empresa', { replace: true });
    } catch {
      setError('Erro ao salvar dados. Tente novamente.');
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-card">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center">
            <img src="/images/logo-horizontal.png" alt="RecrutaRS" className="h-10 w-auto" />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="text-2xl font-bold text-foreground mb-2">Complete seu perfil</h1>
          <p className="text-muted-foreground mb-8">
            Precisamos de algumas informações para concluir seu acesso.
          </p>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            <AvatarCropUpload
              userId={user?.id ?? ''}
              currentUrl={avatarUrl}
              fallback={initials}
              onUploaded={setAvatarUrl}
            />
            <p className="text-xs text-muted-foreground text-center -mt-1">
              Foto opcional (JPG, PNG ou WebP, máx 2MB)
            </p>

            <div className="space-y-2">
              <Label htmlFor="jobTitle" className="flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-primary" />
                Cargo / função
              </Label>
              <Input
                id="jobTitle"
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Ex.: Analista de RH"
                className={cn(showErrors && !jobTitle.trim() && 'border-destructive')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-1.5">
                <Phone className="w-4 h-4 text-primary" />
                Telefone
              </Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(formatPhone(e.target.value))}
                placeholder="(11) 99999-9999"
                className={cn(showErrors && phoneDigits.length < 10 && 'border-destructive')}
              />
              {showErrors && phoneDigits.length < 10 && (
                <p className="text-xs text-destructive" role="alert">Informe um telefone válido com DDD.</p>
              )}
            </div>

            <Button className="w-full" size="lg" onClick={handleConcluir} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  Concluir
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
