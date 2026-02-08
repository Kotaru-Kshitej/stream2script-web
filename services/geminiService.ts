
import { GoogleGenAI, Type } from "@google/genai";
import { ScriptResult } from "../types";

export class GeminiService {
  async processMedia(base64Data: string, mimeType: string, targetLanguage: string): Promise<ScriptResult> {
    const apiKey = process.env.API_KEY || (window as any).process?.env?.API_KEY;
    
    if (!apiKey) {
      throw new Error("API_KEY is not defined. Please check your Vercel project environment variables.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
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
          { text: `Analyze this content and generate a script in ${targetLanguage}. Include: 1. Title, 2. Executive Summary, 3. Timestamped Transcript, 4. Formatted Screenplay, 5. Keywords, 6. Sentiment. Return valid JSON only.` },
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

    return JSON.parse(response.text || '{}') as ScriptResult;
  }
}

export const geminiService = new GeminiService();
