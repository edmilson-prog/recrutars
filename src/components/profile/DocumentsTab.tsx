import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Upload,
  X,
  ExternalLink,
  Eye,
  Video,
  Link as LinkIcon,
  CheckCircle,
  AlertCircle,
  Loader2,
  Trash2,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { getVideoThumbnail, type VideoThumbnail } from '@/lib/videoThumbnail';
import type { Curriculum } from '@/types/curriculum';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface DocumentsTabProps {
  curriculum: Curriculum;
  candidateId: string;
  onUpdate: (updates: Partial<Curriculum>) => Promise<void>;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function DropZone({
  accept,
  label,
  hint,
  onFile,
  icon: Icon,
  disabled,
}: {
  accept: string;
  label: string;
  hint: string;
  onFile: (file: File) => void;
  icon: React.ElementType;
  disabled?: boolean;
}) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) onFile(file);
    },
    [onFile],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFile(file);
    e.target.value = '';
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => inputRef.current?.click()}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        'w-full rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2',
        'hover:border-cyan-500 hover:bg-cyan-500/5',
        isDragging
          ? 'border-cyan-500 bg-cyan-500/10 scale-[1.01]'
          : 'border-border bg-muted/30',
        disabled && 'opacity-50 cursor-not-allowed pointer-events-none',
      )}
      aria-label={`Área de upload: ${label}`}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <div className="flex flex-col items-center gap-3">
        <div
          className={cn(
            'flex h-12 w-12 items-center justify-center rounded-full transition-colors',
            isDragging ? 'bg-cyan-500/20 text-cyan-500' : 'bg-muted text-muted-foreground',
          )}
        >
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            {isDragging ? 'Solte o arquivo aqui' : label}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
        </div>
        <span className="rounded-full border border-border bg-background px-4 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-muted transition-colors">
          Escolher arquivo
        </span>
      </div>
    </button>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function DocumentsTab({ curriculum, candidateId, onUpdate }: DocumentsTabProps) {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  // PDF state
  const [pdfUploading, setPdfUploading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState(0);

  // Video state
  const [videoMode, setVideoMode] = useState<'upload' | 'external'>(
    curriculum.presentationVideoType ?? 'upload',
  );
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoUrlInput, setVideoUrlInput] = useState(
    curriculum.presentationVideoType === 'external' ? (curriculum.presentationVideoUrl ?? '') : '',
  );
  const [savingUrl, setSavingUrl] = useState(false);

  // ---------------------------------------------------------------------------
  // PDF handlers
  // ---------------------------------------------------------------------------

  const handlePdfFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Apenas arquivos PDF são aceitos para currículo.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('O arquivo excede o limite de 10 MB.');
      return;
    }

    setPdfUploading(true);
    setPdfProgress(10);

    try {
      const ext = 'pdf';
      const path = `${userId}/resumes/${Date.now()}-${encodeURIComponent(file.name.replace(/[^a-zA-Z0-9._-]/g, '_'))}.${ext}`;

      // If there's an existing PDF, remove it from storage
      if (curriculum.resumePdfUrl) {
        const existingPath = new URL(curriculum.resumePdfUrl).pathname
          .split('/object/public/candidate-documents/')[1];
        if (existingPath) {
          await supabase.storage.from('candidate-documents').remove([decodeURIComponent(existingPath)]);
        }
      }

      setPdfProgress(30);

      const { data, error } = await supabase.storage
        .from('candidate-documents')
        .upload(path, file, { upsert: true, contentType: 'application/pdf' });

      if (error) throw error;

      setPdfProgress(80);

      const { data: { publicUrl } } = supabase.storage
        .from('candidate-documents')
        .getPublicUrl(data.path);

      await onUpdate({
        resumePdfUrl: publicUrl,
        resumePdfName: file.name,
        resumePdfSize: file.size,
        resumePdfUploadedAt: new Date().toISOString(),
      });

      setPdfProgress(100);
      toast.success('Currículo enviado com sucesso!');
    } catch (err) {
      console.error('PDF upload error:', err);
      toast.error('Erro ao enviar o currículo. Tente novamente.');
    } finally {
      setTimeout(() => {
        setPdfUploading(false);
        setPdfProgress(0);
      }, 600);
    }
  };

  const handleRemovePdf = async () => {
    if (!curriculum.resumePdfUrl) return;

    try {
      const existingPath = new URL(curriculum.resumePdfUrl).pathname
        .split('/object/public/candidate-documents/')[1];
      if (existingPath) {
        await supabase.storage.from('candidate-documents').remove([decodeURIComponent(existingPath)]);
      }
    } catch {
      // Storage removal is best-effort
    }

    await onUpdate({
      resumePdfUrl: null,
      resumePdfName: null,
      resumePdfSize: null,
      resumePdfUploadedAt: null,
    });
    toast.success('Currículo removido.');
  };

  // ---------------------------------------------------------------------------
  // Video handlers
  // ---------------------------------------------------------------------------

  const handleVideoFile = async (file: File) => {
    const allowed = ['video/mp4', 'video/webm', 'video/quicktime'];
    if (!allowed.includes(file.type)) {
      toast.error('Formatos aceitos: MP4, WebM, MOV.');
      return;
    }
    if (file.size > 100 * 1024 * 1024) {
      toast.error('O vídeo excede o limite de 100 MB.');
      return;
    }

    setVideoUploading(true);
    setVideoProgress(10);

    try {
      // Remove existing video from storage if it was an upload
      if (curriculum.presentationVideoUrl && curriculum.presentationVideoType === 'upload') {
        const existingPath = new URL(curriculum.presentationVideoUrl).pathname
          .split('/object/public/candidate-documents/')[1];
        if (existingPath) {
          await supabase.storage.from('candidate-documents').remove([decodeURIComponent(existingPath)]);
        }
      }

      setVideoProgress(30);

      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
      const path = `${userId}/videos/${Date.now()}-${encodeURIComponent(safeName)}`;

      const { data, error } = await supabase.storage
        .from('candidate-documents')
        .upload(path, file, { upsert: true, contentType: file.type });

      if (error) throw error;

      setVideoProgress(80);

      const { data: { publicUrl } } = supabase.storage
        .from('candidate-documents')
        .getPublicUrl(data.path);

      await onUpdate({
        presentationVideoUrl: publicUrl,
        presentationVideoType: 'upload',
        presentationVideoName: file.name,
      });

      setVideoProgress(100);
      toast.success('Vídeo enviado com sucesso!');
    } catch (err) {
      console.error('Video upload error:', err);
      toast.error('Erro ao enviar o vídeo. Tente novamente.');
    } finally {
      setTimeout(() => {
        setVideoUploading(false);
        setVideoProgress(0);
      }, 600);
    }
  };

  const handleSaveVideoUrl = async () => {
    const url = videoUrlInput.trim();
    if (!url) {
      toast.error('Insira uma URL válida.');
      return;
    }
    try {
      new URL(url);
    } catch {
      toast.error('URL inválida. Verifique o link e tente novamente.');
      return;
    }

    setSavingUrl(true);
    try {
      await onUpdate({
        presentationVideoUrl: url,
        presentationVideoType: 'external',
        presentationVideoName: url,
      });
      toast.success('Link de vídeo salvo!');
    } finally {
      setSavingUrl(false);
    }
  };

  const handleRemoveVideo = async () => {
    if (curriculum.presentationVideoType === 'upload' && curriculum.presentationVideoUrl) {
      try {
        const existingPath = new URL(curriculum.presentationVideoUrl).pathname
          .split('/object/public/candidate-documents/')[1];
        if (existingPath) {
          await supabase.storage.from('candidate-documents').remove([decodeURIComponent(existingPath)]);
        }
      } catch {
        // best-effort
      }
    }

    await onUpdate({
      presentationVideoUrl: null,
      presentationVideoType: null,
      presentationVideoName: null,
    });
    setVideoUrlInput('');
    toast.success('Vídeo removido.');
  };

  // ---------------------------------------------------------------------------
  // Derived values
  // ---------------------------------------------------------------------------

  const hasPdf = !!curriculum.resumePdfUrl;
  const hasVideo = !!curriculum.presentationVideoUrl;
  const videoThumbnail = hasVideo && curriculum.presentationVideoType === 'external'
    ? getVideoThumbnail(curriculum.presentationVideoUrl!)
    : null;

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-6 space-y-6"
    >
      {/* ------------------------------------------------------------------ */}
      {/* PDF Section                                                          */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <FileText className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <CardTitle className="text-base">Currículo em PDF</CardTitle>
              <CardDescription className="text-xs">
                Envie seu currículo no formato PDF para complementar seu perfil
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            {pdfUploading ? (
              <motion.div
                key="pdf-uploading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 rounded-xl border bg-muted/30 p-6"
              >
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
                  <span className="text-sm font-medium">Enviando currículo...</span>
                </div>
                <Progress value={pdfProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">{pdfProgress}% concluído</p>
              </motion.div>
            ) : hasPdf ? (
              <motion.div
                key="pdf-card"
                initial={{ opacity: 0, scale: 0.97 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.97 }}
                className="flex items-start gap-4 rounded-xl border bg-gradient-to-r from-cyan-500/5 to-transparent p-4"
              >
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-red-500/10">
                  <FileText className="h-6 w-6 text-red-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {curriculum.resumePdfName ?? 'Currículo.pdf'}
                  </p>
                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                    {curriculum.resumePdfSize && (
                      <span>{formatBytes(curriculum.resumePdfSize)}</span>
                    )}
                    {curriculum.resumePdfUploadedAt && (
                      <span>Enviado em {formatDate(curriculum.resumePdfUploadedAt)}</span>
                    )}
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs"
                      onClick={() => window.open(curriculum.resumePdfUrl, '_blank')}
                    >
                      <Eye className="h-3.5 w-3.5" />
                      Visualizar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1.5 text-xs text-destructive hover:text-destructive"
                      onClick={handleRemovePdf}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remover
                    </Button>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-500" />
              </motion.div>
            ) : (
              <motion.div
                key="pdf-dropzone"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <DropZone
                  accept=".pdf"
                  label="Arraste seu currículo ou clique para selecionar"
                  hint="PDF · Máximo 10 MB"
                  onFile={handlePdfFile}
                  icon={FileText}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Video Section                                                        */}
      {/* ------------------------------------------------------------------ */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-cyan-500/10">
              <Video className="h-5 w-5 text-cyan-500" />
            </div>
            <div>
              <CardTitle className="text-base">Vídeo de Apresentação</CardTitle>
              <CardDescription className="text-xs">
                Grave uma apresentação de até 2 minutos falando sobre você e seu perfil profissional
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Video saved card */}
          <AnimatePresence>
            {hasVideo && !videoUploading && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="flex items-start gap-4 rounded-xl border bg-gradient-to-r from-cyan-500/5 to-transparent p-4">
                  {/* Thumbnail */}
                  <div className="relative flex-shrink-0">
                    {videoThumbnail?.type === 'youtube' ? (
                      <div className="relative h-16 w-28 overflow-hidden rounded-lg">
                        <img
                          src={`https://img.youtube.com/vi/${videoThumbnail.id}/hqdefault.jpg`}
                          alt="Thumbnail do vídeo"
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

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-foreground">
                      {curriculum.presentationVideoType === 'upload'
                        ? (curriculum.presentationVideoName ?? 'Vídeo de apresentação')
                        : 'Link externo'}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {curriculum.presentationVideoType === 'upload' ? 'Arquivo enviado' : 'YouTube / Vimeo / outro'}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs"
                        onClick={() => window.open(curriculum.presentationVideoUrl, '_blank')}
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Assistir
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1.5 text-xs text-destructive hover:text-destructive"
                        onClick={handleRemoveVideo}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Remover
                      </Button>
                    </div>
                  </div>
                  <CheckCircle className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Upload progress */}
          <AnimatePresence>
            {videoUploading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-3 rounded-xl border bg-muted/30 p-6"
              >
                <div className="flex items-center gap-3">
                  <Loader2 className="h-5 w-5 animate-spin text-cyan-500" />
                  <span className="text-sm font-medium">Enviando vídeo...</span>
                </div>
                <Progress value={videoProgress} className="h-2" />
                <p className="text-xs text-muted-foreground">{videoProgress}% concluído</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Mode toggle — only show when no video saved */}
          {!hasVideo && !videoUploading && (
            <div className="space-y-4">
              {/* Pill toggle */}
              <div className="inline-flex rounded-full bg-muted p-1">
                {(['upload', 'external'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setVideoMode(mode)}
                    className={cn(
                      'relative rounded-full px-4 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500',
                      videoMode === mode
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground',
                    )}
                  >
                    {mode === 'upload' ? (
                      <span className="flex items-center gap-1.5">
                        <Upload className="h-3.5 w-3.5" />
                        Upload
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <LinkIcon className="h-3.5 w-3.5" />
                        Link externo
                      </span>
                    )}
                  </button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                {videoMode === 'upload' ? (
                  <motion.div
                    key="video-upload"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.18 }}
                  >
                    <DropZone
                      accept=".mp4,.webm,.mov,video/mp4,video/webm,video/quicktime"
                      label="Arraste seu vídeo ou clique para selecionar"
                      hint="MP4, WebM ou MOV · Máximo 100 MB"
                      onFile={handleVideoFile}
                      icon={Video}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="video-external"
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 8 }}
                    transition={{ duration: 0.18 }}
                    className="space-y-3"
                  >
                    {/* URL preview */}
                    {videoUrlInput && (() => {
                      const thumb = getVideoThumbnail(videoUrlInput);
                      if (thumb?.type === 'youtube') {
                        return (
                          <div className="relative h-40 w-full overflow-hidden rounded-xl border">
                            <img
                              src={`https://img.youtube.com/vi/${thumb.id}/hqdefault.jpg`}
                              alt="Preview do vídeo"
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                              <Play className="h-10 w-10 fill-white text-white drop-shadow-lg" />
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={videoUrlInput}
                          onChange={(e) => setVideoUrlInput(e.target.value)}
                          placeholder="https://youtube.com/watch?v=... ou outro link"
                          className="pl-9 text-sm"
                          onKeyDown={(e) => e.key === 'Enter' && handleSaveVideoUrl()}
                        />
                      </div>
                      <Button
                        onClick={handleSaveVideoUrl}
                        disabled={savingUrl || !videoUrlInput.trim()}
                        className="shrink-0 gap-1.5"
                      >
                        {savingUrl ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Salvar
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Cole o link do YouTube, Vimeo ou qualquer plataforma de vídeo.
                      Links do YouTube mostrarão preview automático.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          {/* Replace video button when video exists */}
          {hasVideo && !videoUploading && (
            <div className="flex justify-end">
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-xs text-muted-foreground"
                onClick={() => {
                  handleRemoveVideo();
                }}
              >
                <X className="h-3.5 w-3.5" />
                Substituir vídeo
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Tips                                                                  */}
      {/* ------------------------------------------------------------------ */}
      <div className="rounded-xl border bg-gradient-to-br from-cyan-500/5 via-transparent to-transparent p-5">
        <div className="flex gap-3">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-cyan-500" />
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-foreground">Dicas para se destacar</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Mantenha seu currículo PDF atualizado e com formatação profissional</li>
              <li>• No vídeo, apresente-se em até 2 minutos: quem você é, sua trajetória e objetivos</li>
              <li>• Grave em ambiente iluminado, com áudio claro e fundo neutro</li>
              <li>• Links do YouTube têm melhor compatibilidade com recrutadores</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
