// PRD-073: Destaques de candidatura customizável

export type HighlightItemType = 'experience' | 'education' | 'skill' | 'course';

export interface ApplicationHighlight {
  id: string;
  applicationId: string;
  itemType: HighlightItemType;
  itemId: string;
  createdAt: string;
}

/** Destaques agrupados por tipo para uma candidatura */
export interface ApplicationHighlights {
  experienceIds: string[];
  educationIds: string[];
  skillIds: string[];
  courseIds: string[];
}
