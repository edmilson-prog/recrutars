/**
 * useFAQ Hook
 * PRD-028: Central de Ajuda - FAQ Management
 */

import { useState, useMemo } from 'react';
import type { FAQItem, UserArea } from '@/types/help';
import { mockFAQItems } from '@/data/mockData';

export function useFAQ(userArea: UserArea = 'general') {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Filtrar FAQ por área do usuário
  const faqByArea = useMemo(() => {
    // Sempre incluir FAQ gerais
    const generalFAQs = mockFAQItems.filter((item) => item.area === 'general');

    // Se for área específica, incluir FAQs dessa área
    if (userArea !== 'general') {
      const specificFAQs = mockFAQItems.filter((item) => item.area === userArea);
      return [...generalFAQs, ...specificFAQs];
    }

    return generalFAQs;
  }, [userArea]);

  // Aplicar filtros de busca e categoria
  const filteredFAQs = useMemo(() => {
    let filtered = faqByArea;

    // Filtrar por categoria
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filtrar por busca (case-insensitive)
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.question.toLowerCase().includes(query) ||
          item.answer.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [faqByArea, searchQuery, selectedCategory]);

  // Obter categorias únicas disponíveis
  const categories = useMemo(() => {
    const uniqueCategories = new Set(faqByArea.map((item) => item.category));
    return Array.from(uniqueCategories).sort();
  }, [faqByArea]);

  return {
    faqs: filteredFAQs,
    categories,
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    totalCount: faqByArea.length,
    filteredCount: filteredFAQs.length,
  };
}
