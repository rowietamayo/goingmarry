import { GoogleGenAI, Type } from "@google/genai";
import express from 'express';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Initialize Gemini with server-side API Key
const apiKey = process.env.GOINGMARRY_API_KEY || process.env.VITE_GOINGMARRY_API_KEY || process.env.API_KEY || '';

if (!apiKey) {
    console.error("CRITICAL: AI Service API Key is missing in server/.env");
}

const ai = new GoogleGenAI({ apiKey });

router.post('/analyze', authenticateToken, async (req: any, res: any) => {
    const { imageUrl } = req.body;

    if (!imageUrl) {
        return res.status(400).json({ error: 'Image data is required' });
    }

    try {
        const base64Data = imageUrl.includes('base64,')
            ? imageUrl.split('base64,')[1]
            : imageUrl;

        const response = await ai.models.generateContent({
            model: 'gemini-flash-latest',
            contents: [
                {
                    parts: [
                        { inlineData: { mimeType: 'image/jpeg', data: base64Data } },
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

        const text = response.text ? response.text : JSON.stringify(response);
        const cleanJson = text.replace(/```json\n?|```/g, '').trim();

        res.json(JSON.parse(cleanJson || '{}'));
    } catch (error: any) {
        console.error("AI Analysis Failed on Server:", error);

        if (error.message?.includes('API key')) {
            return res.status(500).json({ error: "Invalid or Missing AI API Key on Server" });
        }

        res.status(500).json({ error: "AI Analysis failed", details: error.message });
    }
});

export default router;
