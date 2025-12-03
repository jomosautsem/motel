
import { GoogleGenAI } from "@google/genai";

// Safety check to prevent "process is not defined" crash in browser
const apiKey = (typeof process !== 'undefined' && process.env && process.env.API_KEY) 
  ? process.env.API_KEY 
  : ''; 

const ai = new GoogleGenAI({ apiKey: apiKey });

export const analyzeBusinessData = async (dataContext: string): Promise<string> => {
  try {
    if (!apiKey) {
      return "API Key no configurada. No se puede realizar el análisis.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `
        Actúa como un consultor de negocios experto para el "Motel las Bolas".
        Analiza los siguientes datos operativos y financieros del día/semana y proporciona un resumen ejecutivo breve (máximo 150 palabras) y 3 sugerencias clave para mejorar la rentabilidad o el servicio.
        El tono debe ser profesional pero alentador.
        
        Datos:
        ${dataContext}
      `,
      config: {
        temperature: 0.7,
      }
    });

    return response.text || "No se pudo generar el análisis en este momento.";
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return "Error al conectar con el asistente inteligente. Por favor intente más tarde.";
  }
};
