/**
 * Candidate Settings Page
 * PRD-045: Página de Configurações do Candidato
 * Preferências, Segurança e Conta
 * Dados pessoais disponíveis em /candidato/perfil
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, Download, Mail, KeyRound, Loader2 } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { ConfigLayout } from '@/components/settings/ConfigLayout';
import { candidateSettingsCategories } from '@/data/settingsConfig';
import { useSettings } from '@/hooks/useSettings';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';

// Filtra categorias que serão gerenciadas pelo ConfigLayout (exclui "Meu Perfil")
const filteredCategories = candidateSettingsCategories.filter(
  (cat) => cat.key !== 'profile'
);

export default function CandidateSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Settings hook (para categorias de preferências)
  const {
    values,
    history,
    updateValue,
    saveSection,
    restoreDefaults,
    isLoading: settingsLoading,
  } = useSettings({
    categories: filteredCategories,
    panel: 'candidate',
    userId: user?.id || '',
    userName: user?.name || 'Candidato',
    entityId: user?.id,
  });

  // Modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Form states
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [newEmail, setNewEmail] = useState('');

  // Mask email for display
  const maskEmail = (email: string) => {
    const [userPart, domain] = email.split('@');
    if (!domain) return email;
    const maskedUser = userPart.slice(0, 2) + '•'.repeat(Math.max(0, userPart.length - 2));
    return `${maskedUser}@${domain}`;
  };

  // Handle download data (mock)
  const handleDownloadData = () => {
    toast.success('Seus dados estão sendo preparados. Você receberá um email em breve.');
  };

  // Handle change password (mock)
  const handleChangePassword = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('As senhas não coincidem');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('A nova senha deve ter pelo menos 6 caracteres');
      return;
    }
    setShowPasswordModal(false);
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    toast.success('Senha alterada com sucesso');
  };

  // Handle change email (mock)
  const handleChangeEmail = () => {
    if (!newEmail || !newEmail.includes('@')) {
      toast.error('Digite um email válido');
      return;
    }
    setShowEmailModal(false);
    setNewEmail('');
    toast.success('Email de confirmação enviado para o novo endereço');
  };

  // Handle deactivate account (mock)
  const handleDeactivateAccount = () => {
    setShowDeactivateModal(false);
    logout();
    navigate('/');
    toast.success('Conta desativada. Você pode reativá-la fazendo login novamente.');
  };

  // Handle delete account
  const handleDeleteAccount = () => {
    if (deleteConfirmText !== 'EXCLUIR') return;
    setShowDeleteModal(false);
    setDeleteConfirmText('');
    logout();
    navigate('/');
    toast.success('Conta excluída com sucesso');
  };

  if (settingsLoading) {
    return (
      <DashboardLayout userType="candidate">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando configurações...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas preferências e dados da conta</p>
        </div>

        {/* ConfigLayout for preferences */}
        <ConfigLayout
          title="Preferências"
          subtitle="Configure suas preferências de vagas, notificações, privacidade e aparência"
          categories={filteredCategories}
          values={values}
          history={history}
          onValueChange={updateValue}
          onSave={saveSection}
          onRestoreDefaults={restoreDefaults}
        />

        {/* Security Actions Card */}
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyRound className="w-5 h-5" />
              Ações de Segurança
            </CardTitle>
            <CardDescription>
              Gerencie suas credenciais e baixe seus dados
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Email */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email
                </p>
                <p className="text-sm text-muted-foreground">
                  {maskEmail(user?.email || 'email@exemplo.com')}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowEmailModal(true)}>
                Alterar email
              </Button>
            </div>
            <Separator />
            {/* Password */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground flex items-center gap-2">
                  <KeyRound className="w-4 h-4" />
                  Senha
                </p>
                <p className="text-sm text-muted-foreground">••••••••</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
                Alterar senha
              </Button>
            </div>
            <Separator />
            {/* Download Data */}
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Exportar dados
                </p>
                <p className="text-sm text-muted-foreground">
                  Baixe uma cópia de todos os seus dados (LGPD)
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadData}>
                Baixar dados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone Section */}
        <Card className="border-destructive/50 max-w-3xl">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Zona de Perigo
            </CardTitle>
            <CardDescription>
              Ações irreversíveis que afetam sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Desativar conta</p>
                <p className="text-sm text-muted-foreground">
                  Sua conta ficará invisível, mas pode ser reativada
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowDeactivateModal(true)}>
                Desativar
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Excluir conta permanentemente</p>
                <p className="text-sm text-muted-foreground">
                  Todos os seus dados serão apagados. Ação irreversível.
                </p>
              </div>
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteModal(true)}>
                Excluir conta
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ============ MODALS ============ */}

      {/* Change Email Modal */}
      <Dialog open={showEmailModal} onOpenChange={setShowEmailModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar email</DialogTitle>
            <DialogDescription>
              Um email de confirmação será enviado para o novo endereço.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newEmail">Novo email</Label>
              <Input
                id="newEmail"
                type="email"
                placeholder="novo@email.com"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEmailModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangeEmail}>Enviar confirmação</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Password Modal */}
      <Dialog open={showPasswordModal} onOpenChange={setShowPasswordModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={passwordForm.currentPassword}
                onChange={e =>
                  setPasswordForm(prev => ({ ...prev, currentPassword: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={passwordForm.newPassword}
                onChange={e =>
                  setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={passwordForm.confirmPassword}
                onChange={e =>
                  setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordModal(false)}>
              Cancelar
            </Button>
            <Button onClick={handleChangePassword}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Deactivate Account Modal */}
      <AlertDialog open={showDeactivateModal} onOpenChange={setShowDeactivateModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar conta?</AlertDialogTitle>
            <AlertDialogDescription>
              Sua conta ficará invisível para empresas e você não receberá mais notificações. Você
              pode reativar sua conta a qualquer momento fazendo login novamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeactivateAccount}>
              Desativar conta
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Account Modal */}
      <AlertDialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir conta permanentemente?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação é irreversível. Todos os seus dados serão apagados permanentemente,
              incluindo seu perfil, candidaturas e mensagens.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Label htmlFor="deleteConfirm" className="text-sm text-muted-foreground">
              Para confirmar, digite <strong className="text-foreground">EXCLUIR</strong> abaixo:
            </Label>
            <Input
              id="deleteConfirm"
              className="mt-2"
              value={deleteConfirmText}
              onChange={e => setDeleteConfirmText(e.target.value)}
              placeholder="Digite EXCLUIR"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteConfirmText('')}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteConfirmText !== 'EXCLUIR'}
              onClick={handleDeleteAccount}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
