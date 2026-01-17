/**
 * Template Selector Component
 * PRD-041: Mensagens Personalizadas
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Search,
  X,
  ChevronRight,
  Mail,
  MessageSquare,
  ThumbsDown,
  Clock,
  PartyPopper,
  Pencil,
  Trash2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import type { MessageTemplate, TemplateCategory } from '@/types/messageTemplates';
import { CATEGORY_LABELS } from '@/types/messageTemplates';

interface TemplateSelectorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  templates: MessageTemplate[];
  onSelect: (template: MessageTemplate) => void;
  onDelete?: (templateId: string) => void;
}

const CATEGORY_ICONS: Record<TemplateCategory, React.ReactNode> = {
  invitation: <Mail className="w-4 h-4" />,
  feedback: <MessageSquare className="w-4 h-4" />,
  rejection: <ThumbsDown className="w-4 h-4" />,
  followup: <Clock className="w-4 h-4" />,
  welcome: <PartyPopper className="w-4 h-4" />,
  custom: <Pencil className="w-4 h-4" />,
};

export function TemplateSelector({
  open,
  onOpenChange,
  templates,
  onSelect,
  onDelete,
}: TemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory | 'all'>('all');

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set<TemplateCategory>();
    templates.forEach((t) => cats.add(t.category));
    return Array.from(cats);
  }, [templates]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesSearch =
        searchTerm === '' ||
        template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        selectedCategory === 'all' || template.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [templates, searchTerm, selectedCategory]);

  // Group templates by category
  const groupedTemplates = useMemo(() => {
    const grouped: Record<TemplateCategory, MessageTemplate[]> = {
      invitation: [],
      feedback: [],
      rejection: [],
      followup: [],
      welcome: [],
      custom: [],
    };

    filteredTemplates.forEach((template) => {
      grouped[template.category].push(template);
    });

    return grouped;
  }, [filteredTemplates]);

  const handleSelect = (template: MessageTemplate) => {
    onSelect(template);
    onOpenChange(false);
    setSearchTerm('');
    setSelectedCategory('all');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Biblioteca de Templates
          </DialogTitle>
          <DialogDescription>
            Selecione um template para começar sua mensagem
          </DialogDescription>
        </DialogHeader>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar template..."
            className="pl-9 pr-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category Tabs */}
        <Tabs
          value={selectedCategory}
          onValueChange={(v) => setSelectedCategory(v as TemplateCategory | 'all')}
        >
          <TabsList className="w-full justify-start overflow-x-auto">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category} value={category} className="gap-1">
                {CATEGORY_ICONS[category]}
                <span className="hidden sm:inline">{CATEGORY_LABELS[category]}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          {/* All Templates View */}
          <TabsContent value="all" className="mt-4">
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-6">
                {categories.map((category) => {
                  const categoryTemplates = groupedTemplates[category];
                  if (categoryTemplates.length === 0) return null;

                  return (
                    <div key={category}>
                      <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                        {CATEGORY_ICONS[category]}
                        {CATEGORY_LABELS[category]}
                        <Badge variant="secondary" className="text-xs">
                          {categoryTemplates.length}
                        </Badge>
                      </h3>
                      <div className="space-y-2">
                        {categoryTemplates.map((template) => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            onSelect={handleSelect}
                            onDelete={onDelete}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredTemplates.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    Nenhum template encontrado
                  </p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Category-specific views */}
          {categories.map((category) => (
            <TabsContent key={category} value={category} className="mt-4">
              <ScrollArea className="h-[400px] pr-4">
                <div className="space-y-2">
                  {groupedTemplates[category].map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={handleSelect}
                      onDelete={onDelete}
                    />
                  ))}
                </div>

                {groupedTemplates[category].length === 0 && (
                  <div className="text-center py-12">
                    <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum template nesta categoria
                    </p>
                  </div>
                )}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// Template Card Component
interface TemplateCardProps {
  template: MessageTemplate;
  onSelect: (template: MessageTemplate) => void;
  onDelete?: (templateId: string) => void;
}

function TemplateCard({ template, onSelect, onDelete }: TemplateCardProps) {
  return (
    <motion.button
      onClick={() => onSelect(template)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
      className={cn(
        'w-full p-4 rounded-xl border border-border bg-card',
        'text-left transition-all hover:border-primary/50 hover:bg-primary/5',
        'flex items-center justify-between gap-4 group'
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-foreground truncate">
            {template.name}
          </span>
          {template.isCustom && (
            <Badge variant="secondary" className="text-xs">
              Personalizado
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {template.description}
        </p>
        {template.variables.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {template.variables.slice(0, 4).map((v) => (
              <Badge key={v} variant="outline" className="text-xs">
                {`{{${v}}}`}
              </Badge>
            ))}
            {template.variables.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{template.variables.length - 4}
              </Badge>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2">
        {template.isCustom && onDelete && (
          <Button
            variant="ghost"
            size="icon"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(template.id);
            }}
          >
            <Trash2 className="w-4 h-4 text-destructive" />
          </Button>
        )}
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </motion.button>
  );
}
