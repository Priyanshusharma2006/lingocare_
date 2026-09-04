/**
 * Lingocare Curriculum Creation Engine — Shared Data Models
 * Strictly matches PRD section 3
 */

export interface Lesson {
  id: string;
  title: string;
  description: string;
  type?: string;
}

export interface Topic {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  type?: string;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  topics: Topic[];
  type?: string;
}

export interface Curriculum {
  id: string;
  title: string;
  description: string;
  modules: Module[];
}

/**
 * Generate a cryptographically secure UUID.
 * Works across modern browsers and Node environments.
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'id-' + Math.random().toString(36).substring(2, 9) + '-' + Date.now().toString(36);
}

/**
 * Factory functions to create clean node instances with fresh UUIDs
 */
export function createLesson(title: string = 'Lesson 1', description: string = ''): Lesson {
  return {
    id: generateId(),
    title,
    description,
  };
}

export function createTopic(title: string = 'Topic 1', description: string = '', lessons: Lesson[] = []): Topic {
  return {
    id: generateId(),
    title,
    description,
    lessons: lessons.length > 0 ? lessons : [createLesson('Lesson 1', '')],
  };
}

export function createModule(title: string = 'Foundations', description: string = '', topics: Topic[] = []): Module {
  return {
    id: generateId(),
    title,
    description,
    topics,
  };
}

export function createCurriculum(
  title: string = 'Program 1',
  description: string = '',
  modules: Module[] = []
): Curriculum {
  return {
    id: generateId(),
    title,
    description,
    modules: modules.length > 0 ? modules : [createModule('Foundations', '', [])],
  };
}

/**
 * Ensures all nodes in a curriculum tree (especially those returned from AI responses)
 * have valid, unique client-side UUIDs and valid array structures.
 */
export function sanitizeCurriculumTree(data: Partial<Curriculum>): Curriculum {
  const sanitizeLessons = (lessons: any[]): Lesson[] => {
    if (!Array.isArray(lessons)) return [];
    return lessons.map((l, idx) => ({
      id: generateId(), // Always enforce client-side UUID
      title: String(l.title || `Lesson ${idx + 1}`).trim(),
      description: String(l.description || '').trim(),
    }));
  };

  const sanitizeTopics = (topics: any[]): Topic[] => {
    if (!Array.isArray(topics)) return [];
    return topics.map((t, idx) => ({
      id: generateId(),
      title: String(t.title || `Topic ${idx + 1}`).trim(),
      description: String(t.description || '').trim(),
      lessons: sanitizeLessons(t.lessons || []),
    }));
  };

  const sanitizeModules = (modules: any[]): Module[] => {
    if (!Array.isArray(modules) || modules.length === 0) {
      return [createModule('Foundations', '', [])];
    }
    return modules.map((m, idx) => ({
      id: generateId(),
      title: String(m.title || `Module ${idx + 1}`).trim(),
      description: String(m.description || '').trim(),
      topics: sanitizeTopics(m.topics || []),
    }));
  };

  return {
    id: generateId(),
    title: String(data.title || 'Program 1').trim(),
    description: String(data.description || '').trim(),
    modules: sanitizeModules(data.modules || []),
  };
}

/**
 * Rich sample curriculum for testing and immediate demo
 */
export const SAMPLE_CURRICULUM: Curriculum = {
  id: generateId(),
  title: 'Spanish B1: Intermediate Conversational Mastery',
  description: 'A comprehensive curriculum designed to bridge grammatical foundations into fluid, spontaneous conversation across real-world scenarios.',
  modules: [
    {
      id: generateId(),
      title: 'Narrative Tenses & Storytelling',
      description: 'Mastering the nuanced distinction between Pretérito Indefinido and Pretérito Imperfecto in personal anecdotes.',
      topics: [
        {
          id: generateId(),
          title: 'Preterite vs. Imperfect Dynamics',
          description: 'Understanding completed actions versus habitual actions and background context.',
          lessons: [
            {
              id: generateId(),
              title: 'Trigger Words & Temporal Markers',
              description: 'Identifying key time markers like "ayer", "mientras", and "de repente".',
            },
            {
              id: generateId(),
              title: 'Telling Childhood Stories & Memories',
              description: 'Constructing narrative paragraphs blending habitual past and sudden plot events.',
            },
          ],
        },
        {
          id: generateId(),
          title: 'The Past Perfect (Pretérito Pluscuamperfecto)',
          description: 'Expressing actions that occurred before another past milestone.',
          lessons: [
            {
              id: generateId(),
              title: 'Forming Haber in the Imperfect',
              description: 'Conjugating había + participio pasado with irregular participles.',
            },
          ],
        },
      ],
    },
    {
      id: generateId(),
      title: 'The Subjunctive in Everyday Discourse',
      description: 'Expressing doubts, emotions, desires, and hypothetical situations with confidence.',
      topics: [
        {
          id: generateId(),
          title: 'W-E-I-R-D-O Triggers & Present Subjunctive',
          description: 'Forming and applying subjunctive moods triggered by wishes, doubts, and emotions.',
          lessons: [
            {
              id: generateId(),
              title: 'Regular and Irregular Subjunctive Conjugations',
              description: 'Navigating stem changers (tenga, pueda, vaya, sepa) and opposite vowel endings.',
            },
            {
              id: generateId(),
              title: 'Giving Subtle Advice & Recommendations',
              description: 'Using "Te recomiendo que...", "Es importante que...", and "Dudo que...".',
            },
          ],
        },
      ],
    },
  ],
};
