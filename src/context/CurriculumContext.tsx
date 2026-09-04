import React, { useState, useCallback, useEffect } from 'react';
import type {
  Curriculum,
  Module,
  Topic,
  Lesson,
} from '../types';
import {
  createModule,
  createTopic,
  createLesson,
  createCurriculum,
  SAMPLE_CURRICULUM,
  sanitizeCurriculumTree,
  generateId,
} from '../types';
import { CurriculumContext } from './curriculumContextDef';

export interface ToastItem {
  id: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  undoState?: Curriculum;
  timestamp: number;
}

export interface CurriculumContextType {
  curriculum: Curriculum;
  collapsedIds: Set<string>;
  toasts: ToastItem[];
  stats: {
    moduleCount: number;
    topicCount: number;
    lessonCount: number;
  };

  // Curriculum Actions
  updateCurriculumHeader: (title?: string, description?: string) => void;
  setCurriculumTree: (newCurriculum: Curriculum, sourceMessage?: string) => void;
  resetToBlank: () => void;
  loadSample: () => void;

  // Module Actions
  addModule: (title?: string, description?: string) => string;
  updateModule: (moduleId: string, updates: Partial<Pick<Module, 'title' | 'description'>>) => void;
  deleteModule: (moduleId: string) => void;

  // Topic Actions
  addTopic: (moduleId: string, title?: string, description?: string) => string;
  updateTopic: (moduleId: string, topicId: string, updates: Partial<Pick<Topic, 'title' | 'description'>>) => void;
  deleteTopic: (moduleId: string, topicId: string) => void;

  // Lesson Actions
  addLesson: (moduleId: string, topicId: string, title?: string, description?: string) => string;
  updateLesson: (moduleId: string, topicId: string, lessonId: string, updates: Partial<Pick<Lesson, 'title' | 'description'>>) => void;
  deleteLesson: (moduleId: string, topicId: string, lessonId: string) => void;

  // Collapse / Expand
  toggleCollapse: (id: string) => void;
  isCollapsed: (id: string) => boolean;
  collapseAll: () => void;
  expandAll: () => void;

  // Undo & Toasts
  undo: () => void;
  addToast: (message: string, type?: ToastItem['type'], undoState?: Curriculum) => void;
  removeToast: (id: string) => void;

  // Import / Export
  exportJson: () => string;
  importJson: (jsonString: string) => boolean;
}

const STORAGE_KEY = 'lingocare_curriculum_state_v1';

const BLANK_DEFAULT = createCurriculum('Program 1', '', [createModule('Foundations', '', [])]);

export const CurriculumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from local storage or clean blank curriculum
  const [curriculum, setCurriculum] = useState<Curriculum>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return sanitizeCurriculumTree(parsed);
      }
    } catch {
      // Fallback if localStorage read fails
    }
    return BLANK_DEFAULT;
  });

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => {
    return new Set([BLANK_DEFAULT.modules[0]?.id].filter(Boolean) as string[]);
  });
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [undoStack, setUndoStack] = useState<Curriculum[]>([]);

  // Persist to local storage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(curriculum));
    } catch (e) {
      console.warn('Could not save curriculum to localStorage', e);
    }
  }, [curriculum]);

  // Compute overall counts
  const stats = {
    moduleCount: curriculum.modules.length,
    topicCount: curriculum.modules.reduce((acc, m) => acc + m.topics.length, 0),
    lessonCount: curriculum.modules.reduce(
      (acc, m) => acc + m.topics.reduce((tAcc, t) => tAcc + t.lessons.length, 0),
      0
    ),
  };

  // Toast manager
  const addToast = useCallback(
    (message: string, type: ToastItem['type'] = 'info', undoState?: Curriculum) => {
      const id = generateId();
      const newToast: ToastItem = {
        id,
        message,
        type,
        undoState,
        timestamp: Date.now(),
      };
      setToasts((prev) => [...prev.slice(-4), newToast]); // keep max 5 toasts

      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 6000);
    },
    []
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Push state snapshot for undo
  const pushUndoSnapshot = useCallback(
    (_actionDescription?: string) => {
      setUndoStack((prev) => [...prev.slice(-15), curriculum]);
      return curriculum;
    },
    [curriculum]
  );

  const undo = useCallback(() => {
    if (undoStack.length === 0) return;
    const previous = undoStack[undoStack.length - 1];
    setUndoStack((prev) => prev.slice(0, -1));
    setCurriculum(previous);
    addToast('Changes reverted successfully', 'info');
  }, [undoStack, addToast]);

  // Collapse management
  const toggleCollapse = useCallback((id: string) => {
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const isCollapsed = useCallback(
    (id: string) => collapsedIds.has(id),
    [collapsedIds]
  );

  const collapseAll = useCallback(() => {
    const allIds = new Set<string>();
    curriculum.modules.forEach((m) => {
      allIds.add(m.id);
      m.topics.forEach((t) => allIds.add(t.id));
    });
    setCollapsedIds(allIds);
  }, [curriculum]);

  const expandAll = useCallback(() => {
    setCollapsedIds(new Set());
  }, []);

  // Update Curriculum Header
  const updateCurriculumHeader = useCallback((title?: string, description?: string) => {
    setCurriculum((prev) => ({
      ...prev,
      title: title !== undefined ? title : prev.title,
      description: description !== undefined ? description : prev.description,
    }));
  }, []);

  // Replace Entire Curriculum
  const setCurriculumTree = useCallback(
    (newCurriculum: Curriculum, sourceMessage?: string) => {
      pushUndoSnapshot('Replace Curriculum');
      const sanitized = sanitizeCurriculumTree(newCurriculum);

      // Auto-collapse if more than 3 modules to prevent wall of text (§4 & §5)
      if (sanitized.modules.length > 3) {
        const autoCollapsed = new Set<string>();
        sanitized.modules.forEach((m, idx) => {
          if (idx > 0) autoCollapsed.add(m.id); // keep first module expanded, collapse rest
        });
        setCollapsedIds(autoCollapsed);
      }

      setCurriculum(sanitized);
      if (sourceMessage) {
        addToast(sourceMessage, 'success');
      }
    },
    [pushUndoSnapshot, addToast]
  );

  const resetToBlank = useCallback(() => {
    const snapshot = pushUndoSnapshot('Reset to Blank');
    const blank = createCurriculum('Program 1', '', [createModule('Foundations', '', [])]);
    setCurriculum(blank);
    setCollapsedIds(new Set([blank.modules[0].id]));
    addToast('Curriculum reset to blank template', 'info', snapshot);
  }, [pushUndoSnapshot, addToast]);

  const loadSample = useCallback(() => {
    const snapshot = pushUndoSnapshot('Load Sample');
    setCurriculum(sanitizeCurriculumTree(SAMPLE_CURRICULUM));
    setCollapsedIds(new Set());
    addToast('Loaded Spanish B1 sample curriculum', 'success', snapshot);
  }, [pushUndoSnapshot, addToast]);

  // Module CRUD
  const addModule = useCallback(
    (title?: string, description?: string): string => {
      const newModule = createModule(
        title || (curriculum.modules.length === 0 ? 'Foundations' : 'New Module'),
        description || ''
      );
      setCurriculum((prev) => ({
        ...prev,
        modules: [...prev.modules, newModule],
      }));
      return newModule.id;
    },
    [curriculum.modules.length]
  );

  const updateModule = useCallback(
    (moduleId: string, updates: Partial<Pick<Module, 'title' | 'description'>>) => {
      setCurriculum((prev) => ({
        ...prev,
        modules: prev.modules.map((m) => (m.id === moduleId ? { ...m, ...updates } : m)),
      }));
    },
    []
  );

  const deleteModule = useCallback(
    (moduleId: string) => {
      const mod = curriculum.modules.find((m) => m.id === moduleId);
      const snapshot = pushUndoSnapshot(`Delete Module: ${mod?.title || 'Module'}`);
      setCurriculum((prev) => ({
        ...prev,
        modules: prev.modules.filter((m) => m.id !== moduleId),
      }));
      addToast(`Deleted "${mod?.title || 'Module'}" and its subtopics`, 'warning', snapshot);
    },
    [curriculum.modules, pushUndoSnapshot, addToast]
  );

  // Topic CRUD
  const addTopic = useCallback(
    (moduleId: string, title?: string, description?: string): string => {
      const targetModule = curriculum.modules.find((m) => m.id === moduleId);
      const topicCount = targetModule ? targetModule.topics.length + 1 : 1;
      const newTopic = createTopic(title || `Topic ${topicCount}: New Topic`, description || '');

      setCurriculum((prev) => ({
        ...prev,
        modules: prev.modules.map((m) => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            topics: [...m.topics, newTopic],
          };
        }),
      }));
      return newTopic.id;
    },
    [curriculum.modules]
  );

  const updateTopic = useCallback(
    (moduleId: string, topicId: string, updates: Partial<Pick<Topic, 'title' | 'description'>>) => {
      setCurriculum((prev) => ({
        ...prev,
        modules: prev.modules.map((m) => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            topics: m.topics.map((t) => (t.id === topicId ? { ...t, ...updates } : t)),
          };
        }),
      }));
    },
    []
  );

  const deleteTopic = useCallback(
    (moduleId: string, topicId: string) => {
      const mod = curriculum.modules.find((m) => m.id === moduleId);
      const top = mod?.topics.find((t) => t.id === topicId);
      const snapshot = pushUndoSnapshot(`Delete Topic: ${top?.title || 'Topic'}`);

      setCurriculum((prev) => ({
        ...prev,
        modules: prev.modules.map((m) => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            topics: m.topics.filter((t) => t.id !== topicId),
          };
        }),
      }));
      addToast(`Deleted "${top?.title || 'Topic'}"`, 'warning', snapshot);
    },
    [curriculum.modules, pushUndoSnapshot, addToast]
  );

  // Lesson CRUD
  const addLesson = useCallback(
    (moduleId: string, topicId: string, title?: string, description?: string): string => {
      const targetModule = curriculum.modules.find((m) => m.id === moduleId);
      const targetTopic = targetModule?.topics.find((t) => t.id === topicId);
      const lessonCount = targetTopic ? targetTopic.lessons.length + 1 : 1;
      const newLesson = createLesson(title || `Lesson ${lessonCount}: New Lesson`, description || '');

      setCurriculum((prev) => ({
        ...prev,
        modules: prev.modules.map((m) => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            topics: m.topics.map((t) => {
              if (t.id !== topicId) return t;
              return {
                ...t,
                lessons: [...t.lessons, newLesson],
              };
            }),
          };
        }),
      }));
      return newLesson.id;
    },
    [curriculum.modules]
  );

  const updateLesson = useCallback(
    (
      moduleId: string,
      topicId: string,
      lessonId: string,
      updates: Partial<Pick<Lesson, 'title' | 'description'>>
    ) => {
      setCurriculum((prev) => ({
        ...prev,
        modules: prev.modules.map((m) => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            topics: m.topics.map((t) => {
              if (t.id !== topicId) return t;
              return {
                ...t,
                lessons: t.lessons.map((l) => (l.id === lessonId ? { ...l, ...updates } : l)),
              };
            }),
          };
        }),
      }));
    },
    []
  );

  const deleteLesson = useCallback(
    (moduleId: string, topicId: string, lessonId: string) => {
      const mod = curriculum.modules.find((m) => m.id === moduleId);
      const top = mod?.topics.find((t) => t.id === topicId);
      const les = top?.lessons.find((l) => l.id === lessonId);
      const snapshot = pushUndoSnapshot(`Delete Lesson: ${les?.title || 'Lesson'}`);

      setCurriculum((prev) => ({
        ...prev,
        modules: prev.modules.map((m) => {
          if (m.id !== moduleId) return m;
          return {
            ...m,
            topics: m.topics.map((t) => {
              if (t.id !== topicId) return t;
              return {
                ...t,
                lessons: t.lessons.filter((l) => l.id !== lessonId),
              };
            }),
          };
        }),
      }));
      addToast(`Deleted "${les?.title || 'Lesson'}"`, 'info', snapshot);
    },
    [curriculum.modules, pushUndoSnapshot, addToast]
  );

  // Import / Export JSON
  const exportJson = useCallback(() => {
    return JSON.stringify(curriculum, null, 2);
  }, [curriculum]);

  const importJson = useCallback(
    (jsonString: string): boolean => {
      try {
        const parsed = JSON.parse(jsonString);
        setCurriculumTree(parsed, 'Curriculum successfully loaded from JSON');
        return true;
      } catch {
        addToast('Invalid JSON file format', 'error');
        return false;
      }
    },
    [setCurriculumTree, addToast]
  );

  const value: CurriculumContextType = {
    curriculum,
    collapsedIds,
    toasts,
    stats,
    updateCurriculumHeader,
    setCurriculumTree,
    resetToBlank,
    loadSample,
    addModule,
    updateModule,
    deleteModule,
    addTopic,
    updateTopic,
    deleteTopic,
    addLesson,
    updateLesson,
    deleteLesson,
    toggleCollapse,
    isCollapsed,
    collapseAll,
    expandAll,
    undo,
    addToast,
    removeToast,
    exportJson,
    importJson,
  };

  return <CurriculumContext.Provider value={value}>{children}</CurriculumContext.Provider>;
};
