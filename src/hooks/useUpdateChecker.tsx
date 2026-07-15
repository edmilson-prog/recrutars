import { useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Rocket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { hasNewBuild, isSnoozed } from '@/lib/updateChecker';

const POLL_INTERVAL_MS = 5 * 60 * 1000;
const SNOOZE_MS = 30 * 60 * 1000;
const TOAST_ID = 'update-available';

async function fetchBuildId(): Promise<string | null> {
  try {
    const response = await fetch('/build-meta.json', { cache: 'no-store' });
    if (!response.ok) return null;
    const data = await response.json();
    return typeof data?.buildId === 'string' ? data.buildId : null;
  } catch {
    return null;
  }
}

function showUpdateToast(onSnooze: () => void) {
  toast.custom(
    (id) => (
      <div className="flex flex-col gap-3 rounded-lg border bg-background p-4 shadow-lg w-[356px]">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Rocket className="h-4 w-4 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-semibold">Atualização disponível</p>
            <p className="text-sm text-muted-foreground">
              Uma nova versão da plataforma está pronta. Atualize quando puder para aplicar as melhorias.
            </p>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              toast.dismiss(id);
              onSnooze();
            }}
          >
            Agora não
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => window.location.reload()}
          >
            Atualizar agora
          </Button>
        </div>
      </div>
    ),
    { id: TOAST_ID, duration: Infinity },
  );
}

export function useUpdateChecker(): void {
  const snoozedUntilRef = useRef<number | null>(null);

  useEffect(() => {
    let cancelled = false;

    const check = async () => {
      if (isSnoozed(snoozedUntilRef.current, Date.now())) return;
      const fetchedBuildId = await fetchBuildId();
      if (cancelled) return;
      if (hasNewBuild(__BUILD_ID__, fetchedBuildId)) {
        showUpdateToast(() => {
          snoozedUntilRef.current = Date.now() + SNOOZE_MS;
        });
      }
    };

    check();
    const intervalId = window.setInterval(check, POLL_INTERVAL_MS);
    const onVisibilityOrFocus = () => {
      if (document.visibilityState === 'visible') check();
    };
    document.addEventListener('visibilitychange', onVisibilityOrFocus);
    window.addEventListener('focus', onVisibilityOrFocus);

    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVisibilityOrFocus);
      window.removeEventListener('focus', onVisibilityOrFocus);
    };
  }, []);
}
