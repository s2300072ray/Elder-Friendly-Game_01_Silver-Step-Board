import { GoogleGenAI, Type } from "@google/genai";
import { EncouragementResponse } from "../types";

const apiKey = process.env.API_KEY || '';
// Initialize conditionally to avoid errors if key is missing (handled in functions)
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Circuit Breaker State
// If the API fails multiple times, we stop calling it to prevent cost overruns or console noise.
let errorCount = 0;
const MAX_ERROR_THRESHOLD = 2;
let isOfflineMode = false;

// Fallback messages (Traditional Chinese - Taiwan)
const FALLBACK_MESSAGES = [
  "做得很好！房間越來越整齊了。",
  "慢慢來，您做得非常棒。",
  "每一個動作都讓生活更美好。",
  "這一步走得很穩，繼續加油！",
  "休息一下也沒關係，我們慢慢整理。",
  "您的動作很靈活！",
  "看著房間變乾淨，心情也變好了。",
  "真棒，保持這個節奏。"
];

const FALLBACK_WELCOME = "歡迎來到銀髮慢步棋。今天我們一起來輕鬆整理房間吧。";

/**
 * Safely handles API errors by enabling offline mode if threshold is reached.
 */
const handleApiError = (error: unknown) => {
  errorCount++;
  // We log a sanitized message to avoid leaking potential header details in strict environments
  console.warn(`AI Service Check: Use fallback (${errorCount}/${MAX_ERROR_THRESHOLD})`);
  
  if (errorCount >= MAX_ERROR_THRESHOLD) {
    isOfflineMode = true;
    console.log("⚠️ AI Service switched to Offline Mode to ensure stability and control costs.");
  }
};

export const getEncouragement = async (score: number): Promise<string> => {
  // 1. Safety Check: Missing Key or Circuit Broken
  if (!apiKey || !ai || isOfflineMode) {
    return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a very short, warm, and encouraging sentence (in Traditional Chinese, Taiwan style) for an elderly person playing a slow-paced game where they tidy up a room by clicking items. 
      The user has currently tidied ${score} items.
      The tone should be respectful, gentle, and explicitly NOT childish. Avoid complex words.
      Examples: "您的動作很靈活！", "慢慢來，做得很好。", "房間變得好乾淨！"`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            message: { type: Type.STRING }
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      const json: EncouragementResponse = JSON.parse(text);
      // Reset error count on success to be forgiving
      errorCount = 0; 
      return json.message;
    }
    return FALLBACK_MESSAGES[0];
  } catch (error) {
    handleApiError(error);
    return FALLBACK_MESSAGES[Math.floor(Math.random() * FALLBACK_MESSAGES.length)];
  }
};

export const getWelcomeMessage = async (): Promise<string> => {
  // 1. Safety Check
  if (!apiKey || !ai || isOfflineMode) return FALLBACK_WELCOME;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: "Generate a short, welcoming greeting (Traditional Chinese) for an elderly user starting a relaxing game about tidying up. Tone: Warm, polite, inviting. Max 20 words.",
      config: {
         responseMimeType: "application/json",
         responseSchema: {
            type: Type.OBJECT,
            properties: {
               message: { type: Type.STRING }
            }
         }
      }
    });
    
    const text = response.text;
    if (text) {
      const json: EncouragementResponse = JSON.parse(text);
      errorCount = 0;
      return json.message;
    }
    return FALLBACK_WELCOME;
  } catch (error) {
    handleApiError(error);
    return FALLBACK_WELCOME;
  }
}