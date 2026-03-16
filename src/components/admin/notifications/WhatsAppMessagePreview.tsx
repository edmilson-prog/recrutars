/**
 * WhatsAppMessagePreview
 * Renders a WhatsApp-style message preview bubble inside a simulated phone screen.
 * Template variables like {{nome}} and {{link}} are highlighted with cyan styling.
 */

import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WhatsAppMessagePreviewProps {
  message: string;
  recipientName?: string;
  className?: string;
}

/** Parses template variables (e.g. {{nome}}) and wraps them in highlighted spans. */
function renderMessageWithVariables(text: string) {
  const parts = text.split(/({{[^}]+}})/g);

  return parts.map((part, index) => {
    if (/^{{[^}]+}}$/.test(part)) {
      return (
        <span
          key={index}
          className="px-1 py-0.5 rounded text-xs font-semibold bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-300"
        >
          {part}
        </span>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

function getCurrentTime(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

export function WhatsAppMessagePreview({
  message,
  recipientName,
  className,
}: WhatsAppMessagePreviewProps) {
  return (
    <div
      className={cn(
        'max-w-[320px] rounded-2xl overflow-hidden border border-border shadow-lg',
        className,
      )}
      aria-label="Pre-visualizacao da mensagem WhatsApp"
    >
      {/* Header bar */}
      <div className="flex items-center gap-2 px-4 py-2.5 bg-[#075E54] dark:bg-[#1F2C34]">
        <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="w-4 h-4 text-white"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-white truncate">WhatsApp</p>
          {recipientName && (
            <p className="text-[10px] text-white/70 truncate">
              Para: {recipientName}
            </p>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="bg-[#ECE5DD] dark:bg-[#0B141A] px-3 py-4 min-h-[120px]">
        {/* Message bubble */}
        <div className="max-w-[85%]">
          <div className="bg-[#DCF8C6] dark:bg-[#005C4B] rounded-lg rounded-tl-none px-3 py-2 shadow-sm">
            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
              {message ? renderMessageWithVariables(message) : (
                <span className="text-gray-400 dark:text-gray-500 italic">
                  Nenhuma mensagem para pre-visualizar
                </span>
              )}
            </p>

            {/* Timestamp + check mark */}
            <div className="flex items-center justify-end gap-1 mt-1">
              <span className="text-[10px] text-gray-500 dark:text-gray-400 tabular-nums">
                {getCurrentTime()}
              </span>
              <Check className="w-3 h-3 text-gray-400 dark:text-gray-500" aria-hidden="true" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
