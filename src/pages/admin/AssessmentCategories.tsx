/**
 * Assessment Categories Page (Admin)
 * PRD-046: Banco de Perguntas e Avaliação Comportamental
 *
 * Gestão de dimensões e categorias de avaliação
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderTree,
  FileQuestion,
  ChevronRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { CategoryTree, CategoryForm } from '@/components/assessment';
import { useAssessmentCategories } from '@/hooks/useAssessmentCategories';
import type { AssessmentCategory, CategoryFormData } from '@/types/assessment';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { toast } from 'sonner';

export default function AdminAssessmentCategories() {
  const {
    dimensions,
    categoriesByDimension,
    stats,
    getDimensionById,
    updateCategory,
    toggleCategoryStatus,
  } = useAssessmentCategories();

  // Edit dialog state
  const [editingCategory, setEditingCategory] = useState<AssessmentCategory | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle edit category
  const handleEditCategory = (category: AssessmentCategory) => {
    setEditingCategory(category);
  };

  // Handle toggle status
  const handleToggleStatus = (category: AssessmentCategory) => {
    toggleCategoryStatus(category.id);
    toast.success(
      category.isActive
        ? `Categoria "${category.name}" desativada`
        : `Categoria "${category.name}" ativada`
    );
  };

  // Handle form submit
  const handleFormSubmit = (data: CategoryFormData) => {
    if (!editingCategory) return;

    setIsSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      updateCategory(editingCategory.id, data);
      toast.success(`Categoria "${data.name}" atualizada com sucesso`);
      setEditingCategory(null);
      setIsSubmitting(false);
    }, 500);
  };

  // Get dimension name for form
  const editingDimensionName = editingCategory
    ? getDimensionById(editingCategory.dimensionId)?.name || ''
    : '';

  return (
    <DashboardLayout userType="admin">
      <div className="space-y-6">
        {/* Banner */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-l-[3px] border-l-primary p-6">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/10 shrink-0">
              <FolderTree className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold text-foreground">Categorias de Avaliação</h1>
              <p className="text-muted-foreground mt-1 text-sm">
                Gerencie as dimensões e categorias do sistema Gauge-Pro para avaliações comportamentais.
              </p>
            </div>
            <Button asChild className="shrink-0">
              <Link to="/admin/avaliacoes/perguntas">
                <FileQuestion className="h-4 w-4 mr-2" />
                Ver Perguntas
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>

        <AdminTabNav />

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FolderTree className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDimensions}</p>
                <p className="text-xs text-muted-foreground">Dimensões</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <FolderTree className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalCategories}</p>
                <p className="text-xs text-muted-foreground">Categorias</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/10">
                <FileQuestion className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                <p className="text-xs text-muted-foreground">Perguntas</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-500/10">
                <FolderTree className="h-5 w-5 text-amber-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeCategories}</p>
                <p className="text-xs text-muted-foreground">Categorias Ativas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-muted-foreground">Dimensões:</span>
          {dimensions.map((dim) => (
            <Badge
              key={dim.id}
              variant="outline"
              className="font-normal"
            >
              {dim.icon} {dim.name}
              <span className="ml-1 text-muted-foreground">({dim.questionCount})</span>
            </Badge>
          ))}
        </div>

        {/* Category Tree */}
        <CategoryTree
          dimensions={dimensions}
          categoriesByDimension={categoriesByDimension}
          onEditCategory={handleEditCategory}
          onToggleCategoryStatus={handleToggleStatus}
        />

        {/* Edit Category Dialog */}
        <Dialog
          open={!!editingCategory}
          onOpenChange={(open) => !open && setEditingCategory(null)}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Editar Categoria</DialogTitle>
              <DialogDescription>
                Altere as informações da categoria de avaliação
              </DialogDescription>
            </DialogHeader>

            {editingCategory && (
              <CategoryForm
                category={editingCategory}
                dimensionName={editingDimensionName}
                onSubmit={handleFormSubmit}
                onCancel={() => setEditingCategory(null)}
                isSubmitting={isSubmitting}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
