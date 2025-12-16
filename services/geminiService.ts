import { GoogleGenAI } from "@google/genai";
import { Sheet } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateRowData = async (sheet: Sheet, instruction: string): Promise<any> => {
  if (!apiKey) throw new Error("API Key is missing");

  const model = "gemini-2.5-flash";
  const prompt = `
    You are a data entry assistant. 
    I have a spreadsheet with these columns: ${sheet.columns.map(c => c.name).join(', ')}.
    
    The user wants to generate a new row based on this instruction: "${instruction}".
    
    Return ONLY a valid JSON object representing one row. Keys must match the column names exactly.
    Do not include markdown formatting or backticks.
  `;

  try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (!text) return null;
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini generation error:", error);
    throw error;
  }
};

export const analyzeData = async (sheets: Sheet[], query: string): Promise<string> => {
  if (!apiKey) return "API Key not configured.";
  
  const model = "gemini-2.5-flash";
  
  // Serialize a summary of data to send to AI (avoid sending massive datasets)
  const dataSummary = sheets.map(s => ({
    sheetName: s.name,
    columns: s.columns.map(c => c.name),
    rowCount: s.rows.length,
    sampleRows: s.rows.slice(0, 3) // Send first 3 rows as sample
  }));

  const prompt = `
    You are a data analyst helper for a spreadsheet app.
    Here is the structure of the current sheets:
    ${JSON.stringify(dataSummary, null, 2)}
    
    The user asks: "${query}"
    
    Provide a helpful, concise answer. If they ask for insights, look at the sample data or infer from structure.
  `;

   try {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text || "No response generated.";
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return "Error analyzing data. Please check your API key.";
  }
}
