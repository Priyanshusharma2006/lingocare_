import { createContext } from 'react';
import type { CurriculumContextType } from './CurriculumContext';

export const CurriculumContext = createContext<CurriculumContextType | null>(null);
