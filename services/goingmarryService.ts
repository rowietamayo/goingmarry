
import { GoogleGenAI, Type } from "@google/genai";

// @ts-ignore
const apiKey = import.meta.env.VITE_GOINGMARRY_API_KEY || process.env.GOINGMARRY_API_KEY || process.env.API_KEY || '';

if (!apiKey) {
  console.error("GoingMarry Service Error: API Key is missing. Check .env.local for VITE_GOINGMARRY_API_KEY");
}

const ai = new GoogleGenAI({ apiKey });

console.log("DEBUG: GoingMarry Service API Key:", apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : "MISSING", "Length:", apiKey.length);


export const analyzeProductImage = async (base64Image: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-flash-latest',
      contents: [
        {
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: base64Image } },
            { text: "Analyze this preloved item and suggest a catchy title, a short description, an estimated resale price in Philippine Peso (PHP), and a category (Fashion, Electronics or Home). Return strictly valid JSON." }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            description: { type: Type.STRING },
            suggestedPrice: { type: Type.NUMBER },
            category: { type: Type.STRING }
          },
          required: ["title", "description", "suggestedPrice", "category"]
        }
      }
    });

    // Handle different response structures from the SDK
    const text = response.text ? response.text : JSON.stringify(response);

    // Strip markdown code blocks if present (SDK might return raw string with markdown)
    const cleanJson = text.replace(/```json\n?|```/g, '').trim();

    console.log("Gemini Raw Response:", cleanJson);

    return JSON.parse(cleanJson || '{}');
  } catch (error) {
    console.error("GoingMarry Analysis Failed:", error);
    // @ts-ignore
    if (error.message?.includes('API key')) {
        throw new Error("Invalid or Missing API Key");
    }
    throw error;
  }
};
