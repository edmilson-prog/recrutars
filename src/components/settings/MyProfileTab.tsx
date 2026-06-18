/**
 * MyProfileTab
 * Fase 2: edição do perfil pessoal do colaborador (cargo, telefone, foto).
 * Não altera onboarding_step — apenas edição. Serve colaboradores e donos.
 */

import { useState, useEffect } from 'react';
import { Briefcase, Phone, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { AvatarCropUpload } from '@/components/profile/AvatarCropUpload';
import { formatPhone } from '@/lib/formatters';
import { toast } from 'sonner';

export function MyProfileTab() {
  const { user, currentCompany } = useAuth();

  const [jobTitle, setJobTitle] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar ?? '');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !currentCompany) {
      setLoading(false);
      return;
    }
    let active = true;
    (async () => {
      const { data: cu } = await supabase
        .from('company_users')
        .select('job_title')
        .eq('company_id', currentCompany.id)
        .eq('profile_id', user.id)
        .single();
      const { data: p } = await supabase
        .from('profiles')
        .select('phone, avatar_url')
        .eq('id', user.id)
        .single();
      if (!active) return;
      if (cu?.job_title) setJobTitle(cu.job_title);
      if (p?.phone) setPhone(formatPhone(p.phone));
      if (p?.avatar_url) setAvatarUrl(p.avatar_url);
      setLoading(false);
    })();
    return () => { active = false; };
  }, [user, currentCompany]);

  const phoneDigits = phone.replace(/\D/g, '');

  const handleSave = async () => {
    if (!user || !currentCompany) return;
    setSaving(true);
    try {
      const { error: cuError } = await supabase
        .from('company_users')
        .update({ job_title: jobTitle.trim() || null })
        .eq('company_id', currentCompany.id)
        .eq('profile_id', user.id);
      if (cuError) throw cuError;

      const { error: pError } = await supabase
        .from('profiles')
        .update({ phone: phoneDigits || null, avatar_url: avatarUrl || null })
        .eq('id', user.id);
      if (pError) throw pError;

      toast.success('Perfil atualizado com sucesso!');
    } catch {
      toast.error('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()
    : 'U';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meu Perfil</CardTitle>
        <CardDescription>Seus dados pessoais como colaborador desta empresa.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <AvatarCropUpload
          userId={user?.id ?? ''}
          currentUrl={avatarUrl}
          fallback={initials}
          onUploaded={setAvatarUrl}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="my-job-title" className="flex items-center gap-1.5">
              <Briefcase className="w-4 h-4 text-primary" />
              Cargo / função
            </Label>
            <Input
              id="my-job-title"
              type="text"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="Ex.: Analista de RH"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="my-phone" className="flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-primary" />
              Telefone
            </Label>
            <Input
              id="my-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              placeholder="(11) 99999-9999"
            />
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Salvando...
            </>
          ) : (
            'Salvar alterações'
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
