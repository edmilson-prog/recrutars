// src/components/empresa/notes/NoteListItem.tsx
import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
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
import { MoreVertical, Pencil, Trash2, History } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { NoteEditor } from './NoteEditor';
import type { CandidateNote } from '@/types/notes';

interface NoteListItemProps {
  note: CandidateNote;
  onUpdate: (content: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onShowHistory: () => void;
  isUpdating?: boolean;
  isDeleting?: boolean;
}

export function NoteListItem({
  note,
  onUpdate,
  onDelete,
  onShowHistory,
  isUpdating = false,
  isDeleting = false,
}: NoteListItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const wasEdited = note.updatedAt !== note.createdAt;
  const initials = (note.authorName ?? 'U')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handleSave = async (content: string) => {
    await onUpdate(content);
    setIsEditing(false);
  };

  const handleConfirmDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      await onDelete();
    } finally {
      setConfirmDelete(false);
    }
  };

  return (
    <div className="flex gap-3 p-4 rounded-lg border bg-card">
      <Avatar className="h-9 w-9 flex-shrink-0">
        <AvatarImage src={note.authorAvatar ?? undefined} />
        <AvatarFallback className="bg-primary/10 text-primary text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <span className="font-medium text-sm">{note.authorName ?? 'Usuário'}</span>
            <span
              className="text-xs text-muted-foreground"
              title={format(new Date(note.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
            >
              {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: ptBR })}
            </span>
            {wasEdited && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                editado
              </Badge>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" /> Editar
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onShowHistory}>
                <History className="h-4 w-4 mr-2" /> Ver histórico
              </DropdownMenuItem>
              <DropdownMenuItem
                onSelect={() => setConfirmDelete(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" /> Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {isEditing ? (
          <div className="mt-2">
            <NoteEditor
              initialContent={note.content}
              onSave={handleSave}
              onCancel={() => setIsEditing(false)}
              isSubmitting={isUpdating}
            />
          </div>
        ) : (
          <p className="text-sm mt-2 whitespace-pre-wrap break-words">{note.content}</p>
        )}
      </div>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir nota?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação fica registrada no histórico e pode ser revertida posteriormente por qualquer membro da equipe.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Excluindo…' : 'Excluir'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
