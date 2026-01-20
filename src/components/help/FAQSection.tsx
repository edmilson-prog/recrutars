/**
 * FAQSection Component
 * PRD-028: Central de Ajuda - FAQ Display with Search and Filters
 */

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <AnimatePresence mode="wait">
        {displayFaqs.length > 0 ? (
          <motion.div
            key="faq-list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Accordion type="single" collapsible className="w-full space-y-3">
              {displayFaqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <AccordionItem
                    value={faq.id}
                    className="rounded-2xl border border-border/50 bg-card shadow-soft px-6 data-[state=open]:bg-card data-[state=open]:shadow-lg transition-all duration-300"
                  >
                    <AccordionTrigger className="text-left hover:no-underline py-5">
                      <span className="font-medium text-foreground">{faq.question}</span>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-muted-foreground">
                      <div className="space-y-4 pt-2 pb-2">
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
                </motion.div>
              ))}
            </Accordion>
          </motion.div>
        ) : (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/30 py-12"
          >
            <HelpCircle className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="mb-2 font-medium text-foreground">
              Nenhuma pergunta encontrada
            </h3>
            <p className="text-sm text-muted-foreground">
              Tente ajustar seus filtros ou buscar por outros termos.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
