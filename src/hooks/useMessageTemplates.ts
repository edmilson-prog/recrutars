/**
 * Hook for Message Templates
 * PRD-041: Mensagens Personalizadas
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  MessageTemplate,
  MessageTone,
  TemplateCategory,
  TemplateVariableData,
  CustomTemplate,
} from '@/types/messageTemplates';
import { defaultMessageTemplates } from '@/data/messageTemplates';
import { parseVariables, validateVariables } from '@/lib/messageTemplates';

interface UseMessageTemplatesOptions {
  companyId?: string;
}

interface UseMessageTemplatesReturn {
  // Data
  templates: MessageTemplate[];
  customTemplates: CustomTemplate[];
  categories: TemplateCategory[];

  // Selection state
  selectedTemplate: MessageTemplate | null;
  selectedTone: MessageTone;
  previewContent: string;

  // Actions
  selectTemplate: (templateId: string | null) => void;
  setTone: (tone: MessageTone) => void;
  getPreview: (variableData: Partial<TemplateVariableData>) => string;
  validateTemplate: (variableData: Partial<TemplateVariableData>) => {
    isValid: boolean;
    missingVariables: string[];
  };

  // Custom templates
  saveCustomTemplate: (name: string, content: string, category: TemplateCategory) => void;
  deleteCustomTemplate: (templateId: string) => void;

  // Filters
  filterByCategory: (category: TemplateCategory | 'all') => MessageTemplate[];

  // Content generation
  generateMessage: (variableData: Partial<TemplateVariableData>) => string;
}

const STORAGE_KEY = 'recruta_custom_templates';

export function useMessageTemplates(
  options: UseMessageTemplatesOptions = {}
): UseMessageTemplatesReturn {
  const { companyId = 'company-1' } = options;

  // Load custom templates from localStorage
  const loadCustomTemplates = (): CustomTemplate[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const all = JSON.parse(stored) as CustomTemplate[];
        return all.filter(t => t.companyId === companyId);
      }
    } catch {
      // Ignore parsing errors
    }
    return [];
  };

  // State
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>(loadCustomTemplates);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedTone, setSelectedTone] = useState<MessageTone>('neutral');

  // All templates (default + custom converted to MessageTemplate format)
  const templates = useMemo(() => {
    const customAsMessageTemplates: MessageTemplate[] = customTemplates.map(ct => ({
      id: ct.id,
      name: ct.name,
      category: ct.category,
      description: 'Template personalizado',
      content: {
        formal: ct.content,
        neutral: ct.content,
        informal: ct.content,
      },
      variables: [],
      isCustom: true,
      createdAt: ct.createdAt,
    }));

    return [...defaultMessageTemplates, ...customAsMessageTemplates];
  }, [customTemplates]);

  // Selected template
  const selectedTemplate = useMemo(() => {
    if (!selectedTemplateId) return null;
    return templates.find(t => t.id === selectedTemplateId) || null;
  }, [selectedTemplateId, templates]);

  // Preview content based on selected template and tone
  const previewContent = useMemo(() => {
    if (!selectedTemplate) return '';
    return selectedTemplate.content[selectedTone];
  }, [selectedTemplate, selectedTone]);

  // Available categories
  const categories = useMemo(() => {
    const cats = new Set<TemplateCategory>();
    templates.forEach(t => cats.add(t.category));
    return Array.from(cats);
  }, [templates]);

  // Select a template
  const selectTemplate = useCallback((templateId: string | null) => {
    setSelectedTemplateId(templateId);
  }, []);

  // Set tone
  const setTone = useCallback((tone: MessageTone) => {
    setSelectedTone(tone);
  }, []);

  // Get preview with variable substitution
  const getPreview = useCallback(
    (variableData: Partial<TemplateVariableData>): string => {
      if (!selectedTemplate) return '';
      const content = selectedTemplate.content[selectedTone];
      return parseVariables(content, variableData);
    },
    [selectedTemplate, selectedTone]
  );

  // Validate template variables
  const validateTemplate = useCallback(
    (variableData: Partial<TemplateVariableData>) => {
      if (!selectedTemplate) {
        return { isValid: false, missingVariables: [] };
      }
      const content = selectedTemplate.content[selectedTone];
      return validateVariables(content, variableData);
    },
    [selectedTemplate, selectedTone]
  );

  // Save custom template
  const saveCustomTemplate = useCallback(
    (name: string, content: string, category: TemplateCategory) => {
      const newTemplate: CustomTemplate = {
        id: `custom-${Date.now()}`,
        name,
        category,
        content,
        tone: selectedTone,
        createdAt: new Date().toISOString(),
        companyId,
      };

      setCustomTemplates(prev => {
        const updated = [...prev, newTemplate];

        // Save to localStorage
        try {
          const allStored = localStorage.getItem(STORAGE_KEY);
          const all = allStored ? JSON.parse(allStored) : [];
          const filtered = all.filter((t: CustomTemplate) => t.companyId !== companyId);
          localStorage.setItem(STORAGE_KEY, JSON.stringify([...filtered, ...updated]));
        } catch {
          // Ignore storage errors
        }

        return updated;
      });
    },
    [companyId, selectedTone]
  );

  // Delete custom template
  const deleteCustomTemplate = useCallback(
    (templateId: string) => {
      setCustomTemplates(prev => {
        const updated = prev.filter(t => t.id !== templateId);

        // Update localStorage
        try {
          const allStored = localStorage.getItem(STORAGE_KEY);
          const all = allStored ? JSON.parse(allStored) : [];
          const filtered = all.filter(
            (t: CustomTemplate) => t.id !== templateId
          );
          localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        } catch {
          // Ignore storage errors
        }

        return updated;
      });

      // Clear selection if deleted template was selected
      if (selectedTemplateId === templateId) {
        setSelectedTemplateId(null);
      }
    },
    [selectedTemplateId]
  );

  // Filter templates by category
  const filterByCategory = useCallback(
    (category: TemplateCategory | 'all') => {
      if (category === 'all') return templates;
      return templates.filter(t => t.category === category);
    },
    [templates]
  );

  // Generate final message
  const generateMessage = useCallback(
    (variableData: Partial<TemplateVariableData>): string => {
      return getPreview(variableData);
    },
    [getPreview]
  );

  return {
    templates,
    customTemplates,
    categories,
    selectedTemplate,
    selectedTone,
    previewContent,
    selectTemplate,
    setTone,
    getPreview,
    validateTemplate,
    saveCustomTemplate,
    deleteCustomTemplate,
    filterByCategory,
    generateMessage,
  };
}
