import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeHealthNotes(notes: string[]): Promise<string[]> {
    if (!notes || notes.length === 0) return [];

    const combinedNotes = notes.join('\n');

    try {
        const response = await ai.models.generateContent({
            model: "gemini-3-flash-preview",
            contents: `Analyze the following health notes provided by a client during check-in at a cosmetic/medical studio. 
Extract any critical medical flags that the practitioner should be aware of (e.g., allergies, new medications, pregnancies, recent surgeries, chronic conditions).
Return ONLY a JSON array of strings, where each string is a concise medical flag in German. If there are no critical flags, return an empty array.

Health Notes:
${combinedNotes}`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: {
                        type: Type.STRING,
                    },
                    description: "Array of critical medical flags in German.",
                },
            },
        });

        const jsonStr = response.text?.trim();
        if (jsonStr) {
            return JSON.parse(jsonStr);
        }
        return [];
    } catch (error) {
        console.error("Error analyzing health notes with Gemini:", error);
        // Fallback to basic keyword matching if API fails
        const fallbackFlags: string[] = [];
        if (combinedNotes.toLowerCase().includes('diabetes')) fallbackFlags.push('Diabetes');
        if (combinedNotes.toLowerCase().includes('blutverdünner')) fallbackFlags.push('Blutverdünner');
        if (combinedNotes.toLowerCase().includes('schwanger')) fallbackFlags.push('Schwangerschaft');
        if (combinedNotes.toLowerCase().includes('allergie')) fallbackFlags.push('Allergie gemeldet');
        
        return fallbackFlags.length > 0 ? fallbackFlags : ['Medizinische Änderung gemeldet (Details siehe Notizen)'];
    }
}
