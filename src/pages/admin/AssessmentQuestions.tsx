/**
 * Assessment Questions Page (Admin)
 * PRD-046: Banco de Perguntas e Avaliação Comportamental
 *
 * Gestão de perguntas do banco de avaliação Gauge-Pro 2.0
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  Plus,
  X,
  FileQuestion,
  FolderTree,
  ChevronLeft,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import {
  QuestionCard,
  QuestionFilters,
  QuestionForm,
} from '@/components/assessment';
import { useAssessmentQuestions } from '@/hooks/useAssessmentQuestions';
import { useAssessmentCategories } from '@/hooks/useAssessmentCategories';
import type { AssessmentQuestion, QuestionFormData } from '@/types/assessment';
import {
  QUESTION_TYPE_LABELS,
  QUESTION_TYPE_ICONS,
  QUESTION_LEVEL_LABELS,
} from '@/types/assessment';
import { AdminTabNav } from '@/components/admin/AdminTabNav';
import { toast } from 'sonner';

export default function AdminAssessmentQuestions() {
  const {
    questions,
    pagination,
    stats,
    filters,
    searchTerm,
    setSearchTerm,
    updateFilters,
    clearFilters,
    goToPage,
    createQuestion,
    updateQuestion,
    toggleQuestionStatus,
    duplicateQuestion,
    getQuestionWithContext,
  } = useAssessmentQuestions({ pageSize: 50 });

  const { getCategoryById, getDimensionById } = useAssessmentCategories();

  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<AssessmentQuestion | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle edit
  const handleEdit = (question: AssessmentQuestion) => {
    setEditingQuestion(question);
    setIsFormOpen(true);
  };

  // Handle duplicate
  const handleDuplicate = (question: AssessmentQuestion) => {
    const duplicated = duplicateQuestion(question.id);
    if (duplicated) {
      toast.success(`Pergunta duplicada: ${duplicated.code}`);
    }
  };

  // Handle toggle status
  const handleToggleStatus = (question: AssessmentQuestion) => {
    toggleQuestionStatus(question.id);
    toast.success(
      question.isActive
        ? `Pergunta ${question.code} desativada`
        : `Pergunta ${question.code} ativada`
    );
  };

  // Handle create/edit submit
  const handleFormSubmit = (data: QuestionFormData) => {
    setIsSubmitting(true);

    setTimeout(() => {
      if (editingQuestion) {
        updateQuestion(editingQuestion.id, data);
        toast.success(`Pergunta ${data.code} atualizada`);
      } else {
        createQuestion(data);
        toast.success(`Pergunta ${data.code} criada`);
      }

      setIsFormOpen(false);
      setEditingQuestion(null);
      setIsSubmitting(false);
    }, 500);
  };

  // Handle form close
  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingQuestion(null);
  };

  // Helper function for pagination
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const { page, totalPages } = pagination;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <DashboardLayout userType="admin">
      <AdminTabNav />
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Button variant="ghost" size="sm" asChild className="h-8 px-2">
                <Link to="/admin/avaliacoes/categorias">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Categorias
                </Link>
              </Button>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Banco de Perguntas</h1>
            <p className="text-muted-foreground">
              Gerencie as {stats.totalQuestions} perguntas do sistema Gauge-Pro 2.0
            </p>
          </div>

          <Button onClick={() => setIsFormOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova Pergunta
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-5">
          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileQuestion className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalQuestions}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <FileQuestion className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeQuestions}</p>
                <p className="text-xs text-muted-foreground">Ativas</p>
              </div>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="text-center">
              <p className="text-lg font-bold">{stats.byType.behavioral}</p>
              <p className="text-xs text-muted-foreground">
                {QUESTION_TYPE_ICONS.behavioral} Comportamental
              </p>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="text-center">
              <p className="text-lg font-bold">{stats.byType.situational}</p>
              <p className="text-xs text-muted-foreground">
                {QUESTION_TYPE_ICONS.situational} Situacional
              </p>
            </div>
          </div>

          <div className="bg-card border rounded-lg p-4">
            <div className="text-center">
              <p className="text-lg font-bold">{stats.byType.self_assessment}</p>
              <p className="text-xs text-muted-foreground">
                {QUESTION_TYPE_ICONS.self_assessment} Autoavaliação
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código ou texto da pergunta..."
              className="pl-10 pr-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                onClick={() => setSearchTerm('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Mobile filter button */}
          <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" className="md:hidden">
                <Filter className="h-4 w-4 mr-2" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <SheetTitle>Filtros</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <QuestionFilters
                  filters={filters}
                  onFilterChange={updateFilters}
                  onClearFilters={clearFilters}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <div className="flex gap-6">
          {/* Sidebar filters (desktop) */}
          <div className="hidden md:block w-72 flex-shrink-0">
            <div className="bg-card border rounded-lg p-6 sticky top-4">
              <h2 className="font-semibold mb-4">Filtros</h2>
              <QuestionFilters
                filters={filters}
                onFilterChange={updateFilters}
                onClearFilters={clearFilters}
              />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 space-y-6">
            {/* Results count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {pagination.total} pergunta(s) encontrada(s)
                {pagination.totalPages > 1 && (
                  <span className="ml-1">
                    - Página {pagination.page} de {pagination.totalPages}
                  </span>
                )}
              </p>
            </div>

            {/* Questions list */}
            {questions.length > 0 ? (
              <div className="space-y-4">
                {questions.map((question, index) => {
                  const context = getQuestionWithContext(question.id);
                  return (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      category={context?.category}
                      dimension={context?.dimension}
                      index={index}
                      onEdit={handleEdit}
                      onDuplicate={handleDuplicate}
                      onToggleStatus={handleToggleStatus}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 border rounded-lg bg-card">
                <FileQuestion className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                <h3 className="text-lg font-semibold mb-2">Nenhuma pergunta encontrada</h3>
                <p className="text-muted-foreground">
                  Tente ajustar os filtros ou termo de busca.
                </p>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => goToPage(Math.max(1, pagination.page - 1))}
                        className={
                          pagination.page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>

                    {getPageNumbers().map((page, index) => (
                      <PaginationItem key={index}>
                        {page === '...' ? (
                          <span className="px-4">...</span>
                        ) : (
                          <PaginationLink
                            onClick={() => goToPage(page as number)}
                            isActive={pagination.page === page}
                            className="cursor-pointer"
                          >
                            {page}
                          </PaginationLink>
                        )}
                      </PaginationItem>
                    ))}

                    <PaginationItem>
                      <PaginationNext
                        onClick={() => goToPage(Math.min(pagination.totalPages, pagination.page + 1))}
                        className={
                          pagination.page === pagination.totalPages
                            ? 'pointer-events-none opacity-50'
                            : 'cursor-pointer'
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </div>
        </div>

        {/* Question Form Dialog */}
        <Dialog open={isFormOpen} onOpenChange={(open) => !open && handleFormClose()}>
          <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingQuestion ? 'Editar Pergunta' : 'Nova Pergunta'}
              </DialogTitle>
              <DialogDescription>
                {editingQuestion
                  ? `Editando pergunta ${editingQuestion.code}`
                  : 'Preencha os dados para criar uma nova pergunta'}
              </DialogDescription>
            </DialogHeader>

            <QuestionForm
              question={editingQuestion}
              onSubmit={handleFormSubmit}
              onCancel={handleFormClose}
              isSubmitting={isSubmitting}
            />
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
}
