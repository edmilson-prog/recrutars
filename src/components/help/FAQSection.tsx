/**
 * FAQSection Component
 * PRD-028: Central de Ajuda - FAQ Display with Search and Filters
 */

import { useMemo } from 'react';
import { Search, HelpCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { useFAQ } from '@/hooks/useFAQ';
import { useDebounce } from '@/hooks/useDebounce';
import type { UserArea } from '@/types/help';

interface FAQSectionProps {
  userArea?: UserArea;
}

export function FAQSection({ userArea = 'general' }: FAQSectionProps) {
  const {
    faqs,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    filteredCount,
  } = useFAQ(userArea);

  // Debounce da busca para evitar muitas atualizações
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Use debounced value for filtering
  const displayFaqs = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return faqs;
    }
    const query = debouncedSearch.toLowerCase();
    return faqs.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query)
    );
  }, [faqs, debouncedSearch]);

  return (
    <div className="space-y-6">
      {/* Filtros */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar em perguntas e respostas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Contador de resultados */}
      {searchQuery.trim() && (
        <p className="text-sm text-muted-foreground">
          {filteredCount} {filteredCount === 1 ? 'resultado encontrado' : 'resultados encontrados'}
        </p>
      )}

      {/* FAQ Accordion */}
      {displayFaqs.length > 0 ? (
        <Accordion type="single" collapsible className="w-full space-y-2">
          {displayFaqs.map((faq) => (
            <AccordionItem
              key={faq.id}
              value={faq.id}
              className="rounded-lg border border-border/50 bg-card/50 px-6 data-[state=open]:bg-card"
            >
              <AccordionTrigger className="text-left hover:no-underline">
                <span className="font-medium text-foreground">{faq.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground">
                <div className="space-y-4 pt-2">
                  <p className="whitespace-pre-line leading-relaxed">{faq.answer}</p>
                  {faq.relatedArticles && faq.relatedArticles.length > 0 && (
                    <div className="border-t border-border/50 pt-4">
                      <p className="text-xs font-medium text-foreground">
                        Artigos relacionados:
                      </p>
                      <ul className="mt-2 space-y-1">
                        {faq.relatedArticles.map((article, idx) => (
                          <li key={idx} className="text-xs text-muted-foreground">
                            • {article}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 bg-card/30 py-12">
          <HelpCircle className="mb-4 h-12 w-12 text-muted-foreground/50" />
          <h3 className="mb-2 font-medium text-foreground">
            Nenhuma pergunta encontrada
          </h3>
          <p className="text-sm text-muted-foreground">
            Tente ajustar seus filtros ou buscar por outros termos.
          </p>
        </div>
      )}
    </div>
  );
}
