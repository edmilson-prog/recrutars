/**
 * NewTicketModal Component
 * PRD-028: Central de Ajuda - New Ticket Creation Modal
 */

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, Paperclip, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { TicketCategory } from '@/types/help';
import { ticketCategoryLabels } from '@/types/help';

const formSchema = z.object({
  category: z.string().min(1, 'Selecione uma categoria'),
  subject: z.string().min(5, 'O assunto deve ter no mínimo 5 caracteres'),
  description: z
    .string()
    .min(20, 'A descrição deve ter no mínimo 20 caracteres')
    .max(2000, 'A descrição deve ter no máximo 2000 caracteres'),
});

type FormValues = z.infer<typeof formSchema>;

interface NewTicketModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail: string;
  onSubmit: (
    category: TicketCategory,
    subject: string,
    description: string,
    attachment?: { url: string; name: string }
  ) => Promise<void>;
}

export function NewTicketModal({
  open,
  onOpenChange,
  userEmail,
  onSubmit,
}: NewTicketModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [attachment, setAttachment] = useState<{ url: string; name: string } | null>(
    null
  );
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      category: '',
      subject: '',
      description: '',
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tamanho (máx 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'Arquivo muito grande',
        description: 'O arquivo deve ter no máximo 5MB.',
        variant: 'destructive',
      });
      return;
    }

    // Validar tipo
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'application/pdf'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Tipo de arquivo não permitido',
        description: 'Apenas arquivos PNG, JPG e PDF são permitidos.',
        variant: 'destructive',
      });
      return;
    }

    // Converter para base64 (mock)
    const reader = new FileReader();
    reader.onloadend = () => {
      setAttachment({
        url: reader.result as string,
        name: file.name,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAttachment = () => {
    setAttachment(null);
  };

  const handleSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      await onSubmit(
        values.category as TicketCategory,
        values.subject,
        values.description,
        attachment || undefined
      );

      toast({
        title: 'Ticket criado com sucesso!',
        description: 'Nossa equipe entrará em contato em breve.',
      });

      form.reset();
      setAttachment(null);
      onOpenChange(false);
    } catch (error) {
      toast({
        title: 'Erro ao criar ticket',
        description: 'Tente novamente mais tarde.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Criar Novo Ticket</DialogTitle>
          <DialogDescription>
            Descreva seu problema ou dúvida e nossa equipe entrará em contato.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Email (read-only) */}
            <FormItem>
              <FormLabel>Seu Email</FormLabel>
              <Input value={userEmail} disabled className="bg-muted" />
            </FormItem>

            {/* Categoria */}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione a categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(ticketCategoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Assunto */}
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assunto *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Descreva brevemente o problema"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Descreva detalhadamente seu problema ou dúvida..."
                      className="min-h-[150px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <FormMessage />
                    <span>
                      {field.value.length}/2000 caracteres
                    </span>
                  </div>
                </FormItem>
              )}
            />

            {/* Upload de anexo */}
            <FormItem>
              <FormLabel>Anexo (opcional)</FormLabel>
              <div className="space-y-2">
                {attachment ? (
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted p-3">
                    <Paperclip className="h-4 w-4 text-muted-foreground" />
                    <span className="flex-1 truncate text-sm">{attachment.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleRemoveAttachment}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={handleFileChange}
                      className="cursor-pointer"
                    />
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Formatos aceitos: PNG, JPG, PDF (máx. 5MB)
                </p>
              </div>
            </FormItem>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Enviar Ticket
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
