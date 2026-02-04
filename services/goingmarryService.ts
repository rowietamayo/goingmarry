
const API_URL = (import.meta as any).env.VITE_API_URL || '/api';

export const analyzeProductImage = async (base64Image: string) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/ai/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ imageUrl: base64Image }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'AI Analysis failed');
    }

    return await response.json();
  } catch (error: any) {
    console.error("GoingMarry Analysis Failed:", error);
    if (error.message?.includes('API key')) {
        throw new Error("Invalid or Missing API Key on Server");
    }
    throw error;
  }
};
