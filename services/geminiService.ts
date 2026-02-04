import { GoogleGenAI, Type } from "@google/genai";
import { Poem, InterpretationResponse } from "../types";
import { SUFI_SYSTEM_PROMPT } from "../constants";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("API_KEY is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const interpretFal = async (
  context: string,
  poem: Poem
): Promise<InterpretationResponse> => {
  const ai = getClient();
  
  const prompt = `
    The seeker asks about: ${context}.
    
    The Poem drawn is (English Translation):
    ${poem.english.join('\n')}
    
    Please provide the Sufi interpretation.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SUFI_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interpretation: {
              type: Type.STRING,
              description: "The mystical interpretation of the poem based on the user's context.",
            },
            reflection: {
              type: Type.STRING,
              description: "A short, powerful reflective sentence for the user.",
            },
          },
          required: ["interpretation", "reflection"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Oracle");

    return JSON.parse(text) as InterpretationResponse;

  } catch (error) {
    console.error("Gemini Interpretation Failed:", error);
    // Fallback for demo stability if API fails
    return {
      interpretation: "The nightingale sings to the rose not of sorrow, but of the patience required for blooming. Your heart seeks answers that are already written upon it. Look inward, for the cup of Jamshid—the truth you seek—has been in your hand all along.",
      reflection: "What veil must you lift to see the Beloved in your own mirror?"
    };
  }
};
