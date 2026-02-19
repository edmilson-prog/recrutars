import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { CheckCircle2, XCircle, Loader2, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase';
import { ForceLightTheme } from '@/components/theme/ForceLightTheme';

type Status = 'verifying' | 'success' | 'error' | 'resend';

export default function AuthConfirm() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [status, setStatus] = useState<Status>('verifying');
  const [errorMsg, setErrorMsg] = useState('');
  const [resendEmail, setResendEmail] = useState('');
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState('');

  useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type') as 'email' | 'recovery' | 'invite' | null;

    if (!tokenHash || !type) {
      setErrorMsg('Link de confirmação inválido ou incompleto.');
      setStatus('error');
      return;
    }

    supabase.auth
      .verifyOtp({ token_hash: tokenHash, type })
      .then(async ({ error }) => {
        if (error) {
          setErrorMsg(
            error.message.includes('expired')
              ? 'O link de confirmação expirou. Solicite um novo link abaixo.'
              : 'Não foi possível confirmar o email. O link pode ser inválido ou já ter sido usado.'
          );
          setStatus('error');
          return;
        }

        setStatus('success');

        // Redirect to the correct dashboard after a short delay
        const { data } = await supabase.auth.getUser();
        const userType = data?.user?.user_metadata?.type as string | undefined;

        setTimeout(() => {
          if (userType === 'company') navigate('/empresa', { replace: true });
          else if (userType === 'admin') navigate('/admin', { replace: true });
          else navigate('/candidato', { replace: true });
        }, 2000);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail) return;

    setResending(true);
    setResendError('');

    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: resendEmail,
      options: { emailRedirectTo: `${window.location.origin}/auth/confirm` },
    });

    setResending(false);

    if (error) {
      setResendError('Não foi possível reenviar o email. Verifique o endereço informado.');
    } else {
      setResendSuccess(true);
    }
  };

  return (
    <ForceLightTheme>
      <div className="min-h-screen flex items-center justify-center bg-[#f0f4f8] px-4">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="bg-gradient-to-r from-[#2b3068] to-[#2371af] rounded-t-xl p-8 flex justify-center">
            <img
              src="https://filackbesialiapjwijb.supabase.co/storage/v1/object/public/brand-assets/logos/logo-horizontal-color.png"
              alt="RecrutaRS"
              className="h-10 w-auto"
            />
          </div>

          {/* Card body */}
          <div className="bg-white rounded-b-xl shadow-lg px-8 py-10 text-center">
            {status === 'verifying' && (
              <>
                <Loader2 className="mx-auto mb-4 h-12 w-12 text-[#2371af] animate-spin" />
                <h1 className="text-xl font-bold text-[#2b3068] mb-2">Confirmando seu email...</h1>
                <p className="text-sm text-slate-500">Aguarde um momento.</p>
              </>
            )}

            {status === 'success' && (
              <>
                <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-green-500" />
                <h1 className="text-xl font-bold text-[#2b3068] mb-2">Email confirmado!</h1>
                <p className="text-sm text-slate-500">Redirecionando para o painel...</p>
              </>
            )}

            {status === 'error' && (
              <>
                <XCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />
                <h1 className="text-xl font-bold text-[#2b3068] mb-2">Falha na confirmação</h1>
                <p className="text-sm text-slate-500 mb-6">{errorMsg}</p>

                <div className="flex flex-col gap-3">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setStatus('resend')}
                  >
                    <Mail className="mr-2 h-4 w-4" />
                    Reenviar email de confirmação
                  </Button>
                  <Link to="/login">
                    <Button variant="ghost" className="w-full text-[#2371af]">
                      Ir para o login
                    </Button>
                  </Link>
                </div>
              </>
            )}

            {status === 'resend' && (
              <>
                <Mail className="mx-auto mb-4 h-12 w-12 text-[#2371af]" />
                <h1 className="text-xl font-bold text-[#2b3068] mb-2">Reenviar confirmação</h1>
                <p className="text-sm text-slate-500 mb-6">
                  Informe o email cadastrado para receber um novo link de confirmação.
                </p>

                {resendSuccess ? (
                  <>
                    <CheckCircle2 className="mx-auto mb-3 h-8 w-8 text-green-500" />
                    <p className="text-sm text-green-600 font-medium mb-4">
                      Email reenviado! Verifique sua caixa de entrada.
                    </p>
                    <Link to="/login">
                      <Button variant="ghost" className="w-full text-[#2371af]">
                        Ir para o login
                      </Button>
                    </Link>
                  </>
                ) : (
                  <form onSubmit={handleResend} className="text-left space-y-4">
                    <div>
                      <Label htmlFor="resend-email">Email</Label>
                      <Input
                        id="resend-email"
                        type="email"
                        placeholder="seu@email.com"
                        value={resendEmail}
                        onChange={(e) => setResendEmail(e.target.value)}
                        required
                        className="mt-1"
                      />
                    </div>
                    {resendError && (
                      <p className="text-xs text-red-500">{resendError}</p>
                    )}
                    <Button
                      type="submit"
                      disabled={resending}
                      className="w-full bg-[#2371af] hover:bg-[#1e5f96] text-white"
                    >
                      {resending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Reenviar
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full text-slate-500"
                      onClick={() => setStatus('error')}
                    >
                      Voltar
                    </Button>
                  </form>
                )}
              </>
            )}
          </div>

          <p className="mt-6 text-center text-xs text-slate-400">
            Este é um email automático. Por favor, não responda diretamente.
          </p>
        </div>
      </div>
    </ForceLightTheme>
  );
}
