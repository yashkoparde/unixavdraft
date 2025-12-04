import { GoogleGenAI, Type, Modality } from "@google/genai";
import { AnalysisResult } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Analyzes the medical document (Image or Text)
 */
export const analyzeDocument = async (
  fileBase64: string,
  mimeType: string,
  isText: boolean = false
): Promise<AnalysisResult> => {
  
  const modelId = "gemini-2.5-flash"; 

  const systemInstruction = "You are ArogyaVani, an elite medical AI. Your goal is to analyze medical documents instantly and provide simplified, accurate summaries for patients.";

  const prompt = `
    Analyze the provided medical document (Prescription, Consent Form, or Lab Report).
    
    1. **Summarization (T5 Style)**: Provide a concise, plain-English summary. Remove jargon. Target audience: 12-year-old.
    
    2. **Consent Form Analysis (If applicable)**: 
       - Identify 'Risks' and 'Missing Clauses'.
       - Rate 'ComplexityScore' (1-10).
       - Suggestion: Should they sign?
    
    3. **Specialist Recommendation**: 
       - Recommend "More Experienced Doctors" for this condition.
       - Urgency: Routine, Urgent, Immediate.

    Output PURE JSON. Keep strings concise to save generation time.
  `;

  let contents;
  if (isText) {
    contents = {
      parts: [{ text: prompt }, { text: `Document Content:\n${fileBase64}` }]
    };
  } else {
    contents = {
      parts: [
        { text: prompt },
        {
          inlineData: {
            mimeType: mimeType,
            data: fileBase64
          }
        }
      ]
    };
  }

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
        thinkingConfig: { thinkingBudget: 0 }, // Disable thinking for lower latency
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING },
            documentType: { type: Type.STRING },
            consentAnalysis: {
              type: Type.OBJECT,
              properties: {
                risks: { type: Type.ARRAY, items: { type: Type.STRING } },
                missingClauses: { type: Type.ARRAY, items: { type: Type.STRING } },
                suggestion: { type: Type.STRING },
                complexityScore: { type: Type.NUMBER }
              }
            },
            doctorRecommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  specialty: { type: Type.STRING },
                  reason: { type: Type.STRING },
                  urgency: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    });

    const resultText = response.text;
    if (!resultText) throw new Error("No response from AI");
    return JSON.parse(resultText) as AnalysisResult;

  } catch (error) {
    console.error("Analysis Error:", error);
    throw new Error("Failed to analyze document. Ensure the file is clear and try again.");
  }
};

/**
 * Translates text into the target language (mBART emulation)
 */
export const translateText = async (text: string, targetLanguage: string): Promise<string> => {
  const modelId = "gemini-2.5-flash";
  
  const prompt = `Translate the following medical summary into ${targetLanguage}. Keep it accurate but simple. Text: "${text}"`;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 } // Speed up translation
      }
    });
    return response.text || "Translation failed.";
  } catch (error) {
    console.error("Translation Error:", error);
    throw new Error("Failed to translate text.");
  }
};

/**
 * Generates Speech from text using Gemini TTS (Coqui emulation)
 */
export const generateSpeech = async (text: string, languageCode: string, voiceName: string = 'Kore'): Promise<string> => {
  const modelId = "gemini-2.5-flash-preview-tts";
  
  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: {
        parts: [{ text: text }]
      },
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voiceName }
          }
        }
      }
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    
    if (!audioData) {
      throw new Error("No audio generated");
    }

    return audioData;

  } catch (error) {
    console.error("TTS Error:", error);
    throw new Error("Failed to generate speech. Please try a shorter text.");
  }
};
