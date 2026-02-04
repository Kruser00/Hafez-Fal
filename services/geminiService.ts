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
    
    The Poem drawn is:
    ${poem.persian.join('\n')}
    
    Please provide the Sufi interpretation in Persian.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SUFI_SYSTEM_PROMPT,
        // Cost Optimization: 
        // 1. Disable "thinking" tokens as this is a creative/associative task, not complex logic.
        // 2. Limit output tokens to prevent long, expensive responses.
        thinkingConfig: { thinkingBudget: 0 }, 
        maxOutputTokens: 500,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interpretation: {
              type: Type.STRING,
              description: "The mystical interpretation of the poem in Persian.",
            },
            reflection: {
              type: Type.STRING,
              description: "A short reflective sentence in Persian.",
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
      interpretation: "بلبل به شاخ گل نه از غم، که از شوق می‌نالد. دل قوی دار که آنچه می‌طلبی در درون توست. جام جم در دستان توست، تنها باید حجاب‌ها را کنار بزنی و در آینه دل بنگری.",
      reflection: "یوسف گمگشته باز آید به کنعان غم مخور."
    };
  }
};