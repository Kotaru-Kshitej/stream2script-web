
import { GoogleGenAI, Type, Chat } from "@google/genai";
import { ScriptResult } from "../types";

export class GeminiService {
  private getApiKey(): string {
    if (process.env.API_KEY) return process.env.API_KEY;
    const win = window as any;
    if (win.process?.env?.API_KEY) return win.process.env.API_KEY;
    return "";
  }

  async processMedia(base64Data: string, mimeType: string, targetLanguage: string): Promise<ScriptResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error("API_KEY is missing.");

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { data: base64Data, mimeType: mimeType } },
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
            keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
            sentiment: { type: Type.STRING },
          },
          required: ["title", "summary", "transcript", "formattedScript", "keywords", "sentiment"],
        },
      },
    });

    return JSON.parse(response.text || '{}') as ScriptResult;
  }

  async processYouTubeUrl(url: string, targetLanguage: string): Promise<ScriptResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) throw new Error("API_KEY is missing.");

    const ai = new GoogleGenAI({ apiKey });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Search for the content, transcripts, and metadata of this YouTube video: ${url}. 
      Generate a detailed analysis in ${targetLanguage} including:
      1. A professional Title
      2. An Executive Summary of the video content
      3. A reconstruction of the transcript/key moments with timestamps if possible
      4. A script-style breakdown
      5. 5-10 Keywords
      6. Overall Sentiment.
      
      Return the output strictly in the following JSON format:
      {
        "title": "string",
        "summary": "string",
        "transcript": [{"speaker": "string", "text": "string", "timestamp": "string"}],
        "formattedScript": "string",
        "keywords": ["string"],
        "sentiment": "string"
      }`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      },
    });

    return JSON.parse(response.text || '{}') as ScriptResult;
  }

  createChatSession(result: ScriptResult): Chat {
    const apiKey = this.getApiKey();
    const ai = new GoogleGenAI({ apiKey });
    
    const transcriptText = result.transcript.map(s => `[${s.timestamp || ''}] ${s.speaker}: ${s.text}`).join('\n');
    
    return ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: `You are an expert meeting assistant. You are helping a user analyze a recording titled "${result.title}".
        
        CONTEXT SUMMARY:
        ${result.summary}
        
        FULL TRANSCRIPT:
        ${transcriptText}
        
        INSTRUCTIONS:
        - Answer questions about the content accurately based ONLY on the provided transcript and summary.
        - If the user asks about something not mentioned, politely state that it wasn't covered in the recording.
        - Be concise, professional, and helpful.
        - Format your responses with markdown for clarity (bullet points, bold text).`
      }
    });
  }
}

export const geminiService = new GeminiService();
