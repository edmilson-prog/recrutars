/**
 * Read-only card that shows the documents a candidate attached to their profile
 * (resume PDF + presentation video) on the company's candidate detail page.
 * Visibility is enforced server-side by the curriculums_for_company view, which
 * masks these fields until the candidate accepts the LGPD data-disclosure term.
 */
import { motion } from 'framer-motion';
import { Paperclip, FileText, Eye, Download, Video, ExternalLink, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getVideoThumbnail } from '@/lib/videoThumbnail';

export interface CandidateDocumentsCardProps {
  resumePdfUrl?: string | null;
  resumePdfName?: string | null;
  resumePdfSize?: number | null;
  resumePdfUploadedAt?: string | null;
  presentationVideoUrl?: string | null;
  presentationVideoType?: 'upload' | 'external' | null;
  presentationVideoName?: string | null;
  delay?: number;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function CandidateDocumentsCard({
  resumePdfUrl,
  resumePdfName,
  resumePdfSize,
  resumePdfUploadedAt,
  presentationVideoUrl,
  presentationVideoType,
  presentationVideoName: _presentationVideoName,
  delay = 0,
}: CandidateDocumentsCardProps): JSX.Element | null {
  const hasResume = !!resumePdfUrl;
  const hasVideo = !!presentationVideoUrl;
  if (!hasResume && !hasVideo) return null;

  const videoThumb =
    hasVideo && presentationVideoType === 'external'
      ? getVideoThumbnail(presentationVideoUrl!)
      : null;

  // Public bucket supports forcing a download with the ?download query param.
  const downloadUrl = resumePdfUrl
    ? `${resumePdfUrl}${resumePdfUrl.includes('?') ? '&' : '?'}download=${encodeURIComponent(
        resumePdfName ?? 'curriculo.pdf',
      )}`
    : undefined;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paperclip className="w-5 h-5" />
            Currículo Anexado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Resume PDF */}
          {hasResume && (
            <div className="flex items-start gap-4 rounded-xl border bg-gradient-to-r from-cyan-500/5 to-transparent p-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                <FileText className="h-6 w-6 text-red-500" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  {resumePdfName ?? 'Currículo.pdf'}
                </p>
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  {typeof resumePdfSize === 'number' && <span>{formatBytes(resumePdfSize)}</span>}
                  {resumePdfUploadedAt && <span>Enviado em {formatDate(resumePdfUploadedAt)}</span>}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => window.open(resumePdfUrl!, '_blank', 'noopener,noreferrer')}
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Visualizar
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 text-xs" asChild>
                    <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3.5 w-3.5" />
                      Baixar
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Presentation video */}
          {hasVideo && (
            <div className="flex items-start gap-4 rounded-xl border bg-gradient-to-r from-cyan-500/5 to-transparent p-4">
              <div className="relative flex-shrink-0">
                {videoThumb?.type === 'youtube' ? (
                  <div className="relative h-16 w-28 overflow-hidden rounded-lg">
                    <img
                      src={`https://img.youtube.com/vi/${videoThumb.id}/hqdefault.jpg`}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <Play className="h-6 w-6 fill-white text-white" />
                    </div>
                  </div>
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                    <Video className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-foreground">
                  Vídeo de apresentação
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {presentationVideoType === 'upload'
                    ? 'Arquivo enviado'
                    : presentationVideoType === 'external'
                    ? 'Link externo'
                    : null}
                </p>
                <div className="mt-3 flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 text-xs"
                    onClick={() => window.open(presentationVideoUrl!, '_blank', 'noopener,noreferrer')}
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Assistir
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
