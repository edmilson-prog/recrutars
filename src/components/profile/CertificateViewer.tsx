/**
 * CertificateViewer — shared course-certificate viewing for the candidate,
 * company and admin views.
 *
 * - http/https URLs (link certificates and Storage-hosted files): opens in a
 *   new tab, same pattern as the resume PDF in DocumentsTab.
 * - data: URLs (legacy file certificates stored as base64 in the database):
 *   browsers block top-level navigation to data: URLs, so the file is
 *   converted to a Blob object URL and previewed inside a dialog with
 *   download / open-in-new-tab actions.
 */

import { useState } from 'react';
import { Award, Download, ExternalLink, FileText } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Course } from '@/types/curriculum';

interface CertificateViewerProps {
  course: Course;
}

function isDataUrl(url: string): boolean {
  return url.startsWith('data:');
}

function dataUrlToBlob(dataUrl: string): Blob | null {
  try {
    const [header, base64] = dataUrl.split(',');
    const mime = header.match(/data:([^;]+)/)?.[1] ?? 'application/octet-stream';
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new Blob([bytes], { type: mime });
  } catch {
    return null;
  }
}

function extensionFromMime(mime: string): string {
  if (mime === 'application/pdf') return 'pdf';
  if (mime === 'image/png') return 'png';
  if (mime === 'image/jpeg') return 'jpg';
  return 'bin';
}

export function CertificateViewer({ course }: CertificateViewerProps) {
  const [open, setOpen] = useState(false);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [mime, setMime] = useState('');

  const url = course.certificateUrl;
  if (!url) return null;

  const fileName =
    course.certificateFileName ||
    `certificado-${course.name.replace(/[^\p{L}\p{N}._-]+/gu, '-').toLowerCase()}.${extensionFromMime(mime)}`;

  const handleView = () => {
    if (!isDataUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer');
      return;
    }
    const blob = dataUrlToBlob(url);
    if (!blob) {
      toast.error('Não foi possível abrir o certificado.');
      return;
    }
    setMime(blob.type);
    setObjectUrl(URL.createObjectURL(blob));
    setOpen(true);
  };

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next && objectUrl) {
      URL.revokeObjectURL(objectUrl);
      setObjectUrl(null);
    }
  };

  const handleDownload = () => {
    if (!objectUrl) return;
    const anchor = document.createElement('a');
    anchor.href = objectUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="h-7 gap-1.5 text-xs"
        onClick={handleView}
      >
        <Award className="h-3.5 w-3.5" />
        Ver certificado
        {!isDataUrl(url) && <ExternalLink className="h-3 w-3" />}
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Certificado — {course.name}</DialogTitle>
            <DialogDescription>
              {course.institution} · {course.year}
              {course.certificateFileName ? ` · ${course.certificateFileName}` : ''}
            </DialogDescription>
          </DialogHeader>

          {objectUrl && mime.startsWith('image/') && (
            <img
              src={objectUrl}
              alt={`Certificado de ${course.name}`}
              className="max-h-[70vh] w-auto mx-auto rounded-md border"
            />
          )}
          {objectUrl && mime === 'application/pdf' && (
            <iframe
              src={objectUrl}
              title={`Certificado de ${course.name}`}
              className="w-full h-[70vh] rounded-md border"
            />
          )}
          {objectUrl && !mime.startsWith('image/') && mime !== 'application/pdf' && (
            <div className="flex flex-col items-center gap-2 py-10 text-muted-foreground">
              <FileText className="h-10 w-10" />
              <p className="text-sm">
                Pré-visualização indisponível para este formato. Baixe o arquivo para abrir.
              </p>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => objectUrl && window.open(objectUrl, '_blank', 'noopener,noreferrer')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Abrir em nova guia
            </Button>
            <Button onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Baixar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
