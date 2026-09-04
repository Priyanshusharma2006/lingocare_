import { useContext } from 'react';
import { CurriculumContext } from './curriculumContextDef';
import type { CurriculumContextType } from './CurriculumContext';

export const useCurriculum = (): CurriculumContextType => {
  const context = useContext(CurriculumContext);
  if (!context) {
    throw new Error('useCurriculum must be used within a CurriculumProvider');
  }
  return context;
};
