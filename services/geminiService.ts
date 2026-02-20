import { GoogleGenAI, Type } from "@google/genai";
import { Poem, InterpretationResponse, DreamResponse, DreamPerspective } from "../types";
import { SUFI_SYSTEM_PROMPT } from "../constants";

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables.");
    throw new Error("API_KEY is missing");
  }
  return new GoogleGenAI({ apiKey });
};

export const interpretDream = async (
  dream: string,
  perspective: DreamPerspective
): Promise<DreamResponse> => {
  const ai = getClient();

  let systemPrompt = "";
  switch (perspective) {
    case DreamPerspective.ISLAMIC:
      systemPrompt = "You are an expert in Islamic dream interpretation (Ta'bir al-Ru'ya) based on the Quran and Hadith. Interpret the dream with spiritual depth.";
      break;
    case DreamPerspective.IBN_SINA:
      systemPrompt = "You are Ibn Sina (Avicenna). Interpret the dream using your philosophical and medical knowledge, focusing on the soul and body connection.";
      break;
    case DreamPerspective.PSYCHOLOGY:
      systemPrompt = "You are a modern psychologist combining Freud and Jung. Analyze the dream symbols, archetypes, and subconscious desires.";
      break;
    case DreamPerspective.FOLKLORE:
      systemPrompt = "You are a wise elder knowing all Iranian folk tales and superstitions about dreams. Interpret based on traditional Iranian culture.";
      break;
    default:
      systemPrompt = "You are a wise dream interpreter.";
  }

  const prompt = `
    The dreamer saw: "${dream}".
    
    Interpret this dream in PERSIAN (Farsi).
    Provide:
    1. The main interpretation.
    2. Key symbolism.
    3. Suggested action/reflection.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: systemPrompt,
        thinkingConfig: { thinkingBudget: 0 },
        maxOutputTokens: 800,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            interpretation: { type: Type.STRING, description: "Main interpretation in Persian" },
            symbolism: { type: Type.STRING, description: "Key symbols explained in Persian" },
            action: { type: Type.STRING, description: "Suggested action or reflection in Persian" },
          },
          required: ["interpretation", "symbolism", "action"],
        },
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Dream Interpreter");

    return JSON.parse(text) as DreamResponse;

  } catch (error) {
    console.error("Dream Interpretation Failed:", error);
    return {
      interpretation: "متأسفانه در حال حاضر قادر به تعبیر این خواب نیستم. لطفاً دوباره تلاش کنید.",
      symbolism: "نامشخص",
      action: "آرامش خود را حفظ کنید و دوباره نیت کنید."
    };
  }
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