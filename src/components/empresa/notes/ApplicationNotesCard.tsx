// src/components/empresa/notes/ApplicationNotesCard.tsx
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, FileText, Plus } from 'lucide-react';
import { NoteEditor } from './NoteEditor';
import { NoteListItem } from './NoteListItem';
import { NoteHistoryModal } from './NoteHistoryModal';
import {
  useApplicationNotes,
  useAddApplicationNote,
  useUpdateApplicationNote,
  useDeleteApplicationNote,
  useApplicationNoteHistory,
} from '@/hooks/useApplicationsQuery';
import type { ApplicationNote } from '@/types/application';
import type { CandidateNote } from '@/types/notes';

export interface ApplicationNotesCardHandle {
  scrollIntoView: () => void;
  startCreating: () => void;
}

interface ApplicationNotesCardProps {
  applicationId: string;
  jobTitle?: string;
}

/**
 * Adapts the lean `ApplicationNote` shape returned by `useApplicationNotes`
 * (`{ id, applicationId, content, author, createdAt }`) to the richer
 * `CandidateNote` shape consumed by `NoteListItem`.
 *
 * The applications service does not expose authorId/avatar/updatedAt, so we
 * fill those with safe defaults (empty IDs, no avatar, updatedAt === createdAt
 * so the "editado" badge does not appear, isDeleted false because the service
 * already filters soft-deleted rows out).
 */
function adaptApplicationNote(raw: ApplicationNote): CandidateNote {
  return {
    id: raw.id,
    candidateId: '',
    companyId: '',
    authorId: '',
    authorName: raw.author,
    authorAvatar: null,
    content: raw.content,
    createdAt: raw.createdAt,
    updatedAt: raw.createdAt,
    isDeleted: false,
    deletedAt: null,
    deletedBy: null,
  };
}

export const ApplicationNotesCard = forwardRef<
  ApplicationNotesCardHandle,
  ApplicationNotesCardProps
>(function ApplicationNotesCard({ applicationId, jobTitle }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [historyNoteId, setHistoryNoteId] = useState<string | null>(null);

  const { data: rawNotes, isLoading } = useApplicationNotes(applicationId);
  const createMut = useAddApplicationNote();
  const updateMut = useUpdateApplicationNote(applicationId);
  const deleteMut = useDeleteApplicationNote(applicationId);
  const { data: history, isLoading: historyLoading } = useApplicationNoteHistory(
    historyNoteId ?? undefined,
  );

  const notes = (rawNotes ?? []).map(adaptApplicationNote);

  useImperativeHandle(ref, () => ({
    scrollIntoView: () => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    startCreating: () => {
      containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setIsCreating(true);
    },
  }));

  const handleCreate = async (content: string) => {
    await createMut.mutateAsync({ applicationId, content });
    setIsCreating(false);
  };

  return (
    <div ref={containerRef}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-600" />
            Notas desta Candidatura
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Observações específicas {jobTitle ? `sobre a vaga "${jobTitle}"` : 'sobre esta candidatura'} — invisíveis para o candidato.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCreating ? (
            <NoteEditor
              onSave={handleCreate}
              onCancel={() => setIsCreating(false)}
              isSubmitting={createMut.isPending}
              placeholder="Escreva uma observação sobre esta candidatura…"
            />
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreating(true)}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" /> Adicionar nota
            </Button>
          )}

          {isLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma nota ainda nesta candidatura.
            </p>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <NoteListItem
                  key={note.id}
                  note={note}
                  onUpdate={async (content) => {
                    await updateMut.mutateAsync({ noteId: note.id, content });
                  }}
                  onDelete={async () => {
                    await deleteMut.mutateAsync(note.id);
                  }}
                  onShowHistory={() => setHistoryNoteId(note.id)}
                  isUpdating={updateMut.isPending && updateMut.variables?.noteId === note.id}
                  isDeleting={deleteMut.isPending && deleteMut.variables === note.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NoteHistoryModal
        open={!!historyNoteId}
        onOpenChange={(open) => !open && setHistoryNoteId(null)}
        history={history}
        isLoading={historyLoading}
      />
    </div>
  );
});
