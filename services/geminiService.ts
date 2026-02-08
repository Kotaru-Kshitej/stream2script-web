
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptResult } from "../types";

const getApiKey = (): string => {
  try {
    // Check global process shim first
    const globalProcess = (window as any).process;
    if (globalProcess?.env?.API_KEY) {
      return globalProcess.env.API_KEY;
    }
    
    // Check standard Node.js style access
    if (typeof process !== 'undefined' && process.env?.API_KEY) {
      return process.env.API_KEY;
    }
  } catch (e) {
    console.warn("API Key retrieval failed", e);
  }
  return '';
};

export class GeminiService {
  async processMedia(base64Data: string, mimeType: string, targetLanguage: string): Promise<ScriptResult> {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error("Missing API Key. Ensure API_KEY is set in Vercel Environment Variables.");
    }

    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
      Analyze this audio/video. 
      Target Language for analysis: ${targetLanguage}.
      
      Tasks:
      1. Provide a title for this content.
      2. Provide a 2-paragraph executive summary.
      3. Provide a full speaker-labeled transcript with approximate timestamps (HH:MM:SS format).
      4. Convert the entire content into a professional screenplay format.
      5. Extract the top 5-7 key topics or keywords.
      6. Analyze the overall sentiment of the conversation.

      Return the data in a clean JSON format matching the schema exactly.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              data: base64Data,
              mimeType: mimeType,
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            transcript: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  speaker: { type: Type.STRING },
                  text: { type: Type.STRING },
                  timestamp: { type: Type.STRING },
                },
                required: ["speaker", "text"]
              }
            },
            formattedScript: { type: Type.STRING },
            keywords: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            sentiment: { type: Type.STRING },
          },
          required: ["title", "summary", "transcript", "formattedScript", "keywords", "sentiment"],
        },
      },
    });

    const text = response.text || '{}';
    return JSON.parse(text) as ScriptResult;
  }
}

export const geminiService = new GeminiService();
