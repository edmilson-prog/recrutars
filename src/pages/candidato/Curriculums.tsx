// PRD-022: Página de Listagem de Currículos

import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Plus,
  Copy,
  Archive,
  ArchiveRestore,
  Star,
  Trash2,
  MoreVertical,
  FileText,
  FileDown,
  Eye,
  Edit,
  MapPin,
  Mail,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { toast } from 'sonner';

import { mockCurriculums } from '@/data/mockData';
import type { Curriculum, CompletenessSection } from '@/types';
import {
  calculateCompleteness,
  getProgressColor,
  getCompletenessMessage,
  formatLastUpdated,
} from '@/utils/curriculumCompleteness';
import { CurriculumPreview } from '@/components/candidato/CurriculumPreview';
import { ExportPDFModal } from '@/components/candidato/ExportPDFModal';

// Componente de Card do Currículo
interface CurriculumCardProps {
  curriculum: Curriculum;
  index: number;
  onDuplicate: (curriculum: Curriculum) => void;
  onArchive: (curriculum: Curriculum) => void;
  onUnarchive: (curriculum: Curriculum) => void;
  onSetDefault: (curriculum: Curriculum) => void;
  onDelete: (curriculum: Curriculum) => void;
  onPreview: (curriculum: Curriculum) => void;
  onEdit: (curriculum: Curriculum) => void;
  onExportPDF: (curriculum: Curriculum) => void;
}

function CurriculumCard({
  curriculum,
  index,
  onDuplicate,
  onArchive,
  onUnarchive,
  onSetDefault,
  onDelete,
  onPreview,
  onEdit,
  onExportPDF,
}: CurriculumCardProps) {
  const completeness = calculateCompleteness(curriculum);
  const progressColorClass = getProgressColor(completeness.percentage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-cyan-500" />
              <div>
                <CardTitle className="text-lg flex items-center gap-2">
                  {curriculum.name}
                  {curriculum.isDefault && (
                    <Badge variant="default" className="bg-cyan-500">
                      <Star className="h-3 w-3 mr-1" />
                      Padrão
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  {curriculum.title}
                </p>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onPreview(curriculum)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Visualizar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onEdit(curriculum)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onExportPDF(curriculum)}>
                  <FileDown className="h-4 w-4 mr-2" />
                  Exportar PDF
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {!curriculum.isDefault && !curriculum.isArchived && (
                  <DropdownMenuItem onClick={() => onSetDefault(curriculum)}>
                    <Star className="h-4 w-4 mr-2" />
                    Definir como padrão
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={() => onDuplicate(curriculum)}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicar
                </DropdownMenuItem>
                {curriculum.isArchived ? (
                  <DropdownMenuItem onClick={() => onUnarchive(curriculum)}>
                    <ArchiveRestore className="h-4 w-4 mr-2" />
                    Desarquivar
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem onClick={() => onArchive(curriculum)}>
                    <Archive className="h-4 w-4 mr-2" />
                    Arquivar
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onDelete(curriculum)}
                  className="text-red-600"
                  disabled={curriculum.isDefault}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Info básica */}
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {curriculum.location || 'Localização não informada'}
            </div>
            <div className="flex items-center gap-1">
              <Mail className="h-4 w-4" />
              {curriculum.email}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {curriculum.availability || 'Não informada'}
            </div>
          </div>

          {/* Barra de completude */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Completude</span>
              <span className={`font-bold ${completeness.percentage >= 80 ? 'text-green-600' : completeness.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {completeness.percentage}%
              </span>
            </div>
            <Progress
              value={completeness.percentage}
              className="h-2"
            />
          </div>

          {/* Seções de completude */}
          <div className="space-y-2">
            <CompleteSectionsList sections={completeness.sections} />
          </div>

          {/* Mensagem de dica */}
          {completeness.percentage < 100 && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
              <Lightbulb className="h-4 w-4 text-amber-500 mt-0.5" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                {getCompletenessMessage(completeness.percentage)}
              </p>
            </div>
          )}

          {/* Data de atualização */}
          <div className="flex items-center justify-between pt-2 border-t">
            <span className="text-xs text-muted-foreground">
              {formatLastUpdated(curriculum.updatedAt)}
            </span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPreview(curriculum)}
              >
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </Button>
              <Button
                size="sm"
                onClick={() => onEdit(curriculum)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Componente de lista de seções completas/incompletas
function CompleteSectionsList({ sections }: { sections: CompletenessSection[] }) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {sections.map((section) => (
        <div
          key={section.key}
          className={`flex items-center gap-2 text-xs px-2 py-1.5 rounded ${
            section.isComplete
              ? 'bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-300'
              : section.required
              ? 'bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-300'
              : 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
          }`}
        >
          {section.isComplete ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : section.required ? (
            <XCircle className="h-3.5 w-3.5" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5" />
          )}
          <span>{section.name}</span>
          {section.itemCount !== undefined && section.itemCount > 0 && (
            <Badge variant="secondary" className="text-[10px] h-4 px-1">
              {section.itemCount}
            </Badge>
          )}
        </div>
      ))}
    </div>
  );
}

export default function Curriculums() {
  const navigate = useNavigate();

  // Estado dos currículos (simulando candidato logado = candidate-1)
  const [curriculums, setCurriculums] = useState<Curriculum[]>(
    mockCurriculums.filter((c) => c.candidateId === 'candidate-1')
  );

  // Estados de UI
  const [activeTab, setActiveTab] = useState<'active' | 'archived'>('active');
  const [selectedCurriculum, setSelectedCurriculum] = useState<Curriculum | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [curriculumToDelete, setCurriculumToDelete] = useState<Curriculum | null>(null);
  const [exportPDFOpen, setExportPDFOpen] = useState(false);
  const [curriculumToExport, setCurriculumToExport] = useState<Curriculum | null>(null);

  // Filtrar currículos por aba
  const filteredCurriculums = useMemo(() => {
    return curriculums.filter((c) =>
      activeTab === 'active' ? !c.isArchived : c.isArchived
    );
  }, [curriculums, activeTab]);

  // Contadores
  const activeCurriculumsCount = curriculums.filter((c) => !c.isArchived).length;
  const archivedCurriculumsCount = curriculums.filter((c) => c.isArchived).length;

  // Handlers
  const handleDuplicate = (curriculum: Curriculum) => {
    const newCurriculum: Curriculum = {
      ...curriculum,
      id: `curriculum-${Date.now()}`,
      name: `${curriculum.name} - Cópia`,
      isDefault: false,
      isArchived: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setCurriculums([...curriculums, newCurriculum]);
    toast.success('Currículo duplicado com sucesso!');
  };

  const handleArchive = (curriculum: Curriculum) => {
    setCurriculums(
      curriculums.map((c) =>
        c.id === curriculum.id
          ? { ...c, isArchived: true, isDefault: false }
          : c
      )
    );
    toast.success('Currículo arquivado.');
  };

  const handleUnarchive = (curriculum: Curriculum) => {
    setCurriculums(
      curriculums.map((c) =>
        c.id === curriculum.id ? { ...c, isArchived: false } : c
      )
    );
    setActiveTab('active');
    toast.success('Currículo desarquivado.');
  };

  const handleSetDefault = (curriculum: Curriculum) => {
    setCurriculums(
      curriculums.map((c) => ({
        ...c,
        isDefault: c.id === curriculum.id,
      }))
    );
    toast.success(`"${curriculum.name}" definido como currículo padrão.`);
  };

  const handleDelete = (curriculum: Curriculum) => {
    setCurriculumToDelete(curriculum);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (curriculumToDelete) {
      setCurriculums(curriculums.filter((c) => c.id !== curriculumToDelete.id));
      toast.success('Currículo excluído.');
      setCurriculumToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const handlePreview = (curriculum: Curriculum) => {
    setSelectedCurriculum(curriculum);
    setShowPreview(true);
  };

  const handleEdit = (curriculum: Curriculum) => {
    navigate(`/candidato/curriculos/${curriculum.id}`);
  };

  const handleExportPDF = (curriculum: Curriculum) => {
    setCurriculumToExport(curriculum);
    setExportPDFOpen(true);
  };

  const handleCreateNew = () => {
    navigate('/candidato/curriculos/novo');
  };

  return (
    <DashboardLayout userType="candidate">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Meus Currículos</h1>
            <p className="text-muted-foreground">
              Gerencie seus currículos e mantenha-os atualizados
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Novo Currículo
          </Button>
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as 'active' | 'archived')}
        >
          <TabsList>
            <TabsTrigger value="active" className="gap-2">
              <FileText className="h-4 w-4" />
              Ativos
              <Badge variant="secondary">{activeCurriculumsCount}</Badge>
            </TabsTrigger>
            <TabsTrigger value="archived" className="gap-2">
              <Archive className="h-4 w-4" />
              Arquivados
              <Badge variant="secondary">{archivedCurriculumsCount}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {filteredCurriculums.length === 0 ? (
              <Card className="p-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum currículo ativo
                </h3>
                <p className="text-muted-foreground mb-4">
                  Crie seu primeiro currículo para começar a se candidatar às
                  vagas.
                </p>
                <Button onClick={handleCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Criar Currículo
                </Button>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredCurriculums.map((curriculum, index) => (
                  <CurriculumCard
                    key={curriculum.id}
                    curriculum={curriculum}
                    index={index}
                    onDuplicate={handleDuplicate}
                    onArchive={handleArchive}
                    onUnarchive={handleUnarchive}
                    onSetDefault={handleSetDefault}
                    onDelete={handleDelete}
                    onPreview={handlePreview}
                    onEdit={handleEdit}
                    onExportPDF={handleExportPDF}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            {filteredCurriculums.length === 0 ? (
              <Card className="p-12 text-center">
                <Archive className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Nenhum currículo arquivado
                </h3>
                <p className="text-muted-foreground">
                  Currículos arquivados aparecerão aqui.
                </p>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                {filteredCurriculums.map((curriculum, index) => (
                  <CurriculumCard
                    key={curriculum.id}
                    curriculum={curriculum}
                    index={index}
                    onDuplicate={handleDuplicate}
                    onArchive={handleArchive}
                    onUnarchive={handleUnarchive}
                    onSetDefault={handleSetDefault}
                    onDelete={handleDelete}
                    onPreview={handlePreview}
                    onEdit={handleEdit}
                    onExportPDF={handleExportPDF}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Dialog de confirmação de exclusão */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir currículo?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta ação não pode ser desfeita. O currículo "
                {curriculumToDelete?.name}" será permanentemente excluído.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDelete}
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Preview do currículo */}
        {selectedCurriculum && (
          <CurriculumPreview
            curriculum={selectedCurriculum}
            open={showPreview}
            onOpenChange={setShowPreview}
          />
        )}

        {/* Modal de exportação PDF */}
        {curriculumToExport && (
          <ExportPDFModal
            curriculum={curriculumToExport}
            open={exportPDFOpen}
            onOpenChange={setExportPDFOpen}
          />
        )}
      </div>
    </DashboardLayout>
  );
}
