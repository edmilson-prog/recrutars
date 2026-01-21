/**
 * CategoryForm Component
 * PRD-046: Banco de Perguntas e Avaliação Comportamental
 *
 * Formulário para editar categorias de avaliação
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
import { Switch } from '@/components/ui/switch';
import type { AssessmentCategory, CategoryFormData } from '@/types/assessment';

// Form schema
const categoryFormSchema = z.object({
  name: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  description: z.string().min(10, 'Descrição deve ter pelo menos 10 caracteres'),
  order: z.number().min(1).max(99),
  isActive: z.boolean(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

interface CategoryFormProps {
  category: AssessmentCategory;
  dimensionName: string;
  onSubmit: (data: CategoryFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function CategoryForm({
  category,
  dimensionName,
  onSubmit,
  onCancel,
  isSubmitting = false,
}: CategoryFormProps) {
  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: {
      name: category.name,
      description: category.description,
      order: category.order,
      isActive: category.isActive,
    },
  });

  // Reset form when category changes
  useEffect(() => {
    form.reset({
      name: category.name,
      description: category.description,
      order: category.order,
      isActive: category.isActive,
    });
  }, [category, form]);

  const handleSubmit = (values: CategoryFormValues) => {
    onSubmit({
      ...values,
      dimensionId: category.dimensionId,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Dimension (read-only) */}
        <FormItem>
          <FormLabel>Dimensão</FormLabel>
          <Input value={dimensionName} disabled className="bg-muted" />
          <FormDescription>
            A dimensão da categoria não pode ser alterada
          </FormDescription>
        </FormItem>

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome *</FormLabel>
              <FormControl>
                <Input placeholder="Nome da categoria" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="O que esta categoria avalia..."
                  className="min-h-[80px] resize-y"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Descreva brevemente o que esta categoria avalia
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Order */}
        <FormField
          control={form.control}
          name="order"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ordem *</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={99}
                  {...field}
                  onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                />
              </FormControl>
              <FormDescription>
                Ordem de exibição (1-99)
              </FormDescription>
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
                <FormLabel className="text-base">Categoria Ativa</FormLabel>
                <FormDescription>
                  Categorias inativas não aparecem nas seleções
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
            {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
