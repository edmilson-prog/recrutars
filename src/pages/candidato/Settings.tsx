/**
 * Candidate Settings Page
 * PRD-011: Configurações do Candidato
 * PRD-026: Visibilidade do Perfil
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Bell,
  AlertTriangle,
  Download,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { VisibilitySettings } from '@/components/candidato/VisibilitySettings';
import { ThemeSettings } from '@/components/settings/ThemeSettings';
import type { VisibilityMode } from '@/types/candidate';
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
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

// Notification preferences type
interface NotificationPreferences {
  newJobs: boolean;
  applicationUpdates: boolean;
  messages: boolean;
  newsletter: boolean;
}

export default function CandidateSettings() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Notification preferences state
  const [notifications, setNotifications] = useState<NotificationPreferences>({
    newJobs: true,
    applicationUpdates: true,
    messages: true,
    newsletter: false,
  });

  // PRD-026: Profile visibility state
  const [visibilityMode, setVisibilityMode] = useState<VisibilityMode>('public');
  const anonymousId = '4721'; // Mock: seria gerado ao criar conta

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

  // Handle notification preference change
  const handleNotificationChange = (key: keyof NotificationPreferences, checked: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: checked }));
    toast.success('Preferências salvas');
  };

  // PRD-026: Handle visibility mode change
  const handleVisibilityChange = (mode: VisibilityMode) => {
    setVisibilityMode(mode);
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

  // Notification options
  const notificationOptions = [
    { key: 'newJobs' as const, label: 'Novas vagas compatíveis com meu perfil' },
    { key: 'applicationUpdates' as const, label: 'Atualizações das minhas candidaturas' },
    { key: 'messages' as const, label: 'Mensagens de empresas' },
    { key: 'newsletter' as const, label: 'Newsletter e novidades da plataforma' },
  ];

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6 max-w-3xl">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
          <p className="text-muted-foreground">Gerencie suas preferências e dados da conta</p>
        </div>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Segurança
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Email</p>
                <p className="text-sm text-muted-foreground">
                  {maskEmail(user?.email || 'joao.santos@email.com')}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowEmailModal(true)}>
                Alterar email
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Senha</p>
                <p className="text-sm text-muted-foreground">••••••••</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => setShowPasswordModal(true)}>
                Alterar senha
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="w-5 h-5" />
              Notificações
            </CardTitle>
            <CardDescription>Escolha quais emails você deseja receber</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {notificationOptions.map(item => (
              <div key={item.key} className="flex items-center space-x-3">
                <Checkbox
                  id={item.key}
                  checked={notifications[item.key]}
                  onCheckedChange={(checked) =>
                    handleNotificationChange(item.key, checked as boolean)
                  }
                />
                <Label htmlFor={item.key} className="text-foreground cursor-pointer">
                  {item.label}
                </Label>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* PRD-026: Privacy/Visibility Section */}
        <VisibilitySettings
          currentMode={visibilityMode}
          anonymousId={anonymousId}
          onSave={handleVisibilityChange}
        />

        {/* PRD-029: Appearence/Theme Section */}
        <ThemeSettings />

        {/* Download Data Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              Meus Dados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Exportar dados</p>
                <p className="text-sm text-muted-foreground">
                  Baixe uma cópia de todos os seus dados
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownloadData}>
                <Download className="w-4 h-4 mr-2" />
                Baixar dados
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone Section */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              Zona de Perigo
            </CardTitle>
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
