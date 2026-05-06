// src/components/empresa/notes/CandidateNotesCard.tsx
import { forwardRef, useImperativeHandle, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, StickyNote, Plus } from 'lucide-react';
import { NoteEditor } from './NoteEditor';
import { NoteListItem } from './NoteListItem';
import { NoteHistoryModal } from './NoteHistoryModal';
import {
  useCandidateNotes,
  useCreateCandidateNote,
  useUpdateCandidateNote,
  useDeleteCandidateNote,
  useCandidateNoteHistory,
} from '@/hooks/useCandidateNotesQuery';

export interface CandidateNotesCardHandle {
  scrollIntoView: () => void;
  startCreating: () => void;
}

interface CandidateNotesCardProps {
  candidateId: string;
  companyId: string;
}

export const CandidateNotesCard = forwardRef<
  CandidateNotesCardHandle,
  CandidateNotesCardProps
>(function CandidateNotesCard({ candidateId, companyId }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [historyNoteId, setHistoryNoteId] = useState<string | null>(null);

  const { data: notes, isLoading } = useCandidateNotes(candidateId, companyId);
  const createMut = useCreateCandidateNote();
  const updateMut = useUpdateCandidateNote(candidateId, companyId);
  const deleteMut = useDeleteCandidateNote(candidateId, companyId);
  const { data: history, isLoading: historyLoading } = useCandidateNoteHistory(
    historyNoteId ?? undefined,
  );

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
    await createMut.mutateAsync({ candidateId, companyId, content });
    setIsCreating(false);
  };

  return (
    <div ref={containerRef}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-5 w-5 text-primary" />
            Notas sobre o Candidato
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Anotações perenes da equipe — visíveis em qualquer vaga, invisíveis para o candidato.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {isCreating ? (
            <NoteEditor
              onSave={handleCreate}
              onCancel={() => setIsCreating(false)}
              isSubmitting={createMut.isPending}
              placeholder="Escreva uma observação sobre este candidato…"
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
          ) : !notes || notes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma nota ainda. Adicione a primeira observação sobre este candidato.
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
