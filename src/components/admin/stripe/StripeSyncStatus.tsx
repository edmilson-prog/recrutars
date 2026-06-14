import { Cloud, CloudOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StripeSyncStatusProps {
  liveProductId: string | null;
  liveSyncedAt: string | null;
  testProductId: string | null;
  testSyncedAt: string | null;
  className?: string;
}

interface SyncLineProps {
  label: string;
  synced: boolean;
  syncedAt: string | null;
}

function SyncLine({ label, synced, syncedAt }: SyncLineProps) {
  const dateLabel = synced && syncedAt
    ? new Date(syncedAt).toLocaleDateString('pt-BR')
    : null;

  return (
    <div className="flex items-center gap-2 text-xs">
      <span
        aria-hidden="true"
        className={cn(
          'flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full',
          synced ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground'
        )}
      >
        {synced ? <Cloud className="h-2.5 w-2.5" /> : <CloudOff className="h-2.5 w-2.5" />}
      </span>
      <span className="w-[68px] flex-shrink-0 font-medium text-foreground">{label}</span>
      <span className="text-muted-foreground">
        {synced ? 'sincronizado' : 'não sincronizado'}
      </span>
      {dateLabel && <span className="ml-auto text-muted-foreground">{dateLabel}</span>}
    </div>
  );
}

export function StripeSyncStatus({
  liveProductId,
  liveSyncedAt,
  testProductId,
  testSyncedAt,
  className,
}: StripeSyncStatusProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <h4 className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Sincronização Stripe
      </h4>
      <SyncLine label="Produção" synced={!!liveProductId} syncedAt={liveSyncedAt} />
      <SyncLine label="Sandbox" synced={!!testProductId} syncedAt={testSyncedAt} />
    </div>
  );
}
