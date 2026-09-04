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
 * Demonstrates the full 4-tier hierarchy scale (4 modules, 8 topics, 18 lessons)
 */
export const SAMPLE_CURRICULUM: Curriculum = {
  id: generateId(),
  title: 'Spanish B2: Professional & Conversational Mastery',
  description: 'A comprehensive curriculum bridging conversational spontaneity, advanced grammatical precision, and workplace negotiation in Spanish.',
  modules: [
    {
      id: generateId(),
      title: 'Narrative Mastery & Complex Past',
      description: 'Mastering nuanced temporal sequences, flashbacks, and narrative rhythm in storytelling.',
      topics: [
        {
          id: generateId(),
          title: 'Past Tense Contrast & Aspectual Shifts',
          description: 'Differentiating Pretérito Indefinido, Imperfecto, and Pluscuamperfecto in dynamic discourse.',
          lessons: [
            {
              id: generateId(),
              title: 'Trigger Words & Aspectual Nuances (Quise vs Quería, Supe vs Sabía)',
              description: 'Analyzing how verb meanings shift based on aspectual choice.',
            },
            {
              id: generateId(),
              title: 'Narrative Rhythm: Foregrounding Events vs Background Framing',
              description: 'Constructing layered paragraphs blending habitual backdrop and pivotal plot events.',
            },
            {
              id: generateId(),
              title: 'Childhood Memories & Autobiographical Storytelling',
              description: 'Fluidly sharing personal anecdotes and historical milestones.',
            },
          ],
        },
        {
          id: generateId(),
          title: 'Reported Speech in Past Contexts',
          description: 'Transposing direct quotes into indirect past reported speech with accurate tense shifts.',
          lessons: [
            {
              id: generateId(),
              title: 'Backshifting Tenses (Dijo que vendría / había venido)',
              description: 'Rules for shifting present and future statements into past perspectives.',
            },
            {
              id: generateId(),
              title: 'Reporting Questions, Commands & Doubts (Me preguntó si...)',
              description: 'Transforming imperative commands into subjunctive reported structures.',
            },
          ],
        },
      ],
    },
    {
      id: generateId(),
      title: 'The Subjunctive in Nuanced Discourse',
      description: 'Expressing hypothetical scenarios, emotional stances, and concessions with confidence.',
      topics: [
        {
          id: generateId(),
          title: 'Imperfect Subjunctive & Conditional Structures',
          description: 'Navigating hypothetical "si" clauses and counterfactual reflections.',
          lessons: [
            {
              id: generateId(),
              title: 'Conjugating the Imperfect Subjunctive (-ra and -se endings)',
              description: 'Mastering regular and irregular 3rd-person preterite root derivations.',
            },
            {
              id: generateId(),
              title: 'Hypothetical Conditions: "Si tuviera tiempo, viajaría"',
              description: 'Constructing improbable present and future conditional structures.',
            },
            {
              id: generateId(),
              title: 'Past Counterfactuals & Regrets: "Si hubiera sabido..."',
              description: 'Expressing unfulfilled past outcomes using Pluscuamperfecto de Subjuntivo.',
            },
          ],
        },
        {
          id: generateId(),
          title: 'Concessive & Temporal Triggers',
          description: 'Using "aunque", "a pesar de que", and "en cuanto" with Indicative vs Subjunctive.',
          lessons: [
            {
              id: generateId(),
              title: 'Concession Dynamics: "Aunque llueva" vs "Aunque llueve"',
              description: 'Distinguishing between known facts and hypothetical concessions.',
            },
            {
              id: generateId(),
              title: 'Future Temporal Connectors: "Tan pronto como llegue"',
              description: 'Applying subjunctive rules after prospective time conjunctions.',
            },
          ],
        },
      ],
    },
    {
      id: generateId(),
      title: 'Business Spanish & Professional Negotiations',
      description: 'Formal workplace interactions, executive communication, and diplomatic objection handling.',
      topics: [
        {
          id: generateId(),
          title: 'Professional Correspondence & Meeting Leadership',
          description: 'Structuring executive emails, proposals, and leading cross-functional discussions.',
          lessons: [
            {
              id: generateId(),
              title: 'Formal Register: Executive Salutations & Courtesy Formulas',
              description: 'Crafting polished formal communications using "Por medio de la presente...".',
            },
            {
              id: generateId(),
              title: 'Leading Agendas & Facilitating Team Discussions',
              description: 'Guiding meeting agendas, opening floor questions, and synthesizing action items.',
            },
            {
              id: generateId(),
              title: 'Pitching Value Propositions & Product Presentations',
              description: 'Structuring persuasive commercial pitches with rhetorical clarity.',
            },
          ],
        },
        {
          id: generateId(),
          title: 'Persuasion & Diplomatic Disagreement',
          description: 'Polite dissent, counter-proposals, and closing agreements.',
          lessons: [
            {
              id: generateId(),
              title: 'Softening Dissent: "Entiendo su punto, sin embargo..."',
              description: 'Using diplomatic hedging and tactful counterpoints in high-stakes negotiations.',
            },
            {
              id: generateId(),
              title: 'Price Negotiation & Concession Trading Strategies',
              description: 'Navigating contractual terms, volume discounts, and mutually beneficial compromises.',
            },
          ],
        },
      ],
    },
    {
      id: generateId(),
      title: 'Idiomatic Nuance & Cultural Colloquialisms',
      description: 'Understanding regional slang, humor, metaphors, and native speech cadences.',
      topics: [
        {
          id: generateId(),
          title: 'High-Frequency Idioms & Proverbs',
          description: 'Contextual usage of popular proverbs and figurative expressions.',
          lessons: [
            {
              id: generateId(),
              title: 'Everyday Metaphors ("Dar en el clavo", "Estar en las nubes")',
              description: 'Deciphering common conversational idioms and their cultural origins.',
            },
            {
              id: generateId(),
              title: 'Body-Part Idioms ("Costar un ojo de la cara", "Tomar el pelo")',
              description: 'Mastering expressive conversational phrases used in daily social exchanges.',
            },
          ],
        },
        {
          id: generateId(),
          title: 'Regional Variations (Spain vs Latin America)',
          description: 'Key lexical and syntactic differences across major Spanish-speaking regions.',
          lessons: [
            {
              id: generateId(),
              title: 'Lexical Splits: Peninsular vs Latin American Terminology',
              description: 'Navigating vocabulary differences (coche/carro, ordenador/computadora).',
            },
            {
              id: generateId(),
              title: 'Voseo & Pronoun Dynamics in the Southern Cone & Central America',
              description: 'Understanding vos conjugations, direct/indirect clitic placements, and regional identity.',
            },
          ],
        },
      ],
    },
  ],
};
