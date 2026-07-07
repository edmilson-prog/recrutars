import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface CandidatePhotoLightboxProps {
  src?: string | null;
  alt: string;
  initials: string;
  className?: string;
  fallbackClassName?: string;
}

export function CandidatePhotoLightbox({
  src,
  alt,
  initials,
  className,
  fallbackClassName,
}: CandidatePhotoLightboxProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasPhoto = Boolean(src);

  return (
    <>
      <Avatar
        className={cn(
          'shrink-0',
          hasPhoto && 'cursor-pointer transition-opacity hover:opacity-80',
          className,
        )}
        onClick={hasPhoto ? () => setIsOpen(true) : undefined}
        role={hasPhoto ? 'button' : undefined}
        tabIndex={hasPhoto ? 0 : undefined}
        onKeyDown={
          hasPhoto
            ? (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  setIsOpen(true);
                }
              }
            : undefined
        }
        aria-label={hasPhoto ? `Ampliar foto de ${alt}` : undefined}
      >
        {hasPhoto && <AvatarImage src={src ?? undefined} alt={alt} />}
        <AvatarFallback className={cn('bg-primary/10 text-primary', fallbackClassName)}>
          {initials}
        </AvatarFallback>
      </Avatar>

      {hasPhoto && (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-3xl border-none bg-transparent p-0 shadow-none">
            <DialogTitle className="sr-only">{alt}</DialogTitle>
            <img
              src={src ?? undefined}
              alt={alt}
              className="max-h-[85vh] w-full rounded-lg object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
