// Google Gemini API Configuration
// ✅ Gemini API Key (from Google AI Studio / Google Cloud)
export const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
export const GEMINI_MODEL = "gemini-2.5-flash";
export const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

