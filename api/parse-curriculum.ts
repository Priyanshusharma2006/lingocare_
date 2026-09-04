import { GoogleGenAI, Type } from '@google/genai';

export const config = {
  maxDuration: 60,
};

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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { pdfBase64, apiKey: clientApiKey } = req.body || {};

    if (!pdfBase64) {
      return res.status(400).json({ error: 'Missing pdfBase64 data in request body.' });
    }

    const apiKey = clientApiKey || process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(401).json({
        error: 'Gemini API key not configured. Please supply a key or configure GEMINI_API_KEY in server environment.',
      });
    }

    const cleanBase64 = pdfBase64.includes('base64,')
      ? pdfBase64.split('base64,')[1]
      : pdfBase64;

    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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

    const rawText = response.text;
    if (!rawText) {
      throw new Error('Empty response received from Gemini model.');
    }

    const parsedData = JSON.parse(rawText);
    return res.status(200).json(parsedData);
  } catch (error: any) {
    console.error('API /parse-curriculum error:', error);
    return res.status(500).json({
      error: error.message || 'Failed to parse curriculum from PDF.',
    });
  }
}
