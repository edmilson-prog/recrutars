import { useEffect, useState } from 'react';
import { Plus, RefreshCw, AlertTriangle, Trash2, Wrench, Shield, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useCurrentVersion } from '@/hooks/useChangelog';
import { shouldShowWhatsNew, readLastSeenVersion, writeLastSeenVersion } from '@/lib/whatsNewVersion';
import type { ChangeType } from '@/types/changelog';
import { cn } from '@/lib/utils';

const changeTypeConfig: Record<ChangeType, { label: string; icon: typeof Plus; color: string }> = {
  added: { label: 'Adicionado', icon: Plus, color: 'text-green-500' },
  changed: { label: 'Alterado', icon: RefreshCw, color: 'text-blue-500' },
  deprecated: { label: 'Descontinuado', icon: AlertTriangle, color: 'text-yellow-500' },
  removed: { label: 'Removido', icon: Trash2, color: 'text-red-500' },
  fixed: { label: 'Corrigido', icon: Wrench, color: 'text-purple-500' },
  security: { label: 'Segurança', icon: Shield, color: 'text-orange-500' },
};

export function WhatsNewModal() {
  const { version, isLoading } = useCurrentVersion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (isLoading || !version) return;
    const lastSeen = readLastSeenVersion();
    if (lastSeen === null) {
      writeLastSeenVersion(version.version);
      return;
    }
    if (shouldShowWhatsNew(lastSeen, version.version)) {
      setOpen(true);
    }
  }, [isLoading, version]);

  if (!version) return null;

  const handleClose = () => {
    writeLastSeenVersion(version.version);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={(next) => { if (!next) handleClose(); }}>
      <DialogContent className="max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Novidades da versão {version.version}
          </DialogTitle>
          <DialogDescription>{version.description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {version.changes.map((category) => {
            const config = changeTypeConfig[category.type];
            const Icon = config.icon;
            return (
              <div key={category.type} className="space-y-2">
                <div className={cn('flex items-center gap-2 font-medium text-sm', config.color)}>
                  <Icon className="w-4 h-4" />
                  {config.label}
                </div>
                <ul className="space-y-1 pl-6">
                  {category.items.map((item, index) => (
                    <li
                      key={index}
                      className="text-sm text-muted-foreground list-disc marker:text-muted-foreground/50"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
        <DialogFooter>
          <Button onClick={handleClose}>Entendi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
