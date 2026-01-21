/**
 * QuestionForm Component
 * PRD-046: Banco de Perguntas e Avaliação Comportamental
 *
 * Formulário para criar/editar perguntas de avaliação
 */

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useAssessmentCategories } from '@/hooks/useAssessmentCategories';
import type { AssessmentQuestion, QuestionFormData } from '@/types/assessment';
import {
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_ICONS,
  QUESTION_LEVEL_LABELS,
  QUESTION_LEVEL_STARS,
} from '@/types/assessment';

// Form schema
const questionFormSchema = z.object({
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  code: z
    .string()
    .min(1, 'Código é obrigatório')
    .regex(/^\d+\.\d+(-\w+)?$/, 'Formato inválido. Use: X.Y ou X.Y-sufixo'),
  type: z.enum(['behavioral', 'situational', 'self_assessment']),
  level: z.enum(['basic', 'intermediate', 'advanced']),
  text: z.string().min(10, 'A pergunta deve ter pelo menos 10 caracteres'),
  helpText: z.string().optional(),
  isActive: z.boolean(),
});

type QuestionFormValues = z.infer<typeof questionFormSchema>;

interface QuestionFormProps {
  question?: AssessmentQuestion | null;
  onSubmit: (data: QuestionFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function QuestionForm({
  question,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: QuestionFormProps) {
  const { dimensions, getCategoriesByDimensionId } = useAssessmentCategories();
  const isEditing = !!question;

  const form = useForm<QuestionFormValues>({
    resolver: zodResolver(questionFormSchema),
    defaultValues: {
      categoryId: question?.categoryId || '',
      code: question?.code || '',
      type: question?.type || 'behavioral',
      level: question?.level || 'intermediate',
      text: question?.text || '',
      helpText: question?.helpText || '',
      isActive: question?.isActive ?? true,
    },
  });

  // Watch categoryId to determine dimension
  const selectedCategoryId = form.watch('categoryId');

  // Find dimension for selected category
  const selectedDimensionId = dimensions.find((dim) =>
    getCategoriesByDimensionId(dim.id).some((c) => c.id === selectedCategoryId)
  )?.id;

  // Reset form when question changes
  useEffect(() => {
    if (question) {
      form.reset({
        categoryId: question.categoryId,
        code: question.code,
        type: question.type,
        level: question.level,
        text: question.text,
        helpText: question.helpText || '',
        isActive: question.isActive,
      });
    }
  }, [question, form]);

  const handleSubmit = (values: QuestionFormValues) => {
    onSubmit(values as QuestionFormData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Dimension and Category */}
        <div className="grid gap-4 md:grid-cols-2">
          {/* Dimension (display only, derived from category) */}
          <FormItem>
            <FormLabel>Dimensão</FormLabel>
            <Select
              value={selectedDimensionId || ''}
              onValueChange={(dimId) => {
                // When dimension changes, clear category
                const firstCategory = getCategoriesByDimensionId(dimId)[0];
                form.setValue('categoryId', firstCategory?.id || '');
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione a dimensão" />
              </SelectTrigger>
              <SelectContent>
                {dimensions.map((dim) => (
                  <SelectItem key={dim.id} value={dim.id}>
                    {dim.icon} {dim.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>

          {/* Category */}
          <FormField
            control={form.control}
            name="categoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria *</FormLabel>
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={!selectedDimensionId}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a categoria" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedDimensionId &&
                      getCategoriesByDimensionId(selectedDimensionId).map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Code, Type, Level */}
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 1.1 ou 6.7-alt" {...field} />
                </FormControl>
                <FormDescription>Formato: X.Y ou X.Y-sufixo</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="behavioral">
                      {QUESTION_TYPE_ICONS.behavioral} {QUESTION_TYPE_LABELS.behavioral}
                    </SelectItem>
                    <SelectItem value="situational">
                      {QUESTION_TYPE_ICONS.situational} {QUESTION_TYPE_LABELS.situational}
                    </SelectItem>
                    <SelectItem value="self_assessment">
                      {QUESTION_TYPE_ICONS.self_assessment}{' '}
                      {QUESTION_TYPE_LABELS.self_assessment}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="level"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nível *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="basic">
                      {QUESTION_LEVEL_STARS.basic} {QUESTION_LEVEL_LABELS.basic}
                    </SelectItem>
                    <SelectItem value="intermediate">
                      {QUESTION_LEVEL_STARS.intermediate}{' '}
                      {QUESTION_LEVEL_LABELS.intermediate}
                    </SelectItem>
                    <SelectItem value="advanced">
                      {QUESTION_LEVEL_STARS.advanced} {QUESTION_LEVEL_LABELS.advanced}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Question text */}
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Pergunta *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Digite o texto da pergunta..."
                  className="min-h-[100px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                {field.value.length} caracteres
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Help text */}
        <FormField
          control={form.control}
          name="helpText"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Texto de ajuda (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Instruções ou dicas para o avaliador..."
                  className="min-h-[60px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active status */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Pergunta Ativa</FormLabel>
                <FormDescription>
                  Perguntas inativas não aparecem nas avaliações
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting
              ? 'Salvando...'
              : isEditing
              ? 'Salvar Alterações'
              : 'Criar Pergunta'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
