import type { Curriculum } from '../types';
import { sanitizeCurriculumTree } from '../types';
import { GoogleGenAI, Type } from '@google/genai';

const API_KEY_STORAGE = 'lingocare_gemini_api_key';

export function getStoredApiKey(): string {
  if (typeof window !== 'undefined') {
    const fromStorage = localStorage.getItem(API_KEY_STORAGE);
    if (fromStorage) return fromStorage;
  }
  return (
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (import.meta as any).env?.GEMINI_API_KEY ||
    ''
  );
}

export function saveStoredApiKey(key: string): void {
  if (typeof window !== 'undefined') {
    if (key) {
      localStorage.setItem(API_KEY_STORAGE, key);
    } else {
      localStorage.removeItem(API_KEY_STORAGE);
    }
  }
}

const EXTRACTION_PROMPT = `
You are an expert curriculum design assistant for Lingocare.
Your task is to analyze the provided PDF document and extract or reconstruct a comprehensive hierarchical curriculum structure with 4 tiers:
Curriculum → Modules → Topics → Lessons.

CRITICAL INSTRUCTIONS:
1. Extract the overall curriculum title and a concise summary description.
2. Structure the content strictly into Modules, each containing Topics, and each Topic containing Lessons.
3. INFERENCE RULE: If a Module has no visible Topics, or a Topic has no visible Lessons in the source PDF, you MUST infer plausible, high-quality, educationally sound topics or lessons from the subject matter and surrounding context. DO NOT leave modules or topics empty.
4. UNSTRUCTURED / NON-CURRICULUM RULE: If the PDF document contains generic or unstructured content (e.g. an article, notes, or non-hierarchical text), do NOT fail or hallucinate an absurd hierarchy. Instead, extract a single coherent Module with a Topic summarizing the document's subject matter and break it down into logical sequential lessons.
5. Keep titles clear, concise, and professional.
6. Provide meaningful descriptions (1-2 sentences) for modules, topics, and lessons where relevant.
`;

export interface ParseProgress {
  step: 'reading' | 'uploading' | 'analyzing' | 'generating' | 'sanitizing' | 'done';
  message: string;
  percentage: number;
}

/**
 * Converts a File object to base64 string
 */
export async function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = (error) => reject(error);
  });
}

/**
 * Parses a PDF file into a structured Curriculum tree
 */
export async function parsePdfCurriculum(
  file: File,
  onProgress?: (progress: ParseProgress) => void
): Promise<Curriculum> {
  // Client-side file type verification (§6)
  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    throw new Error('Invalid file format. Please upload a valid PDF document (.pdf).');
  }

  // Step 1: Read file
  onProgress?.({
    step: 'reading',
    message: 'Reading PDF document into memory...',
    percentage: 15,
  });

  const fullBase64 = await fileToBase64(file);
  const cleanBase64 = fullBase64.includes('base64,')
    ? fullBase64.split('base64,')[1]
    : fullBase64;

  const apiKey = getStoredApiKey();

  // Step 2: Try Serverless API endpoint first
  onProgress?.({
    step: 'uploading',
    message: 'Sending document for AI structure decomposition...',
    percentage: 35,
  });

  let rawCurriculumData: any = null;

  try {
    const response = await fetch('/api/parse-curriculum', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        pdfBase64: cleanBase64,
        apiKey: apiKey || undefined,
      }),
    });

    if (response.ok) {
      onProgress?.({
        step: 'generating',
        message: 'Parsing AI response into curriculum hierarchy...',
        percentage: 80,
      });
      rawCurriculumData = await response.json();
    } else if (response.status === 404) {
      // Endpoint not found (e.g. running in plain Vite dev without serverless)
      console.info('Serverless /api/parse-curriculum not found, falling back to client-side GenAI invocation.');
    } else {
      const errJson = await response.json().catch(() => ({}));
      throw new Error(errJson.error || `Server responded with status ${response.status}`);
    }
  } catch (apiErr: any) {
    if (apiErr.message?.includes('Failed to fetch') || apiErr.message?.includes('404')) {
      console.info('API route unavailable, attempting client fallback.');
    } else {
      // If it's a specific error returned by server, rethrow unless we can try client
      if (!apiKey) {
        throw apiErr;
      }
    }
  }

  // Step 3: Client-side fallback if serverless wasn't available
  if (!rawCurriculumData) {
    if (!apiKey) {
      throw new Error(
        'Gemini API Key is required. Please set GEMINI_API_KEY in your .env file or click the Key icon in the top bar to provide your Gemini API key.'
      );
    }

    onProgress?.({
      step: 'analyzing',
      message: 'Analyzing layout, tables & modules using gemini-3.6-flash...',
      percentage: 55,
    });

    const ai = new GoogleGenAI({ apiKey });

    const aiResponse = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              inlineData: {
                mimeType: 'application/pdf',
                data: cleanBase64,
              },
            },
            {
              text: EXTRACTION_PROMPT,
            },
          ],
        },
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'Overall curriculum title' },
            description: { type: Type.STRING, description: 'Curriculum summary' },
            modules: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: 'Module title' },
                  description: { type: Type.STRING, description: 'Module description' },
                  topics: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        title: { type: Type.STRING, description: 'Topic title' },
                        description: { type: Type.STRING, description: 'Topic description' },
                        lessons: {
                          type: Type.ARRAY,
                          items: {
                            type: Type.OBJECT,
                            properties: {
                              title: { type: Type.STRING, description: 'Lesson title' },
                              description: { type: Type.STRING, description: 'Lesson description' },
                            },
                            required: ['title'],
                          },
                        },
                      },
                      required: ['title'],
                    },
                  },
                },
                required: ['title'],
              },
            },
          },
          required: ['title', 'modules'],
        },
      },
    });

    const text = aiResponse.text;
    if (!text) {
      throw new Error('Received an empty response from Gemini.');
    }

    rawCurriculumData = JSON.parse(text);
  }

  // Step 4: Validate and assign client-side UUIDs (§3 & §6)
  onProgress?.({
    step: 'sanitizing',
    message: 'Assigning client-side UUIDs & populating editable local state...',
    percentage: 95,
  });

  const sanitized = sanitizeCurriculumTree(rawCurriculumData);

  onProgress?.({
    step: 'done',
    message: 'Curriculum successfully extracted!',
    percentage: 100,
  });

  return sanitized;
}
